import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

import { ContentEmptyState } from "~/core/components/content/content-empty-state";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/core/components/ui/collapsible";
import { cn } from "~/core/lib/utils";

import { itemReportsDetailHref } from "../lib/item-reports-urls";
import type { ReportListItem } from "../types";
import { ReportListRow } from "./report-list-row";

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
  /**
   * Override the per-row detail link target so the timeline can live inside a
   * series (e.g. /weekly-ai-issue-digest/:id). Defaults to /item_reports/:id.
   */
  detailHref?: (id: string) => string;
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
  detailHref = itemReportsDetailHref,
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
          detailHref={detailHref}
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
  detailHref,
}: {
  group: TimelineGroup;
  compact: boolean;
  showGroupCounts: boolean;
  collapsible: boolean;
  /** 최신 월만 `true` — 그룹은 `groupByMonth` 내림차순 정렬 기준 */
  defaultOpen: boolean;
  detailHref: (id: string) => string;
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
        <TimelineMonthList group={group} compact detailHref={detailHref} />
      </section>
    );
  }

  if (compact) {
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <section
          aria-label={group.label}
          className="border-border/60 bg-card/30 overflow-hidden rounded-lg border"
        >
          <CollapsibleTrigger
            type="button"
            className={cn(
              "group/trigger bg-muted/15 flex w-full cursor-pointer items-center justify-between gap-2 rounded-none px-3 py-2 text-left transition-colors outline-none",
              "hover:bg-muted/30",
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
            <div className="border-border/50 bg-muted/5 border-t px-3 pb-3 pt-2">
              <TimelineMonthList group={group} compact detailHref={detailHref} />
            </div>
          </CollapsibleContent>
        </section>
      </Collapsible>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <section
        aria-label={group.label}
        className="border-border/60 bg-card/30 overflow-hidden rounded-xl border"
      >
        <CollapsibleTrigger
          type="button"
          className={cn(
            "group/trigger bg-muted/15 flex w-full cursor-pointer items-center justify-between gap-3 rounded-none px-4 py-3 text-left transition-colors outline-none",
            "hover:bg-muted/30",
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
          <div className="border-border/50 bg-muted/5 border-t px-4 pb-5 pt-3 md:px-5 md:pb-6">
            <TimelineMonthList group={group} compact={false} detailHref={detailHref} />
          </div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}

function TimelineMonthList({
  group,
  compact,
  detailHref,
}: {
  group: TimelineGroup;
  compact: boolean;
  detailHref: (id: string) => string;
}) {
  return (
    <div className={cn("relative", compact ? "pt-0.5" : "pt-0")}>
      <div
        className={cn(
          "bg-border/80 absolute bottom-2 w-px",
          compact ? "top-3 left-[7px]" : "top-0 left-[7px] md:left-[9px]",
        )}
      />
      <ul className={cn(compact ? "space-y-4" : "space-y-6 md:space-y-7")}>
        {group.reports.map((report) => (
          <ReportListRow
            key={report.id}
            layout="timeline"
            report={report}
            compact={compact}
            detailHref={detailHref}
          />
        ))}
      </ul>
    </div>
  );
}
