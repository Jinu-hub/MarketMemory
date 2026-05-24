/** Calendar date (UTC) derived from snapshot `fetchedAt` / DB `fetched_at`. */
export function marketDateFromFetchedAt(fetchedAt: string): string {
  const trimmed = fetchedAt.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid fetchedAt for market_date: ${fetchedAt}`);
  }
  return d.toISOString().slice(0, 10);
}
