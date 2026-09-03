import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "database.types";

import type { ItemContentSignalSource } from "~/features/cron/lib/market-signal/types";

export const GLOBAL_MARKET_ISSUES_SCOPE_KEY = "global-market-issues";

export type SignalSourceSelector = {
  scopeKey: string;
  scopeType: "content_type";
  observationLayer: "item_content";
  sourceKind: "item_content";
  titlePrefixes: string[];
  reportTypes: Database["public"]["Enums"]["report_type"][];
};

export const GLOBAL_MARKET_ISSUES_SELECTOR: SignalSourceSelector = {
  scopeKey: GLOBAL_MARKET_ISSUES_SCOPE_KEY,
  scopeType: "content_type",
  observationLayer: "item_content",
  sourceKind: "item_content",
  reportTypes: ["digest-report"],
  titlePrefixes: ["글로벌 시장 이슈", "글로벌 시장 주요 이슈"],
};

const SELECTOR_REGISTRY: Record<string, SignalSourceSelector> = {
  [GLOBAL_MARKET_ISSUES_SCOPE_KEY]: GLOBAL_MARKET_ISSUES_SELECTOR,
};

export function getSignalSourceSelector(scopeKey: string): SignalSourceSelector {
  const selector = SELECTOR_REGISTRY[scopeKey];
  if (!selector) {
    throw new Error(`Unknown market signal scopeKey: ${scopeKey}`);
  }
  return selector;
}

function matchesTitle(title: string | null, prefixes: string[]): boolean {
  if (!title) return false;
  return prefixes.some((prefix) => title.startsWith(prefix));
}

export async function fetchItemContentSignalSources(
  db: SupabaseClient<Database>,
  selector: SignalSourceSelector,
  params: { from?: string; to?: string } = {},
): Promise<ItemContentSignalSource[]> {
  let query = db
    .from("item_contents")
    .select("id, market_date, report_type, title, input_hash, metadata")
    .eq("is_active", true)
    .eq("is_public", true)
    .not("market_date", "is", null)
    .order("market_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (params.from) {
    query = query.gte("market_date", params.from);
  }
  if (params.to) {
    query = query.lte("market_date", params.to);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`item_contents signal source 조회 실패: ${error.message}`);
  }

  return (data ?? [])
    .filter((row) => {
      const reportType = row.report_type;
      if (!reportType || !selector.reportTypes.includes(reportType)) {
        return false;
      }
      return matchesTitle(row.title, selector.titlePrefixes);
    })
    .map((row) => ({
      kind: "item_content" as const,
      id: row.id,
      market_date: row.market_date as string,
      report_type: row.report_type,
      title: row.title,
      input_hash: row.input_hash,
      metadata: row.metadata,
    }));
}

export function groupSourcesByPeriod<T extends { market_date: string }>(
  sources: T[],
  resolvePeriodKey: (marketDate: string) => string,
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const source of sources) {
    const periodKey = resolvePeriodKey(source.market_date);
    const bucket = grouped.get(periodKey) ?? [];
    bucket.push(source);
    grouped.set(periodKey, bucket);
  }
  return grouped;
}
