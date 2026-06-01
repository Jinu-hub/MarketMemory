import type { ListFilter } from "../types";

import { parseReportDateFilter } from "./report-date-params";

/**
 * Parse list-screen filters from the request URL (shared loader contract).
 */
export function parseListFilter(url: URL): ListFilter {
  const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  const sortParam = url.searchParams.get("sort");

  return {
    category: url.searchParams.get("category") ?? undefined,
    reportType: url.searchParams.get("report_type") ?? undefined,
    reportTier: url.searchParams.get("report_tier") ?? undefined,
    region: url.searchParams.get("region") ?? undefined,
    country: url.searchParams.get("country") ?? undefined,
    tag: url.searchParams.get("tag") ?? undefined,
    lang: url.searchParams.get("lang") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
    ...parseReportDateFilter(url.searchParams),
    sort: sortParam === "oldest" ? "oldest" : "newest",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}
