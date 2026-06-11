import type { Database } from "database.types";

import en from "~/locales/en";
import ko from "~/locales/ko";

export type ReportCategory = Database["public"]["Enums"]["category"];
export type ReportType = Database["public"]["Enums"]["report_type"];
export type ReportRegion = Database["public"]["Enums"]["region"];
export type ReportTier = Database["public"]["Enums"]["report_tier"];

export const REPORT_CATEGORIES: ReportCategory[] = [
  "foundation",
  "issue",
  "research",
  "market",
  "trend",
  "deep_dive",
  "column",
  "narrative_analysis",
  "review",
  "watchlist",
];

/** @deprecated Use `getCategoryLabel` from `~/features/item-reports/i18n` */
export const REPORT_CATEGORY_LABELS = en.itemReports.semantic
  .category as Record<ReportCategory, string>;

/** @deprecated Use `getCategoryLabel` from `~/features/item-reports/i18n` */
export const REPORT_CATEGORY_LABELS_KO = ko.itemReports.semantic
  .category as Record<ReportCategory, string>;

export const REPORT_TYPES: ReportType[] = [
  "digest-report",
  "full-report",
  "analysis-report",
  "thesis-report",
  "briefing-report",
  "baseline-report",
  "review",
  "other",
];

/** @deprecated Use `getReportTypeLabel` from `~/features/item-reports/i18n` */
export const REPORT_TYPE_LABELS = en.itemReports.semantic
  .reportType as Record<ReportType, string>;

/** @deprecated Use `getReportTypeLabel` from `~/features/item-reports/i18n` */
export const REPORT_TYPE_LABELS_KO = ko.itemReports.semantic
  .reportType as Record<ReportType, string>;

/** @deprecated Use `getReportTypeExploreIntro` from `~/features/item-reports/i18n` */
export const REPORT_TYPE_EXPLORE_INTRO_KO = ko.itemReports.semantic
  .reportTypeExploreIntro as Record<ReportType, string>;

export const REPORT_REGIONS: ReportRegion[] = [
  "GLOBAL",
  "AMERICAS",
  "NORTH_AMERICA",
  "LATAM",
  "CENTRAL_AMERICA",
  "CARIBBEAN",
  "EMEA",
  "EUROPE",
  "WESTERN_EUROPE",
  "EASTERN_EUROPE",
  "CEE",
  "DACH",
  "BENELUX",
  "NORDICS",
  "UK_AND_IRELAND",
  "MIDDLE_EAST",
  "MENA",
  "GCC",
  "NORTH_AFRICA",
  "AFRICA",
  "SUB_SAHARAN_AFRICA",
  "APAC",
  "ASIA",
  "EAST_ASIA",
  "SEA",
  "SOUTH_ASIA",
  "CENTRAL_ASIA",
  "ANZ",
  "OCEANIA",
  "UNKNOWN",
];

/** @deprecated Use `getRegionLabel` from `~/features/item-reports/i18n` */
export const REPORT_REGION_LABELS_KO = ko.itemReports.semantic
  .region as Partial<Record<ReportRegion, string>>;

export const REPORT_TIERS: ReportTier[] = ["free", "premium", "premium_plus"];

/** @deprecated Use `getReportTierLabel` from `~/features/item-reports/i18n` */
export const REPORT_TIER_LABELS_KO = ko.itemReports.semantic
  .reportTier as Record<ReportTier, string>;

/** @deprecated Use `getReportTierLabel` from `~/features/item-reports/i18n` */
export const REPORT_TIER_LABELS = en.itemReports.semantic
  .reportTier as Record<ReportTier, string>;

export const PAGE_SIZE = 12;

export const SORT_OPTIONS = ["newest", "oldest"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];
