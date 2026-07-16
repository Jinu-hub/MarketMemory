/**
 * SampleReportsBlock — public-dashboard teaser for the newest preview reports.
 *
 * Guests can open only the allowlisted preview reports. This block surfaces
 * those samples as inviting InsightCard-style cards so visitors can try the
 * reading experience before signing in.
 */
import {
  ArrowRightIcon,
  BookOpenIcon,
  InfoIcon,
  SparklesIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { NexBadge } from "~/core/components/nex";
import { ContentEmptyState } from "~/core/components/content/content-empty-state";
import { cn } from "~/core/lib/utils";
import { DashboardBlockShell } from "~/features/dashboard/components/dashboard-block-shell";
import { ReportCard } from "~/features/item-reports/components/report-card";
import type { ReportListItem } from "~/features/item-reports/types";

import { publicDashboardReportHref } from "../lib/urls";

type SampleReportsBlockProps = {
  reports: ReportListItem[];
  /** IDs allowlisted for `/public-dashboard/reports/:id`. */
  previewReportIds: readonly string[];
  className?: string;
};

export function SampleReportsBlock({
  reports,
  previewReportIds,
  className,
}: SampleReportsBlockProps) {
  const { t } = useTranslation();
  const previewIdSet = new Set(previewReportIds);
  const samples = reports.filter((report) => previewIdSet.has(report.id));
  const sampleCount = previewReportIds.length;

  const titleId = "public-dashboard-sample-reports-heading";

  return (
    <DashboardBlockShell
      tone="default"
      ariaLabelledBy={titleId}
      className={cn("relative overflow-hidden", className)}
    >
      {/* Soft directional wash — invites the eye without hardcoding theme colors */}
      <div
        aria-hidden
        className="from-primary/[0.07] via-primary/[0.02] pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b to-transparent"
      />

      <div className="relative space-y-4 p-4 sm:space-y-5 sm:p-5 md:p-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1.5">
            <p className="text-primary inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase sm:text-xs">
              <SparklesIcon className="size-3.5" aria-hidden />
              {t("publicDashboard.sampleReports.eyebrow")}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id={titleId}
                className="text-base font-semibold tracking-tight sm:text-lg md:text-xl"
              >
                {t("publicDashboard.sampleReports.title")}
              </h2>
              {sampleCount > 0 ? (
                <NexBadge variant="secondary" size="sm" className="shrink-0">
                  {t("publicDashboard.sampleReports.badge", {
                    count: sampleCount,
                  })}
                </NexBadge>
              ) : null}
            </div>
            <p className="text-muted-foreground max-w-2xl text-xs leading-relaxed sm:text-sm">
              {t("publicDashboard.sampleReports.description")}
            </p>
          </div>

          <p className="text-primary/90 bg-primary/[0.06] ring-primary/15 inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg px-3 py-1.5 text-[11px] font-medium ring-1 sm:text-xs">
            <BookOpenIcon className="size-3.5" aria-hidden />
            {t("publicDashboard.sampleReports.ctaHint")}
            <ArrowRightIcon className="size-3 opacity-70" aria-hidden />
          </p>
        </header>

        <div
          role="status"
          className="border-border/80 bg-muted/40 text-muted-foreground flex items-start gap-2 rounded-lg border border-dashed px-3.5 py-2.5 text-[11px] leading-relaxed sm:text-xs"
        >
          <InfoIcon
            className="text-primary mt-0.5 size-3.5 shrink-0"
            aria-hidden
          />
          <span className="min-w-0 flex-1">
            {t("publicDashboard.sampleReports.limitNotice")}
          </span>
        </div>

        {samples.length === 0 ? (
          <ContentEmptyState>
            {t("publicDashboard.sampleReports.empty")}
          </ContentEmptyState>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {samples.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                density="default"
                detailHref={publicDashboardReportHref}
                className="hover:border-primary/40 hover:ring-primary/10 focus-within:ring-primary/20 transition-shadow duration-200 hover:shadow-lg hover:ring-1 focus-within:ring-2"
              />
            ))}
          </div>
        )}
      </div>
    </DashboardBlockShell>
  );
}