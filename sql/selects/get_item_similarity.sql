with latest_embeddings as (
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
  where item_id = '665e5df6-4e67-4853-bf88-1f3ae509ffd6'
),

vector_candidates as (
  select
    e.item_id,
    1 - (e.embedding <=> t.embedding) as vector_score
  from latest_embeddings e
  cross join target_embedding t
  where e.item_id <> '665e5df6-4e67-4853-bf88-1f3ae509ffd6'
  order by e.embedding <=> t.embedding
  limit 100
),

base_tags as (
  select
    tag_id,
    confidence
  from item_tags
  where item_id = '665e5df6-4e67-4853-bf88-1f3ae509ffd6'
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
  where it.item_id <> '665e5df6-4e67-4853-bf88-1f3ae509ffd6'
  group by it.item_id
),


candidates as (
  select item_id from vector_candidates
  union
  select item_id from tag_scores
)

select *
from 
(
  select
    c.item_id,
    coalesce(v.vector_score, 0) as vector_score,
    coalesce(t.tag_score, 0) as tag_score,
    least(
      1.0,
      0.95 * coalesce(v.vector_score, 0)
      +
      0.2 * coalesce(t.tag_score, 0)
    ) as final_score,
    coalesce(t.shared_tag_ids, '[]'::jsonb) as shared_tag_ids
  from candidates c
  left join vector_candidates v on v.item_id = c.item_id
  left join tag_scores t on t.item_id = c.item_id
  order by final_score desc
  limit 10
) t1
where t1.final_score >= 0.6;