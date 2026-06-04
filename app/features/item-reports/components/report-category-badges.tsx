import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import { getCategoryStyle } from "../lib/category-style";
import { formatReportType } from "../lib/labels";
import { ReportTierBadge } from "./report-tier-badge";

type ReportCategoryBadgesProps = {
  category?: string | null;
  reportType?: string | null;
  reportTier?: string | null;
  className?: string;
  /** Smaller text/icons for compact card grids. */
  size?: "default" | "compact";
  showReportType?: boolean;
  showTier?: boolean;
  /** Applied to `ReportTierBadge` (e.g. `ml-auto` on card headers). */
  tierClassName?: string;
  /** Rendered before the category badge (e.g. Featured stamp). */
  leading?: React.ReactNode;
  /** Rendered after tier badge (e.g. publish date on detail header). */
  trailing?: React.ReactNode;
};

/**
 * Category + report type + tier badge cluster shared across cards and headers.
 */
export function ReportCategoryBadges({
  category,
  reportType,
  reportTier,
  className,
  size = "default",
  showReportType = true,
  showTier = true,
  tierClassName,
  leading,
  trailing,
}: ReportCategoryBadgesProps) {
  const isCompact = size === "compact";
  const style = getCategoryStyle(category);
  const CategoryIcon = style.icon;
  const iconClass = cn("mr-1", isCompact ? "size-2.5" : "size-3");
  const badgeTextClass = isCompact ? "text-[11px]" : undefined;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 sm:gap-2",
        className,
      )}
    >
      {leading}
      {category ? (
        <NexBadge
          variant={style.badgeVariant}
          size="sm"
          className={badgeTextClass}
        >
          <CategoryIcon className={iconClass} />
          {style.label}
        </NexBadge>
      ) : null}
      {showReportType && reportType ? (
        <NexBadge
          variant="outline"
          size="sm"
          className={badgeTextClass}
        >
          {formatReportType(reportType)}
        </NexBadge>
      ) : null}
      {showTier ? (
        <ReportTierBadge
          tier={reportTier}
          className={cn("shrink-0", tierClassName)}
        />
      ) : null}
      {trailing}
    </div>
  );
}
