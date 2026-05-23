/**
 * Dashboard Types
 *
 * Type shapes for the JSONB columns we read off `daily_market_memories` and
 * `daily_market_memory_i18n`. Everything is intentionally optional / defensive
 * because the payload is produced by an AI pipeline (n8n) — the dashboard
 * needs to render gracefully when fields are missing.
 *
 * Static copy (labels, UI strings) lives in `./i18n/messages.ts`.
 */

/* ----------------------- Market Snapshot ----------------------- */

export type MarketSnapshotItemId =
  | "sp500"
  | "nasdaq"
  | "dow"
  | "bitcoin"
  | "gold"
  | "brent_crude"
  | "us_10y";

export type MarketSnapshotItem = {
  id: MarketSnapshotItemId | string;
  label?: string | null;
  symbol?: string | null;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  currency?: string | null;
  asOf?: string | null;
  isStale?: boolean | null;
};

export type FearGreedSnapshot = {
  value: number;
  classification: string;
  asOf?: string | null;
  previousClose?: { value: number; classification: string } | null;
};

export type MarketSnapshotData = {
  fetchedAt?: string | null;
  items?: MarketSnapshotItem[] | null;
  fearGreed?: FearGreedSnapshot | null;
  cryptoFearGreed?: FearGreedSnapshot | null;
};

/* ----------------------- Today's Themes ----------------------- */

/**
 * Canonical keys after normalizing `top_themes[].trend_status`.
 * Pipeline often emits `rising` | `steady` | `weakening` — see
 * `resolveTrendStatusKey` in `lib/trend-status.ts`.
 */
export type TrendStatusKey = "up" | "stable" | "down";

export type ThemeTrendStatus = TrendStatusKey | string;

export type DailyMemoryTheme = {
  theme_title?: string | null;
  /** Some pipelines may emit `title` rather than `theme_title`. */
  title?: string | null;
  summary?: string | null;
  trend_status?: ThemeTrendStatus | null;
  related_tags?: string[] | null;
  /** Either a count or an array of report ids/titles. */
  related_reports?: number | string[] | null;
};

/* ----------------------- Market Mood ----------------------- */

/**
 * Canonical mood keys produced by the pipeline (`core_data.market_mood.type`).
 */
export type MarketMoodKey = "risk_on" | "risk_off" | "mixed" | "cautious";

/**
 * Loose mood representation that may appear on the legacy
 * `daily_market_memories.market_mood_type` column. We accept any string and
 * normalize it at read time.
 */
export type MarketMoodType =
  | "Risk-On"
  | "Risk-Off"
  | "Mixed"
  | "Cautious"
  | MarketMoodKey
  | string;

/* ----------------------- Risk Signals ----------------------- */

export type RiskSeverity = "low" | "medium" | "high" | "critical" | string;

export type RiskSeverityKey = "low" | "medium" | "high" | "critical";

export type RiskSignal = {
  title?: string | null;
  /** Some pipelines may emit `label` instead of `title`. */
  label?: string | null;
  description?: string | null;
  severity?: RiskSeverity | null;
  tags?: string[] | null;
};

/* ----------------------- Core Data (language-independent SSOT) ----------------------- */

/**
 * `daily_market_memories.core_data` JSONB SSOT.
 */
export type CoreDataMarketMood = {
  type?: MarketMoodKey | string | null;
};

export type CoreData = {
  market_mood?: CoreDataMarketMood | null;
};

/* ----------------------- Aggregated snapshot for the loader ----------------------- */

export type DailyMarketMemorySnapshot = {
  id: string;
  market_date: string;
  market_scope: string;
  status: string;
  generated_at: string;
  updated_at: string;
  source_report_count: number;
  core_lang_code: string;

  market_snapshot: MarketSnapshotData | null;
  /** Language-independent SSOT (mood type, future fields). */
  core_data: CoreData | null;
  /** Legacy / denormalized fallback — prefer `core_data.market_mood.type`. */
  market_mood_type: MarketMoodType | null;
  risk_signals: RiskSignal[] | null;
  top_tags: string[] | null;

  /** From i18n row (preferred locale → core_lang_code → first available). */
  display_title: string | null;
  display_subtitle: string | null;
  core_summary: string | null;
  top_themes: DailyMemoryTheme[] | null;
  market_mood_summary: string | null;
  /** Actual i18n lang we resolved to (e.g. 'ko' / 'en'). */
  resolved_lang_code: string | null;
};
