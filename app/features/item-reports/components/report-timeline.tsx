import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";

import { ContentEmptyState } from "~/core/components/content/content-empty-state";
import { NexBadge } from "~/core/components/nex";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/core/components/ui/collapsible";
import { cn } from "~/core/lib/utils";

import { getCategoryStyle } from "../lib/category-style";
import { resolveDisplayDate } from "../lib/dates";
import { resolveTakeaway } from "../lib/summary-meta";
import { itemReportsDetailHref } from "../lib/item-reports-urls";
import type { ReportListItem } from "../types";

type ReportTimelineProps = {
  reports: ReportListItem[];
  className?: string;
  /**
   * When `true`, compact variant used as a sidebar / secondary block (smaller
   * text, denser spacing). Default is `false` (standalone page variant).
   */
  compact?: boolean;
  /**
   * When `false`, hides the per-month `N건` next to group headings (e.g. when
   * the parent surface already shows the total count).
   */
  showGroupCounts?: boolean;
};

type TimelineGroup = {
  key: string;
  label: string;
  reports: ReportListItem[];
};

function groupByMonth(reports: ReportListItem[]): TimelineGroup[] {
  const buckets = new Map<string, TimelineGroup>();
  for (const report of reports) {
    const raw = report.market_date ?? report.created_at;
    if (!raw) continue;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
    });
    if (!buckets.has(key)) {
      buckets.set(key, { key, label, reports: [] });
    }
    buckets.get(key)!.reports.push(report);
  }
  return Array.from(buckets.values()).sort((a, b) => (a.key < b.key ? 1 : -1));
}

/**
 * Narrative-oriented timeline inspired by the showcase Timeline pattern.
 * Renders reports as chronologically grouped events with category-colored
 * nodes. Designed for the /item_reports/timeline route and the explore hub.
 */
export function ReportTimeline({
  reports,
  className,
  compact = false,
  showGroupCounts = true,
}: ReportTimelineProps) {
  const groups = groupByMonth(reports);
  if (groups.length === 0) {
    return (
      <ContentEmptyState>
        아직 타임라인에 표시할 리포트가 없습니다.
      </ContentEmptyState>
    );
  }

  return (
    <div className={cn(compact ? "space-y-3" : "space-y-10", className)}>
      {groups.map((group, index) => (
        <TimelineMonthGroup
          key={group.key}
          group={group}
          compact={compact}
          showGroupCounts={showGroupCounts}
          collapsible={!compact || groups.length > 1}
          defaultOpen={index === 0}
        />
      ))}
    </div>
  );
}

function TimelineMonthGroup({
  group,
  compact,
  showGroupCounts,
  collapsible,
  defaultOpen,
}: {
  group: TimelineGroup;
  compact: boolean;
  showGroupCounts: boolean;
  collapsible: boolean;
  /** 최신 월만 `true` — 그룹은 `groupByMonth` 내림차순 정렬 기준 */
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `timeline-month-${group.key}`;
  const countLabel = showGroupCounts ? `, ${group.reports.length}건` : "";

  if (compact && !collapsible) {
    return (
      <section aria-label={group.label} className="space-y-2">
        <h3 className="text-muted-foreground text-xs font-semibold tracking-tight">
          {group.label}
        </h3>
        <TimelineMonthList group={group} compact />
      </section>
    );
  }

  if (compact) {
    return (
      <Collapsible open={open} onOpenChange={setOpen} className="space-y-2">
        <section aria-label={group.label}>
          <CollapsibleTrigger
            type="button"
            className={cn(
              "group/trigger -mx-1 flex w-[calc(100%+0.5rem)] items-center justify-between gap-2 rounded-md px-1 py-0.5 text-left transition-colors outline-none",
              "hover:bg-muted/40 focus-visible:bg-muted/40",
              "focus-visible:ring-ring focus-visible:ring-2",
            )}
            aria-controls={panelId}
            aria-label={`${group.label}${countLabel}, ${open ? "접기" : "펼치기"}`}
          >
            <div className="flex min-w-0 items-baseline gap-2">
              <h3 className="text-muted-foreground text-xs font-semibold tracking-tight">
                {group.label}
              </h3>
              {showGroupCounts ? (
                <span className="text-muted-foreground/80 text-[11px] tabular-nums">
                  {group.reports.length}건
                </span>
              ) : null}
            </div>
            <ChevronDownIcon
              className={cn(
                "text-muted-foreground size-3.5 shrink-0 transition-transform duration-200",
                "group-hover/trigger:text-foreground",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </CollapsibleTrigger>

          <CollapsibleContent
            id={panelId}
            className={cn(
              "overflow-hidden",
              "data-[state=closed]:animate-collapsible-up",
              "data-[state=open]:animate-collapsible-down",
            )}
          >
            <TimelineMonthList group={group} compact />
          </CollapsibleContent>
        </section>
      </Collapsible>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="space-y-4">
      <section aria-label={group.label} className="space-y-4">
        <CollapsibleTrigger
          type="button"
          className={cn(
            "group/trigger -mx-2 flex w-[calc(100%+1rem)] items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left transition-colors outline-none",
            "hover:bg-muted/40 focus-visible:bg-muted/40",
            "focus-visible:ring-ring focus-visible:ring-2",
          )}
          aria-controls={panelId}
          aria-label={`${group.label}${countLabel}, ${open ? "접기" : "펼치기"}`}
        >
          <div className="flex min-w-0 items-baseline gap-2 sm:gap-3">
            <h3 className="text-base font-semibold tracking-tight md:text-lg">
              {group.label}
            </h3>
            {showGroupCounts ? (
              <span className="text-muted-foreground text-xs tabular-nums">
                {group.reports.length}건
              </span>
            ) : null}
          </div>

          <span className="text-muted-foreground flex shrink-0 items-center gap-2">
            <span
              className={cn(
                "hidden text-xs font-medium sm:inline",
                "group-hover/trigger:text-foreground transition-colors",
              )}
              aria-hidden
            >
              {open ? "접기" : "펼치기"}
            </span>
            <span
              className={cn(
                "border-border/70 bg-background flex items-center justify-center rounded-full border",
                "group-hover/trigger:border-primary/30 group-hover/trigger:text-primary transition-colors",
                "size-8",
              )}
              aria-hidden
            >
              <ChevronDownIcon
                className={cn(
                  "size-4 transition-transform duration-200 ease-out",
                  open && "rotate-180",
                )}
              />
            </span>
          </span>
        </CollapsibleTrigger>

        <CollapsibleContent
          id={panelId}
          className={cn(
            "overflow-hidden",
            "data-[state=closed]:animate-collapsible-up",
            "data-[state=open]:animate-collapsible-down",
          )}
        >
          <TimelineMonthList group={group} compact={false} />
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}

function TimelineMonthList({
  group,
  compact,
}: {
  group: TimelineGroup;
  compact: boolean;
}) {
  return (
    <div className={cn("relative", compact ? "pt-0.5" : "pt-1")}>
      <div
        className={cn(
          "bg-border absolute top-3 bottom-2 w-px",
          "left-[7px] md:left-[9px]",
        )}
      />
      <ul className={cn(compact ? "space-y-4" : "space-y-6 md:space-y-7")}>
        {group.reports.map((report) => (
          <TimelineRow key={report.id} report={report} compact={compact} />
        ))}
      </ul>
    </div>
  );
}

function TimelineRow({
  report,
  compact,
}: {
  report: ReportListItem;
  compact: boolean;
}) {
  const style = getCategoryStyle(report.category);
  const takeaway = resolveTakeaway(report.summary, report.summary_meta);
  const CategoryIcon = style.icon;
  const date = resolveDisplayDate(report);

  return (
    <li className={cn("relative flex", compact ? "gap-3" : "gap-5 md:gap-6")}>
      <div className="relative z-10 flex-shrink-0">
        <div
          className={cn(
            "bg-background flex size-4 items-center justify-center rounded-full border-2 md:size-5",
            style.accentText,
          )}
          style={{ borderColor: "currentColor" }}
        >
          <span className={cn("block size-1.5 rounded-full", "bg-current")} />
        </div>
      </div>

      <div className="min-w-0 flex-1 -mt-0.5 pb-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          <time className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            {date}
          </time>
          {report.category ? (
            <NexBadge variant={style.badgeVariant} size="sm">
              <CategoryIcon className="mr-1 size-3" />
              {style.label}
            </NexBadge>
          ) : null}
        </div>

        <Link
          to={itemReportsDetailHref(report.id)}
          viewTransition
          className="group block"
        >
          <h4
            className={cn(
              "group-hover:text-primary font-semibold transition-colors",
              compact
                ? "text-sm leading-snug"
                : "text-base leading-snug md:text-lg",
            )}
          >
            {report.title ?? "Untitled"}
          </h4>
          {takeaway && !compact ? (
            <p className="text-muted-foreground mt-1 line-clamp-2 max-w-2xl text-sm leading-6">
              {takeaway}
            </p>
          ) : null}
        </Link>
      </div>
    </li>
  );
}
