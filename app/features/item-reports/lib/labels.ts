import {
  REPORT_CATEGORY_LABELS_KO,
  REPORT_REGION_LABELS_KO,
  REPORT_TIER_LABELS_KO,
  REPORT_TYPE_LABELS_KO,
  type ReportCategory,
  type ReportRegion,
  type ReportTier,
  type ReportType,
} from "../constants";

export function formatCategory(value: string | null | undefined): string {
  if (!value) return "";
  return REPORT_CATEGORY_LABELS_KO[value as ReportCategory] ?? value;
}

export function formatReportType(value: string | null | undefined): string {
  if (!value) return "";
  return REPORT_TYPE_LABELS_KO[value as ReportType] ?? value;
}

export function formatReportTier(value: string | null | undefined): string {
  if (!value) return "";
  return REPORT_TIER_LABELS_KO[value as ReportTier] ?? value;
}

export function formatRegion(value: string | null | undefined): string {
  if (!value) return "";
  return REPORT_REGION_LABELS_KO[value as ReportRegion] ?? value;
}
