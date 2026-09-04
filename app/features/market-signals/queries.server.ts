import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "database.types";

import type { MarketSignalPeriodType } from "~/features/cron/lib/market-signal/types";

import { MARKET_SIGNAL_DEFAULT_SCOPE_KEY } from "./lib/visibility";

export type MarketSignalSnapshotSummary = {
  id: string;
  periodType: MarketSignalPeriodType;
  periodKey: string;
  periodStart: string;
  periodEnd: string;
  sourceCount: number;
  status: "draft" | "final";
  generatedAt: string | null;
  updatedAt: string;
  partial: boolean | null;
  aggregationLayer: string | null;
};

export type MarketSignalItemRow = {
  id: string;
  rank: number | null;
  signalType: string;
  signalKey: string;
  displayName: string;
  currentCount: number | null;
  previousCount: number | null;
  changeRate: number | null;
  trendType: "rising" | "falling" | "new" | "stable" | null;
  signalStrength: number | null;
};

const PERIOD_TYPES: MarketSignalPeriodType[] = ["weekly", "monthly", "yearly"];

export function parseMarketSignalPeriodType(
  value: string | null,
): MarketSignalPeriodType {
  if (value === "weekly" || value === "monthly" || value === "yearly") {
    return value;
  }
  return "weekly";
}

export async function listMarketSignalSnapshots(
  db: SupabaseClient<Database>,
  params: {
    scopeKey?: string;
    periodType: MarketSignalPeriodType;
  },
): Promise<MarketSignalSnapshotSummary[]> {
  const scopeKey = params.scopeKey ?? MARKET_SIGNAL_DEFAULT_SCOPE_KEY;

  const { data, error } = await db
    .from("market_signal_snapshots")
    .select(
      "id, period_type, period_key, period_start, period_end, source_count, status, generated_at, updated_at, metadata",
    )
    .eq("scope_key", scopeKey)
    .eq("period_type", params.periodType)
    .order("period_key", { ascending: false });

  if (error) {
    throw new Error(`market_signal_snapshots 조회 실패: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const metadata =
      row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>)
        : {};
    return {
      id: row.id,
      periodType: row.period_type,
      periodKey: row.period_key,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      sourceCount: row.source_count,
      status: row.status,
      generatedAt: row.generated_at,
      updatedAt: row.updated_at,
      partial: typeof metadata.partial === "boolean" ? metadata.partial : null,
      aggregationLayer:
        typeof metadata.aggregation_layer === "string"
          ? metadata.aggregation_layer
          : null,
    };
  });
}

export async function getMarketSignalSnapshotByKey(
  db: SupabaseClient<Database>,
  params: {
    scopeKey?: string;
    periodType: MarketSignalPeriodType;
    periodKey: string;
  },
): Promise<MarketSignalSnapshotSummary | null> {
  const scopeKey = params.scopeKey ?? MARKET_SIGNAL_DEFAULT_SCOPE_KEY;

  const { data, error } = await db
    .from("market_signal_snapshots")
    .select(
      "id, period_type, period_key, period_start, period_end, source_count, status, generated_at, updated_at, metadata",
    )
    .eq("scope_key", scopeKey)
    .eq("period_type", params.periodType)
    .eq("period_key", params.periodKey)
    .maybeSingle();

  if (error) {
    throw new Error(`market_signal_snapshot 조회 실패: ${error.message}`);
  }
  if (!data) {
    return null;
  }

  const metadata =
    data.metadata && typeof data.metadata === "object" && !Array.isArray(data.metadata)
      ? (data.metadata as Record<string, unknown>)
      : {};

  return {
    id: data.id,
    periodType: data.period_type,
    periodKey: data.period_key,
    periodStart: data.period_start,
    periodEnd: data.period_end,
    sourceCount: data.source_count,
    status: data.status,
    generatedAt: data.generated_at,
    updatedAt: data.updated_at,
    partial: typeof metadata.partial === "boolean" ? metadata.partial : null,
    aggregationLayer:
      typeof metadata.aggregation_layer === "string"
        ? metadata.aggregation_layer
        : null,
  };
}

export async function listMarketSignalItems(
  db: SupabaseClient<Database>,
  snapshotId: string,
  limit = 50,
): Promise<MarketSignalItemRow[]> {
  const { data, error } = await db
    .from("market_signal_items")
    .select(
      "id, rank, signal_type, signal_key, display_name, current_count, previous_count, change_rate, trend_type, signal_strength",
    )
    .eq("snapshot_id", snapshotId)
    .order("rank", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`market_signal_items 조회 실패: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    rank: row.rank,
    signalType: row.signal_type,
    signalKey: row.signal_key,
    displayName: row.display_name,
    currentCount: row.current_count,
    previousCount: row.previous_count,
    changeRate: row.change_rate !== null ? Number(row.change_rate) : null,
    trendType: row.trend_type,
    signalStrength:
      row.signal_strength !== null ? Number(row.signal_strength) : null,
  }));
}

export function isSupportedMarketSignalPeriodType(
  value: string,
): value is MarketSignalPeriodType {
  return PERIOD_TYPES.includes(value as MarketSignalPeriodType);
}
