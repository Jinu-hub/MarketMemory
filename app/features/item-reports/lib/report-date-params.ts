import type { ReportDateFilter } from "../types";

import { isValidIsoDate } from "./report-date-filter";

/** URL search param keys for report date filtering (list + explore drill-down). */
export const REPORT_DATE_PARAM_KEYS = {
  year: "year",
  month: "month",
  dateFrom: "date_from",
  dateTo: "date_to",
} as const;

export type ReportDateParamKey =
  (typeof REPORT_DATE_PARAM_KEYS)[keyof typeof REPORT_DATE_PARAM_KEYS];

const DATE_PARAM_KEY_LIST = Object.values(REPORT_DATE_PARAM_KEYS);

export function parseReportYearParam(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const year = Number.parseInt(raw, 10);
  if (!Number.isFinite(year) || year < 1900 || year > 2100) return undefined;
  return year;
}

export function parseReportMonthParam(
  raw: string | null,
  year?: number,
): number | undefined {
  if (!year || !raw) return undefined;
  const month = Number.parseInt(raw, 10);
  if (!Number.isFinite(month) || month < 1 || month > 12) return undefined;
  return month;
}

export function parseReportDateFilter(
  params: URLSearchParams,
): ReportDateFilter {
  const year = parseReportYearParam(params.get(REPORT_DATE_PARAM_KEYS.year));
  const dateFromRaw = params.get(REPORT_DATE_PARAM_KEYS.dateFrom);
  const dateToRaw = params.get(REPORT_DATE_PARAM_KEYS.dateTo);

  return {
    year,
    month: parseReportMonthParam(
      params.get(REPORT_DATE_PARAM_KEYS.month),
      year,
    ),
    dateFrom:
      dateFromRaw && isValidIsoDate(dateFromRaw) ? dateFromRaw : undefined,
    dateTo: dateToRaw && isValidIsoDate(dateToRaw) ? dateToRaw : undefined,
  };
}

export function hasReportDateParams(params: URLSearchParams): boolean {
  return DATE_PARAM_KEY_LIST.some((key) => params.has(key));
}

export function countReportDateParams(params: URLSearchParams): number {
  return DATE_PARAM_KEY_LIST.filter((key) => params.has(key)).length;
}

export function clearReportDateParams(next: URLSearchParams): void {
  for (const key of DATE_PARAM_KEY_LIST) {
    next.delete(key);
  }
}
