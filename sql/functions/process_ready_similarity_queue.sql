create or replace function public.regenerate_similarity_edges_once(
  p_source_item_id uuid,
  p_method_version text default 'hybrid_v1'
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
  delete from item_similarity_edges
  where source_item_id = p_source_item_id
    and method_version = p_method_version;

  with source_item as (
    select id, market_memory_item_id
    from item_contents
    where id = p_source_item_id
  ),
  computed as (
    select *
    from public.compute_item_similarity_edges(p_source_item_id, p_method_version)
  ),
  eligible as (
    select
      c.target_item_id,
      c.vector_score,
      c.tag_score,
      c.final_score,
      c.shared_tag_ids
    from computed c
    join item_contents t
      on t.id = c.target_item_id
    join source_item s
      on true
    where t.is_active = true
      and t.market_memory_item_id is distinct from s.market_memory_item_id
  ),
  ranked as (
    select
      e.*,
      row_number() over (
        order by e.final_score desc nulls last, e.target_item_id asc
      ) as ranking
    from eligible e
  ),
  inserted as (
    insert into item_similarity_edges (
      source_item_id,
      target_item_id,
      vector_score,
      tag_score,
      final_score,
      ranking,
      similarity_level,
      shared_tags,
      method_version
    )
    select
      p_source_item_id,
      r.target_item_id,
      r.vector_score,
      r.tag_score,
      r.final_score,
      r.ranking,
      case
        when coalesce(r.final_score, 0) >= 0.8 then 'strong'::similarity_level
        when coalesce(r.final_score, 0) >= 0.7 then 'high'::similarity_level
        when coalesce(r.final_score, 0) >= 0.6 then 'medium'::similarity_level
        else 'weak'::similarity_level
      end as similarity_level,
      r.shared_tag_ids,
      p_method_version
    from ranked r
    returning target_item_id, ranking
  )
  select
    count(*)::integer,
    coalesce(
      array_agg(target_item_id order by ranking) filter (where ranking between 1 and 5),
      '{}'::uuid[]
    )
  into v_inserted, v_top_target_ids
  from inserted;

  update item_contents
  set similarity_status = case
    when v_inserted > 0 then 'done'::similarity_status
    else 'nothing'::similarity_status
  end
  where id = p_source_item_id;

  return query
  select v_inserted, v_top_target_ids;
end;
$$;

comment on function public.regenerate_similarity_edges_once(uuid, text) is
  'Regenerates item_similarity_edges for one source item and returns inserted count and top-5 targets.';

create or replace function public.regenerate_similarity_edges_with_secondary(
  p_source_item_id uuid,
  p_method_version text default 'hybrid_v1'
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
  from public.regenerate_similarity_edges_once(p_source_item_id, p_method_version);

  if coalesce(v_regen_result.inserted_count, 0) > 0 then
    foreach v_top_target_id in array coalesce(v_regen_result.top_target_ids, '{}'::uuid[])
    loop
      perform public.regenerate_similarity_edges_once(v_top_target_id, p_method_version);
      v_secondary_rewrites := v_secondary_rewrites + 1;
    end loop;
  end if;

  return jsonb_build_object(
    'source_item_id', p_source_item_id,
    'inserted_count', coalesce(v_regen_result.inserted_count, 0),
    'top_target_ids', coalesce(v_regen_result.top_target_ids, '{}'::uuid[]),
    'secondary_rewrites', v_secondary_rewrites,
    'method_version', p_method_version
  );
end;
$$;

comment on function public.regenerate_similarity_edges_with_secondary(uuid, text) is
  'Regenerates edges for one source and one-hop top-5 secondary rewrites (same as cron queue item).';

create or replace function public.process_ready_similarity_queue(
  p_batch_limit integer default 20,
  p_method_version text default 'hybrid_v1'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ready_source_id uuid;
  v_item_result jsonb;
  v_processed_ready integer := 0;
  v_total_inserted integer := 0;
  v_secondary_rewrites integer := 0;
  v_effective_limit integer := greatest(coalesce(p_batch_limit, 20), 1);
begin
  for v_ready_source_id in
    select id
    from item_contents
    where similarity_status = 'ready'
    order by created_at asc
    limit v_effective_limit
  loop
    v_processed_ready := v_processed_ready + 1;

    v_item_result := public.regenerate_similarity_edges_with_secondary(
      v_ready_source_id,
      p_method_version
    );

    v_total_inserted := v_total_inserted + coalesce((v_item_result->>'inserted_count')::integer, 0);
    v_secondary_rewrites := v_secondary_rewrites
      + coalesce((v_item_result->>'secondary_rewrites')::integer, 0);
  end loop;

  return jsonb_build_object(
    'processed_ready', v_processed_ready,
    'total_inserted', v_total_inserted,
    'secondary_rewrites', v_secondary_rewrites,
    'method_version', p_method_version,
    'executed_at', now()
  );
end;
$$;

comment on function public.process_ready_similarity_queue(integer, text) is
  'Processes ready similarity queue and runs one-hop top-5 secondary rewrites without recursion.';

grant execute on function public.regenerate_similarity_edges_with_secondary(uuid, text) to authenticated;
grant execute on function public.process_ready_similarity_queue(integer, text) to authenticated;
