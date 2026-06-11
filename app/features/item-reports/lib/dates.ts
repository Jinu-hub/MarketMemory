import { dateLocaleTag } from "../i18n/resolve";

import type { ReportListItem } from "../types";

export function formatDate(
  value: string | null | undefined,
  locale?: string | null,
): string {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString(dateLocaleTag(locale), {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

export function resolveDisplayDate(
  row: Pick<ReportListItem, "market_date" | "created_at">,
  locale?: string | null,
): string {
  return formatDate(row.market_date ?? row.created_at, locale);
}

/** Calendar year from an ISO-ish date string; invalid or missing → null. */
export function parseCalendarYear(rawDate?: string | null): number | null {
  if (!rawDate) return null;
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return null;
  return date.getFullYear();
}

/** Calendar year + month (1–12) from `market_date` or fallback timestamp. */
export function parseCalendarYearMonth(
  rawDate?: string | null,
): { year: number; month: number } | null {
  if (!rawDate) return null;
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return null;
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

/** Timeline/list date: prefer `market_date`, else `created_at`. */
export function resolveReportCalendarParts(row: {
  market_date: string | null;
  created_at: string | null;
}): { year: number; month: number } | null {
  return parseCalendarYearMonth(row.market_date ?? row.created_at);
}
