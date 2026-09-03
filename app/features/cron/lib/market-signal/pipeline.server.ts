import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "database.types";

import {
  fetchIndexedSnapshotSources,
  filterSourcesNeedingProcessing,
} from "~/features/cron/lib/market-signal/discover.server";
import {
  extractSignalAtomsFromItemContent,
  MARKET_SIGNAL_AGGREGATION_VERSION,
} from "~/features/cron/lib/market-signal/extractors/metadata-v1";
import {
  enumeratePeriodKeys,
  formatMarketDate,
  resolvePeriodKey,
  resolvePeriodRange,
  resolvePreviousPeriodKey,
  resolveSnapshotStatus,
} from "~/features/cron/lib/market-signal/period";
import {
  finalizeMarketSignalSnapshotStatus,
  persistMarketSignalPeriod,
} from "./persist.server";
import {
  buildMonthlyRollupFromWeekly,
  buildYearlyRollupFromMonthly,
  detectRollupPending,
  fetchMonthlySnapshotsForYear,
  fetchRollupLineageIndex,
  fetchWeeklySnapshotsForMonth,
  type RollupBuildResult,
} from "./rollup.server";
import {
  fetchItemContentSignalSources,
  getSignalSourceSelector,
  groupSourcesByPeriod,
} from "~/features/cron/lib/market-signal/source-selectors/global-market-issues";
import type {
  AggregatedSignalRow,
  ItemContentSignalSource,
  MarketSignalPeriodType,
  MarketSignalPipelineMode,
  MarketSignalPipelineResult,
  MarketSignalSnapshotStatus,
  PeriodAggregateResult,
  RunMarketSignalPipelineParams,
} from "~/features/cron/lib/market-signal/types";

import adminClient from "~/core/lib/supa-admin-client.server";

const DEFAULT_SCOPE_KEY = "global-market-issues";
const DEFAULT_MIN_COUNT = 2;

const LEAF_PERIOD_TYPES = new Set<MarketSignalPeriodType>(["weekly"]);
const ROLLUP_PERIOD_TYPES = new Set<MarketSignalPeriodType>(["monthly", "yearly"]);

function splitPeriodTypes(periodTypes: MarketSignalPeriodType[]) {
  return {
    leaf: periodTypes.filter((type) => LEAF_PERIOD_TYPES.has(type)),
    rollup: periodTypes.filter((type) => ROLLUP_PERIOD_TYPES.has(type)),
  };
}

function computeTrend(
  currentCount: number,
  previousCount: number | null | undefined,
): Pick<AggregatedSignalRow, "previousCount" | "changeRate" | "trendType"> {
  const previous = previousCount ?? 0;
  if (previous === 0 && currentCount > 0) {
    return { previousCount: 0, changeRate: null, trendType: "new" };
  }
  if (previous === 0 && currentCount === 0) {
    return { previousCount: 0, changeRate: null, trendType: "stable" };
  }

  const changeRate = Number(((currentCount - previous) / previous).toFixed(4));
  let trendType: AggregatedSignalRow["trendType"] = "stable";
  if (changeRate >= 0.2) trendType = "rising";
  if (changeRate <= -0.2) trendType = "falling";

  return { previousCount: previous, changeRate, trendType };
}

function aggregateLeafSources(
  sources: ItemContentSignalSource[],
  minCount: number,
): AggregatedSignalRow[] {
  const stats = new Map<
    string,
    AggregatedSignalRow & {
      marketDates: Set<string>;
      sourceIdSet: Set<string>;
    }
  >();

  for (const source of sources) {
    const atoms = extractSignalAtomsFromItemContent(source);
    for (const atom of atoms) {
      const mapKey = `${atom.signalType}::${atom.signalKey}`;
      const current = stats.get(mapKey) ?? {
        ...atom,
        currentCount: 0,
        distinctMarketDates: [],
        sourceIds: [],
        marketDates: new Set<string>(),
        sourceIdSet: new Set<string>(),
      };

      if (!current.sourceIdSet.has(source.id)) {
        current.sourceIdSet.add(source.id);
        current.currentCount += 1;
        current.sourceIds.push(source.id);
      }
      current.marketDates.add(source.market_date);
      stats.set(mapKey, current);
    }
  }

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
        sources.length > 0
          ? Number((row.currentCount / sources.length).toFixed(4))
          : null,
    }));
}

async function loadPreviousSignalCounts(
  db: SupabaseClient<Database>,
  scopeType: "content_type",
  scopeKey: string,
  periodType: MarketSignalPeriodType,
  periodKeys: string[],
  currentPeriodKey: string,
): Promise<Map<string, number>> {
  const previousKeys = periodKeys.filter((key) => key < currentPeriodKey);
  const previousKey =
    previousKeys.at(-1) ?? resolvePreviousPeriodKey(currentPeriodKey, periodType);
  if (!previousKey) {
    return new Map();
  }

  const { data: snapshot, error: snapshotError } = await db
    .from("market_signal_snapshots")
    .select("id")
    .eq("scope_type", scopeType)
    .eq("scope_key", scopeKey)
    .eq("period_type", periodType)
    .eq("period_key", previousKey)
    .maybeSingle();

  if (snapshotError) {
    throw new Error(`previous snapshot 조회 실패: ${snapshotError.message}`);
  }
  if (!snapshot) {
    return new Map();
  }

  const { data: items, error: itemsError } = await db
    .from("market_signal_items")
    .select("signal_type, signal_key, current_count")
    .eq("snapshot_id", snapshot.id);

  if (itemsError) {
    throw new Error(`previous snapshot items 조회 실패: ${itemsError.message}`);
  }

  const map = new Map<string, number>();
  for (const item of items ?? []) {
    map.set(`${item.signal_type}::${item.signal_key}`, item.current_count ?? 0);
  }
  return map;
}

async function persistWeeklyLeafPeriod(params: {
  db: SupabaseClient<Database>;
  selector: ReturnType<typeof getSignalSourceSelector>;
  periodKey: string;
  sources: ItemContentSignalSource[];
  allPeriodKeys: string[];
  minCount: number;
  status: MarketSignalSnapshotStatus;
  dryRun: boolean;
}): Promise<PeriodAggregateResult> {
  const { periodStart, periodEnd } = resolvePeriodRange(params.periodKey, "weekly");

  const previousCounts = await loadPreviousSignalCounts(
    params.db,
    params.selector.scopeType,
    params.selector.scopeKey,
    "weekly",
    params.allPeriodKeys,
    params.periodKey,
  );

  const aggregated = aggregateLeafSources(params.sources, params.minCount).map((row) => ({
    ...row,
    ...computeTrend(
      row.currentCount,
      previousCounts.get(`${row.signalType}::${row.signalKey}`),
    ),
  }));

  let snapshotId: string | null = null;

  if (!params.dryRun) {
    snapshotId = await persistMarketSignalPeriod({
      db: params.db,
      scopeType: params.selector.scopeType,
      scopeKey: params.selector.scopeKey,
      periodType: "weekly",
      periodKey: params.periodKey,
      periodStart,
      periodEnd,
      status: params.status,
      sourceCount: params.sources.length,
      sources: params.sources.map((source) => ({
        sourceKind: params.selector.sourceKind,
        sourceId: source.id,
        marketDate: source.market_date,
        reportType: source.report_type,
        inputHash: source.input_hash,
      })),
      items: aggregated,
      metadata: {
        observation_layer: params.selector.observationLayer,
        source_family: params.selector.scopeKey,
        aggregation_version: MARKET_SIGNAL_AGGREGATION_VERSION,
        min_count_threshold: params.minCount,
      },
    });
  }

  return {
    periodKey: params.periodKey,
    periodStart,
    periodEnd,
    sourceCount: params.sources.length,
    itemCount: aggregated.length,
    snapshotId,
    status: params.status,
    topSignals: aggregated.slice(0, 10).map((row) => ({
      signalType: row.signalType,
      signalKey: row.signalKey,
      displayName: row.displayName,
      currentCount: row.currentCount,
      trendType: row.trendType ?? null,
    })),
  };
}

async function persistRollupPeriod(params: {
  db: SupabaseClient<Database>;
  selector: ReturnType<typeof getSignalSourceSelector>;
  periodType: "monthly" | "yearly";
  periodKey: string;
  rollup: RollupBuildResult;
  allPeriodKeys: string[];
  minCount: number;
  status: MarketSignalSnapshotStatus;
  dryRun: boolean;
}): Promise<PeriodAggregateResult> {
  const { periodStart, periodEnd } = resolvePeriodRange(
    params.periodKey,
    params.periodType,
  );

  const previousCounts = await loadPreviousSignalCounts(
    params.db,
    params.selector.scopeType,
    params.selector.scopeKey,
    params.periodType,
    params.allPeriodKeys,
    params.periodKey,
  );

  const aggregated = params.rollup.items.map((row) => ({
    ...row,
    ...computeTrend(
      row.currentCount,
      previousCounts.get(`${row.signalType}::${row.signalKey}`),
    ),
  }));

  let snapshotId: string | null = null;

  if (!params.dryRun) {
    snapshotId = await persistMarketSignalPeriod({
      db: params.db,
      scopeType: params.selector.scopeType,
      scopeKey: params.selector.scopeKey,
      periodType: params.periodType,
      periodKey: params.periodKey,
      periodStart,
      periodEnd,
      status: params.status,
      sourceCount: params.rollup.leafSourceCount,
      sources: params.rollup.sources,
      items: aggregated,
      metadata: {
        observation_layer: params.selector.observationLayer,
        source_family: params.selector.scopeKey,
        ...params.rollup.metadata,
      },
    });
  }

  return {
    periodKey: params.periodKey,
    periodStart,
    periodEnd,
    sourceCount: params.rollup.leafSourceCount,
    itemCount: aggregated.length,
    snapshotId,
    status: params.status,
    topSignals: aggregated.slice(0, 10).map((row) => ({
      signalType: row.signalType,
      signalKey: row.signalKey,
      displayName: row.displayName,
      currentCount: row.currentCount,
      trendType: row.trendType ?? null,
    })),
  };
}

async function runWeeklyRollupForMonth(params: {
  db: SupabaseClient<Database>;
  selector: ReturnType<typeof getSignalSourceSelector>;
  monthPeriodKey: string;
  allMonthKeys: string[];
  minCount: number;
  status: MarketSignalSnapshotStatus;
  dryRun: boolean;
}): Promise<PeriodAggregateResult | null> {
  const rollup = await buildMonthlyRollupFromWeekly({
    db: params.db,
    scopeType: params.selector.scopeType,
    scopeKey: params.selector.scopeKey,
    monthPeriodKey: params.monthPeriodKey,
    minCount: params.minCount,
  });
  if (!rollup) {
    return null;
  }

  return persistRollupPeriod({
    db: params.db,
    selector: params.selector,
    periodType: "monthly",
    periodKey: params.monthPeriodKey,
    rollup,
    allPeriodKeys: params.allMonthKeys,
    minCount: params.minCount,
    status: params.status,
    dryRun: params.dryRun,
  });
}

async function runMonthlyRollupForYear(params: {
  db: SupabaseClient<Database>;
  selector: ReturnType<typeof getSignalSourceSelector>;
  yearPeriodKey: string;
  allYearKeys: string[];
  minCount: number;
  status: MarketSignalSnapshotStatus;
  dryRun: boolean;
}): Promise<PeriodAggregateResult | null> {
  const rollup = await buildYearlyRollupFromMonthly({
    db: params.db,
    scopeType: params.selector.scopeType,
    scopeKey: params.selector.scopeKey,
    yearPeriodKey: params.yearPeriodKey,
    minCount: params.minCount,
  });
  if (!rollup) {
    return null;
  }

  return persistRollupPeriod({
    db: params.db,
    selector: params.selector,
    periodType: "yearly",
    periodKey: params.yearPeriodKey,
    rollup,
    allPeriodKeys: params.allYearKeys,
    minCount: params.minCount,
    status: params.status,
    dryRun: params.dryRun,
  });
}

async function runWeeklyBackfill(params: {
  db: SupabaseClient<Database>;
  selector: ReturnType<typeof getSignalSourceSelector>;
  mode: MarketSignalPipelineMode;
  periodKey?: string;
  from?: string;
  to?: string;
  finalize: boolean;
  minCount: number;
  dryRun: boolean;
  referenceDate: string;
  allSources: ItemContentSignalSource[];
}): Promise<{ periodsProcessed: PeriodAggregateResult[]; info: string[]; errors: string[] }> {
  const info: string[] = [];
  const errors: string[] = [];
  const periodsProcessed: PeriodAggregateResult[] = [];

  const grouped = groupSourcesByPeriod(params.allSources, (marketDate) =>
    resolvePeriodKey(marketDate, "weekly"),
  );
  const allPeriodKeys = [...grouped.keys()].sort();
  const targetPeriodKeys =
    params.mode === "period" && params.periodKey ? [params.periodKey] : allPeriodKeys;

  for (const periodKey of targetPeriodKeys) {
    const sources = grouped.get(periodKey) ?? [];
    if (sources.length === 0) {
      info.push(`weekly/${periodKey}: source 0건 — skip`);
      continue;
    }

    const forceFinal =
      params.finalize && (params.mode === "backfill" || params.mode === "period");
    const status = resolveSnapshotStatus(
      periodKey,
      "weekly",
      params.referenceDate,
      forceFinal,
    );

    try {
      const result = await persistWeeklyLeafPeriod({
        db: params.db,
        selector: params.selector,
        periodKey,
        sources,
        allPeriodKeys,
        minCount: params.minCount,
        status,
        dryRun: params.dryRun,
      });
      periodsProcessed.push(result);
      info.push(
        `weekly/${periodKey}: leaf sources=${result.sourceCount}, items=${result.itemCount}, status=${result.status}${params.dryRun ? " (dry run)" : ""}`,
      );
    } catch (error) {
      errors.push(
        `weekly/${periodKey} 집계 실패: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  return { periodsProcessed, info, errors };
}

async function runRollupBackfill(params: {
  db: SupabaseClient<Database>;
  selector: ReturnType<typeof getSignalSourceSelector>;
  mode: MarketSignalPipelineMode;
  periodTypes: MarketSignalPeriodType[];
  periodKey?: string;
  from: string;
  to: string;
  finalize: boolean;
  minCount: number;
  dryRun: boolean;
  referenceDate: string;
}): Promise<{ periodsProcessed: PeriodAggregateResult[]; info: string[]; errors: string[] }> {
  const info: string[] = [];
  const errors: string[] = [];
  const periodsProcessed: PeriodAggregateResult[] = [];

  if (params.periodTypes.includes("monthly")) {
    const monthKeys =
      params.mode === "period" && params.periodKey?.includes("-")
        ? [params.periodKey]
        : enumeratePeriodKeys(params.from, params.to, "monthly");

    for (const monthKey of monthKeys) {
      const forceFinal =
        params.finalize && (params.mode === "backfill" || params.mode === "period");
      const status = resolveSnapshotStatus(
        monthKey,
        "monthly",
        params.referenceDate,
        forceFinal,
      );

      try {
        const result = await runWeeklyRollupForMonth({
          db: params.db,
          selector: params.selector,
          monthPeriodKey: monthKey,
          allMonthKeys: monthKeys,
          minCount: params.minCount,
          status,
          dryRun: params.dryRun,
        });
        if (!result) {
          info.push(`monthly/${monthKey}: weekly snapshot 0건 — skip`);
          continue;
        }
        periodsProcessed.push(result);
        info.push(
          `monthly/${monthKey}: rollup sources=${result.sourceCount}, items=${result.itemCount}, status=${result.status}${params.dryRun ? " (dry run)" : ""}`,
        );
      } catch (error) {
        errors.push(
          `monthly/${monthKey} rollup 실패: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  if (params.periodTypes.includes("yearly")) {
    const yearKeys =
      params.mode === "period" && params.periodKey && /^\d{4}$/.test(params.periodKey)
        ? [params.periodKey]
        : enumeratePeriodKeys(params.from, params.to, "yearly");

    for (const yearKey of yearKeys) {
      const forceFinal =
        params.finalize && (params.mode === "backfill" || params.mode === "period");
      const status = resolveSnapshotStatus(
        yearKey,
        "yearly",
        params.referenceDate,
        forceFinal,
      );

      try {
        const result = await runMonthlyRollupForYear({
          db: params.db,
          selector: params.selector,
          yearPeriodKey: yearKey,
          allYearKeys: yearKeys,
          minCount: params.minCount,
          status,
          dryRun: params.dryRun,
        });
        if (!result) {
          info.push(`yearly/${yearKey}: monthly snapshot 0건 — skip`);
          continue;
        }
        periodsProcessed.push(result);
        info.push(
          `yearly/${yearKey}: rollup sources=${result.sourceCount}, items=${result.itemCount}, status=${result.status}${params.dryRun ? " (dry run)" : ""}`,
        );
      } catch (error) {
        errors.push(
          `yearly/${yearKey} rollup 실패: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  return { periodsProcessed, info, errors };
}

async function finalizeClosedWeeklyDrafts(params: {
  db: SupabaseClient<Database>;
  selector: ReturnType<typeof getSignalSourceSelector>;
  currentPeriodKey: string;
  referenceDate: string;
  indexed: Map<string, string | null>;
  minCount: number;
  dryRun: boolean;
  info: string[];
  errors: string[];
  periodsProcessed: PeriodAggregateResult[];
}): Promise<void> {
  const { data: draftSnapshots, error: draftError } = await params.db
    .from("market_signal_snapshots")
    .select("id, period_key, period_start, period_end, source_count, status")
    .eq("scope_type", params.selector.scopeType)
    .eq("scope_key", params.selector.scopeKey)
    .eq("period_type", "weekly")
    .eq("status", "draft")
    .lt("period_end", params.referenceDate)
    .order("period_key", { ascending: true });

  if (draftError) {
    params.errors.push(`weekly closed draft 조회 실패: ${draftError.message}`);
    return;
  }

  for (const snapshot of draftSnapshots ?? []) {
    if (snapshot.period_key === params.currentPeriodKey) {
      continue;
    }

    const periodSources = await fetchItemContentSignalSources(
      params.db,
      params.selector,
      { from: snapshot.period_start, to: snapshot.period_end },
    );
    const pending = filterSourcesNeedingProcessing(periodSources, params.indexed);

    if (pending.length > 0) {
      const allPeriodKeys = [snapshot.period_key];
      const previousKey = resolvePreviousPeriodKey(snapshot.period_key, "weekly");
      if (previousKey) {
        allPeriodKeys.unshift(previousKey);
      }

      try {
        const result = await persistWeeklyLeafPeriod({
          db: params.db,
          selector: params.selector,
          periodKey: snapshot.period_key,
          sources: periodSources,
          allPeriodKeys,
          minCount: params.minCount,
          status: "final",
          dryRun: params.dryRun,
        });
        params.periodsProcessed.push(result);
        params.info.push(
          `weekly/${snapshot.period_key}: closed finalize (pending=${pending.length}), status=final${params.dryRun ? " (dry run)" : ""}`,
        );
      } catch (error) {
        params.errors.push(
          `weekly/${snapshot.period_key} closed finalize 실패: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
      continue;
    }

    try {
      const finalized = await finalizeMarketSignalSnapshotStatus({
        db: params.db,
        scopeType: params.selector.scopeType,
        scopeKey: params.selector.scopeKey,
        periodType: "weekly",
        periodKey: snapshot.period_key,
        dryRun: params.dryRun,
      });
      if (finalized) {
        params.periodsProcessed.push({
          periodKey: snapshot.period_key,
          periodStart: snapshot.period_start,
          periodEnd: snapshot.period_end,
          sourceCount: snapshot.source_count,
          itemCount: 0,
          snapshotId: finalized.snapshotId,
          status: "final",
          topSignals: [],
        });
        params.info.push(
          `weekly/${snapshot.period_key}: closed finalize (status only), status=final${params.dryRun ? " (dry run)" : ""}`,
        );
      }
    } catch (error) {
      params.errors.push(
        `weekly/${snapshot.period_key} status finalize 실패: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}

async function finalizeClosedRollupDrafts(params: {
  db: SupabaseClient<Database>;
  selector: ReturnType<typeof getSignalSourceSelector>;
  periodType: "monthly" | "yearly";
  currentPeriodKey: string;
  referenceDate: string;
  minCount: number;
  dryRun: boolean;
  info: string[];
  errors: string[];
  periodsProcessed: PeriodAggregateResult[];
}): Promise<void> {
  const { data: draftSnapshots, error: draftError } = await params.db
    .from("market_signal_snapshots")
    .select("id, period_key, period_start, period_end, source_count, status")
    .eq("scope_type", params.selector.scopeType)
    .eq("scope_key", params.selector.scopeKey)
    .eq("period_type", params.periodType)
    .eq("status", "draft")
    .lt("period_end", params.referenceDate)
    .order("period_key", { ascending: true });

  if (draftError) {
    params.errors.push(`${params.periodType} closed draft 조회 실패: ${draftError.message}`);
    return;
  }

  for (const snapshot of draftSnapshots ?? []) {
    if (snapshot.period_key === params.currentPeriodKey) {
      continue;
    }

    try {
      const result =
        params.periodType === "monthly"
          ? await runWeeklyRollupForMonth({
              db: params.db,
              selector: params.selector,
              monthPeriodKey: snapshot.period_key,
              allMonthKeys: [snapshot.period_key],
              minCount: params.minCount,
              status: "final",
              dryRun: params.dryRun,
            })
          : await runMonthlyRollupForYear({
              db: params.db,
              selector: params.selector,
              yearPeriodKey: snapshot.period_key,
              allYearKeys: [snapshot.period_key],
              minCount: params.minCount,
              status: "final",
              dryRun: params.dryRun,
            });

      if (result) {
        params.periodsProcessed.push(result);
        params.info.push(
          `${params.periodType}/${snapshot.period_key}: closed rollup finalize, status=final${params.dryRun ? " (dry run)" : ""}`,
        );
      } else {
        const finalized = await finalizeMarketSignalSnapshotStatus({
          db: params.db,
          scopeType: params.selector.scopeType,
          scopeKey: params.selector.scopeKey,
          periodType: params.periodType,
          periodKey: snapshot.period_key,
          dryRun: params.dryRun,
        });
        if (finalized) {
          params.info.push(
            `${params.periodType}/${snapshot.period_key}: closed finalize (status only), status=final${params.dryRun ? " (dry run)" : ""}`,
          );
        }
      }
    } catch (error) {
      params.errors.push(
        `${params.periodType}/${snapshot.period_key} closed finalize 실패: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}

async function discoverWeekly(params: {
  db: SupabaseClient<Database>;
  selector: ReturnType<typeof getSignalSourceSelector>;
  indexed: Map<string, string | null>;
  minCount: number;
  dryRun: boolean;
  referenceDate: string;
}): Promise<{
  scanned: number;
  discovered: number;
  periodsProcessed: PeriodAggregateResult[];
  info: string[];
  errors: string[];
}> {
  const info: string[] = [];
  const errors: string[] = [];
  const periodsProcessed: PeriodAggregateResult[] = [];

  const currentPeriodKey = resolvePeriodKey(params.referenceDate, "weekly");
  const { periodStart, periodEnd } = resolvePeriodRange(currentPeriodKey, "weekly");

  const periodSources = await fetchItemContentSignalSources(params.db, params.selector, {
    from: periodStart,
    to: periodEnd,
  });
  const pending = filterSourcesNeedingProcessing(periodSources, params.indexed);

  if (pending.length === 0) {
    info.push(
      `weekly/${currentPeriodKey}: pending 0건 — skip (scanned=${periodSources.length})`,
    );
  } else {
    const status = resolveSnapshotStatus(
      currentPeriodKey,
      "weekly",
      params.referenceDate,
      false,
    );
    const allPeriodKeys = [currentPeriodKey];
    const previousKey = resolvePreviousPeriodKey(currentPeriodKey, "weekly");
    if (previousKey) {
      allPeriodKeys.unshift(previousKey);
    }

    try {
      const result = await persistWeeklyLeafPeriod({
        db: params.db,
        selector: params.selector,
        periodKey: currentPeriodKey,
        sources: periodSources,
        allPeriodKeys,
        minCount: params.minCount,
        status,
        dryRun: params.dryRun,
      });
      periodsProcessed.push(result);
      info.push(
        `weekly/${currentPeriodKey}: pending=${pending.length}, sources=${result.sourceCount}, items=${result.itemCount}, status=${result.status}${params.dryRun ? " (dry run)" : ""}`,
      );
    } catch (error) {
      errors.push(
        `weekly/${currentPeriodKey} 집계 실패: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  await finalizeClosedWeeklyDrafts({
    db: params.db,
    selector: params.selector,
    currentPeriodKey,
    referenceDate: params.referenceDate,
    indexed: params.indexed,
    minCount: params.minCount,
    dryRun: params.dryRun,
    info,
    errors,
    periodsProcessed,
  });

  return {
    scanned: periodSources.length,
    discovered: pending.length,
    periodsProcessed,
    info,
    errors,
  };
}

async function discoverMonthlyRollup(params: {
  db: SupabaseClient<Database>;
  selector: ReturnType<typeof getSignalSourceSelector>;
  minCount: number;
  dryRun: boolean;
  referenceDate: string;
}): Promise<{
  scanned: number;
  discovered: number;
  periodsProcessed: PeriodAggregateResult[];
  info: string[];
  errors: string[];
}> {
  const info: string[] = [];
  const errors: string[] = [];
  const periodsProcessed: PeriodAggregateResult[] = [];

  const monthKey = resolvePeriodKey(params.referenceDate, "monthly");
  const weeklySnapshots = await fetchWeeklySnapshotsForMonth(
    params.db,
    params.selector.scopeType,
    params.selector.scopeKey,
    monthKey,
  );

  if (weeklySnapshots.length === 0) {
    info.push(`monthly/${monthKey}: weekly snapshot 0건 — skip`);
    return { scanned: 0, discovered: 0, periodsProcessed, info, errors };
  }

  const lineage = await fetchRollupLineageIndex(params.db, {
    scopeType: params.selector.scopeType,
    scopeKey: params.selector.scopeKey,
    parentPeriodType: "monthly",
    parentPeriodKey: monthKey,
    childSourceKind: "weekly_snapshot",
  });
  const pending = detectRollupPending(weeklySnapshots, lineage);

  if (pending === 0 && lineage.size > 0) {
    info.push(
      `monthly/${monthKey}: rollup pending 0건 — skip (weeks=${weeklySnapshots.length})`,
    );
  } else {
    const status = resolveSnapshotStatus(
      monthKey,
      "monthly",
      params.referenceDate,
      false,
    );
    const allMonthKeys = [monthKey];
    const previousKey = resolvePreviousPeriodKey(monthKey, "monthly");
    if (previousKey) {
      allMonthKeys.unshift(previousKey);
    }

    try {
      const result = await runWeeklyRollupForMonth({
        db: params.db,
        selector: params.selector,
        monthPeriodKey: monthKey,
        allMonthKeys,
        minCount: params.minCount,
        status,
        dryRun: params.dryRun,
      });
      if (result) {
        periodsProcessed.push(result);
        info.push(
          `monthly/${monthKey}: rollup pending=${pending}, sources=${result.sourceCount}, items=${result.itemCount}, status=${result.status}${params.dryRun ? " (dry run)" : ""}`,
        );
      }
    } catch (error) {
      errors.push(
        `monthly/${monthKey} rollup 실패: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  await finalizeClosedRollupDrafts({
    db: params.db,
    selector: params.selector,
    periodType: "monthly",
    currentPeriodKey: monthKey,
    referenceDate: params.referenceDate,
    minCount: params.minCount,
    dryRun: params.dryRun,
    info,
    errors,
    periodsProcessed,
  });

  return {
    scanned: weeklySnapshots.length,
    discovered: pending,
    periodsProcessed,
    info,
    errors,
  };
}

async function discoverYearlyRollup(params: {
  db: SupabaseClient<Database>;
  selector: ReturnType<typeof getSignalSourceSelector>;
  minCount: number;
  dryRun: boolean;
  referenceDate: string;
}): Promise<{
  scanned: number;
  discovered: number;
  periodsProcessed: PeriodAggregateResult[];
  info: string[];
  errors: string[];
}> {
  const info: string[] = [];
  const errors: string[] = [];
  const periodsProcessed: PeriodAggregateResult[] = [];

  const yearKey = resolvePeriodKey(params.referenceDate, "yearly");
  const monthlySnapshots = await fetchMonthlySnapshotsForYear(
    params.db,
    params.selector.scopeType,
    params.selector.scopeKey,
    yearKey,
  );

  if (monthlySnapshots.length === 0) {
    info.push(`yearly/${yearKey}: monthly snapshot 0건 — skip`);
    return { scanned: 0, discovered: 0, periodsProcessed, info, errors };
  }

  const lineage = await fetchRollupLineageIndex(params.db, {
    scopeType: params.selector.scopeType,
    scopeKey: params.selector.scopeKey,
    parentPeriodType: "yearly",
    parentPeriodKey: yearKey,
    childSourceKind: "monthly_snapshot",
  });
  const pending = detectRollupPending(monthlySnapshots, lineage);

  if (pending === 0 && lineage.size > 0) {
    info.push(
      `yearly/${yearKey}: rollup pending 0건 — skip (months=${monthlySnapshots.length})`,
    );
  } else {
    const status = resolveSnapshotStatus(yearKey, "yearly", params.referenceDate, false);
    const allYearKeys = [yearKey];
    const previousKey = resolvePreviousPeriodKey(yearKey, "yearly");
    if (previousKey) {
      allYearKeys.unshift(previousKey);
    }

    try {
      const result = await runMonthlyRollupForYear({
        db: params.db,
        selector: params.selector,
        yearPeriodKey: yearKey,
        allYearKeys,
        minCount: params.minCount,
        status,
        dryRun: params.dryRun,
      });
      if (result) {
        periodsProcessed.push(result);
        info.push(
          `yearly/${yearKey}: rollup pending=${pending}, sources=${result.sourceCount}, items=${result.itemCount}, status=${result.status}${params.dryRun ? " (dry run)" : ""}`,
        );
      }
    } catch (error) {
      errors.push(
        `yearly/${yearKey} rollup 실패: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  await finalizeClosedRollupDrafts({
    db: params.db,
    selector: params.selector,
    periodType: "yearly",
    currentPeriodKey: yearKey,
    referenceDate: params.referenceDate,
    minCount: params.minCount,
    dryRun: params.dryRun,
    info,
    errors,
    periodsProcessed,
  });

  return {
    scanned: monthlySnapshots.length,
    discovered: pending,
    periodsProcessed,
    info,
    errors,
  };
}

async function runBackfillOrPeriodPipeline(params: {
  db: SupabaseClient<Database>;
  selector: ReturnType<typeof getSignalSourceSelector>;
  mode: MarketSignalPipelineMode;
  periodTypes: MarketSignalPeriodType[];
  periodKey?: string;
  from?: string;
  to?: string;
  finalize: boolean;
  minCount: number;
  dryRun: boolean;
  referenceDate: string;
}): Promise<{
  totalSources: number;
  discoveredSources: number;
  dateRange: { from: string; to: string } | null;
  periodsProcessed: PeriodAggregateResult[];
  info: string[];
  errors: string[];
}> {
  const { leaf, rollup } = splitPeriodTypes(params.periodTypes);
  const info: string[] = [];
  const errors: string[] = [];
  const periodsProcessed: PeriodAggregateResult[] = [];

  let allSources: ItemContentSignalSource[] = [];
  if (leaf.includes("weekly")) {
    allSources = await fetchItemContentSignalSources(params.db, params.selector, {
      from: params.from,
      to: params.to,
    });
    if (allSources.length === 0) {
      errors.push(`scopeKey=${params.selector.scopeKey} 에 해당하는 signal source가 없습니다.`);
    }
  }

  const dateRange =
    allSources.length > 0
      ? { from: allSources[0].market_date, to: allSources.at(-1)!.market_date }
      : null;

  const rangeFrom = params.from ?? dateRange?.from;
  const rangeTo = params.to ?? dateRange?.to;

  if (leaf.includes("weekly")) {
    const weeklyResult = await runWeeklyBackfill({
      ...params,
      allSources,
    });
    periodsProcessed.push(...weeklyResult.periodsProcessed);
    info.push(...weeklyResult.info);
    errors.push(...weeklyResult.errors);
  }

  if (rollup.length > 0 && rangeFrom && rangeTo) {
    const rollupResult = await runRollupBackfill({
      ...params,
      periodTypes: rollup,
      from: rangeFrom,
      to: rangeTo,
    });
    periodsProcessed.push(...rollupResult.periodsProcessed);
    info.push(...rollupResult.info);
    errors.push(...rollupResult.errors);
  } else if (rollup.length > 0) {
    errors.push("monthly/yearly rollup 을 위해 weekly leaf date range 가 필요합니다.");
  }

  return {
    totalSources: allSources.length,
    discoveredSources: allSources.length,
    dateRange,
    periodsProcessed,
    info,
    errors,
  };
}

async function runDiscoverAndAggregatePipeline(params: {
  db: SupabaseClient<Database>;
  selector: ReturnType<typeof getSignalSourceSelector>;
  periodTypes: MarketSignalPeriodType[];
  minCount: number;
  dryRun: boolean;
  referenceDate: string;
}): Promise<{
  totalSources: number;
  discoveredSources: number;
  dateRange: { from: string; to: string } | null;
  periodsProcessed: PeriodAggregateResult[];
  info: string[];
  errors: string[];
}> {
  const { leaf, rollup } = splitPeriodTypes(params.periodTypes);
  const info: string[] = [];
  const errors: string[] = [];
  const periodsProcessed: PeriodAggregateResult[] = [];
  let totalSources = 0;
  let discoveredSources = 0;

  if (leaf.includes("weekly")) {
    const indexed = await fetchIndexedSnapshotSources(params.db, {
      scopeType: params.selector.scopeType,
      scopeKey: params.selector.scopeKey,
      sourceKind: params.selector.sourceKind,
    });
    info.push(`indexed item_content sources=${indexed.size}`);

    const weeklyResult = await discoverWeekly({
      db: params.db,
      selector: params.selector,
      indexed,
      minCount: params.minCount,
      dryRun: params.dryRun,
      referenceDate: params.referenceDate,
    });
    totalSources += weeklyResult.scanned;
    discoveredSources += weeklyResult.discovered;
    periodsProcessed.push(...weeklyResult.periodsProcessed);
    info.push(...weeklyResult.info);
    errors.push(...weeklyResult.errors);
  }

  if (rollup.includes("monthly")) {
    const monthlyResult = await discoverMonthlyRollup(params);
    totalSources += monthlyResult.scanned;
    discoveredSources += monthlyResult.discovered;
    periodsProcessed.push(...monthlyResult.periodsProcessed);
    info.push(...monthlyResult.info);
    errors.push(...monthlyResult.errors);
  }

  if (rollup.includes("yearly")) {
    const yearlyResult = await discoverYearlyRollup(params);
    totalSources += yearlyResult.scanned;
    discoveredSources += yearlyResult.discovered;
    periodsProcessed.push(...yearlyResult.periodsProcessed);
    info.push(...yearlyResult.info);
    errors.push(...yearlyResult.errors);
  }

  const dateRange =
    periodsProcessed.length > 0
      ? {
          from: periodsProcessed[0]!.periodStart,
          to: periodsProcessed.at(-1)!.periodEnd,
        }
      : null;

  return {
    totalSources,
    discoveredSources,
    dateRange,
    periodsProcessed,
    info,
    errors,
  };
}

export async function runMarketSignalPipeline(
  params: RunMarketSignalPipelineParams = {},
): Promise<MarketSignalPipelineResult> {
  const ranAt = new Date().toISOString();
  const scopeKey = params.scopeKey?.trim() || DEFAULT_SCOPE_KEY;
  const mode: MarketSignalPipelineMode = params.mode ?? "backfill";
  const dryRun = params.dryRun ?? params.persistToDb === false;
  const finalize = params.finalize ?? true;
  const minCount = params.minCount ?? DEFAULT_MIN_COUNT;
  const referenceDate = params.referenceDate ?? formatMarketDate(new Date());
  const db = adminClient;

  const selector = getSignalSourceSelector(scopeKey);
  const periodTypes =
    params.periodTypes ??
    (params.periodType ? [params.periodType] : (["weekly", "monthly", "yearly"] as const));

  const info: string[] = [
    `scopeKey=${scopeKey}, mode=${mode}, dryRun=${dryRun}, referenceDate=${referenceDate}, hierarchy=daily→weekly→monthly→yearly`,
  ];

  const pipelineResult =
    mode === "discover_and_aggregate"
      ? await runDiscoverAndAggregatePipeline({
          db,
          selector,
          periodTypes: [...periodTypes],
          minCount,
          dryRun,
          referenceDate,
        })
      : await runBackfillOrPeriodPipeline({
          db,
          selector,
          mode,
          periodTypes: [...periodTypes],
          periodKey: params.periodKey,
          from: params.from,
          to: params.to,
          finalize,
          minCount,
          dryRun,
          referenceDate,
        });

  return {
    ranAt,
    scopeKey,
    scopeType: selector.scopeType,
    mode,
    dryRun,
    totalSources: pipelineResult.totalSources,
    discoveredSources: pipelineResult.discoveredSources,
    dateRange: pipelineResult.dateRange,
    periodsProcessed: pipelineResult.periodsProcessed,
    errors: pipelineResult.errors,
    info: [...info, ...pipelineResult.info],
  };
}
