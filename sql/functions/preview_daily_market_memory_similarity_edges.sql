-- Admin-only read path: same hybrid scoring as compute_*, no INSERT.
-- Relaxes min score and raises limit for tuning / diagnostics.

create or replace function public.preview_daily_market_memory_similarity_edges(
  p_source_daily_market_memory_id uuid,
  p_similarity_method text default 'hybrid_v1',
  p_min_final_score numeric default 0,
  p_result_limit integer default 50
)
returns table (
  target_daily_market_memory_id uuid,
  target_market_date date,
  target_status text,
  vector_score numeric,
  tag_score numeric,
  final_score numeric,
  matched_tags jsonb,
  passes_production_threshold boolean
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    c.target_daily_market_memory_id,
    t.market_date as target_market_date,
    t.status::text as target_status,
    c.vector_score,
    c.tag_score,
    c.final_score,
    c.matched_tags,
    (c.final_score >= 0.6) as passes_production_threshold
  from public.compute_daily_market_memory_similarity_edges(
    p_source_daily_market_memory_id,
    p_similarity_method,
    p_min_final_score,
    p_result_limit,
    true
  ) c
  join daily_market_memories t
    on t.id = c.target_daily_market_memory_id
  order by c.final_score desc, c.target_daily_market_memory_id asc;
$$;

comment on function public.preview_daily_market_memory_similarity_edges(uuid, text, numeric, integer) is
  'Admin preview: ranked DMM similarity candidates with target metadata; does not write edges.';

grant execute on function public.preview_daily_market_memory_similarity_edges(uuid, text, numeric, integer) to authenticated;
