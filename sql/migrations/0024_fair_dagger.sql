-- Hybrid vector + tag similarity candidates for one source item_content id.
-- Mirrors sql/selects/get_item_similarity.sql with parameterized source id.
-- p_method_version reserved for future scoring variants (unused in body).

create or replace function public.compute_item_similarity_edges(
  p_source_item_id uuid,
  p_method_version text default 'hybrid_v1'
)
returns table (
  target_item_id uuid,
  vector_score numeric,
  tag_score numeric,
  final_score numeric,
  shared_tag_ids jsonb
)
language sql
stable
security invoker
set search_path = public
as $$
  with source_item as (
    select id, market_memory_item_id
    from item_contents
    where id = p_source_item_id
  ),
  latest_embeddings as (
    select distinct on (item_id)
      item_id,
      embedding,
      created_at
    from item_embeddings
    where content_type = 'summary'
      and lang_code = 'en'
      and model = 'text-embedding-3-large'
    order by item_id, created_at desc
  ),
  target_embedding as (
    select embedding
    from latest_embeddings
    where item_id = p_source_item_id
  ),
  vector_candidates as (
    select
      e.item_id,
      1 - (e.embedding <=> t.embedding) as vector_score
    from latest_embeddings e
    cross join target_embedding t
    join source_item s on true
    join item_contents target_ic on target_ic.id = e.item_id
    where e.item_id <> p_source_item_id
      and target_ic.market_memory_item_id is distinct from s.market_memory_item_id
    order by e.embedding <=> t.embedding
    limit 100
  ),
  base_tags as (
    select
      tag_id,
      confidence
    from item_tags
    where item_id = p_source_item_id
      and confidence >= 0.70
  ),
  tag_scores as (
    select
      it.item_id,
      sum(least(bt.confidence, it.confidence))
        / nullif((select sum(confidence) from base_tags), 0) as tag_score,
      jsonb_agg(it.tag_id) as shared_tag_ids
    from item_tags it
    join base_tags bt
      on bt.tag_id = it.tag_id
    join source_item s on true
    join item_contents target_ic on target_ic.id = it.item_id
    where it.item_id <> p_source_item_id
      and target_ic.market_memory_item_id is distinct from s.market_memory_item_id
    group by it.item_id
  ),
  candidates as (
    select item_id from vector_candidates
    union
    select item_id from tag_scores
  )
  select
    t1.item_id as target_item_id,
    t1.vector_score,
    t1.tag_score,
    t1.final_score,
    t1.shared_tag_ids
  from (
    select
      c.item_id,
      coalesce(v.vector_score, 0)::numeric as vector_score,
      coalesce(t.tag_score, 0)::numeric as tag_score,
      least(
        1.0,
        0.95 * coalesce(v.vector_score, 0)::double precision
        + 0.2 * coalesce(t.tag_score, 0)::double precision
      )::numeric as final_score,
      coalesce(t.shared_tag_ids, '[]'::jsonb) as shared_tag_ids
    from candidates c
    left join vector_candidates v on v.item_id = c.item_id
    left join tag_scores t on t.item_id = c.item_id
    order by least(
      1.0,
      0.95 * coalesce(v.vector_score, 0)::double precision
      + 0.2 * coalesce(t.tag_score, 0)::double precision
    ) desc
    limit 10
  ) t1
  where t1.final_score >= 0.6;
$$;

comment on function public.compute_item_similarity_edges(uuid, text) is
  'Returns top similarity edge candidates for item_contents.id; used by admin regenerate flow.';

grant execute on function public.compute_item_similarity_edges(uuid, text) to authenticated;
