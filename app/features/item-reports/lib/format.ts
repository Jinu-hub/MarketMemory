import {
  REPORT_CATEGORY_LABELS_KO,
  REPORT_REGION_LABELS_KO,
  REPORT_TYPE_LABELS_KO,
  type ReportCategory,
  type ReportRegion,
  type ReportType,
} from "../constants";
import type { ReportListItem, SummaryMeta } from "../types";

export function formatCategory(value: string | null | undefined): string {
  if (!value) return "";
  return REPORT_CATEGORY_LABELS_KO[value as ReportCategory] ?? value;
}

export function formatReportType(value: string | null | undefined): string {
  if (!value) return "";
  return REPORT_TYPE_LABELS_KO[value as ReportType] ?? value;
}

export function formatRegion(value: string | null | undefined): string {
  if (!value) return "";
  return REPORT_REGION_LABELS_KO[value as ReportRegion] ?? value;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

export function resolveDisplayDate(row: Pick<ReportListItem, "input_date" | "created_at">): string {
  return formatDate(row.input_date ?? row.created_at);
}

/**
 * Rough reading-time estimate based on character length.
 * Korean reports mix Hangul + English — we assume ~500 chars per minute.
 * Always returns a positive integer (minimum 1 minute).
 */
export function estimateReadingTime(...sources: Array<string | null | undefined>): number {
  const total = sources.reduce<number>((sum, s) => sum + (s?.length ?? 0), 0);
  if (total === 0) return 1;
  return Math.max(1, Math.round(total / 500));
}

/**
 * Safely parse a `summary_meta` JSON value into a typed shape.
 */
export function parseSummaryMeta(value: unknown): SummaryMeta | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as SummaryMeta;
}

/**
 * Named entities extracted from a report's `metadata.entitys` block by
 * the editorial AI pipeline. Every key is required in the parsed shape
 * (defaulting to `[]`) so consumers don't need to null-check each list,
 * just check `.length`.
 */
export type ReportEntities = {
  persons: string[];
  products: string[];
  companies: string[];
  countries: string[];
  indicators: string[];
  industries: string[];
  institutions: string[];
  technologies: string[];
};

/**
 * Safely parse `item_contents.metadata.entitys` (note: pipeline uses the
 * misspelled `entitys`; we also fall back to the correct `entities` key
 * for forward-compat). Strips empty/whitespace-only values and de-dupes
 * each list so the UI never renders a blank or repeated badge.
 */
export function parseReportEntities(metadata: unknown): ReportEntities | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  const meta = metadata as Record<string, unknown>;
  const raw = meta.entitys ?? meta.entities;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const source = raw as Record<string, unknown>;

  const pickList = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const item of value) {
      if (typeof item !== "string") continue;
      const trimmed = item.trim();
      if (!trimmed || seen.has(trimmed)) continue;
      seen.add(trimmed);
      out.push(trimmed);
    }
    return out;
  };

  return {
    persons: pickList(source.persons),
    products: pickList(source.products),
    companies: pickList(source.companies),
    countries: pickList(source.countries),
    indicators: pickList(source.indicators),
    industries: pickList(source.industries),
    institutions: pickList(source.institutions),
    technologies: pickList(source.technologies),
  };
}

/** True when at least one entity bucket has a value. */
export function hasAnyEntity(entities: ReportEntities | null): boolean {
  if (!entities) return false;
  return Object.values(entities).some((list) => list.length > 0);
}

/**
 * Pick the most readable short takeaway for a report:
 * 1) summary_meta.one_line_takeaway (if present)
 * 2) summary_meta.headline_angle (fallback)
 * 3) summary (first line)
 */
export function resolveTakeaway(
  summary: string | null | undefined,
  summaryMeta: unknown,
): string {
  const meta = parseSummaryMeta(summaryMeta);
  if (meta?.one_line_takeaway) return meta.one_line_takeaway;
  if (meta?.headline_angle) return meta.headline_angle;
  if (summary) {
    const firstLine = summary.split(/\n+/).map((s) => s.trim()).find(Boolean);
    if (firstLine) return firstLine;
  }
  return "";
}
