create or replace function public.regenerate_daily_market_memory_similarity_once(
  p_source_daily_market_memory_id uuid,
  p_similarity_method text default 'hybrid_v1'
)
returns table (
  inserted_count integer,
  top_target_ids uuid[]
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_inserted integer := 0;
  v_top_target_ids uuid[] := '{}'::uuid[];
begin
  delete from daily_market_memory_similarity_edges
  where source_daily_market_memory_id = p_source_daily_market_memory_id
    and similarity_method = p_similarity_method;

  with source_memory as (
    select id, market_scope, core_data
    from daily_market_memories
    where id = p_source_daily_market_memory_id
  ),
  computed as (
    select *
    from public.compute_daily_market_memory_similarity_edges(
      p_source_daily_market_memory_id,
      p_similarity_method
    )
  ),
  eligible as (
    select
      c.target_daily_market_memory_id,
      c.vector_score,
      c.tag_score,
      c.final_score,
      c.matched_tags,
      s.core_data as source_snapshot,
      t.core_data as target_snapshot
    from computed c
    join daily_market_memories t
      on t.id = c.target_daily_market_memory_id
    join source_memory s on true
    where t.status = 'final'
      and t.market_scope = s.market_scope
      and t.id <> p_source_daily_market_memory_id
  ),
  ranked as (
    select
      e.*,
      row_number() over (
        order by e.final_score desc nulls last, e.target_daily_market_memory_id asc
      ) as ranking
    from eligible e
  ),
  inserted as (
    insert into daily_market_memory_similarity_edges (
      source_daily_market_memory_id,
      target_daily_market_memory_id,
      vector_score,
      tag_score,
      final_score,
      similarity_rank,
      similarity_method,
      matched_tags,
      source_snapshot,
      target_snapshot,
      is_visible
    )
    select
      p_source_daily_market_memory_id,
      r.target_daily_market_memory_id,
      r.vector_score,
      r.tag_score,
      r.final_score,
      r.ranking,
      p_similarity_method,
      r.matched_tags,
      r.source_snapshot,
      r.target_snapshot,
      true
    from ranked r
    returning target_daily_market_memory_id, similarity_rank
  )
  select
    count(*)::integer,
    coalesce(
      array_agg(target_daily_market_memory_id order by similarity_rank) filter (
        where similarity_rank between 1 and 5
      ),
      '{}'::uuid[]
    )
  into v_inserted, v_top_target_ids
  from inserted;

  update daily_market_memories
  set similarity_status = case
    when v_inserted > 0 then 'done'::similarity_status
    else 'nothing'::similarity_status
  end
  where id = p_source_daily_market_memory_id;

  return query
  select v_inserted, v_top_target_ids;
end;
$$;

comment on function public.regenerate_daily_market_memory_similarity_once(uuid, text) is
  'Regenerates daily_market_memory_similarity_edges for one source memory.';

create or replace function public.regenerate_daily_market_memory_similarity_with_secondary(
  p_source_daily_market_memory_id uuid,
  p_similarity_method text default 'hybrid_v1'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_regen_result record;
  v_top_target_id uuid;
  v_secondary_rewrites integer := 0;
begin
  select *
  into v_regen_result
  from public.regenerate_daily_market_memory_similarity_once(
    p_source_daily_market_memory_id,
    p_similarity_method
  );

  if coalesce(v_regen_result.inserted_count, 0) > 0 then
    foreach v_top_target_id in array coalesce(v_regen_result.top_target_ids, '{}'::uuid[])
    loop
      perform public.regenerate_daily_market_memory_similarity_once(
        v_top_target_id,
        p_similarity_method
      );
      v_secondary_rewrites := v_secondary_rewrites + 1;
    end loop;
  end if;

  return jsonb_build_object(
    'source_daily_market_memory_id', p_source_daily_market_memory_id,
    'inserted_count', coalesce(v_regen_result.inserted_count, 0),
    'top_target_ids', coalesce(v_regen_result.top_target_ids, '{}'::uuid[]),
    'secondary_rewrites', v_secondary_rewrites,
    'similarity_method', p_similarity_method
  );
end;
$$;

comment on function public.regenerate_daily_market_memory_similarity_with_secondary(uuid, text) is
  'Regenerates edges for one source and one-hop top-5 secondary rewrites.';

grant execute on function public.regenerate_daily_market_memory_similarity_once(uuid, text) to authenticated;
grant execute on function public.regenerate_daily_market_memory_similarity_with_secondary(uuid, text) to authenticated;
