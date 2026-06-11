import {
  getCategoryLabel,
  getRegionLabel,
  getReportTierLabel,
  getReportTypeLabel,
} from "../i18n/labels";

export {
  getCategoryLabel,
  getRegionLabel,
  getReportTierLabel,
  getReportTypeLabel,
} from "../i18n/labels";

/** @deprecated Prefer `getCategoryLabel(value, locale)` */
export function formatCategory(
  value: string | null | undefined,
  locale?: string | null,
): string {
  return getCategoryLabel(value, locale);
}

/** @deprecated Prefer `getReportTypeLabel(value, locale)` */
export function formatReportType(
  value: string | null | undefined,
  locale?: string | null,
): string {
  return getReportTypeLabel(value, locale);
}

/** @deprecated Prefer `getReportTierLabel(value, locale)` */
export function formatReportTier(
  value: string | null | undefined,
  locale?: string | null,
): string {
  return getReportTierLabel(value, locale);
}

/** @deprecated Prefer `getRegionLabel(value, locale)` */
export function formatRegion(
  value: string | null | undefined,
  locale?: string | null,
): string {
  return getRegionLabel(value, locale);
}
