/**
 * Weekly AI Issue Digest — constants
 *
 * This series is a curated, chronologically-published reading experience built
 * on top of the same `item_contents` data as /item_reports. Membership is
 * defined by `report_series.slug = WEEKLY_AI_ISSUES_SLUG`, linked through
 * `market_memory_items.series_id`.
 */

/** report_series.slug that identifies this digest series. */
export const WEEKLY_AI_ISSUES_SLUG = "weekly-ai-issues";

/** Fallback copy used before the series row exists in the DB. */
export const WEEKLY_AI_ISSUES_FALLBACK_TITLE = "주간 AI 이슈 다이제스트";
export const WEEKLY_AI_ISSUES_FALLBACK_DESCRIPTION =
  "매주 가장 중요한 AI 이슈를 선별해 한 편의 리포트로 정리합니다. 흐름을 놓치지 않도록 회차별로 따라 읽어 보세요.";

/** Reports per page on the series landing list. */
export const PAGE_SIZE = 12;
