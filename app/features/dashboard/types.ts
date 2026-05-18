/**
 * Dashboard Types
 *
 * Type shapes for the JSONB columns we read off `daily_market_memories` and
 * `daily_market_memory_i18n`. Everything is intentionally optional / defensive
 * because the payload is produced by an AI pipeline (n8n) — the dashboard
 * needs to render gracefully when fields are missing.
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

export const TREND_STATUS_LABELS = {
  ko: {
    up: "상승",
    stable: "유지",
    down: "약화",
    unknown: "관찰",
  },
  en: {
    up: "Rising",
    stable: "Stable",
    down: "Weakening",
    unknown: "Watch",
  },
  ja: {
    up: "上昇",
    stable: "維持",
    down: "弱化",
    unknown: "観察",
  },
} as const;

export type TrendStatusLocale = keyof typeof TREND_STATUS_LABELS;

/** Label map keys — pipeline `up|stable|down` plus UI fallback `unknown`. */
export type TrendStatusLabelKey = keyof (typeof TREND_STATUS_LABELS)["ko"];

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
 * Matches the keys in `MARKET_MOOD_LABELS` so we can index directly.
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

export type RiskSignal = {
  title?: string | null;
  /** Some pipelines may emit `label` instead of `title`. */
  label?: string | null;
  description?: string | null;
  severity?: RiskSeverity | null;
  tags?: string[] | null;
};

export const MARKET_MOOD_LABELS = {
  ko: {
    risk_on: "위험선호",
    risk_off: "위험회피",
    mixed: "혼재",
    cautious: "신중",
  },
  en: {
    risk_on: "Risk-On",
    risk_off: "Risk-Off",
    mixed: "Mixed",
    cautious: "Cautious",
  },
  ja: {
    risk_on: "リスクオン",
    risk_off: "リスクオフ",
    mixed: "まちまち",
    cautious: "慎重",
  },
} as const;

/** Short tagline beside the mood badge (one phrase). */
export const MARKET_MOOD_DESCRIPTIONS = {
  ko: {
    risk_on: "위험자산 선호",
    risk_off: "방어적 시장",
    mixed: "혼합 국면",
    cautious: "신중한 관망",
  },
  en: {
    risk_on: "Risk asset preference",
    risk_off: "Defensive market",
    mixed: "Mixed regime",
    cautious: "Cautious stance",
  },
  ja: {
    risk_on: "リスク資産選好",
    risk_off: "防御的な市場",
    mixed: "混在した局面",
    cautious: "慎重な様子見",
  },
} as const;

/**
 * Locale-aware helper copy for each mood type — what the label *means* in
 * market terms. Kept short for the dashboard mood panel; day-specific
 * narrative still comes from `market_mood_summary` (i18n).
 */
export const MARKET_MOOD_SUBDESCRIPTIONS = {
  ko: {
    risk_on:
      "시장 전반에 위험선호가 강합니다. 주식·성장주·크립토 등 고위험 자산이 폭넓게 강하고, 매크로·유동성 환경이 위험자산에 우호적으로 읽힙니다.",
    risk_off:
      "위험회피가 두드러집니다. 주식 약세, 안전자산 선호, 변동성 상승 등 투자자들이 리스크를 줄이는 흐름이 관찰됩니다.",
    mixed:
      "신호가 엇갈립니다. 지수와 내부 강도·섹터·매크로가 상충해 Risk-On/Off로 단정하기 어렵습니다.",
    cautious:
      "완전한 Risk-Off는 아니지만 조심스러운 국면입니다. 일부 테마는 강하나 인플레·금리·지정학 등이 광범위한 위험선호를 제한합니다.",
  },
  en: {
    risk_on:
      "Broad risk appetite: equities, growth, and crypto lead; macro and liquidity read as supportive for risk assets.",
    risk_off:
      "Defensive tone: equities weaken, safe havens and volatility rise—investors are trimming risk.",
    mixed:
      "Cross-currents: index, internals, sectors, or macro conflict—hard to call a clean Risk-On or Risk-Off.",
    cautious:
      "Selective risk-on: some themes work, but inflation, rates, geopolitics, or liquidity cap broad risk appetite.",
  },
  ja: {
    risk_on:
      "市場全体でリスクオン。株式・グロース・暗号資産が広く強く、マクロ・流動性はリスク資産に追い風と読まれます。",
    risk_off:
      "リスクオフが目立つ日。株式弱含み、安全資産選好、ボラ上昇など、リスク縮小の動きが観察されます。",
    mixed:
      "シグナルが交錯。指数・内部・セクター・マクロが噛み合わず、リスクオン/オフと断定しにくい局面です。",
    cautious:
      "完全なリスクオフではないが慎重な日。一部テーマは強いが、インフレ・金利・地政学などが広いリスク選好を抑えます。",
  },
} as const;

/** Locale codes that `MARKET_MOOD_LABELS` is keyed by. */
export type MarketMoodLocale = keyof typeof MARKET_MOOD_LABELS;

/* ----------------------- Core Data (language-independent SSOT) ----------------------- */

/**
 * `daily_market_memories.core_data` JSONB SSOT.
 *
 * Produced by the pipeline. The dashboard reads the canonical mood key from
 * `core_data.market_mood.type` and renders the locale-aware label via
 * `MARKET_MOOD_LABELS`.
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
