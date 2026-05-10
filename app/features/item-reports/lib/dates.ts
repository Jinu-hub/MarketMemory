import type { ReportListItem } from "../types";

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

export function resolveDisplayDate(
  row: Pick<ReportListItem, "input_date" | "created_at">,
): string {
  return formatDate(row.input_date ?? row.created_at);
}

/** Calendar year from an ISO-ish date string; invalid or missing → null. */
export function parseCalendarYear(rawDate?: string | null): number | null {
  if (!rawDate) return null;
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return null;
  return date.getFullYear();
}
