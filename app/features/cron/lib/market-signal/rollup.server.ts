import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "database.types";

import {
  isDateInRange,
  periodOverlapsRange,
  resolvePeriodRange,
} from "~/features/cron/lib/market-signal/period";
import type {
  AggregatedSignalRow,
  MarketSignalScopeType,
  MarketSignalSnapshotSourceInput,
  MarketSignalSnapshotStatus,
  MarketSignalType,
} from "~/features/cron/lib/market-signal/types";

export const MARKET_SIGNAL_ROLLUP_VERSION = "prorate-v1";

type SnapshotRow = {
  id: string;
  period_key: string;
  period_start: string;
  period_end: string;
  status: MarketSignalSnapshotStatus;
  updated_at: string;
};

type SnapshotItemRow = {
  signal_type: MarketSignalType;
  signal_key: string;
  display_name: string;
  current_count: number | null;
  metadata: Json | null;
};

export type RollupBuildResult = {
  items: AggregatedSignalRow[];
  sources: MarketSignalSnapshotSourceInput[];
  leafSourceCount: number;
  metadata: Record<string, unknown>;
};

function parseItemSourceIds(metadata: Json | null): string[] {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return [];
  }
  const ids = (metadata as Record<string, unknown>).source_item_content_ids;
  if (!Array.isArray(ids)) {
    return [];
  }
  return ids.filter((id): id is string => typeof id === "string");
}

function rankRollupRows(
  stats: Map<
    string,
    AggregatedSignalRow & {
      marketDates: Set<string>;
      sourceIdSet: Set<string>;
    }
  >,
  minCount: number,
  leafSourceCount: number,
): AggregatedSignalRow[] {
  return [...stats.values()]
    .map((row) => ({
      signalType: row.signalType,
      signalKey: row.signalKey,
      displayName: row.displayName,
      currentCount: row.currentCount,
      distinctMarketDates: [...row.marketDates].sort(),
      sourceIds: row.sourceIds,
    }))
    .filter((row) => row.currentCount >= minCount)
    .sort(
      (a, b) =>
        b.currentCount - a.currentCount ||
        a.signalType.localeCompare(b.signalType) ||
        a.displayName.localeCompare(b.displayName),
    )
    .map((row, index) => ({
      ...row,
      rank: index + 1,
      signalStrength:
        leafSourceCount > 0
          ? Number((row.currentCount / leafSourceCount).toFixed(4))
          : null,
    }));
}

async function fetchChildSnapshots(
  db: SupabaseClient<Database>,
  params: {
    scopeType: MarketSignalScopeType;
    scopeKey: string;
    childPeriodType: "weekly" | "monthly";
    rangeStart: string;
    rangeEnd: string;
  },
): Promise<SnapshotRow[]> {
  const { data, error } = await db
    .from("market_signal_snapshots")
    .select("id, period_key, period_start, period_end, status, updated_at")
    .eq("scope_type", params.scopeType)
    .eq("scope_key", params.scopeKey)
    .eq("period_type", params.childPeriodType)
    .lte("period_start", params.rangeEnd)
    .gte("period_end", params.rangeStart)
    .order("period_key", { ascending: true });

  if (error) {
    throw new Error(`${params.childPeriodType} snapshot 조회 실패: ${error.message}`);
  }

  return (data ?? []).filter((row) =>
    periodOverlapsRange(row.period_start, row.period_end, params.rangeStart, params.rangeEnd),
  );
}

async function fetchSnapshotItems(
  db: SupabaseClient<Database>,
  snapshotId: string,
): Promise<SnapshotItemRow[]> {
  const { data, error } = await db
    .from("market_signal_items")
    .select("signal_type, signal_key, display_name, current_count, metadata")
    .eq("snapshot_id", snapshotId);

  if (error) {
    throw new Error(`snapshot items 조회 실패: ${error.message}`);
  }
  return data ?? [];
}

async function fetchItemContentDatesBySnapshot(
  db: SupabaseClient<Database>,
  snapshotId: string,
): Promise<Map<string, string>> {
  const { data, error } = await db
    .from("market_signal_snapshot_sources")
    .select("source_id, market_date")
    .eq("snapshot_id", snapshotId)
    .eq("source_kind", "item_content");

  if (error) {
    throw new Error(`weekly snapshot sources 조회 실패: ${error.message}`);
  }

  const map = new Map<string, string>();
  for (const row of data ?? []) {
    if (row.market_date) {
      map.set(row.source_id, row.market_date);
    }
  }
  return map;
}

/** weekly snapshots → monthly (prorate by market_date within month) */
export async function buildMonthlyRollupFromWeekly(params: {
  db: SupabaseClient<Database>;
  scopeType: MarketSignalScopeType;
  scopeKey: string;
  monthPeriodKey: string;
  minCount: number;
}): Promise<RollupBuildResult | null> {
  const { periodStart, periodEnd } = resolvePeriodRange(
    params.monthPeriodKey,
    "monthly",
  );

  const weeklySnapshots = await fetchChildSnapshots(params.db, {
    scopeType: params.scopeType,
    scopeKey: params.scopeKey,
    childPeriodType: "weekly",
    rangeStart: periodStart,
    rangeEnd: periodEnd,
  });

  if (weeklySnapshots.length === 0) {
    return null;
  }

  const stats = new Map<
    string,
    AggregatedSignalRow & {
      marketDates: Set<string>;
      sourceIdSet: Set<string>;
    }
  >();
  const leafSourceIds = new Set<string>();
  const includedWeeks: Array<{
    period_key: string;
    snapshot_id: string;
    status: MarketSignalSnapshotStatus;
  }> = [];

  for (const weekly of weeklySnapshots) {
    includedWeeks.push({
      period_key: weekly.period_key,
      snapshot_id: weekly.id,
      status: weekly.status,
    });

    const dateBySource = await fetchItemContentDatesBySnapshot(params.db, weekly.id);
    const items = await fetchSnapshotItems(params.db, weekly.id);

    for (const item of items) {
      const mapKey = `${item.signal_type}::${item.signal_key}`;
      const current = stats.get(mapKey) ?? {
        signalType: item.signal_type,
        signalKey: item.signal_key,
        displayName: item.display_name,
        currentCount: 0,
        distinctMarketDates: [],
        sourceIds: [],
        marketDates: new Set<string>(),
        sourceIdSet: new Set<string>(),
      };

      for (const sourceId of parseItemSourceIds(item.metadata)) {
        const marketDate = dateBySource.get(sourceId);
        if (!marketDate || !isDateInRange(marketDate, periodStart, periodEnd)) {
          continue;
        }
        if (current.sourceIdSet.has(sourceId)) {
          continue;
        }
        current.sourceIdSet.add(sourceId);
        current.sourceIds.push(sourceId);
        current.currentCount += 1;
        current.marketDates.add(marketDate);
        leafSourceIds.add(sourceId);
      }

      stats.set(mapKey, current);
    }
  }

  const items = rankRollupRows(stats, params.minCount, leafSourceIds.size);
  const hasDraftWeek = includedWeeks.some((week) => week.status === "draft");

  return {
    items,
    sources: weeklySnapshots.map((weekly) => ({
      sourceKind: "weekly_snapshot" as const,
      sourceId: weekly.id,
      marketDate: weekly.period_start,
      reportType: null,
      inputHash: weekly.updated_at,
    })),
    leafSourceCount: leafSourceIds.size,
    metadata: {
      aggregation_layer: "weekly_rollup",
      prorate_method: "market_date",
      rollup_version: MARKET_SIGNAL_ROLLUP_VERSION,
      included_weeks: includedWeeks,
      partial: hasDraftWeek,
      min_count_threshold: params.minCount,
    },
  };
}

/** monthly snapshots → yearly (sum prorated monthly counts; calendar months do not overlap) */
export async function buildYearlyRollupFromMonthly(params: {
  db: SupabaseClient<Database>;
  scopeType: MarketSignalScopeType;
  scopeKey: string;
  yearPeriodKey: string;
  minCount: number;
}): Promise<RollupBuildResult | null> {
  const { periodStart, periodEnd } = resolvePeriodRange(
    params.yearPeriodKey,
    "yearly",
  );

  const monthlySnapshots = await fetchChildSnapshots(params.db, {
    scopeType: params.scopeType,
    scopeKey: params.scopeKey,
    childPeriodType: "monthly",
    rangeStart: periodStart,
    rangeEnd: periodEnd,
  });

  if (monthlySnapshots.length === 0) {
    return null;
  }

  const stats = new Map<
    string,
    AggregatedSignalRow & {
      marketDates: Set<string>;
      sourceIdSet: Set<string>;
    }
  >();
  const leafSourceIds = new Set<string>();
  const includedMonths: Array<{
    period_key: string;
    snapshot_id: string;
    status: MarketSignalSnapshotStatus;
  }> = [];

  for (const monthly of monthlySnapshots) {
    includedMonths.push({
      period_key: monthly.period_key,
      snapshot_id: monthly.id,
      status: monthly.status,
    });

    const items = await fetchSnapshotItems(params.db, monthly.id);

    for (const item of items) {
      const mapKey = `${item.signal_type}::${item.signal_key}`;
      const current = stats.get(mapKey) ?? {
        signalType: item.signal_type,
        signalKey: item.signal_key,
        displayName: item.display_name,
        currentCount: 0,
        distinctMarketDates: [],
        sourceIds: [],
        marketDates: new Set<string>(),
        sourceIdSet: new Set<string>(),
      };

      current.currentCount += item.current_count ?? 0;

      for (const sourceId of parseItemSourceIds(item.metadata)) {
        if (current.sourceIdSet.has(sourceId)) {
          continue;
        }
        current.sourceIdSet.add(sourceId);
        current.sourceIds.push(sourceId);
        leafSourceIds.add(sourceId);
      }

      for (const date of parseDistinctMarketDates(item.metadata)) {
        if (isDateInRange(date, periodStart, periodEnd)) {
          current.marketDates.add(date);
        }
      }

      stats.set(mapKey, current);
    }
  }

  const items = rankRollupRows(stats, params.minCount, leafSourceIds.size);
  const hasDraftMonth = includedMonths.some((month) => month.status === "draft");

  return {
    items,
    sources: monthlySnapshots.map((monthly) => ({
      sourceKind: "monthly_snapshot" as const,
      sourceId: monthly.id,
      marketDate: monthly.period_start,
      reportType: null,
      inputHash: monthly.updated_at,
    })),
    leafSourceCount: leafSourceIds.size,
    metadata: {
      aggregation_layer: "monthly_rollup",
      prorate_method: "calendar_month_sum",
      rollup_version: MARKET_SIGNAL_ROLLUP_VERSION,
      included_months: includedMonths,
      partial: hasDraftMonth,
      min_count_threshold: params.minCount,
    },
  };
}

function parseDistinctMarketDates(metadata: Json | null): string[] {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return [];
  }
  const dates = (metadata as Record<string, unknown>).distinct_market_dates;
  if (!Array.isArray(dates)) {
    return [];
  }
  return dates.filter((date): date is string => typeof date === "string");
}

/** rollup parent snapshot 에 기록된 child snapshot lineage (source_id → input_hash) */
export async function fetchRollupLineageIndex(
  db: SupabaseClient<Database>,
  params: {
    scopeType: MarketSignalScopeType;
    scopeKey: string;
    parentPeriodType: "monthly" | "yearly";
    parentPeriodKey: string;
    childSourceKind: "weekly_snapshot" | "monthly_snapshot";
  },
): Promise<Map<string, string | null>> {
  const { data: parent, error: parentError } = await db
    .from("market_signal_snapshots")
    .select("id")
    .eq("scope_type", params.scopeType)
    .eq("scope_key", params.scopeKey)
    .eq("period_type", params.parentPeriodType)
    .eq("period_key", params.parentPeriodKey)
    .maybeSingle();

  if (parentError) {
    throw new Error(`parent snapshot lookup 실패: ${parentError.message}`);
  }
  if (!parent) {
    return new Map();
  }

  const { data: sources, error: sourcesError } = await db
    .from("market_signal_snapshot_sources")
    .select("source_id, input_hash")
    .eq("snapshot_id", parent.id)
    .eq("source_kind", params.childSourceKind);

  if (sourcesError) {
    throw new Error(`rollup lineage 조회 실패: ${sourcesError.message}`);
  }

  const indexed = new Map<string, string | null>();
  for (const row of sources ?? []) {
    indexed.set(row.source_id, row.input_hash);
  }
  return indexed;
}

export function detectRollupPending(
  childSnapshots: SnapshotRow[],
  lineage: Map<string, string | null>,
): number {
  if (childSnapshots.length === 0) {
    return 0;
  }
  let pending = 0;
  for (const child of childSnapshots) {
    const stored = lineage.get(child.id);
    if (stored === undefined || stored !== child.updated_at) {
      pending += 1;
    }
  }
  return pending;
}

export async function fetchWeeklySnapshotsForMonth(
  db: SupabaseClient<Database>,
  scopeType: MarketSignalScopeType,
  scopeKey: string,
  monthPeriodKey: string,
): Promise<SnapshotRow[]> {
  const { periodStart, periodEnd } = resolvePeriodRange(monthPeriodKey, "monthly");
  return fetchChildSnapshots(db, {
    scopeType,
    scopeKey,
    childPeriodType: "weekly",
    rangeStart: periodStart,
    rangeEnd: periodEnd,
  });
}

export async function fetchMonthlySnapshotsForYear(
  db: SupabaseClient<Database>,
  scopeType: MarketSignalScopeType,
  scopeKey: string,
  yearPeriodKey: string,
): Promise<SnapshotRow[]> {
  const { periodStart, periodEnd } = resolvePeriodRange(yearPeriodKey, "yearly");
  return fetchChildSnapshots(db, {
    scopeType,
    scopeKey,
    childPeriodType: "monthly",
    rangeStart: periodStart,
    rangeEnd: periodEnd,
  });
}
