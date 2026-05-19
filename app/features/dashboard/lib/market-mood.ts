/**
 * Visual mapping for `core_data.market_mood.type`.
 * Labels: `~/features/dashboard/i18n/labels`.
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

import type { MarketMoodKey } from "../types";

export type { MarketMoodKey };

export {
  getMarketMoodDescription,
  getMarketMoodLabel,
  getMarketMoodSubdescription,
} from "../i18n/labels";

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
