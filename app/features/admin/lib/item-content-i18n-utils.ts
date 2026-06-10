import type { Database } from "database.types";

import {
  REPORT_TIERS,
  REPORT_TYPES,
  type ReportTier,
  type ReportType,
} from "~/features/item-reports/constants";

import {
  ITEM_CONTENT_I18N_DEFAULT_I18N_FILTER,
  ITEM_CONTENT_I18N_SUPPORTED_LANGS,
  ITEM_CONTENT_I18N_TRACKING_KEY,
  type ItemContentI18nLangCode,
} from "./item-content-i18n.config";
import { parseTriStateQueryParam } from "./item-similarity-utils";

export type ItemContentI18nFilterState = "all" | "missing" | "complete";
export type ReportTypeFilter = "all" | ReportType;
export type ReportTierFilter = "all" | ReportTier;

export type ItemContentI18nFilterHrefParts = {
  active: "all" | "1" | "0";
  pub: "all" | "1" | "0";
  i18n: ItemContentI18nFilterState;
  reportType: ReportTypeFilter;
  reportTier: ReportTierFilter;
};

export type ItemContentI18nListRow = Pick<
  Database["public"]["Tables"]["item_contents"]["Row"],
  | "id"
  | "title"
  | "lang_code"
  | "category"
  | "report_type"
  | "report_tier"
  | "market_date"
  | "is_active"
  | "is_public"
  | "tracking"
  | "created_at"
>;

export type ItemContentI18nRecordRow = Pick<
  Database["public"]["Tables"]["item_content_i18n"]["Row"],
  "id" | "item_content_id" | "lang_code" | "status" | "is_public" | "created_at" | "updated_at"
>;

export type ItemContentI18nLangCell = {
  langCode: ItemContentI18nLangCode;
  isSource: boolean;
  exists: boolean;
  i18n: ItemContentI18nRecordRow | null;
  lastWebhookAt: string | null;
};

export type ItemContentI18nRowModel = {
  content: ItemContentI18nListRow;
  cells: Record<ItemContentI18nLangCode, ItemContentI18nLangCell>;
};

export function isItemContentI18nLangCode(v: string): v is ItemContentI18nLangCode {
  return (ITEM_CONTENT_I18N_SUPPORTED_LANGS as readonly string[]).includes(v);
}

export function getTargetLangCodes(sourceLang: string): ItemContentI18nLangCode[] {
  return ITEM_CONTENT_I18N_SUPPORTED_LANGS.filter((code) => code !== sourceLang);
}

export function parseI18nFilterParam(v: string | null): ItemContentI18nFilterState {
  if (v === "all" || v === "missing" || v === "complete") {
    return v;
  }
  return ITEM_CONTENT_I18N_DEFAULT_I18N_FILTER;
}

export function parseI18nWebhookRuns(
  tracking: Database["public"]["Tables"]["item_contents"]["Row"]["tracking"],
): Partial<Record<ItemContentI18nLangCode, string>> {
  if (!tracking || typeof tracking !== "object" || Array.isArray(tracking)) {
    return {};
  }
  const raw = (tracking as Record<string, unknown>)[ITEM_CONTENT_I18N_TRACKING_KEY];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }
  const out: Partial<Record<ItemContentI18nLangCode, string>> = {};
  for (const lang of ITEM_CONTENT_I18N_SUPPORTED_LANGS) {
    const value = (raw as Record<string, unknown>)[lang];
    if (typeof value === "string" && value.trim() !== "") {
      out[lang] = value;
    }
  }
  return out;
}

function pickLatestI18nRecord(
  records: ItemContentI18nRecordRow[],
): ItemContentI18nRecordRow | null {
  if (records.length === 0) {
    return null;
  }
  return [...records].sort((a, b) => {
    const aTs = Date.parse(a.updated_at ?? a.created_at);
    const bTs = Date.parse(b.updated_at ?? b.created_at);
    return bTs - aTs;
  })[0]!;
}

export function groupItemContentI18nByContentAndLang(
  rows: ItemContentI18nRecordRow[],
): Map<string, Map<ItemContentI18nLangCode, ItemContentI18nRecordRow>> {
  const grouped = new Map<string, Map<ItemContentI18nLangCode, ItemContentI18nRecordRow[]>>();

  for (const row of rows) {
    if (!isItemContentI18nLangCode(row.lang_code)) {
      continue;
    }
    const byLang = grouped.get(row.item_content_id) ?? new Map();
    const list = byLang.get(row.lang_code) ?? [];
    list.push(row);
    byLang.set(row.lang_code, list);
    grouped.set(row.item_content_id, byLang);
  }

  const out = new Map<string, Map<ItemContentI18nLangCode, ItemContentI18nRecordRow>>();
  for (const [contentId, byLang] of grouped) {
    const latestByLang = new Map<ItemContentI18nLangCode, ItemContentI18nRecordRow>();
    for (const [lang, list] of byLang) {
      const latest = pickLatestI18nRecord(list);
      if (latest) {
        latestByLang.set(lang, latest);
      }
    }
    out.set(contentId, latestByLang);
  }
  return out;
}

export function buildItemContentI18nRowModels(
  contents: ItemContentI18nListRow[],
  i18nMap: Map<string, Map<ItemContentI18nLangCode, ItemContentI18nRecordRow>>,
): ItemContentI18nRowModel[] {
  return contents.map((content) => {
    const webhookRuns = parseI18nWebhookRuns(content.tracking);
    const perLang = i18nMap.get(content.id);
    const cells = {} as Record<ItemContentI18nLangCode, ItemContentI18nLangCell>;

    for (const langCode of ITEM_CONTENT_I18N_SUPPORTED_LANGS) {
      const isSource = content.lang_code === langCode;
      const i18n = perLang?.get(langCode) ?? null;
      cells[langCode] = {
        langCode,
        isSource,
        exists: isSource || i18n != null,
        i18n,
        lastWebhookAt: webhookRuns[langCode] ?? null,
      };
    }

    return { content, cells };
  });
}

export function rowHasMissingTargetI18n(row: ItemContentI18nRowModel): boolean {
  return getTargetLangCodes(row.content.lang_code).some((lang) => !row.cells[lang].exists);
}

export function rowHasCompleteTargetI18n(row: ItemContentI18nRowModel): boolean {
  const targets = getTargetLangCodes(row.content.lang_code);
  if (targets.length === 0) {
    return true;
  }
  return targets.every((lang) => row.cells[lang].exists);
}

export function filterItemContentI18nRows(
  rows: ItemContentI18nRowModel[],
  i18nFilter: ItemContentI18nFilterState,
): ItemContentI18nRowModel[] {
  if (i18nFilter === "missing") {
    return rows.filter(rowHasMissingTargetI18n);
  }
  if (i18nFilter === "complete") {
    return rows.filter(rowHasCompleteTargetI18n);
  }
  return rows;
}

export function parseReportTypeFilterParam(v: string | null): ReportTypeFilter {
  if (v && (REPORT_TYPES as readonly string[]).includes(v)) {
    return v as ReportType;
  }
  return "all";
}

export function parseReportTierFilterParam(v: string | null): ReportTierFilter {
  if (v && (REPORT_TIERS as readonly string[]).includes(v)) {
    return v as ReportTier;
  }
  return "all";
}

export function mergeI18nFilterHref(parts: ItemContentI18nFilterHrefParts): string {
  const sp = new URLSearchParams();
  if (parts.active !== "all") {
    sp.set("active", parts.active);
  }
  if (parts.pub !== "all") {
    sp.set("public", parts.pub);
  }
  if (parts.i18n !== ITEM_CONTENT_I18N_DEFAULT_I18N_FILTER) {
    sp.set("i18n", parts.i18n);
  }
  if (parts.reportType !== "all") {
    sp.set("report_type", parts.reportType);
  }
  if (parts.reportTier !== "all") {
    sp.set("report_tier", parts.reportTier);
  }
  const q = sp.toString();
  return q ? `/admin/item-content-reports-i18n?${q}` : "/admin/item-content-reports-i18n";
}

export function parseI18nListFilters(url: URL) {
  const reportTypeFilter = parseReportTypeFilterParam(url.searchParams.get("report_type"));
  const reportTierFilter = parseReportTierFilterParam(url.searchParams.get("report_tier"));

  return {
    isActive: (() => {
      const v = parseTriStateQueryParam(url.searchParams.get("active"));
      return v === "all" ? undefined : v === "1";
    })(),
    isPublic: (() => {
      const v = parseTriStateQueryParam(url.searchParams.get("public"));
      return v === "all" ? undefined : v === "1";
    })(),
    reportType: reportTypeFilter === "all" ? undefined : reportTypeFilter,
    reportTier: reportTierFilter === "all" ? undefined : reportTierFilter,
    activeFilter: parseTriStateQueryParam(url.searchParams.get("active")),
    publicFilter: parseTriStateQueryParam(url.searchParams.get("public")),
    i18nFilter: parseI18nFilterParam(url.searchParams.get("i18n")),
    reportTypeFilter,
    reportTierFilter,
  };
}

export function formatAdminDateTime(iso: string | null | undefined): string {
  if (!iso) {
    return "—";
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "—";
  }
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function buildI18nJobKey(itemContentId: string, langCode: ItemContentI18nLangCode): string {
  return `${itemContentId}:${langCode}`;
}

export function parseI18nJobKey(
  raw: string,
): { itemContentId: string; langCode: ItemContentI18nLangCode } | null {
  const idx = raw.lastIndexOf(":");
  if (idx <= 0) {
    return null;
  }
  const itemContentId = raw.slice(0, idx);
  const langCode = raw.slice(idx + 1);
  if (!isItemContentI18nLangCode(langCode)) {
    return null;
  }
  return { itemContentId, langCode };
}
