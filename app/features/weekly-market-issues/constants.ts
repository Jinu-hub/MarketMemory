/**
 * Weekly Global Market Issues — constants
 *
 * This series is a curated, chronologically-published reading experience built
 * on top of the same `item_contents` data as /item_reports. Membership is
 * defined by `report_series.slug = WEEKLY_MARKET_ISSUES_SLUG`, linked through
 * `market_memory_items.series_id`.
 */

/** report_series.slug that identifies this digest series. */
export const WEEKLY_MARKET_ISSUES_SLUG = "weekly-market-issues";

/** Fallback copy used before the series row exists in the DB. */
export const WEEKLY_MARKET_ISSUES_FALLBACK_TITLE = "주간 글로벌 시장 주요 이슈";
export const WEEKLY_MARKET_ISSUES_FALLBACK_DESCRIPTION =
  "매주 글로벌 시장에서 주목할 주요 이슈를 정리합니다. 회차별로 따라 읽으며 시장 흐름을 놓치지 마세요.";

/** Reports per page on the series landing list. */
export const PAGE_SIZE = 12;
