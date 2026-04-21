import { ArrowRightIcon, Link2Icon } from "lucide-react";
import { Link } from "react-router";

import { cn } from "~/core/lib/utils";

import { getCategoryStyle } from "../lib/category-style";
import { resolveDisplayDate, resolveTakeaway } from "../lib/format";
import type { ReportListItem } from "../types";

type RelatedReportsProps = {
  reports: ReportListItem[];
  className?: string;
};

/**
 * Sidebar block listing related reports. Each row uses the category accent
 * so users recognise category shifts at a glance (e.g. switching from a
 * `market` story to a `watchlist` signal).
 */
export function RelatedReports({ reports, className }: RelatedReportsProps) {
  if (!reports || reports.length === 0) return null;

  return (
    <section
      className={cn(
        "border-border bg-card rounded-xl border p-5",
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <Link2Icon className="text-muted-foreground size-4" />
        <h3 className="text-sm font-semibold tracking-tight">관련 리포트</h3>
      </div>
      <ul className="-mx-2 space-y-1">
        {reports.map((report) => {
          const takeaway = resolveTakeaway(report.summary, report.summary_meta);
          const style = getCategoryStyle(report.category);
          const CategoryIcon = style.icon;
          return (
            <li key={report.id}>
              <Link
                to={`/item_reports/${report.id}`}
                viewTransition
                className={cn(
                  "hover:bg-accent/50 group flex flex-col gap-1 rounded-md border-l-[3px] px-3 py-2.5 transition-colors",
                  style.accentBorder,
                )}
              >
                <div className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <CategoryIcon
                    className={cn("size-3", style.accentText)}
                  />
                  <span>{style.label}</span>
                  <span aria-hidden>·</span>
                  <span>{resolveDisplayDate(report)}</span>
                </div>
                <div className="group-hover:text-primary line-clamp-2 text-sm leading-snug font-medium transition-colors">
                  {report.title ?? "Untitled"}
                </div>
                {takeaway ? (
                  <p className="text-muted-foreground line-clamp-2 text-xs leading-5">
                    {takeaway}
                  </p>
                ) : null}
                <ArrowRightIcon className="text-muted-foreground size-3 self-end opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
