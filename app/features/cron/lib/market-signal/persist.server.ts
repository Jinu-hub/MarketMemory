import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "database.types";

import type {
  AggregatedSignalRow,
  MarketSignalPeriodType,
  MarketSignalSnapshotSourceInput,
  MarketSignalSnapshotStatus,
  MarketSignalScopeType,
} from "~/features/cron/lib/market-signal/types";

type PersistMarketSignalPeriodParams = {
  db: SupabaseClient<Database>;
  scopeType: MarketSignalScopeType;
  scopeKey: string;
  periodType: MarketSignalPeriodType;
  periodKey: string;
  periodStart: string;
  periodEnd: string;
  status: MarketSignalSnapshotStatus;
  sourceCount: number;
  sources: MarketSignalSnapshotSourceInput[];
  items: AggregatedSignalRow[];
  metadata: Record<string, unknown>;
};

export async function persistMarketSignalPeriod(
  params: PersistMarketSignalPeriodParams,
): Promise<string> {
  const now = new Date().toISOString();

  const { data: existing, error: existingError } = await params.db
    .from("market_signal_snapshots")
    .select("id")
    .eq("scope_type", params.scopeType)
    .eq("scope_key", params.scopeKey)
    .eq("period_type", params.periodType)
    .eq("period_key", params.periodKey)
    .maybeSingle();

  if (existingError) {
    throw new Error(`snapshot lookup 실패: ${existingError.message}`);
  }

  let snapshotId = existing?.id ?? null;

  if (snapshotId) {
    const { error: updateError } = await params.db
      .from("market_signal_snapshots")
      .update({
        period_start: params.periodStart,
        period_end: params.periodEnd,
        source_count: params.sourceCount,
        status: params.status,
        generated_at: now,
        metadata: params.metadata as Json,
        updated_at: now,
      })
      .eq("id", snapshotId);

    if (updateError) {
      throw new Error(`snapshot update 실패: ${updateError.message}`);
    }
  } else {
    const { data: inserted, error: insertError } = await params.db
      .from("market_signal_snapshots")
      .insert({
        scope_type: params.scopeType,
        scope_key: params.scopeKey,
        period_type: params.periodType,
        period_key: params.periodKey,
        period_start: params.periodStart,
        period_end: params.periodEnd,
        source_count: params.sourceCount,
        status: params.status,
        generated_at: now,
        metadata: params.metadata as Json,
        updated_at: now,
      })
      .select("id")
      .single();

    if (insertError) {
      throw new Error(`snapshot insert 실패: ${insertError.message}`);
    }
    snapshotId = inserted.id;
  }

  const { error: deleteItemsError } = await params.db
    .from("market_signal_items")
    .delete()
    .eq("snapshot_id", snapshotId);
  if (deleteItemsError) {
    throw new Error(`snapshot items delete 실패: ${deleteItemsError.message}`);
  }

  const { error: deleteSourcesError } = await params.db
    .from("market_signal_snapshot_sources")
    .delete()
    .eq("snapshot_id", snapshotId);
  if (deleteSourcesError) {
    throw new Error(`snapshot sources delete 실패: ${deleteSourcesError.message}`);
  }

  if (params.items.length > 0) {
    const { error: insertItemsError } = await params.db
      .from("market_signal_items")
      .insert(
        params.items.map((item) => ({
          snapshot_id: snapshotId,
          signal_type: item.signalType,
          signal_key: item.signalKey,
          display_name: item.displayName,
          rank: item.rank ?? null,
          current_count: item.currentCount,
          previous_count: item.previousCount ?? null,
          change_rate: item.changeRate ?? null,
          trend_type: item.trendType ?? null,
          signal_strength: item.signalStrength ?? null,
          metadata: {
            source_item_content_ids: item.sourceIds,
            distinct_market_dates: item.distinctMarketDates,
          } as Json,
          updated_at: now,
        })),
      );

    if (insertItemsError) {
      throw new Error(`snapshot items insert 실패: ${insertItemsError.message}`);
    }
  }

  if (params.sources.length > 0) {
    const { error: insertSourcesError } = await params.db
      .from("market_signal_snapshot_sources")
      .insert(
        params.sources.map((source) => ({
          snapshot_id: snapshotId,
          source_kind: source.sourceKind,
          source_id: source.sourceId,
          market_date: source.marketDate,
          report_type: source.reportType,
          input_hash: source.inputHash,
        })),
      );

    if (insertSourcesError) {
      throw new Error(`snapshot sources insert 실패: ${insertSourcesError.message}`);
    }
  }

  return snapshotId;
}

/** 종료된 period snapshot의 status만 final 로 승격 (집계 데이터는 유지) */
export async function finalizeMarketSignalSnapshotStatus(params: {
  db: SupabaseClient<Database>;
  scopeType: MarketSignalScopeType;
  scopeKey: string;
  periodType: MarketSignalPeriodType;
  periodKey: string;
  dryRun: boolean;
}): Promise<{ snapshotId: string; wasDraft: boolean } | null> {
  const { data: existing, error: existingError } = await params.db
    .from("market_signal_snapshots")
    .select("id, status")
    .eq("scope_type", params.scopeType)
    .eq("scope_key", params.scopeKey)
    .eq("period_type", params.periodType)
    .eq("period_key", params.periodKey)
    .maybeSingle();

  if (existingError) {
    throw new Error(`snapshot lookup 실패: ${existingError.message}`);
  }
  if (!existing || existing.status === "final") {
    return null;
  }

  if (!params.dryRun) {
    const now = new Date().toISOString();
    const { error: updateError } = await params.db
      .from("market_signal_snapshots")
      .update({
        status: "final",
        updated_at: now,
      })
      .eq("id", existing.id);

    if (updateError) {
      throw new Error(`snapshot finalize 실패: ${updateError.message}`);
    }
  }

  return { snapshotId: existing.id, wasDraft: true };
}
