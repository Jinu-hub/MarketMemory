/**
 * Visual + i18n mapping for `core_data.market_mood.type`.
 *
 * Pipeline SSOT lives in `daily_market_memories.core_data.market_mood.type`
 * and uses snake_case keys (`risk_on` / `risk_off` / `mixed` / `cautious`).
 *
 * Display labels are looked up in `MARKET_MOOD_LABELS` from `../types` per
 * locale; the visual style table here keeps a directional accent color, a
 * NexBadge variant, and a lucide icon so the mood block reads at a glance
 * (rule §15 — never rely on color alone) and works in light/dark/warm
 * themes.
 */
import type { LucideIcon } from "lucide-react";
import {
  ActivityIcon,
  EyeIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
} from "lucide-react";

import {
  MARKET_MOOD_DESCRIPTIONS,
  MARKET_MOOD_LABELS,
  MARKET_MOOD_SUBDESCRIPTIONS,
  type MarketMoodKey,
  type MarketMoodLocale,
} from "../types";

type NexBadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "secondary"
  | "outline";

export type MarketMoodStyle = {
  /** Canonical mood key — `null` when the input could not be resolved. */
  key: MarketMoodKey | null;
  accentBorder: string;
  accentBg: string;
  accentText: string;
  badgeVariant: NexBadgeVariant;
  icon: LucideIcon;
};

const STYLES: Record<MarketMoodKey, MarketMoodStyle> = {
  risk_on: {
    key: "risk_on",
    accentBorder: "border-l-emerald-500 dark:border-l-emerald-400",
    accentBg: "bg-emerald-500/5 dark:bg-emerald-400/5",
    accentText: "text-emerald-600 dark:text-emerald-400",
    badgeVariant: "success",
    icon: TrendingUpIcon,
  },
  risk_off: {
    key: "risk_off",
    accentBorder: "border-l-rose-500 dark:border-l-rose-400",
    accentBg: "bg-rose-500/5 dark:bg-rose-400/5",
    accentText: "text-rose-600 dark:text-rose-400",
    badgeVariant: "error",
    icon: ShieldCheckIcon,
  },
  mixed: {
    key: "mixed",
    accentBorder: "border-l-amber-500 dark:border-l-amber-400",
    accentBg: "bg-amber-500/5 dark:bg-amber-400/5",
    accentText: "text-amber-600 dark:text-amber-400",
    badgeVariant: "warning",
    icon: ActivityIcon,
  },
  cautious: {
    key: "cautious",
    accentBorder: "border-l-sky-500 dark:border-l-sky-400",
    accentBg: "bg-sky-500/5 dark:bg-sky-400/5",
    accentText: "text-sky-600 dark:text-sky-400",
    badgeVariant: "info",
    icon: EyeIcon,
  },
};

const FALLBACK_STYLE: MarketMoodStyle = {
  key: null,
  accentBorder: "border-l-border",
  accentBg: "bg-muted/40",
  accentText: "text-muted-foreground",
  badgeVariant: "outline",
  icon: ActivityIcon,
};

/**
 * Normalize any incoming mood string (snake_case, kebab-case, "Risk-On",
 * "리스크온" 등) to a canonical `MarketMoodKey`. Returns `null` when the
 * value cannot be recognized.
 */
export function resolveMoodKey(value: unknown): MarketMoodKey | null {
  if (value == null) return null;
  const raw = String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (raw === "risk_on" || raw === "riskon") return "risk_on";
  if (raw === "risk_off" || raw === "riskoff") return "risk_off";
  if (raw === "mixed") return "mixed";
  if (raw === "cautious") return "cautious";
  return null;
}

/**
 * Returns the visual style for a raw mood input. Always returns a style —
 * unknown inputs get a muted fallback so the UI stays stable.
 */
export function getMarketMoodStyle(value: unknown): MarketMoodStyle {
  const key = resolveMoodKey(value);
  if (!key) return FALLBACK_STYLE;
  return STYLES[key];
}

function isMoodLocale(locale: string | null | undefined): locale is MarketMoodLocale {
  return locale != null && locale in MARKET_MOOD_LABELS;
}

/**
 * Resolve the display label for a mood key in the user's locale.
 * Falls back to English when the locale is unsupported.
 */
export function getMarketMoodLabel(
  key: MarketMoodKey | null,
  locale: string | null | undefined,
): string {
  if (!key) return "Unknown";
  const lang: MarketMoodLocale = isMoodLocale(locale) ? locale : "en";
  return MARKET_MOOD_LABELS[lang][key];
}

const MOOD_DESCRIPTION_FALLBACK = {
  ko: "분위기 정보 없음",
  en: "Mood unavailable",
  ja: "ムード不明",
} as const;

/** Short tagline rendered beside the mood badge. */
export function getMarketMoodDescription(
  key: MarketMoodKey | null,
  locale: string | null | undefined,
): string {
  const lang: MarketMoodLocale = isMoodLocale(locale) ? locale : "en";
  if (!key) return MOOD_DESCRIPTION_FALLBACK[lang];
  return MARKET_MOOD_DESCRIPTIONS[lang][key];
}

const MOOD_SUBDESCRIPTION_FALLBACK = {
  ko: "분위기 유형 정보가 아직 준비되지 않았습니다.",
  en: "Mood type details are not available yet.",
  ja: "ムード区分の説明はまだありません。",
} as const;

/**
 * Locale-aware subdescription — what the mood label means in market terms.
 * Day-specific narrative remains in `market_mood_summary` (i18n).
 */
export function getMarketMoodSubdescription(
  key: MarketMoodKey | null,
  locale: string | null | undefined,
): string {
  const lang: MarketMoodLocale = isMoodLocale(locale) ? locale : "en";
  if (!key) return MOOD_SUBDESCRIPTION_FALLBACK[lang];
  return MARKET_MOOD_SUBDESCRIPTIONS[lang][key];
}
