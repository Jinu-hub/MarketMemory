import { ArrowRightIcon, ClockIcon } from "lucide-react";
import { Link } from "react-router";

import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import { ReportTimeline } from "~/features/item-reports/components/report-timeline";
import { itemReportsTimelineHref } from "~/features/item-reports/lib/item-reports-urls";
import type { ReportListItem } from "~/features/item-reports/types";

type LatestReportsBlockProps = {
  reports: ReportListItem[];
  className?: string;
};

/**
 * Latest 7 published reports — modeled after the timeline panel inside
 * `/item_reports/explore` so the dashboard feels consistent with the
 * explore hub. Uses `ReportTimeline` (compact) to render the same
 * chronologically grouped, accent-coded list.
 */
export function LatestReportsBlock({
  reports,
  className,
}: LatestReportsBlockProps) {
  const rows = reports.slice(0, 7);

  return (
    <section
      aria-labelledby="dashboard-latest-reports-heading"
      className={cn(
        "border-border bg-card/60 rounded-2xl border p-4 sm:p-5 md:p-6",
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 pb-3 sm:pb-4">
        <div className="flex min-w-0 items-center gap-2">
          <ClockIcon
            className="text-muted-foreground size-4 shrink-0"
            aria-hidden
          />
          <h2
            id="dashboard-latest-reports-heading"
            className="text-sm font-semibold tracking-tight sm:text-base md:text-lg"
          >
            최신 리포트
          </h2>
          <NexBadge variant="outline" size="sm" className="shrink-0">
            {rows.length}건
          </NexBadge>
        </div>
        <Link
          to={itemReportsTimelineHref({})}
          viewTransition
          className="text-primary hover:text-primary/80 inline-flex shrink-0 items-center gap-1 pt-0.5 text-[11px] font-medium sm:text-xs"
        >
          전체
          <ArrowRightIcon className="size-3" />
        </Link>
      </header>

      {rows.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
          아직 공개된 리포트가 없습니다.
        </div>
      ) : (
        <ReportTimeline reports={rows} compact showGroupCounts={false} />
      )}
    </section>
  );
}
