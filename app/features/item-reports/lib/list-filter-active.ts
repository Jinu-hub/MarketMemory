import type { ListFilter } from "../types";

import { REPORT_LIST_CHIP_PARAM_KEYS } from "./filter-keys";
import { hasReportDateFilter } from "./report-date-filter";
import { hasReportDateParams } from "./report-date-params";

/** Loader-shaped filter has any criterion (used for featured hero visibility). */
export function hasActiveListFilter(filter: ListFilter): boolean {
  return Boolean(
    filter.category ??
      filter.reportType ??
      filter.reportTier ??
      filter.region ??
      filter.country ??
      filter.tag ??
      filter.lang ??
      filter.q ??
      hasReportDateFilter(filter),
  );
}

/** Client URL has any list filter (excludes `sort` / `page` alone). */
export function hasActiveListFilterParams(params: URLSearchParams): boolean {
  if (hasReportDateParams(params)) return true;
  return REPORT_LIST_CHIP_PARAM_KEYS.some((key) => params.has(key));
}
