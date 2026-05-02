import { Link } from "react-router";

import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import { getCategoryStyle } from "../lib/category-style";
import { formatDate, resolveTakeaway } from "../lib/format";
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
    const raw = report.input_date ?? report.created_at;
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
      <div className="border-border text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
        아직 타임라인에 표시할 리포트가 없습니다.
      </div>
    );
  }

  return (
    <div className={cn("space-y-10", className)}>
      {groups.map((group) => (
        <section key={group.key} aria-label={group.label}>
          <div className="mb-4 flex items-baseline gap-3">
            <h3
              className={cn(
                "font-semibold tracking-tight",
                compact ? "text-sm" : "text-base md:text-lg",
              )}
            >
              {group.label}
            </h3>
            {showGroupCounts ? (
              <span className="text-muted-foreground text-xs">
                {group.reports.length}건
              </span>
            ) : null}
          </div>

          <div className="relative">
            <div className="bg-border absolute top-2 bottom-2 left-[7px] w-px md:left-[9px]" />
            <ul
              className={cn(
                "space-y-6",
                compact ? "space-y-4" : "space-y-6 md:space-y-7",
              )}
            >
              {group.reports.map((report) => (
                <TimelineRow
                  key={report.id}
                  report={report}
                  compact={compact}
                />
              ))}
            </ul>
          </div>
        </section>
      ))}
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
  const date = formatDate(report.input_date ?? report.created_at);

  return (
    <li className="relative flex gap-5 md:gap-6">
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
          to={`/item_reports/${report.id}`}
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
