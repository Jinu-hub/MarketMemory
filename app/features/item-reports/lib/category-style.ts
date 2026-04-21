/**
 * Visual semantic mapping for report categories.
 *
 * Every category maps to:
 *  - a directional accent color (used for the left border of cards & insight blocks)
 *  - a matching NexBadge variant (so color language stays consistent)
 *  - a lucide icon (adds a second, non-color signal per rule §15)
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

type NexBadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "secondary"
  | "outline";

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

export const CATEGORY_STYLES: Record<ReportCategory, CategoryStyle> = {
  foundation: {
    label: "기초",
    accentBorder: "border-l-slate-400 dark:border-l-slate-500",
    accentBg: "bg-slate-500/5 dark:bg-slate-400/5",
    accentText: "text-slate-600 dark:text-slate-300",
    badgeVariant: "outline",
    icon: BookOpenIcon,
  },
  issue: {
    label: "이슈",
    accentBorder: "border-l-amber-500 dark:border-l-amber-400",
    accentBg: "bg-amber-500/5 dark:bg-amber-400/5",
    accentText: "text-amber-600 dark:text-amber-400",
    badgeVariant: "warning",
    icon: FlagIcon,
  },
  research: {
    label: "리서치",
    accentBorder: "border-l-blue-500 dark:border-l-blue-400",
    accentBg: "bg-blue-500/5 dark:bg-blue-400/5",
    accentText: "text-blue-600 dark:text-blue-400",
    badgeVariant: "info",
    icon: MicroscopeIcon,
  },
  market: {
    label: "시장",
    accentBorder: "border-l-emerald-500 dark:border-l-emerald-400",
    accentBg: "bg-emerald-500/5 dark:bg-emerald-400/5",
    accentText: "text-emerald-600 dark:text-emerald-400",
    badgeVariant: "success",
    icon: LineChartIcon,
  },
  trend: {
    label: "트렌드",
    accentBorder: "border-l-cyan-500 dark:border-l-cyan-400",
    accentBg: "bg-cyan-500/5 dark:bg-cyan-400/5",
    accentText: "text-cyan-600 dark:text-cyan-400",
    badgeVariant: "info",
    icon: TrendingUpIcon,
  },
  deep_dive: {
    label: "심층 분석",
    accentBorder: "border-l-indigo-500 dark:border-l-indigo-400",
    accentBg: "bg-indigo-500/5 dark:bg-indigo-400/5",
    accentText: "text-indigo-600 dark:text-indigo-400",
    badgeVariant: "secondary",
    icon: CompassIcon,
  },
  column: {
    label: "칼럼",
    accentBorder: "border-l-rose-500 dark:border-l-rose-400",
    accentBg: "bg-rose-500/5 dark:bg-rose-400/5",
    accentText: "text-rose-600 dark:text-rose-400",
    badgeVariant: "error",
    icon: PenLineIcon,
  },
  narrative_analysis: {
    label: "내러티브",
    accentBorder: "border-l-purple-500 dark:border-l-purple-400",
    accentBg: "bg-purple-500/5 dark:bg-purple-400/5",
    accentText: "text-purple-600 dark:text-purple-400",
    badgeVariant: "secondary",
    icon: LightbulbIcon,
  },
  review: {
    label: "리뷰",
    accentBorder: "border-l-muted-foreground/40",
    accentBg: "bg-muted/40",
    accentText: "text-muted-foreground",
    badgeVariant: "default",
    icon: ActivityIcon,
  },
  watchlist: {
    label: "워치리스트",
    accentBorder: "border-l-amber-600 dark:border-l-amber-500",
    accentBg: "bg-amber-600/5 dark:bg-amber-500/5",
    accentText: "text-amber-700 dark:text-amber-400",
    badgeVariant: "warning",
    icon: EyeIcon,
  },
};

/** Fallback style when a report's category is null or unrecognised. */
const FALLBACK_STYLE: CategoryStyle = {
  label: "리포트",
  accentBorder: "border-l-border",
  accentBg: "bg-muted/30",
  accentText: "text-muted-foreground",
  badgeVariant: "outline",
  icon: BookOpenIcon,
};

export function getCategoryStyle(
  category: string | null | undefined,
): CategoryStyle {
  if (!category) return FALLBACK_STYLE;
  return CATEGORY_STYLES[category as ReportCategory] ?? FALLBACK_STYLE;
}
