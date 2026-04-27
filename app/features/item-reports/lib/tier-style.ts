/**
 * Visual semantic mapping for report tiers (free / premium / premium_plus).
 *
 * Mirrors the Category Semantic Accent System (see category-style.ts) but
 * along a different axis — a tier signals access level rather than topical
 * domain, so the visual language is intentionally restrained: a single
 * accent color, a non-color signal (icon), and a quietly themed badge.
 *
 * Design intent (per components.mdc §15):
 *   - "free" should fade into the background; we never want to put a
 *     "FREE" stamp on every card. UIs can opt into showing it via a prop,
 *     but the default treatment is a muted outline.
 *   - "premium" reads as warm/golden but not loud — closer to a magazine
 *     subscriber band than a pricing-page CTA.
 *   - "premium_plus" leans editorial-luxury (violet) and adds a second
 *     icon-level signal so it's distinguishable in monochrome contexts.
 *
 * All classes resolve correctly across light / dark / warm themes; we
 * intentionally pair palette tokens with semantic foreground tokens
 * (`text-muted-foreground`) so warm-mode reading stays comfortable.
 */
import type { LucideIcon } from "lucide-react";
import { GemIcon, LockIcon, SparklesIcon } from "lucide-react";

import type { ReportTier } from "../constants";

type NexBadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "secondary"
  | "outline";

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

export const TIER_STYLES: Record<ReportTier, TierStyle> = {
  free: {
    label: "무료",
    shortLabel: "무료",
    badgeVariant: "outline",
    badgeClassName: "",
    accentText: "text-muted-foreground",
    accentBg: "bg-muted/30",
    icon: LockIcon,
  },
  premium: {
    label: "프리미엄",
    shortLabel: "Premium",
    badgeVariant: "outline",
    badgeClassName:
      "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:border-amber-400/40 dark:text-amber-300",
    accentText: "text-amber-600 dark:text-amber-400",
    accentBg: "bg-amber-500/5 dark:bg-amber-400/5",
    icon: SparklesIcon,
  },
  premium_plus: {
    label: "프리미엄+",
    shortLabel: "Premium+",
    badgeVariant: "outline",
    badgeClassName:
      "border-violet-500/40 bg-violet-500/5 text-violet-700 dark:border-violet-400/40 dark:text-violet-300",
    accentText: "text-violet-600 dark:text-violet-400",
    accentBg: "bg-violet-500/5 dark:bg-violet-400/5",
    icon: GemIcon,
  },
};

const FALLBACK_STYLE: TierStyle = TIER_STYLES.free;

export function getTierStyle(tier: string | null | undefined): TierStyle {
  if (!tier) return FALLBACK_STYLE;
  return TIER_STYLES[tier as ReportTier] ?? FALLBACK_STYLE;
}

/** Tiers ranked higher than `free`; used by UIs that hide the default tier. */
export function isPremiumTier(tier: string | null | undefined): boolean {
  return tier === "premium" || tier === "premium_plus";
}
