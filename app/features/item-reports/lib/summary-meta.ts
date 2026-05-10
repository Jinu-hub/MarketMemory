import type { SummaryMeta } from "../types";

/**
 * Safely parse a `summary_meta` JSON value into a typed shape.
 */
export function parseSummaryMeta(value: unknown): SummaryMeta | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as SummaryMeta;
}

/**
 * Pick the most readable short takeaway for a report:
 * 1) summary_meta.one_line_takeaway (if present)
 * 2) summary_meta.headline_angle (fallback)
 * 3) summary (first line)
 */
export function resolveTakeaway(
  summary: string | null | undefined,
  summaryMeta: unknown,
): string {
  const meta = parseSummaryMeta(summaryMeta);
  if (meta?.one_line_takeaway) return meta.one_line_takeaway;
  if (meta?.headline_angle) return meta.headline_angle;
  if (summary) {
    const firstLine = summary
      .split(/\n+/)
      .map((s) => s.trim())
      .find(Boolean);
    if (firstLine) return firstLine;
  }
  return "";
}
