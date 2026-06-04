import type { ListFilter } from "../types";

import { REPORT_LIST_PARAM } from "./filter-keys";
import { parseReportDateFilter } from "./report-date-params";

/**
 * Parse list-screen filters from the request URL (shared loader contract).
 */
export function parseListFilter(url: URL): ListFilter {
  const { searchParams } = url;
  const page = Number.parseInt(
    searchParams.get(REPORT_LIST_PARAM.page) ?? "1",
    10,
  );
  const sortParam = searchParams.get(REPORT_LIST_PARAM.sort);

  return {
    category: searchParams.get(REPORT_LIST_PARAM.category) ?? undefined,
    reportType: searchParams.get(REPORT_LIST_PARAM.reportType) ?? undefined,
    reportTier: searchParams.get(REPORT_LIST_PARAM.reportTier) ?? undefined,
    region: searchParams.get(REPORT_LIST_PARAM.region) ?? undefined,
    country: searchParams.get(REPORT_LIST_PARAM.country) ?? undefined,
    tag: searchParams.get(REPORT_LIST_PARAM.tag) ?? undefined,
    lang: searchParams.get(REPORT_LIST_PARAM.lang) ?? undefined,
    q: searchParams.get(REPORT_LIST_PARAM.q) ?? undefined,
    ...parseReportDateFilter(searchParams),
    sort: sortParam === "oldest" ? "oldest" : "newest",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}
