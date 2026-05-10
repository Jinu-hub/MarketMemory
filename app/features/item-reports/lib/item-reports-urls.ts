/**
 * Central place to build /item_reports list and detail URLs (query params, encoding).
 */
const LIST_BASE = "/item_reports";

function queryStringFromRecord(
  query: Record<string, string | number | undefined | null>,
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    sp.set(key, String(value));
  }
  return sp.toString();
}

/**
 * Returns `/item_reports` or `/item_reports?<queryString>` (queryString must not include `?`).
 */
export function itemReportsListPath(queryString: string): string {
  return queryString ? `${LIST_BASE}?${queryString}` : LIST_BASE;
}

/**
 * Build a list URL from key-value pairs. Omits empty / null / undefined values.
 * Uses `URLSearchParams` so values (e.g. tags) are encoded consistently.
 */
export function itemReportsListHref(
  query: Record<string, string | number | undefined | null>,
): string {
  return itemReportsListPath(queryStringFromRecord(query));
}

export function itemReportsDetailHref(id: string): string {
  return `${LIST_BASE}/${id}`;
}

const TIMELINE_PATH = `${LIST_BASE}/timeline`;

/** `/item_reports/timeline` or `/item_reports/timeline?<queryString>` */
export function itemReportsTimelinePath(queryString: string): string {
  return queryString ? `${TIMELINE_PATH}?${queryString}` : TIMELINE_PATH;
}

export function itemReportsTimelineHref(
  query: Record<string, string | number | undefined | null>,
): string {
  return itemReportsTimelinePath(queryStringFromRecord(query));
}
