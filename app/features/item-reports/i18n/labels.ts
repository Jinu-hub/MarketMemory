/**
 * Locale-aware labels for DB-driven semantic keys (category, type, region, tier).
 */
import type {
  ReportCategory,
  ReportRegion,
  ReportTier,
  ReportType,
} from "../constants";
import type { SimilarityLevel } from "../lib/similarity-style";
import { ITEM_REPORTS_MESSAGES } from "./messages";
import { pickLocalized, resolveItemReportsLocale } from "./resolve";

const { semantic } = ITEM_REPORTS_MESSAGES;

export function getCategoryLabel(
  value: string | null | undefined,
  locale?: string | null,
): string {
  if (!value) return "";
  return pickLocalized(semantic.category, locale, value);
}

export function getReportTypeLabel(
  value: string | null | undefined,
  locale?: string | null,
): string {
  if (!value) return "";
  return pickLocalized(semantic.reportType, locale, value);
}

export function getReportTierLabel(
  value: string | null | undefined,
  locale?: string | null,
): string {
  if (!value) return "";
  return pickLocalized(semantic.reportTier, locale, value);
}

export function getRegionLabel(
  value: string | null | undefined,
  locale?: string | null,
): string {
  if (!value) return "";
  const lang = resolveItemReportsLocale(locale);
  return semantic.region[lang][value as ReportRegion] ?? value;
}

export function getReportTypeExploreIntro(
  value: string | null | undefined,
  locale?: string | null,
): string {
  if (!value) return pickLocalized(semantic.reportTypeExploreIntro, locale, "unknown");
  return pickLocalized(semantic.reportTypeExploreIntro, locale, value);
}

export function getSimilarityLabel(
  level: SimilarityLevel | null | undefined,
  locale?: string | null,
): string | null {
  if (!level) return null;
  return pickLocalized(semantic.similarity, locale, level);
}

export function getEntityGroupLabel(
  key: keyof (typeof semantic.entityGroup)["ko"],
  locale?: string | null,
): string {
  return pickLocalized(semantic.entityGroup, locale, key);
}

export function getRegionCardTitle(
  region: string,
  label: string,
  locale?: string | null,
): string {
  const lang = resolveItemReportsLocale(locale);
  const copy = ITEM_REPORTS_MESSAGES.ui[lang].explore.regionCard;
  if (region === "GLOBAL") return copy.globalTitle;
  if (region === "UNKNOWN") return copy.unknownTitle;
  return copy.defaultTitle.replace("{label}", label);
}

export function getRegionExploreIntro(
  region: string,
  locale?: string | null,
): string {
  const lang = resolveItemReportsLocale(locale);
  const copy = ITEM_REPORTS_MESSAGES.ui[lang].explore.regionCard;
  if (region === "GLOBAL") return copy.globalIntro;
  if (region === "UNKNOWN") return copy.unknownIntro;
  return copy.defaultIntro;
}

/** Re-export typed keys for callers that need exhaustiveness. */
export type { ReportCategory, ReportRegion, ReportTier, ReportType };
