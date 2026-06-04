/**
 * URL search param keys for `/item_reports` list filtering.
 * Single source for loaders, filter panel, active chips, and parsers.
 */
export const FILTER_SELECT_ALL_VALUE = "__all__";

export const REPORT_LIST_PARAM = {
  category: "category",
  reportType: "report_type",
  reportTier: "report_tier",
  region: "region",
  country: "country",
  tag: "tag",
  lang: "lang",
  q: "q",
  sort: "sort",
  page: "page",
} as const;

/** Removable filter chips above the report grid (includes search `q`). */
export const REPORT_LIST_CHIP_PARAM_KEYS = [
  REPORT_LIST_PARAM.category,
  REPORT_LIST_PARAM.reportType,
  REPORT_LIST_PARAM.reportTier,
  REPORT_LIST_PARAM.region,
  REPORT_LIST_PARAM.country,
  REPORT_LIST_PARAM.tag,
  REPORT_LIST_PARAM.lang,
  REPORT_LIST_PARAM.q,
] as const;

export type ReportListChipParamKey =
  (typeof REPORT_LIST_CHIP_PARAM_KEYS)[number];

/** Attribute tab in the left filter panel (excludes tag/country/q). */
export const REPORT_LIST_PANEL_ATTRIBUTE_KEYS = [
  REPORT_LIST_PARAM.category,
  REPORT_LIST_PARAM.reportType,
  REPORT_LIST_PARAM.reportTier,
  REPORT_LIST_PARAM.region,
  REPORT_LIST_PARAM.lang,
] as const;

export function countParamsInKeys(
  params: URLSearchParams,
  keys: readonly string[],
): number {
  return keys.filter((key) => params.has(key)).length;
}
