/**
 * Visual + i18n mapping for `core_data.market_mood.type`.
 */
import type { LucideIcon } from "lucide-react";
import {
  ActivityIcon,
  EyeIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
} from "lucide-react";

import type { NexBadgeVariant } from "~/core/lib/semantic-style";
import { SEMANTIC_ACCENTS } from "~/core/lib/semantic-style";

import {
  MARKET_MOOD_DESCRIPTIONS,
  MARKET_MOOD_LABELS,
  MARKET_MOOD_SUBDESCRIPTIONS,
  type MarketMoodKey,
  type MarketMoodLocale,
} from "../types";

export type MarketMoodStyle = {
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
    ...SEMANTIC_ACCENTS.positive,
    icon: TrendingUpIcon,
  },
  risk_off: {
    key: "risk_off",
    ...SEMANTIC_ACCENTS.negative,
    icon: ShieldCheckIcon,
  },
  mixed: {
    key: "mixed",
    ...SEMANTIC_ACCENTS.caution,
    icon: ActivityIcon,
  },
  cautious: {
    key: "cautious",
    ...SEMANTIC_ACCENTS.info,
    icon: EyeIcon,
  },
};

const FALLBACK_STYLE: MarketMoodStyle = {
  key: null,
  ...SEMANTIC_ACCENTS.muted,
  icon: ActivityIcon,
};

export function resolveMoodKey(value: unknown): MarketMoodKey | null {
  if (value == null) return null;
  const raw = String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (raw === "risk_on" || raw === "riskon") return "risk_on";
  if (raw === "risk_off" || raw === "riskoff") return "risk_off";
  if (raw === "mixed") return "mixed";
  if (raw === "cautious") return "cautious";
  return null;
}

export function getMarketMoodStyle(value: unknown): MarketMoodStyle {
  const key = resolveMoodKey(value);
  if (!key) return FALLBACK_STYLE;
  return STYLES[key];
}

function isMoodLocale(locale: string | null | undefined): locale is MarketMoodLocale {
  return locale != null && locale in MARKET_MOOD_LABELS;
}

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

export function getMarketMoodSubdescription(
  key: MarketMoodKey | null,
  locale: string | null | undefined,
): string {
  const lang: MarketMoodLocale = isMoodLocale(locale) ? locale : "en";
  if (!key) return MOOD_SUBDESCRIPTION_FALLBACK[lang];
  return MARKET_MOOD_SUBDESCRIPTIONS[lang][key];
}
