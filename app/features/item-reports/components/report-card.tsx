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
  /** Visual density: "default" for standard grid, "dense" for sidebar/list */
  density?: "default" | "dense";
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
  const visibleTags = (report.tags ?? []).slice(0, 3);
  const style = getCategoryStyle(report.category);
  const CategoryIcon = style.icon;
  const isDense = density === "dense";

  return (
    <Link
      to={`/item_reports/${report.id}`}
      viewTransition
      className={cn(
        "group bg-card border-border hover:border-primary/30 flex h-full flex-col gap-3 rounded-xl border border-l-[3px]",
        style.accentBorder,
        "transition-all hover:-translate-y-0.5 hover:shadow-md",
        isDense ? "p-4" : "p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {report.category ? (
          <NexBadge variant={style.badgeVariant} size="sm">
            <CategoryIcon className="mr-1 size-3" />
            {style.label}
          </NexBadge>
        ) : null}
        {report.report_type ? (
          <NexBadge variant="outline" size="sm">
            {formatReportType(report.report_type)}
          </NexBadge>
        ) : null}
        <ReportTierBadge tier={report.report_tier} className="ml-auto" />
      </div>

      <div className="flex-1 space-y-2">
        <h3
          className={cn(
            "group-hover:text-primary line-clamp-2 font-semibold tracking-tight transition-colors",
            isDense
              ? "text-base leading-snug"
              : "text-lg leading-snug md:text-xl",
          )}
        >
          {report.title ?? "Untitled report"}
        </h3>
        {takeaway ? (
          <p
            className={cn(
              "text-muted-foreground leading-6",
              isDense ? "line-clamp-2 text-xs" : "line-clamp-3 text-sm",
            )}
          >
            {takeaway}
          </p>
        ) : null}
      </div>

      {visibleTags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="text-muted-foreground bg-muted/60 rounded-md px-2 py-0.5 text-[11px]"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="text-muted-foreground border-border/60 mt-auto flex items-center justify-between gap-3 border-t pt-3 text-xs">
        <div className="flex items-center gap-3">
          {date ? (
            <span className="flex items-center gap-1">
              <CalendarIcon className="size-3.5" />
              {date}
            </span>
          ) : null}
          {primaryRegion ? (
            <span className="flex items-center gap-1">
              <MapPinIcon className="size-3.5" />
              {formatRegion(primaryRegion)}
            </span>
          ) : null}
        </div>
        <ArrowUpRightIcon className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  );
}
