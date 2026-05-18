/**
 * Visual + i18n mapping for theme `trend_status`.
 *
 * DB stores `trend_status` (pipeline: `rising` / `steady` / `weakening`, or
 * canonical `up` / `stable` / `down`). Display
 * labels come from `TREND_STATUS_LABELS` in `../types` per locale; this
 * module handles normalization, visuals, and label lookup.
 */
import type { LucideIcon } from "lucide-react";
import { MinusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import {
  TREND_STATUS_LABELS,
  type ThemeTrendStatus,
  type TrendStatusKey,
  type TrendStatusLocale,
} from "../types";

type NexBadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "secondary"
  | "outline";

export type TrendStatusStyle = {
  key: TrendStatusKey | null;
  accentBorder: string;
  accentText: string;
  badgeVariant: NexBadgeVariant;
  icon: LucideIcon;
};

const VISUALS: Record<
  TrendStatusKey,
  Omit<TrendStatusStyle, "key">
> = {
  up: {
    accentBorder: "border-l-emerald-500 dark:border-l-emerald-400",
    accentText: "text-emerald-600 dark:text-emerald-400",
    badgeVariant: "success",
    icon: TrendingUpIcon,
  },
  stable: {
    accentBorder: "border-l-amber-500 dark:border-l-amber-400",
    accentText: "text-amber-600 dark:text-amber-400",
    badgeVariant: "warning",
    icon: MinusIcon,
  },
  down: {
    accentBorder: "border-l-rose-500 dark:border-l-rose-400",
    accentText: "text-rose-600 dark:text-rose-400",
    badgeVariant: "error",
    icon: TrendingDownIcon,
  },
};

const FALLBACK_STYLE: TrendStatusStyle = {
  key: null,
  accentBorder: "border-l-border",
  accentText: "text-muted-foreground",
  badgeVariant: "outline",
  icon: MinusIcon,
};

/**
 * Normalize raw `trend_status` (English, Korean, aliases) to a canonical key.
 */
export function resolveTrendStatusKey(
  status: ThemeTrendStatus | null | undefined,
): TrendStatusKey | null {
  if (status == null) return null;
  const key = status.toString().trim().toLowerCase();
  if (
    [
      "up",
      "rise",
      "rising",
      "strong",
      "increase",
      "상승",
      "강화",
    ].includes(key)
  ) {
    return "up";
  }
  if (
    [
      "down",
      "falling",
      "weakening",
      "weak",
      "decrease",
      "declining",
      "약화",
      "하락",
    ].includes(key)
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
      "유지",
      "지속",
      "보합",
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

function isTrendLocale(
  locale: string | null | undefined,
): locale is TrendStatusLocale {
  return locale != null && locale in TREND_STATUS_LABELS;
}

/** Locale-aware label for a normalized `trend_status` key. */
export function getTrendStatusLabel(
  key: TrendStatusKey | null,
  locale: string | null | undefined,
): string {
  const lang: TrendStatusLocale = isTrendLocale(locale) ? locale : "en";
  const labelKey = key ?? "unknown";
  return TREND_STATUS_LABELS[lang][labelKey];
}
