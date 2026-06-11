import type { Database } from "database.types";

import { ITEM_REPORTS_MESSAGES } from "./i18n/messages";

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
export const REPORT_CATEGORY_LABELS = ITEM_REPORTS_MESSAGES.semantic.category
  .en as Record<ReportCategory, string>;

/** @deprecated Use `getCategoryLabel` from `~/features/item-reports/i18n` */
export const REPORT_CATEGORY_LABELS_KO = ITEM_REPORTS_MESSAGES.semantic.category
  .ko as Record<ReportCategory, string>;

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
export const REPORT_TYPE_LABELS = ITEM_REPORTS_MESSAGES.semantic.reportType
  .en as Record<ReportType, string>;

/** @deprecated Use `getReportTypeLabel` from `~/features/item-reports/i18n` */
export const REPORT_TYPE_LABELS_KO = ITEM_REPORTS_MESSAGES.semantic.reportType
  .ko as Record<ReportType, string>;

/** @deprecated Use `getReportTypeExploreIntro` from `~/features/item-reports/i18n` */
export const REPORT_TYPE_EXPLORE_INTRO_KO = ITEM_REPORTS_MESSAGES.semantic
  .reportTypeExploreIntro.ko as Record<ReportType, string>;

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
export const REPORT_REGION_LABELS_KO = ITEM_REPORTS_MESSAGES.semantic.region
  .ko as Partial<Record<ReportRegion, string>>;

export const REPORT_TIERS: ReportTier[] = ["free", "premium", "premium_plus"];

/** @deprecated Use `getReportTierLabel` from `~/features/item-reports/i18n` */
export const REPORT_TIER_LABELS_KO = ITEM_REPORTS_MESSAGES.semantic.reportTier
  .ko as Record<ReportTier, string>;

/** @deprecated Use `getReportTierLabel` from `~/features/item-reports/i18n` */
export const REPORT_TIER_LABELS = ITEM_REPORTS_MESSAGES.semantic.reportTier
  .en as Record<ReportTier, string>;

export const PAGE_SIZE = 12;

export const SORT_OPTIONS = ["newest", "oldest"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];
