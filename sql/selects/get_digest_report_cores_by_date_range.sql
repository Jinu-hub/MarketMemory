-- Digest report cores for n8n (Code node → PostgreSQL Execute Query)
--
-- Purpose:
--   `item_contents` (report_type = digest-report) in a market_date window,
--   filtered by digest series (`notes`), joined to the latest `item_content_cores.core_data`.
--
-- n8n binding (Query Parameters — comma-separated, in order):
--   $1 = from   (YYYY-MM-DD)
--   $2 = to     (YYYY-MM-DD)
--   $3 = notes  ('weekly-market-issues' | 'monthly-ai-issues')
--
-- Code node output example:
--   return [{ json: { from: '2026-05-01', to: '2026-05-31', notes: 'weekly-market-issues' } }];
--
-- Title prefix by notes:
--   weekly-market-issues → title starts with '글로벌 시장 주요 이슈'
--   monthly-ai-issues  → title starts with '주간 AI 이슈 다이제스트'

WITH target_contents AS (
  SELECT
    ic.id AS item_content_id,
    ic.market_memory_item_id,
    ic.title,
    ic.market_date,
    ic.report_type,
    ic.category,
    ic.lang_code,
    ic.created_at
  FROM item_contents AS ic
  WHERE ic.report_type = 'digest-report'
    AND ic.market_date IS NOT NULL
    AND ic.market_date BETWEEN $1::date AND $2::date
    AND ic.is_active = true
    AND (
      (
        $3 = 'weekly-market-issues'
        AND ic.title LIKE '글로벌 시장 주요 이슈%'
      )
      OR (
        $3 = 'monthly-ai-issues'
        AND ic.title LIKE '주간 AI 이슈 다이제스트%'
      )
    )
),

latest_cores AS (
  SELECT DISTINCT ON (icc.item_content_id)
    icc.item_content_id,
    icc.id AS item_content_core_id,
    icc.core_type,
    icc.core_lang,
    icc.core_data,
    icc.created_at AS core_created_at
  FROM item_content_cores AS icc
  INNER JOIN target_contents AS tc
    ON tc.item_content_id = icc.item_content_id
  ORDER BY
    icc.item_content_id,
    icc.created_at DESC
)

SELECT
  tc.item_content_id,
  tc.market_memory_item_id,
  tc.title,
  tc.market_date,
  tc.report_type,
  tc.category,
  tc.lang_code,
  tc.created_at AS item_content_created_at,
  lc.item_content_core_id,
  lc.core_type,
  lc.core_lang,
  lc.core_data,
  lc.core_created_at
FROM target_contents AS tc
INNER JOIN latest_cores AS lc
  ON lc.item_content_id = tc.item_content_id
ORDER BY
  tc.market_date ASC,
  tc.created_at ASC;
