import type { Database } from "database.types";

export type ItemContentRow = Database["public"]["Tables"]["item_contents"]["Row"];

/**
 * Shape of the `summary_meta` JSON column used by editorial AI pipelines.
 * All fields are optional because older reports may only have a subset.
 */
export type SummaryMeta = {
  hooks?: string[];
  headline_angle?: string;
  one_line_takeaway?: string;
  summary_sns_short?: string;
  [key: string]: unknown;
};

/**
 * Compact row used on list/explore screens. Excludes heavy columns (content, content_sns).
 */
export type ReportListItem = Pick<
  ItemContentRow,
  | "id"
  | "title"
  | "summary"
  | "summary_meta"
  | "category"
  | "report_type"
  | "regions"
  | "countries"
  | "tags"
  | "input_date"
  | "created_at"
  | "lang_code"
>;

export type ReportDetail = ItemContentRow;

export type ListFilter = {
  category?: string;
  reportType?: string;
  region?: string;
  country?: string;
  tag?: string;
  lang?: string;
  q?: string;
  sort?: "newest" | "oldest";
  page?: number;
};

export type PagedReports = {
  rows: ReportListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type FacetCounts = {
  categories: Record<string, number>;
  reportTypes: Record<string, number>;
  regions: Record<string, number>;
  languages: Record<string, number>;
  topTags: Array<{ tag: string; count: number }>;
};
