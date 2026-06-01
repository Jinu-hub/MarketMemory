import type { ReportDateFilter } from "../types";

import {
  reportDateRangeOrFilter,
  resolveReportDateRange,
} from "./report-date-filter";

/** Minimal shape for PostgREST builders that support `.or()` date filters. */
type OrFilterableQuery = {
  or: (filters: string) => OrFilterableQuery;
};

export function applyReportDateFilter<T extends OrFilterableQuery>(
  query: T,
  filter: ReportDateFilter,
): T {
  const dateRange = resolveReportDateRange(filter);
  if (!dateRange) return query;

  const dateOr = reportDateRangeOrFilter(dateRange);
  if (!dateOr) return query;

  return query.or(dateOr) as T;
}
