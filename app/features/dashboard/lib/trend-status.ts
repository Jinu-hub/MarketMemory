/**
 * Visual mapping for theme `trend_status`.
 * Labels: `~/features/dashboard/i18n/labels`.
 */
import type { LucideIcon } from "lucide-react";
import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import type { NexBadgeVariant } from "~/core/lib/semantic-style";
import { SEMANTIC_ACCENTS } from "~/core/lib/semantic-style";

import type { ThemeTrendStatus, TrendStatusKey } from "../types";

export { getTrendStatusLabel } from "../i18n/labels";

export type TrendStatusStyle = {
  key: TrendStatusKey | null;
  accentBorder: string;
  accentText: string;
  badgeVariant: NexBadgeVariant;
  icon: LucideIcon;
};

const VISUALS: Record<TrendStatusKey, Omit<TrendStatusStyle, "key">> = {
  up: {
    accentBorder: SEMANTIC_ACCENTS.positive.accentBorder,
    accentText: SEMANTIC_ACCENTS.positive.accentText,
    badgeVariant: SEMANTIC_ACCENTS.positive.badgeVariant,
    icon: TrendingUpIcon,
  },
  stable: {
    accentBorder: SEMANTIC_ACCENTS.caution.accentBorder,
    accentText: SEMANTIC_ACCENTS.caution.accentText,
    badgeVariant: SEMANTIC_ACCENTS.caution.badgeVariant,
    icon: MinusIcon,
  },
  down: {
    accentBorder: SEMANTIC_ACCENTS.negative.accentBorder,
    accentText: SEMANTIC_ACCENTS.negative.accentText,
    badgeVariant: SEMANTIC_ACCENTS.negative.badgeVariant,
    icon: TrendingDownIcon,
  },
};

const FALLBACK_STYLE: TrendStatusStyle = {
  key: null,
  accentBorder: SEMANTIC_ACCENTS.muted.accentBorder,
  accentText: SEMANTIC_ACCENTS.muted.accentText,
  badgeVariant: SEMANTIC_ACCENTS.muted.badgeVariant,
  icon: MinusIcon,
};

/** Normalize pipeline `trend_status` (English aliases only) to a canonical key. */
export function resolveTrendStatusKey(
  status: ThemeTrendStatus | null | undefined,
): TrendStatusKey | null {
  if (status == null) return null;
  const key = status.toString().trim().toLowerCase();
  if (
    ["up", "rise", "rising", "strong", "increase"].includes(key)
  ) {
    return "up";
  }
  if (
    ["down", "falling", "weakening", "weak", "decrease", "declining"].includes(
      key,
    )
  ) {
    return "down";
  }
  if (
    [
      "stable",
      "steady",
      "flat",
      "neutral",
      "persist",
      "persistent",
      "sustained",
    ].includes(key)
  ) {
    return "stable";
  }
  return null;
}

export function getTrendStatusStyle(
  status: ThemeTrendStatus | null | undefined,
): TrendStatusStyle {
  const key = resolveTrendStatusKey(status);
  if (!key) return FALLBACK_STYLE;
  return { key, ...VISUALS[key] };
}
