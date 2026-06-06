/**
 * Dashboard queries
 *
 * Server-side Supabase access for the `/dashboard` screen.
 *
 * - `getLatestDailyMarketMemory`: returns the most recent `daily_market_memories`
 *   row (preferring `status='final'` over `'draft'`) joined with the best
 *   matching `daily_market_memory_i18n` row for the user's locale.
 *
 *   Note: `daily_market_memories` is currently RLS-restricted to admins. When
 *   the policy is opened up, this loader will start returning rows for normal
 *   users without code changes.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

import {
  publicItemContentsSelect,
  type ItemReportsDb,
} from "~/features/item-reports/lib/public-item-contents-query";
import type { ReportListItem } from "~/features/item-reports/types";

import { pickBestI18nRow } from "./lib/i18n-pick";
import type {
  CoreData,
  DailyMarketMemorySnapshot,
  DailyMemoryTheme,
  MarketSnapshotData,
  RiskSignal,
} from "./types";

type DB = SupabaseClient<Database>;

function coerceArray<T>(value: unknown): T[] | null {
  if (Array.isArray(value)) return value as T[];
  return null;
}

/** `top_tags`: string[] or `{ tag: string, ... }[]` from daily market memory pipeline. */
function coerceTopTagSlugs(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const slugs: string[] = [];
  for (const item of value) {
    if (typeof item === "string") {
      const s = item.trim();
      if (s) slugs.push(s);
      continue;
    }
    if (item && typeof item === "object" && "tag" in item) {
      const tag = (item as { tag: unknown }).tag;
      if (typeof tag === "string") {
        const s = tag.trim();
        if (s) slugs.push(s);
      }
    }
  }
  return slugs.length > 0 ? slugs : null;
}

const MEMORY_SELECT =
  "id,market_date,market_scope,status,generated_at,updated_at,source_report_count,core_lang_code,market_snapshot,core_data,market_mood_type,risk_signals,top_tags";

/** Shape of a `daily_market_memories` row selected with `MEMORY_SELECT`. */
type DailyMemoryBaseRow = {
  id: string;
  market_date: string;
  market_scope: string;
  status: string;
  generated_at: string;
  updated_at: string;
  source_report_count: number;
  core_lang_code: string;
  market_snapshot: unknown;
  core_data: unknown;
  market_mood_type: string | null;
  risk_signals: unknown;
  top_tags: unknown;
};

/**
 * Merge a base `daily_market_memories` row with the best-matching
 * `daily_market_memory_i18n` row for the requested locale.
 *
 * Falls back to: preferred lang → row's `core_lang_code` → any available i18n.
 */
async function hydrateDailyMarketMemory(
  client: DB,
  memoryRow: DailyMemoryBaseRow,
  preferredLang: string,
): Promise<DailyMarketMemorySnapshot> {
  const { data: i18nRows, error: i18nError } = await client
    .from("daily_market_memory_i18n")
    .select(
      "lang_code,display_title,display_subtitle,core_summary,top_themes,market_mood_summary",
    )
    .eq("daily_market_memory_id", memoryRow.id);

  if (i18nError) throw i18nError;

  const rows = i18nRows ?? [];
  const coreLang = memoryRow.core_lang_code ?? "en";
  const i18n = pickBestI18nRow(rows, preferredLang, coreLang);

  return {
    id: memoryRow.id,
    market_date: memoryRow.market_date,
    market_scope: memoryRow.market_scope,
    status: memoryRow.status,
    generated_at: memoryRow.generated_at,
    updated_at: memoryRow.updated_at,
    source_report_count: memoryRow.source_report_count,
    core_lang_code: memoryRow.core_lang_code,
    market_snapshot:
      (memoryRow.market_snapshot as unknown as MarketSnapshotData | null) ??
      null,
    core_data: (memoryRow.core_data as unknown as CoreData | null) ?? null,
    market_mood_type: memoryRow.market_mood_type,
    risk_signals: coerceArray<RiskSignal>(memoryRow.risk_signals),
    top_tags: coerceTopTagSlugs(memoryRow.top_tags),

    display_title: i18n?.display_title ?? null,
    display_subtitle: i18n?.display_subtitle ?? null,
    core_summary: i18n?.core_summary ?? null,
    top_themes: coerceArray<DailyMemoryTheme>(i18n?.top_themes ?? null),
    market_mood_summary: i18n?.market_mood_summary ?? null,
    resolved_lang_code: i18n?.lang_code ?? null,
  };
}

/**
 * Fetch the latest `daily_market_memories` row (final > draft) merged with the
 * best-matching `daily_market_memory_i18n` row for the requested locale.
 */
export async function getLatestDailyMarketMemory(
  client: DB,
  preferredLang: string,
): Promise<DailyMarketMemorySnapshot | null> {
  // 1) Try to find the most recent finalized record first.
  let { data: memoryRow, error: finalError } = await client
    .from("daily_market_memories")
    .select(MEMORY_SELECT)
    .eq("status", "final")
    .order("market_date", { ascending: false })
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (finalError && finalError.code !== "PGRST116") {
    // PGRST116 = "no rows" — that's fine; any other error should bubble up
    // unless RLS just hid everything (then maybeSingle returns null).
    throw finalError;
  }

  // 2) If no final row exists, take the most recent draft.
  if (!memoryRow) {
    const { data: draftRow, error: draftError } = await client
      .from("daily_market_memories")
      .select(MEMORY_SELECT)
      .order("market_date", { ascending: false })
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (draftError && draftError.code !== "PGRST116") {
      throw draftError;
    }
    memoryRow = draftRow ?? null;
  }

  if (!memoryRow) return null;

  return hydrateDailyMarketMemory(
    client,
    memoryRow as unknown as DailyMemoryBaseRow,
    preferredLang,
  );
}

/**
 * Fetch the `daily_market_memories` row for a specific trading day.
 *
 * Prefers `status='final'` and falls back to the most recent row for that date
 * (e.g. a draft) so navigating to a past date stays consistent with the
 * "latest" behavior. `marketDate` must be a `YYYY-MM-DD` calendar date.
 */
export async function getDailyMarketMemoryByDate(
  client: DB,
  preferredLang: string,
  marketDate: string,
): Promise<DailyMarketMemorySnapshot | null> {
  let { data: memoryRow, error: finalError } = await client
    .from("daily_market_memories")
    .select(MEMORY_SELECT)
    .eq("market_date", marketDate)
    .eq("status", "final")
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (finalError && finalError.code !== "PGRST116") {
    throw finalError;
  }

  if (!memoryRow) {
    const { data: anyRow, error: anyError } = await client
      .from("daily_market_memories")
      .select(MEMORY_SELECT)
      .eq("market_date", marketDate)
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (anyError && anyError.code !== "PGRST116") {
      throw anyError;
    }
    memoryRow = anyRow ?? null;
  }

  if (!memoryRow) return null;

  return hydrateDailyMarketMemory(
    client,
    memoryRow as unknown as DailyMemoryBaseRow,
    preferredLang,
  );
}

/**
 * Distinct `market_date` values that have at least one readable memory row,
 * newest first. Powers the dashboard date picker (only these days are
 * selectable in the calendar).
 */
export async function getAvailableMarketMemoryDates(
  client: DB,
  limit = 180,
): Promise<string[]> {
  const { data, error } = await client
    .from("daily_market_memories")
    .select("market_date")
    .order("market_date", { ascending: false })
    .limit(limit);

  if (error && error.code !== "PGRST116") throw error;

  const seen = new Set<string>();
  for (const row of data ?? []) {
    if (row.market_date) seen.add(row.market_date);
  }
  return [...seen];
}

const SOURCE_REPORT_COLUMNS =
  "id,title,summary,summary_meta,category,report_type,report_tier,regions,countries,tags,market_date,created_at,lang_code";

type SourceRow = {
  item_content_id: string;
  report_title_snapshot: string | null;
  report_type: string | null;
  lang_code: string | null;
  created_at: string;
};

/**
 * Fetch source reports for a daily market memory, preserving pipeline order.
 * Live `item_contents` rows are preferred; snapshots fill gaps when a source
 * is no longer public.
 */
export async function getDailyMarketMemorySources(
  client: DB,
  memoryId: string,
): Promise<ReportListItem[]> {
  const { data: sourceRows, error: sourceError } = await client
    .from("daily_market_memory_sources")
    .select(
      "item_content_id,report_title_snapshot,report_type,lang_code,created_at",
    )
    .eq("daily_market_memory_id", memoryId)
    .order("created_at", { ascending: true });

  if (sourceError) throw sourceError;

  const rows = (sourceRows ?? []) as SourceRow[];
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.item_content_id);
  const { data: contentRows, error: contentError } =
    await publicItemContentsSelect(
      client as unknown as ItemReportsDb,
      SOURCE_REPORT_COLUMNS,
    ).in("id", ids);

  if (contentError) throw contentError;

  const contentById = new Map(
    (contentRows ?? []).map((row) => [row.id, row as ReportListItem]),
  );

  return rows.map((source) => {
    const live = contentById.get(source.item_content_id);
    if (live) return live;

    return {
      id: source.item_content_id,
      title: source.report_title_snapshot,
      summary: null,
      summary_meta: null,
      category: null,
      report_type: source.report_type as ReportListItem["report_type"],
      report_tier: "free",
      regions: null,
      countries: null,
      tags: null,
      market_date: null,
      created_at: source.created_at,
      lang_code: source.lang_code ?? "en",
    } satisfies ReportListItem;
  });
}
