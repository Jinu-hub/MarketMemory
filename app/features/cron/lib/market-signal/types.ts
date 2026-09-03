import type { Database } from "database.types";

export type MarketSignalPeriodType = Database["public"]["Enums"]["market_signal_period_type"];
export type MarketSignalScopeType = Database["public"]["Enums"]["market_signal_scope_type"];
export type MarketSignalSnapshotStatus =
  Database["public"]["Enums"]["market_signal_snapshot_status"];
export type MarketSignalType = Database["public"]["Enums"]["market_signal_type"];
export type MarketSignalTrendType = Database["public"]["Enums"]["market_signal_trend_type"];
export type MarketSignalSourceKind =
  | "item_content"
  | "daily_market_memory"
  | "weekly_snapshot"
  | "monthly_snapshot";

export type MarketSignalSnapshotSourceInput = {
  sourceKind: MarketSignalSourceKind;
  sourceId: string;
  marketDate: string | null;
  reportType: string | null;
  inputHash: string | null;
};

export type ItemContentSignalSource = {
  kind: "item_content";
  id: string;
  market_date: string;
  report_type: string | null;
  title: string | null;
  input_hash: string | null;
  metadata: unknown;
};

export type SignalAtom = {
  signalType: MarketSignalType;
  signalKey: string;
  displayName: string;
};

export type AggregatedSignalRow = SignalAtom & {
  currentCount: number;
  distinctMarketDates: string[];
  sourceIds: string[];
  rank?: number;
  previousCount?: number | null;
  changeRate?: number | null;
  trendType?: MarketSignalTrendType | null;
  signalStrength?: number | null;
};

export type PeriodBucket = {
  periodKey: string;
  periodStart: string;
  periodEnd: string;
};

export type MarketSignalPipelineMode = "backfill" | "period" | "discover_and_aggregate";

export type RunMarketSignalPipelineParams = {
  scopeKey?: string;
  periodType?: MarketSignalPeriodType;
  periodTypes?: MarketSignalPeriodType[];
  mode?: MarketSignalPipelineMode;
  periodKey?: string;
  from?: string;
  to?: string;
  /** backfill/period 에서만 사용. discover_and_aggregate 는 period 종료 여부로 자동 결정 */
  finalize?: boolean;
  minCount?: number;
  dryRun?: boolean;
  persistToDb?: boolean;
  /** discover/status 판단 기준일 (yyyy-MM-dd). 기본값: 오늘(UTC) */
  referenceDate?: string;
};

export type PeriodAggregateResult = {
  periodKey: string;
  periodStart: string;
  periodEnd: string;
  sourceCount: number;
  itemCount: number;
  snapshotId: string | null;
  status: MarketSignalSnapshotStatus;
  topSignals: Array<{
    signalType: MarketSignalType;
    signalKey: string;
    displayName: string;
    currentCount: number;
    trendType: MarketSignalTrendType | null;
  }>;
};

export type MarketSignalPipelineResult = {
  ranAt: string;
  scopeKey: string;
  scopeType: MarketSignalScopeType;
  mode: MarketSignalPipelineMode;
  dryRun: boolean;
  totalSources: number;
  /** discover_and_aggregate: 처리 대상으로 발견된 source 수 */
  discoveredSources: number;
  dateRange: { from: string; to: string } | null;
  periodsProcessed: PeriodAggregateResult[];
  errors: string[];
  info: string[];
};
