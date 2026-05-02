import { ArrowUpRightIcon, CalendarIcon, MapPinIcon } from "lucide-react";
import { Link } from "react-router";

import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import { getCategoryStyle } from "../lib/category-style";
import {
  formatRegion,
  formatReportType,
  resolveDisplayDate,
  resolveTakeaway,
} from "../lib/format";
import type { ReportListItem } from "../types";
import { ReportTierBadge } from "./report-tier-badge";

type ReportCardProps = {
  report: ReportListItem;
  className?: string;
  /** Visual density: "default" grid, "dense" sidebar/list, "compact" tight grids */
  density?: "default" | "dense" | "compact";
};

/**
 * Content-layer report card built on showcase InsightCard pattern:
 * directional left-border accent per category + NexBadge for semantic
 * signals + hover-revealed action hint. Not a generic dashboard card.
 */
export function ReportCard({
  report,
  className,
  density = "default",
}: ReportCardProps) {
  const takeaway = resolveTakeaway(report.summary, report.summary_meta);
  const date = resolveDisplayDate(report);
  const primaryRegion = report.regions?.[0];
  const style = getCategoryStyle(report.category);
  const CategoryIcon = style.icon;
  const isDense = density === "dense";
  const isCompact = density === "compact";
  const visibleTags = (report.tags ?? []).slice(0, isCompact ? 2 : 3);

  return (
    <Link
      to={`/item_reports/${report.id}`}
      viewTransition
      className={cn(
        "group bg-card border-border hover:border-primary/30 flex h-full flex-col rounded-xl border border-l-[3px]",
        style.accentBorder,
        "transition-all hover:shadow-md",
        isCompact
          ? "gap-2 p-3 hover:-translate-y-px"
          : isDense
            ? "gap-3 p-4 hover:-translate-y-0.5"
            : "gap-3 p-5 hover:-translate-y-0.5",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {report.category ? (
          <NexBadge
            variant={style.badgeVariant}
            size="sm"
            className={isCompact ? "text-[11px]" : undefined}
          >
            <CategoryIcon className={cn("mr-1", isCompact ? "size-2.5" : "size-3")} />
            {style.label}
          </NexBadge>
        ) : null}
        {report.report_type ? (
          <NexBadge variant="outline" size="sm" className={isCompact ? "text-[11px]" : undefined}>
            {formatReportType(report.report_type)}
          </NexBadge>
        ) : null}
        <ReportTierBadge tier={report.report_tier} className="ml-auto shrink-0" />
      </div>

      <div className={cn("flex-1", isCompact ? "space-y-1" : "space-y-2")}>
        <h3
          className={cn(
            "group-hover:text-primary line-clamp-2 font-semibold tracking-tight transition-colors",
            isCompact
              ? "text-sm leading-snug"
              : isDense
                ? "text-base leading-snug"
                : "text-lg leading-snug md:text-xl",
          )}
        >
          {report.title ?? "Untitled report"}
        </h3>
        {takeaway ? (
          <p
            className={cn(
              "text-muted-foreground",
              isCompact
                ? "line-clamp-2 text-xs leading-relaxed"
                : isDense
                  ? "line-clamp-2 text-xs leading-6"
                  : "line-clamp-3 text-sm leading-6",
            )}
          >
            {takeaway}
          </p>
        ) : null}
      </div>

      {visibleTags.length > 0 ? (
        <div className={cn("flex flex-wrap", isCompact ? "gap-1" : "gap-1.5")}>
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "text-muted-foreground bg-muted/60 rounded-md py-0.5 text-[11px]",
                isCompact ? "px-1.5" : "px-2",
              )}
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}

      <div
        className={cn(
          "text-muted-foreground border-border/60 mt-auto flex items-center justify-between gap-2 border-t",
          isCompact ? "pt-2 text-[11px]" : "gap-3 pt-3 text-xs",
        )}
      >
        <div className={cn("flex min-w-0 items-center", isCompact ? "gap-2" : "gap-3")}>
          {date ? (
            <span className="flex min-w-0 items-center gap-0.5">
              <CalendarIcon className={cn(isCompact ? "size-3 shrink-0" : "size-3.5")} />
              <span className="truncate">{date}</span>
            </span>
          ) : null}
          {primaryRegion ? (
            <span className="flex min-w-0 max-w-[42%] items-center gap-0.5 sm:max-w-none">
              <MapPinIcon className={cn(isCompact ? "size-3 shrink-0" : "size-3.5")} />
              <span className="truncate">{formatRegion(primaryRegion)}</span>
            </span>
          ) : null}
        </div>
        <ArrowUpRightIcon
          className={cn(
            "shrink-0 opacity-0 transition-opacity group-hover:opacity-100",
            isCompact ? "size-3.5" : "size-4",
          )}
        />
      </div>
    </Link>
  );
}
