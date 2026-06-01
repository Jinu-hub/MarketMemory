import type { ReportDateFilter } from "../types";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

/** Inclusive calendar day → exclusive next-day bound for `.lt()` filters. */
export function exclusiveEndAfterDay(isoDay: string): string {
  const date = new Date(`${isoDay}T00:00:00`);
  date.setDate(date.getDate() + 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type ResolvedDateRange = {
  start?: string;
  /** Exclusive upper bound (next day / month / year start). */
  end?: string;
};

/**
 * Resolves date filters from URL / list state.
 * Priority: custom range (`date_from` / `date_to`) → year+month → year only.
 */
export function resolveReportDateRange(
  filter: ReportDateFilter,
): ResolvedDateRange | null {
  const from =
    filter.dateFrom && isValidIsoDate(filter.dateFrom)
      ? filter.dateFrom
      : undefined;
  const to =
    filter.dateTo && isValidIsoDate(filter.dateTo) ? filter.dateTo : undefined;

  if (from || to) {
    return {
      start: from,
      end: to ? exclusiveEndAfterDay(to) : undefined,
    };
  }

  if (!filter.year) return null;

  if (filter.month && filter.month >= 1 && filter.month <= 12) {
    const month = String(filter.month).padStart(2, "0");
    const start = `${filter.year}-${month}-01`;
    if (filter.month === 12) {
      return { start, end: `${filter.year + 1}-01-01` };
    }
    const nextMonth = String(filter.month + 1).padStart(2, "0");
    return { start, end: `${filter.year}-${nextMonth}-01` };
  }

  return {
    start: `${filter.year}-01-01`,
    end: `${filter.year + 1}-01-01`,
  };
}

/**
 * PostgREST `.or()` filter: `market_date` when set, otherwise `created_at`
 * (same rule as the timeline year loader).
 */
export function reportDateRangeOrFilter(
  range: ResolvedDateRange,
): string | null {
  const { start, end } = range;
  if (!start && !end) return null;

  if (start && end) {
    return `and(market_date.gte.${start},market_date.lt.${end}),and(market_date.is.null,created_at.gte.${start},created_at.lt.${end})`;
  }
  if (start) {
    return `and(market_date.gte.${start}),and(market_date.is.null,created_at.gte.${start})`;
  }
  return `and(market_date.lt.${end}),and(market_date.is.null,created_at.lt.${end})`;
}

export function hasReportDateFilter(filter: ReportDateFilter): boolean {
  return resolveReportDateRange(filter) !== null;
}

export function formatReportDateChipLabel(
  filter: ReportDateFilter,
): string | null {
  const from =
    filter.dateFrom && isValidIsoDate(filter.dateFrom)
      ? filter.dateFrom
      : undefined;
  const to =
    filter.dateTo && isValidIsoDate(filter.dateTo) ? filter.dateTo : undefined;

  if (from || to) {
    if (from && to) return `${from} ~ ${to}`;
    if (from) return `${from} ~`;
    return `~ ${to}`;
  }

  if (!filter.year) return null;

  if (filter.month && filter.month >= 1 && filter.month <= 12) {
    return `${filter.year}년 ${filter.month}월`;
  }
  return `${filter.year}년`;
}
