/**
 * Visual semantic mapping for report categories.
 *
 * Every category maps to:
 *  - a directional accent color (used for the left border of cards & insight blocks)
 *  - a matching NexBadge variant (so color language stays consistent)
 *  - a lucide icon (adds a second, non-color signal per rule §15)
 *
 * Display labels come from `~/features/item-reports/i18n` so copy stays in one place.
 *
 * All classes are chosen to look correct in light, dark, and warm themes.
 */
import type { LucideIcon } from "lucide-react";
import {
  ActivityIcon,
  BookOpenIcon,
  CompassIcon,
  EyeIcon,
  FlagIcon,
  LightbulbIcon,
  LineChartIcon,
  MicroscopeIcon,
  PenLineIcon,
  TrendingUpIcon,
} from "lucide-react";

import type { ReportCategory } from "../constants";
import { getCategoryLabel } from "../i18n/labels";

import type { NexBadgeVariant } from "~/core/lib/semantic-style";

export type CategoryStyle = {
  label: string;
  /** used for border-l-[3px] directional accent */
  accentBorder: string;
  /** subtle fill to tint a card / callout */
  accentBg: string;
  /** solid color for icons / dots */
  accentText: string;
  /** maps to NexBadge variant so color language is consistent */
  badgeVariant: NexBadgeVariant;
  icon: LucideIcon;
};

/** Visual-only fields; labels are merged from i18n at runtime. */
type CategoryVisual = Omit<CategoryStyle, "label">;

const CATEGORY_VISUAL: Record<ReportCategory, CategoryVisual> = {
  foundation: {
    accentBorder: "border-l-slate-400 dark:border-l-slate-500",
    accentBg: "bg-slate-500/5 dark:bg-slate-400/5",
    accentText: "text-slate-600 dark:text-slate-300",
    badgeVariant: "outline",
    icon: BookOpenIcon,
  },
  issue: {
    accentBorder: "border-l-amber-500 dark:border-l-amber-400",
    accentBg: "bg-amber-500/5 dark:bg-amber-400/5",
    accentText: "text-amber-600 dark:text-amber-400",
    badgeVariant: "warning",
    icon: FlagIcon,
  },
  research: {
    accentBorder: "border-l-blue-500 dark:border-l-blue-400",
    accentBg: "bg-blue-500/5 dark:bg-blue-400/5",
    accentText: "text-blue-600 dark:text-blue-400",
    badgeVariant: "info",
    icon: MicroscopeIcon,
  },
  market: {
    accentBorder: "border-l-emerald-500 dark:border-l-emerald-400",
    accentBg: "bg-emerald-500/5 dark:bg-emerald-400/5",
    accentText: "text-emerald-600 dark:text-emerald-400",
    badgeVariant: "success",
    icon: LineChartIcon,
  },
  trend: {
    accentBorder: "border-l-cyan-500 dark:border-l-cyan-400",
    accentBg: "bg-cyan-500/5 dark:bg-cyan-400/5",
    accentText: "text-cyan-600 dark:text-cyan-400",
    badgeVariant: "info",
    icon: TrendingUpIcon,
  },
  deep_dive: {
    accentBorder: "border-l-indigo-500 dark:border-l-indigo-400",
    accentBg: "bg-indigo-500/5 dark:bg-indigo-400/5",
    accentText: "text-indigo-600 dark:text-indigo-400",
    badgeVariant: "secondary",
    icon: CompassIcon,
  },
  column: {
    accentBorder: "border-l-rose-500 dark:border-l-rose-400",
    accentBg: "bg-rose-500/5 dark:bg-rose-400/5",
    accentText: "text-rose-600 dark:text-rose-400",
    badgeVariant: "error",
    icon: PenLineIcon,
  },
  narrative_analysis: {
    accentBorder: "border-l-purple-500 dark:border-l-purple-400",
    accentBg: "bg-purple-500/5 dark:bg-purple-400/5",
    accentText: "text-purple-600 dark:text-purple-400",
    badgeVariant: "secondary",
    icon: LightbulbIcon,
  },
  review: {
    accentBorder: "border-l-muted-foreground/40",
    accentBg: "bg-muted/40",
    accentText: "text-muted-foreground",
    badgeVariant: "default",
    icon: ActivityIcon,
  },
  watchlist: {
    accentBorder: "border-l-amber-600 dark:border-l-amber-500",
    accentBg: "bg-amber-600/5 dark:bg-amber-500/5",
    accentText: "text-amber-700 dark:text-amber-400",
    badgeVariant: "warning",
    icon: EyeIcon,
  },
};

function fallbackStyle(locale?: string | null): CategoryStyle {
  return {
    label: getCategoryLabel("unknown", locale),
    accentBorder: "border-l-border",
    accentBg: "bg-muted/30",
    accentText: "text-muted-foreground",
    badgeVariant: "outline",
    icon: BookOpenIcon,
  };
}

function styleForCategory(
  category: ReportCategory,
  locale?: string | null,
): CategoryStyle {
  const visual = CATEGORY_VISUAL[category];
  return {
    ...visual,
    label: getCategoryLabel(category, locale),
  };
}

export function getCategoryStyle(
  category: string | null | undefined,
  locale?: string | null,
): CategoryStyle {
  if (!category) return fallbackStyle(locale);
  const key = category as ReportCategory;
  if (!(key in CATEGORY_VISUAL)) return fallbackStyle(locale);
  return styleForCategory(key, locale);
}
