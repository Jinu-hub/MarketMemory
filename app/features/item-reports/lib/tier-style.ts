/**
 * Visual semantic mapping for report tiers (free / premium / premium_plus).
 *
 * Mirrors the Category Semantic Accent System (see category-style.ts) but
 * along a different axis — a tier signals access level rather than topical
 * domain, so the visual language is intentionally restrained: a single
 * accent color, a non-color signal (icon), and a quietly themed badge.
 *
 * Labels resolve via `~/features/item-reports/i18n`.
 */
import type { LucideIcon } from "lucide-react";
import { GemIcon, LockIcon, SparklesIcon } from "lucide-react";

import type { ReportTier } from "../constants";
import { getReportTierLabel } from "../i18n/labels";

import type { NexBadgeVariant } from "~/core/lib/semantic-style";

export type TierStyle = {
  label: string;
  /** Short label used for compact badges where space is tight. */
  shortLabel: string;
  /** NexBadge variant that gives the badge its base shape/contrast. */
  badgeVariant: NexBadgeVariant;
  /**
   * Tailwind classes layered on top of the badge to add the tier's
   * accent color. Empty string for `free` so the muted outline stays
   * neutral.
   */
  badgeClassName: string;
  /** Solid color used for the icon next to the label. */
  accentText: string;
  /** Subtle fill suitable for callout chips / info rows. */
  accentBg: string;
  icon: LucideIcon;
};

type TierVisual = Omit<TierStyle, "label" | "shortLabel">;

const TIER_VISUAL: Record<ReportTier, TierVisual> = {
  free: {
    badgeVariant: "outline",
    badgeClassName: "",
    accentText: "text-muted-foreground",
    accentBg: "bg-muted/30",
    icon: LockIcon,
  },
  premium: {
    badgeVariant: "outline",
    badgeClassName:
      "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:border-amber-400/40 dark:text-amber-300",
    accentText: "text-amber-600 dark:text-amber-400",
    accentBg: "bg-amber-500/5 dark:bg-amber-400/5",
    icon: SparklesIcon,
  },
  premium_plus: {
    badgeVariant: "outline",
    badgeClassName:
      "border-violet-500/40 bg-violet-500/5 text-violet-700 dark:border-violet-400/40 dark:text-violet-300",
    accentText: "text-violet-600 dark:text-violet-400",
    accentBg: "bg-violet-500/5 dark:bg-violet-400/5",
    icon: GemIcon,
  },
};

/** @deprecated Use `getTierStyle(tier, locale)` — kept for admin imports. */
export const TIER_STYLES: Record<ReportTier, TierStyle> = {
  free: {
    ...TIER_VISUAL.free,
    label: "노멀",
    shortLabel: "Normal",
  },
  premium: {
    ...TIER_VISUAL.premium,
    label: "프리미엄",
    shortLabel: "Premium",
  },
  premium_plus: {
    ...TIER_VISUAL.premium_plus,
    label: "프리미엄+",
    shortLabel: "Premium+",
  },
};

function styleForTier(tier: ReportTier, locale?: string | null): TierStyle {
  const visual = TIER_VISUAL[tier];
  const label = getReportTierLabel(tier, locale);
  return {
    ...visual,
    label,
    shortLabel:
      tier === "premium" || tier === "premium_plus"
        ? label.replace("+", "+")
        : label,
  };
}

export function getTierStyle(
  tier: string | null | undefined,
  locale?: string | null,
): TierStyle {
  if (!tier) return styleForTier("free", locale);
  return styleForTier(tier as ReportTier, locale) ?? styleForTier("free", locale);
}

/** Tiers ranked higher than `free`; used by UIs that hide the default tier. */
export function isPremiumTier(tier: string | null | undefined): boolean {
  return tier === "premium" || tier === "premium_plus";
}
