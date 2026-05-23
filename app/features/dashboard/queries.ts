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

/**
 * Fetch the latest `daily_market_memories` row (final > draft) merged with the
 * best-matching `daily_market_memory_i18n` row for the requested locale.
 *
 * Falls back to: preferred lang → row's `core_lang_code` → any available i18n.
 */
export async function getLatestDailyMarketMemory(
  client: DB,
  preferredLang: string,
): Promise<DailyMarketMemorySnapshot | null> {
  const MEMORY_SELECT =
    "id,market_date,market_scope,status,generated_at,updated_at,source_report_count,core_lang_code,market_snapshot,core_data,market_mood_type,risk_signals,top_tags";

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

  // 3) Fetch all i18n rows for this memory (typically just a few langs).
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
