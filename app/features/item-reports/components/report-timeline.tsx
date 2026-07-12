import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

import { ContentEmptyState } from "~/core/components/content/content-empty-state";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/core/components/ui/collapsible";
import { cn } from "~/core/lib/utils";

import {
  formatCount,
  formatItemReportsCopy,
  useItemReportsLocale,
  useItemReportsUi,
} from "../i18n";
import { dateLocaleTag } from "../i18n/resolve";
import { itemReportsDetailHref } from "../lib/item-reports-urls";
import type { ReportListItem } from "../types";
import { ReportListRow } from "./report-list-row";

type ReportTimelineProps = {
  reports: ReportListItem[];
  className?: string;
  compact?: boolean;
  showGroupCounts?: boolean;
  detailHref?: (id: string) => string;
  /** When false, report titles render without links (no navigation). */
  linkReports?: boolean;
};

type TimelineGroup = {
  key: string;
  label: string;
  reports: ReportListItem[];
};

function groupByMonth(
  reports: ReportListItem[],
  locale: string,
): TimelineGroup[] {
  const buckets = new Map<string, TimelineGroup>();
  for (const report of reports) {
    const raw = report.market_date ?? report.created_at;
    if (!raw) continue;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString(dateLocaleTag(locale), {
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

export function ReportTimeline({
  reports,
  className,
  compact = false,
  showGroupCounts = true,
  detailHref = itemReportsDetailHref,
  linkReports = true,
}: ReportTimelineProps) {
  const ui = useItemReportsUi();
  const locale = useItemReportsLocale();
  const groups = groupByMonth(reports, locale);
  if (groups.length === 0) {
    return (
      <ContentEmptyState>{ui.timeline.empty}</ContentEmptyState>
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
          linkReports={linkReports}
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
  linkReports,
}: {
  group: TimelineGroup;
  compact: boolean;
  showGroupCounts: boolean;
  collapsible: boolean;
  defaultOpen: boolean;
  detailHref: (id: string) => string;
  linkReports: boolean;
}) {
  const ui = useItemReportsUi();
  const locale = useItemReportsLocale();
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `timeline-month-${group.key}`;
  const countLabel = showGroupCounts
    ? `, ${formatCount(group.reports.length, locale)}`
    : "";
  const toggleAction = open ? ui.common.collapse : ui.common.expand;
  const toggleAria = formatItemReportsCopy(ui.timeline.monthToggleAria, {
    label: group.label,
    count: formatCount(group.reports.length, locale),
    action: toggleAction,
  });

  if (compact && !collapsible) {
    return (
      <section aria-label={group.label} className="space-y-2">
        <h3 className="text-muted-foreground text-xs font-semibold tracking-tight">
          {group.label}
        </h3>
        <TimelineMonthList
          group={group}
          compact
          detailHref={detailHref}
          linkReports={linkReports}
        />
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
            aria-label={toggleAria}
          >
            <div className="flex min-w-0 items-baseline gap-2">
              <h3 className="text-muted-foreground text-xs font-semibold tracking-tight">
                {group.label}
              </h3>
              {showGroupCounts ? (
                <span className="text-muted-foreground/80 text-[11px] tabular-nums">
                  {formatCount(group.reports.length, locale)}
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
              <TimelineMonthList
                group={group}
                compact
                detailHref={detailHref}
                linkReports={linkReports}
              />
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
          aria-label={`${group.label}${countLabel}, ${toggleAction}`}
        >
          <div className="flex min-w-0 items-baseline gap-2 sm:gap-3">
            <h3 className="text-base font-semibold tracking-tight md:text-lg">
              {group.label}
            </h3>
            {showGroupCounts ? (
              <span className="text-muted-foreground text-xs tabular-nums">
                {formatCount(group.reports.length, locale)}
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
              {toggleAction}
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
            <TimelineMonthList
              group={group}
              compact={false}
              detailHref={detailHref}
              linkReports={linkReports}
            />
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
  linkReports,
}: {
  group: TimelineGroup;
  compact: boolean;
  detailHref: (id: string) => string;
  linkReports: boolean;
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
            linkReports={linkReports}
          />
        ))}
      </ul>
    </div>
  );
}
