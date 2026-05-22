-- Hybrid vector + top_tags overlap for one daily_market_memories id.
-- top_tags: object array [{ "tag": "slug", ... }] or legacy string array.
-- Mirrors compute_item_similarity_edges; p_similarity_method reserved for future variants.

create or replace function public.compute_daily_market_memory_similarity_edges(
  p_source_daily_market_memory_id uuid,
  p_similarity_method text default 'hybrid_v1',
  p_min_final_score numeric default 0.6,
  p_result_limit integer default 10,
  p_score_all_eligible_finals boolean default false
)
returns table (
  target_daily_market_memory_id uuid,
  vector_score numeric,
  tag_score numeric,
  final_score numeric,
  matched_tags jsonb
)
language sql
stable
security invoker
set search_path = public
as $$
  with source_memory as (
    select
      id,
      market_scope,
      core_lang_code
    from daily_market_memories
    where id = p_source_daily_market_memory_id
  ),
  latest_embeddings as (
    select distinct on (e.daily_market_memory_id)
      e.daily_market_memory_id,
      e.embedding,
      e.created_at
    from daily_market_memory_embeddings e
    join source_memory s on true
    where (
        e.lang_code = s.core_lang_code
        or e.lang_code = 'en'
      )
      and (
        e.model is null
        or e.model = 'text-embedding-3-large'
      )
    order by
      e.daily_market_memory_id,
      case when e.lang_code = s.core_lang_code then 0 else 1 end,
      e.created_at desc
  ),
  target_embedding as (
    select embedding
    from latest_embeddings
    where daily_market_memory_id = p_source_daily_market_memory_id
  ),
  vector_candidates as (
    select
      e.daily_market_memory_id,
      1 - (e.embedding <=> t.embedding) as vector_score
    from latest_embeddings e
    cross join target_embedding t
    join source_memory s on true
    join daily_market_memories target_dmm
      on target_dmm.id = e.daily_market_memory_id
    where e.daily_market_memory_id <> p_source_daily_market_memory_id
      and target_dmm.market_scope = s.market_scope
      and target_dmm.status = 'final'
    order by e.embedding <=> t.embedding
    limit 100
  ),
  source_tags as (
    select distinct slug as tag
    from (
      select lower(trim(
        case
          when jsonb_typeof(elem) = 'string' then elem #>> '{}'
          when jsonb_typeof(elem) = 'object' and elem ? 'tag' then elem->>'tag'
          else null
        end
      )) as slug
      from daily_market_memories d,
        lateral jsonb_array_elements(coalesce(d.top_tags, '[]'::jsonb)) as t(elem)
      where d.id = p_source_daily_market_memory_id
    ) parsed
    where slug is not null and slug <> ''
  ),
  target_tags_expanded as (
    select
      target_dmm.id as daily_market_memory_id,
      lower(trim(
        case
          when jsonb_typeof(elem) = 'string' then elem #>> '{}'
          when jsonb_typeof(elem) = 'object' and elem ? 'tag' then elem->>'tag'
          else null
        end
      )) as tag
    from daily_market_memories target_dmm
    join source_memory s on true
    cross join lateral jsonb_array_elements(coalesce(target_dmm.top_tags, '[]'::jsonb)) as t(elem)
    where target_dmm.id <> p_source_daily_market_memory_id
      and target_dmm.market_scope = s.market_scope
      and target_dmm.status = 'final'
  ),
  tag_matches as (
    select distinct
      tt.daily_market_memory_id,
      st.tag
    from target_tags_expanded tt
    inner join source_tags st on st.tag = tt.tag
    where tt.tag is not null and tt.tag <> ''
  ),
  tag_scores as (
    select
      daily_market_memory_id,
      count(tag)::numeric / nullif((select count(*) from source_tags), 0) as tag_score,
      coalesce(jsonb_agg(to_jsonb(tag) order by tag), '[]'::jsonb) as matched_tags
    from tag_matches
    group by daily_market_memory_id
  ),
  candidates as (
    select daily_market_memory_id
    from vector_candidates
    union
    select daily_market_memory_id
    from tag_scores
    union
    select target_dmm.id as daily_market_memory_id
    from daily_market_memories target_dmm
    join source_memory s on true
    where p_score_all_eligible_finals
      and target_dmm.id <> p_source_daily_market_memory_id
      and target_dmm.market_scope = s.market_scope
      and target_dmm.status = 'final'
  )
  select
    t1.daily_market_memory_id as target_daily_market_memory_id,
    t1.vector_score,
    t1.tag_score,
    t1.final_score,
    t1.matched_tags
  from (
    select
      c.daily_market_memory_id,
      coalesce(v.vector_score, 0)::numeric as vector_score,
      coalesce(tg.tag_score, 0)::numeric as tag_score,
      least(
        1.0,
        0.95 * coalesce(v.vector_score, 0)::double precision
        + 0.2 * coalesce(tg.tag_score, 0)::double precision
      )::numeric as final_score,
      coalesce(tg.matched_tags, '[]'::jsonb) as matched_tags
    from candidates c
    left join vector_candidates v
      on v.daily_market_memory_id = c.daily_market_memory_id
    left join tag_scores tg
      on tg.daily_market_memory_id = c.daily_market_memory_id
    order by least(
      1.0,
      0.95 * coalesce(v.vector_score, 0)::double precision
      + 0.2 * coalesce(tg.tag_score, 0)::double precision
    ) desc
    limit greatest(p_result_limit, 1)
  ) t1
  where t1.final_score >= p_min_final_score;
$$;

comment on function public.compute_daily_market_memory_similarity_edges(uuid, text, numeric, integer, boolean) is
  'Returns ranked similarity candidates (no persist). Regenerate: min=0.6 limit=10. Admin preview: all eligible finals, min=0.';

grant execute on function public.compute_daily_market_memory_similarity_edges(uuid, text, numeric, integer, boolean) to authenticated;
