/**
 * ReportTierBadge — Content Layer indicator for `report_tier`.
 *
 * Built on `NexBadge` (Base Layer) plus the `tier-style` semantic mapping
 * so the entire reading experience speaks one visual language: same shape,
 * same icon convention, same theme behaviour as the rest of the Nex
 * components.
 *
 * Editorial defaults:
 *   - `free` is hidden by default (`showFree=false`). Cards and headers
 *     don't need a "FREE" stamp on every row — silence is the signal.
 *     Pass `showFree` to force the badge in contexts that explicitly
 *     enumerate metadata (e.g. the right-rail sidebar's "등급" row).
 *   - `iconOnly` is for tight spaces (table rows, dense lists). The badge
 *     keeps an `aria-label` so screen readers still get the tier name.
 *
 * Theme: every visual is composed from semantic tokens
 * (text-muted-foreground, bg-card, …) plus the tier accent classes from
 * `tier-style.ts`, so it stays legible across light / dark / warm.
 */
import { cn } from "~/core/lib/utils";
import { NexBadge } from "~/core/components/nex";

import { getTierStyle } from "../lib/tier-style";

type ReportTierBadgeProps = {
  tier: string | null | undefined;
  /** Use Korean ("프리미엄") or short English ("Premium") label. */
  variant?: "korean" | "short";
  /** Hide everything but the icon — useful in dense table rows. */
  iconOnly?: boolean;
  /** Render `free` instead of returning `null`. Default false. */
  showFree?: boolean;
  className?: string;
};

export function ReportTierBadge({
  tier,
  variant = "korean",
  iconOnly = false,
  showFree = false,
  className,
}: ReportTierBadgeProps) {
  if (!tier) return null;
  if (tier === "free" && !showFree) return null;

  const style = getTierStyle(tier);
  const Icon = style.icon;
  const label = variant === "short" ? style.shortLabel : style.label;

  return (
    <NexBadge
      variant={style.badgeVariant}
      size="sm"
      className={cn(style.badgeClassName, className)}
      aria-label={`${style.label} 등급 리포트`}
    >
      <Icon className={cn("size-3", iconOnly ? "" : "mr-1")} aria-hidden />
      {iconOnly ? null : label}
    </NexBadge>
  );
}
