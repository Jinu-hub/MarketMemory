/**
 * Rough reading-time estimate based on character length.
 * Korean reports mix Hangul + English — we assume ~500 chars per minute.
 * Always returns a positive integer (minimum 1 minute).
 */
export function estimateReadingTime(
  ...sources: Array<string | null | undefined>
): number {
  const total = sources.reduce<number>((sum, s) => sum + (s?.length ?? 0), 0);
  if (total === 0) return 1;
  return Math.max(1, Math.round(total / 500));
}
