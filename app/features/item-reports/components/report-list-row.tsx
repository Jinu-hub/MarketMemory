import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router";

import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import { getCategoryStyle } from "../lib/category-style";
import { resolveDisplayDate } from "../lib/dates";
import { itemReportsDetailHref } from "../lib/item-reports-urls";
import {
  getSimilarityLabel,
  getSimilarityToneClass,
  type SimilarityLevel,
} from "../lib/similarity-style";
import { resolveTakeaway } from "../lib/summary-meta";
import type { ReportListItem } from "../types";

type ReportListRowBaseProps = {
  report: ReportListItem;
  detailHref?: (id: string) => string;
  className?: string;
};

type ReportListRowRelatedProps = ReportListRowBaseProps & {
  layout: "related";
  similarityLevel?: SimilarityLevel | null;
};

type ReportListRowTimelineProps = ReportListRowBaseProps & {
  layout: "timeline";
  compact?: boolean;
};

export type ReportListRowProps =
  | ReportListRowRelatedProps
  | ReportListRowTimelineProps;

/**
 * Shared list-row presentation for reports (related sidebar + timeline).
 * Keeps takeaway, category accent, and title styling in one place.
 */
export function ReportListRow(props: ReportListRowProps) {
  const { report, detailHref = itemReportsDetailHref, className } = props;
  const style = getCategoryStyle(report.category);
  const CategoryIcon = style.icon;
  const takeaway = resolveTakeaway(report.summary, report.summary_meta);
  const date = resolveDisplayDate(report);
  const title = report.title ?? "Untitled";

  if (props.layout === "related") {
    const similarityLabel = getSimilarityLabel(props.similarityLevel);

    return (
      <Link
        to={detailHref(report.id)}
        viewTransition
        className={cn(
          "hover:bg-accent/50 group flex flex-col gap-1 rounded-md border-l-[3px] px-3 py-2.5 transition-colors",
          style.accentBorder,
          className,
        )}
      >
        <div className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
          <CategoryIcon className={cn("size-3", style.accentText)} />
          <span>{style.label}</span>
          {date ? (
            <>
              <span aria-hidden>·</span>
              <span>{date}</span>
            </>
          ) : null}
          {similarityLabel ? (
            <>
              <span aria-hidden>·</span>
              <NexBadge
                variant="outline"
                size="sm"
                className={cn(
                  "h-5 px-2 py-0 text-[10px] font-semibold tracking-wide",
                  getSimilarityToneClass(props.similarityLevel),
                )}
              >
                {similarityLabel}
              </NexBadge>
            </>
          ) : null}
        </div>
        <div className="group-hover:text-primary line-clamp-2 text-sm leading-snug font-medium transition-colors">
          {title}
        </div>
        {takeaway ? (
          <p className="text-muted-foreground line-clamp-2 text-xs leading-5">
            {takeaway}
          </p>
        ) : null}
        <ArrowRightIcon className="text-muted-foreground size-3 self-end opacity-0 transition-opacity group-hover:opacity-100" />
      </Link>
    );
  }

  const compact = props.compact ?? false;

  return (
    <li
      className={cn(
        "relative flex",
        compact ? "gap-3" : "gap-5 md:gap-6",
        className,
      )}
    >
      <div className="relative z-10 shrink-0">
        <div
          className={cn(
            "bg-background flex size-4 items-center justify-center rounded-full border-2 md:size-5",
            style.accentText,
          )}
          style={{ borderColor: "currentColor" }}
        >
          <span className="block size-1.5 rounded-full bg-current" />
        </div>
      </div>

      <div className="min-w-0 flex-1 -mt-0.5 pb-1">
        <div className="mb-1.5 flex flex-wrap items-center gap-2">
          {date ? (
            <time className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
              {date}
            </time>
          ) : null}
          {report.category ? (
            <NexBadge variant={style.badgeVariant} size="sm">
              <CategoryIcon className="mr-1 size-3" />
              {style.label}
            </NexBadge>
          ) : null}
        </div>

        <Link
          to={detailHref(report.id)}
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
            {title}
          </h4>
          {takeaway && !compact ? (
            <p
              className={cn(
                "text-muted-foreground mt-1 text-sm leading-6",
                "line-clamp-4 max-w-5xl",
                "md:line-clamp-3 md:max-w-6xl",
                "lg:line-clamp-2 lg:max-w-none",
              )}
            >
              {takeaway}
            </p>
          ) : null}
        </Link>
      </div>
    </li>
  );
}
