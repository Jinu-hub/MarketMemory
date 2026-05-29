/**
 * URL builders for the Weekly AI Issue Digest series.
 *
 * Centralised so cards, heroes and breadcrumbs stay inside the series space
 * instead of linking back to the global /item_reports reader.
 */
const BASE = "/weekly-ai-issue-digest";

/** `/weekly-ai-issue-digest` or `/weekly-ai-issue-digest?<queryString>` */
export function weeklyDigestListPath(queryString: string): string {
  return queryString ? `${BASE}?${queryString}` : BASE;
}

/** Detail (single episode) reader: `/weekly-ai-issue-digest/:id`. */
export function weeklyDigestDetailHref(id: string): string {
  return `${BASE}/${id}`;
}

export { BASE as WEEKLY_DIGEST_BASE_PATH };
