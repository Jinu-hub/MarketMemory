import { ArrowRightIcon, ClockIcon } from "lucide-react";
import { Link } from "react-router";

import { NexBadge } from "~/core/components/nex";
import { ContentEmptyState } from "~/core/components/content/content-empty-state";
import { cn } from "~/core/lib/utils";

import { ReportTimeline } from "~/features/item-reports/components/report-timeline";
import { itemReportsTimelineHref } from "~/features/item-reports/lib/item-reports-urls";
import type { ReportListItem } from "~/features/item-reports/types";

import { pickDashboardUi } from "../i18n";
import { DashboardBlockShell } from "./dashboard-block-shell";

type LatestReportsBlockProps = {
  reports: ReportListItem[];
  locale?: string;
  className?: string;
  /** Show the "view all" link in the header. Defaults to true. */
  showViewAll?: boolean;
  /** Render report rows as links to their detail page. Defaults to true. */
  linkReports?: boolean;
  /**
   * When set, only these report ids are linked (overrides a blanket
   * `linkReports={true}`). Used by the public dashboard preview allowlist.
   */
  linkReportIds?: readonly string[];
  /** Detail URL builder. Defaults to `/item_reports/:id`. */
  detailHref?: (id: string) => string;
  /** Optional note rendered below the list (e.g. public preview limit copy). */
  footerNote?: string;
};

export function LatestReportsBlock({
  reports,
  locale,
  className,
  showViewAll = true,
  linkReports = true,
  linkReportIds,
  detailHref,
  footerNote,
}: LatestReportsBlockProps) {
  const ui = pickDashboardUi(locale).latestReports;
  const rows = reports.slice(0, 7);
  const showLinkArrow = Boolean(linkReportIds?.length);

  return (
    <DashboardBlockShell
      tone="subtle"
      ariaLabelledBy="dashboard-latest-reports-heading"
      className={cn("p-4 sm:p-5 md:p-6", className)}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 pb-3 sm:pb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <ClockIcon
              className="text-muted-foreground size-4 shrink-0"
              aria-hidden
            />
            <h2
              id="dashboard-latest-reports-heading"
              className="text-sm font-semibold tracking-tight sm:text-base md:text-lg"
            >
              {ui.title}
            </h2>
            <NexBadge variant="outline" size="sm" className="shrink-0">
              {rows.length}
              {ui.countSuffix}
            </NexBadge>
          </div>
          <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed sm:text-xs">
            {ui.description}
          </p>
        </div>
        {showViewAll ? (
          <Link
            to={itemReportsTimelineHref({})}
            viewTransition
            className="text-primary hover:text-primary/80 inline-flex shrink-0 items-center gap-1 pt-0.5 text-[11px] font-medium sm:text-xs"
          >
            {ui.viewAll}
            <ArrowRightIcon className="size-3" />
          </Link>
        ) : null}
      </header>

      {rows.length === 0 ? (
        <ContentEmptyState>{ui.empty}</ContentEmptyState>
      ) : (
        <ReportTimeline
          reports={rows}
          compact
          showGroupCounts={false}
          linkReports={linkReports}
          linkReportIds={linkReportIds}
          detailHref={detailHref}
          showLinkArrow={showLinkArrow}
        />
      )}

      {footerNote ? (
        <p className="text-muted-foreground border-border/60 mt-4 border-t pt-3 text-[11px] leading-relaxed sm:text-xs">
          {footerNote}
        </p>
      ) : null}
    </DashboardBlockShell>
  );
}
