/**
 * URL builders for the Weekly Global Market Issues series.
 *
 * Centralised so cards, heroes and breadcrumbs stay inside the series space
 * instead of linking back to the global /item_reports reader.
 */
const BASE = "/weekly-market-issues";

/** `/weekly-market-issues` or `/weekly-market-issues?<queryString>` */
export function weeklyMarketIssuesListPath(queryString: string): string {
  return queryString ? `${BASE}?${queryString}` : BASE;
}

/** Detail (single episode) reader: `/weekly-market-issues/:id`. */
export function weeklyMarketIssuesDetailHref(id: string): string {
  return `${BASE}/${id}`;
}

export { BASE as WEEKLY_MARKET_ISSUES_BASE_PATH };
