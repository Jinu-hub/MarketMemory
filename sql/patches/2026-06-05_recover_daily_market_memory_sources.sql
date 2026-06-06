-- Recover daily_market_memory_sources after item_contents delete/recreate.
--
-- Context:
--   daily_market_memory_sources.item_content_id FK → item_contents(id) ON DELETE CASCADE
--   Deleting item_contents removes linked source rows while daily_market_memories remain.
--
-- Strategy (mirrors daily-market-memory pipeline input selection):
--   1. For each daily_market_memories row, derive the report market_date window:
--        - coverage_start_at + coverage_end_at both valid → UTC date range (pipeline parity)
--        - otherwise → single day: item_contents.market_date = daily_market_memories.market_date
--   2. Match item_contents where is_active = true AND is_public = true
--   3. Default lang_code = 'ko' (pipeline default). Remove the filter to include all langs.
--   4. Idempotent insert via ON CONFLICT DO NOTHING
--   5. Refresh daily_market_memories.source_report_count
--
-- Usage:
--   1) Run the PREVIEW block first and verify row counts.
--   2) Run the RECOVERY block inside a transaction.
--   3) COMMIT if preview counts look correct; otherwise ROLLBACK.

/* =========================================================
   PREVIEW — missing sources that would be inserted
   ========================================================= */
WITH dmm_report_window AS (
  SELECT
    dmm.id AS daily_market_memory_id,
    dmm.market_date,
    dmm.market_scope,
    dmm.status,
    dmm.source_report_count AS current_source_count,
    CASE
      WHEN dmm.coverage_start_at IS NOT NULL
       AND dmm.coverage_end_at IS NOT NULL
       AND (dmm.coverage_start_at AT TIME ZONE 'UTC')::date
           <= (dmm.coverage_end_at AT TIME ZONE 'UTC')::date
      THEN (dmm.coverage_start_at AT TIME ZONE 'UTC')::date
      ELSE dmm.market_date
    END AS report_date_start,
    CASE
      WHEN dmm.coverage_start_at IS NOT NULL
       AND dmm.coverage_end_at IS NOT NULL
       AND (dmm.coverage_start_at AT TIME ZONE 'UTC')::date
           <= (dmm.coverage_end_at AT TIME ZONE 'UTC')::date
      THEN (dmm.coverage_end_at AT TIME ZONE 'UTC')::date
      ELSE dmm.market_date
    END AS report_date_end
  FROM daily_market_memories dmm
),
candidate_reports AS (
  SELECT
    w.daily_market_memory_id,
    w.market_date,
    w.market_scope,
    w.status,
    w.current_source_count,
    w.report_date_start,
    w.report_date_end,
    ic.id AS item_content_id,
    ic.market_memory_item_id,
    ic.title,
    ic.report_type::text AS report_type,
    ic.lang_code,
    ic.market_date AS item_market_date,
    ic.created_at
  FROM dmm_report_window w
  JOIN item_contents ic
    ON ic.is_active = true
   AND ic.is_public = true
   AND ic.market_date IS NOT NULL
   AND ic.market_date BETWEEN w.report_date_start AND w.report_date_end
   AND ic.lang_code = 'ko'
  WHERE NOT EXISTS (
    SELECT 1
    FROM daily_market_memory_sources dms
    WHERE dms.daily_market_memory_id = w.daily_market_memory_id
      AND dms.item_content_id = ic.id
  )
)
SELECT
  daily_market_memory_id,
  market_date,
  market_scope,
  status,
  current_source_count,
  report_date_start,
  report_date_end,
  COUNT(*) AS missing_source_count
FROM candidate_reports
GROUP BY
  daily_market_memory_id,
  market_date,
  market_scope,
  status,
  current_source_count,
  report_date_start,
  report_date_end
ORDER BY market_date DESC, market_scope, status;

-- Uncomment for row-level detail:
-- SELECT * FROM candidate_reports ORDER BY market_date DESC, created_at DESC;


/* =========================================================
   RECOVERY — insert missing sources + refresh counts
   ========================================================= */
BEGIN;

WITH dmm_report_window AS (
  SELECT
    dmm.id AS daily_market_memory_id,
    dmm.market_date,
    CASE
      WHEN dmm.coverage_start_at IS NOT NULL
       AND dmm.coverage_end_at IS NOT NULL
       AND (dmm.coverage_start_at AT TIME ZONE 'UTC')::date
           <= (dmm.coverage_end_at AT TIME ZONE 'UTC')::date
      THEN (dmm.coverage_start_at AT TIME ZONE 'UTC')::date
      ELSE dmm.market_date
    END AS report_date_start,
    CASE
      WHEN dmm.coverage_start_at IS NOT NULL
       AND dmm.coverage_end_at IS NOT NULL
       AND (dmm.coverage_start_at AT TIME ZONE 'UTC')::date
           <= (dmm.coverage_end_at AT TIME ZONE 'UTC')::date
      THEN (dmm.coverage_end_at AT TIME ZONE 'UTC')::date
      ELSE dmm.market_date
    END AS report_date_end
  FROM daily_market_memories dmm
),
matched_reports AS (
  SELECT
    w.daily_market_memory_id,
    ic.id AS item_content_id,
    ic.market_memory_item_id,
    ic.title AS report_title_snapshot,
    ic.report_type::text AS report_type,
    ic.lang_code,
    ic.created_at
  FROM dmm_report_window w
  JOIN item_contents ic
    ON ic.is_active = true
   AND ic.is_public = true
   AND ic.market_date IS NOT NULL
   AND ic.market_date BETWEEN w.report_date_start AND w.report_date_end
   AND ic.lang_code = 'ko'
),
weighted_reports AS (
  SELECT
    mr.*,
    COUNT(*) OVER (PARTITION BY mr.daily_market_memory_id) AS report_count
  FROM matched_reports mr
  WHERE NOT EXISTS (
    SELECT 1
    FROM daily_market_memory_sources dms
    WHERE dms.daily_market_memory_id = mr.daily_market_memory_id
      AND dms.item_content_id = mr.item_content_id
  )
),
inserted AS (
  INSERT INTO daily_market_memory_sources (
    daily_market_memory_id,
    item_content_id,
    market_memory_item_id,
    report_title_snapshot,
    report_type,
    lang_code,
    source_weight,
    inclusion_reason
  )
  SELECT
    wr.daily_market_memory_id,
    wr.item_content_id,
    wr.market_memory_item_id,
    wr.report_title_snapshot,
    wr.report_type,
    wr.lang_code,
    ROUND(1.0 / wr.report_count, 4)::numeric(8, 4) AS source_weight,
    'recovery_after_item_contents_restore' AS inclusion_reason
  FROM weighted_reports wr
  ON CONFLICT (daily_market_memory_id, item_content_id) DO NOTHING
  RETURNING daily_market_memory_id
)
SELECT COUNT(*) AS inserted_source_rows FROM inserted;

UPDATE daily_market_memories dmm
SET
  source_report_count = src.cnt,
  updated_at = NOW()
FROM (
  SELECT
    daily_market_memory_id,
    COUNT(*)::integer AS cnt
  FROM daily_market_memory_sources
  GROUP BY daily_market_memory_id
) src
WHERE dmm.id = src.daily_market_memory_id
  AND dmm.source_report_count IS DISTINCT FROM src.cnt;

COMMIT;
-- ROLLBACK;
