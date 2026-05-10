import { ArrowRightIcon, Link2Icon } from "lucide-react";
import { Link } from "react-router";

import { cn } from "~/core/lib/utils";
import { NexBadge } from "~/core/components/nex";

import { getCategoryStyle } from "../lib/category-style";
import { resolveDisplayDate } from "../lib/dates";
import { resolveTakeaway } from "../lib/summary-meta";
import { itemReportsDetailHref } from "../lib/item-reports-urls";
import type { RelatedReportItem } from "../types";

type RelatedReportsProps = {
  reports: RelatedReportItem[];
  className?: string;
  /**
   * Tailwind height utility applied to the outer `<section>`.
   *
   * Two recommended modes:
   *   - **Fixed cap** (default) — `max-h-[28rem]`. The card itself caps at
   *     ~448px and the list scrolls inside it.
   *   - **Flex-fill** — pass `lg:max-h-none` together with a flex parent
   *     that has `min-h-0` so the card grows to fill the remaining space
   *     and the list scrolls inside the leftover area. This is what the
   *     detail-page sidebar uses so the related-reports list stays visible
   *     alongside the report meta block at any viewport height.
   */
  maxHeightClassName?: string;
};

/**
 * Sidebar block listing related reports. Each row uses the category accent
 * so users recognise category shifts at a glance (e.g. switching from a
 * `market` story to a `watchlist` signal).
 *
 * Implementation notes:
 *   - Uses **plain `overflow-y-auto`** rather than Radix `ScrollArea`. Radix
 *     needs an unambiguous height chain; in our flex-fill sidebar that
 *     chain collapsed in some viewports and the list silently overflowed
 *     the card. A native scroll container is more robust.
 *   - The card owns the height cap (`max-h-*`) and `overflow-hidden`, so
 *     the cap is enforced visually no matter what the children contain.
 *   - **Single-flex layout**: the scrolling `<ul>` is itself the flex-1
 *     child of the section. This avoids an intermediate wrapper whose
 *     `flex-1 / min-h-0` size sometimes failed to propagate to a `h-full`
 *     descendant.
 *   - `overscroll-contain` keeps the page from chain-scrolling once the
 *     list reaches its end.
 *   - Soft top/bottom fades hint that more rows exist beyond the viewport
 *     (rule §15 — never rely on color alone to convey state).
 */
export function RelatedReports({
  reports,
  className,
  maxHeightClassName = "max-h-[28rem]",
}: RelatedReportsProps) {
  if (!reports || reports.length === 0) return null;
  const sortedReports = [...reports].sort((a, b) => {
    const rankA = a.ranking ?? 9999;
    const rankB = b.ranking ?? 9999;
    if (rankA !== rankB) return rankA - rankB;
    return (b.final_score ?? -1) - (a.final_score ?? -1);
  });

  const similarityToneClass = (level: RelatedReportItem["similarity_level"]) =>
    level === "strong"
      ? "border-violet-500/60 bg-violet-500/15 text-violet-700 dark:text-violet-300"
      : level === "high"
        ? "border-blue-500/60 bg-blue-500/15 text-blue-700 dark:text-blue-300"
        : level === "medium"
          ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          : "border-muted-foreground/35 bg-muted/55 text-muted-foreground";

  return (
    <section
      className={cn(
        "border-border bg-card flex min-h-0 flex-col overflow-hidden rounded-xl border",
        maxHeightClassName,
        className,
      )}
    >
      <div className="border-border/60 flex shrink-0 items-center gap-2 border-b px-5 py-4">
        <Link2Icon className="text-muted-foreground size-4" />
        <h3 className="text-sm font-semibold tracking-tight">관련 리포트</h3>
        <NexBadge
          variant="secondary"
          size="sm"
          className="ml-auto h-6 px-2.5 text-[11px] font-semibold tabular-nums"
        >
          {reports.length}
        </NexBadge>
      </div>

      <ul className="scrollbar-thin min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-3">
        {sortedReports.map((report) => {
          const takeaway = resolveTakeaway(report.summary, report.summary_meta);
          const style = getCategoryStyle(report.category);
          const CategoryIcon = style.icon;
          const similarityLabel =
            report.similarity_level === "strong"
              ? "Strong"
              : report.similarity_level === "high"
                ? "High"
                : report.similarity_level === "medium"
                  ? "Medium"
                  : report.similarity_level === "weak"
                    ? "Weak"
                    : null;
          return (
            <li key={report.id}>
              <Link
                to={itemReportsDetailHref(report.id)}
                viewTransition
                className={cn(
                  "hover:bg-accent/50 group flex flex-col gap-1 rounded-md border-l-[3px] px-3 py-2.5 transition-colors",
                  style.accentBorder,
                )}
              >
                <div className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <CategoryIcon className={cn("size-3", style.accentText)} />
                  <span>{style.label}</span>
                  <span aria-hidden>·</span>
                  <span>{resolveDisplayDate(report)}</span>
                  {similarityLabel ? (
                    <>
                      <span aria-hidden>·</span>
                      <NexBadge
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-5 px-2 py-0 text-[10px] font-semibold tracking-wide",
                          similarityToneClass(report.similarity_level ?? null),
                        )}
                      >
                        {similarityLabel}
                      </NexBadge>
                    </>
                  ) : null}
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
