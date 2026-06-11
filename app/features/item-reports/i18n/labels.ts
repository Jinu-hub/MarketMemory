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
import { ITEM_REPORTS_BY_LOCALE } from "./locales";
import { pickLocalized, resolveItemReportsLocale } from "./resolve";

function semanticBucket<K extends keyof (typeof ITEM_REPORTS_BY_LOCALE)["ko"]["semantic"]>(
  bucket: K,
  locale?: string | null,
): (typeof ITEM_REPORTS_BY_LOCALE)["ko"]["semantic"][K] {
  const lang = resolveItemReportsLocale(locale);
  return ITEM_REPORTS_BY_LOCALE[lang].semantic[bucket];
}

export function getCategoryLabel(
  value: string | null | undefined,
  locale?: string | null,
): string {
  if (!value) return "";
  const bucket = semanticBucket("category", locale) as Record<string, string>;
  return bucket[value] ?? bucket.unknown ?? value;
}

export function getReportTypeLabel(
  value: string | null | undefined,
  locale?: string | null,
): string {
  if (!value) return "";
  const bucket = semanticBucket("reportType", locale) as Record<string, string>;
  return bucket[value] ?? value;
}

export function getReportTierLabel(
  value: string | null | undefined,
  locale?: string | null,
): string {
  if (!value) return "";
  const bucket = semanticBucket("reportTier", locale) as Record<string, string>;
  return bucket[value] ?? value;
}

export function getRegionLabel(
  value: string | null | undefined,
  locale?: string | null,
): string {
  if (!value) return "";
  const bucket = semanticBucket("region", locale) as Record<string, string>;
  return bucket[value as ReportRegion] ?? value;
}

export function getReportTypeExploreIntro(
  value: string | null | undefined,
  locale?: string | null,
): string {
  const bucket = semanticBucket(
    "reportTypeExploreIntro",
    locale,
  ) as Record<string, string>;
  if (!value) return bucket.unknown ?? "";
  return bucket[value] ?? bucket.unknown ?? value;
}

export function getSimilarityLabel(
  level: SimilarityLevel | null | undefined,
  locale?: string | null,
): string | null {
  if (!level) return null;
  const bucket = semanticBucket("similarity", locale);
  return pickLocalized(
    {
      ko: bucket as Record<string, string>,
      en: semanticBucket("similarity", "en") as Record<string, string>,
      ja: semanticBucket("similarity", "ja") as Record<string, string>,
    },
    locale,
    level,
  );
}

export function getEntityGroupLabel(
  key: keyof (typeof ITEM_REPORTS_BY_LOCALE)["ko"]["semantic"]["entityGroup"],
  locale?: string | null,
): string {
  const bucket = semanticBucket("entityGroup", locale) as Record<string, string>;
  return bucket[key] ?? key;
}

export function getRegionCardTitle(
  region: string,
  label: string,
  locale?: string | null,
): string {
  const lang = resolveItemReportsLocale(locale);
  const copy = ITEM_REPORTS_BY_LOCALE[lang].explore.regionCard;
  if (region === "GLOBAL") return copy.globalTitle;
  if (region === "UNKNOWN") return copy.unknownTitle;
  return copy.defaultTitle.replace("{label}", label);
}

export function getRegionExploreIntro(
  region: string,
  locale?: string | null,
): string {
  const lang = resolveItemReportsLocale(locale);
  const copy = ITEM_REPORTS_BY_LOCALE[lang].explore.regionCard;
  if (region === "GLOBAL") return copy.globalIntro;
  if (region === "UNKNOWN") return copy.unknownIntro;
  return copy.defaultIntro;
}

export type { ReportCategory, ReportRegion, ReportTier, ReportType };
