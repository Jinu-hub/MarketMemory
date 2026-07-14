import { ArrowRightIcon, LockIcon } from "lucide-react";
import { Link } from "react-router";

import { cn } from "~/core/lib/utils";
import { NexBadge } from "~/core/components/nex";

import { useItemReportsLocale, useItemReportsUi } from "../i18n";
import { getCategoryStyle } from "../lib/category-style";
import { resolveDisplayDate } from "../lib/dates";
import { itemReportsDetailHref } from "../lib/item-reports-urls";
import type { ItemReportsListLocationState } from "../lib/list-navigation-state";
import {
  getSimilarityLabel,
  getSimilarityToneClass,
  type SimilarityLevel,
} from "../lib/similarity-style";
import { resolveDisplaySummary } from "../lib/summary";
import type { ReportListItem } from "../types";
import { ReportCategoryBadges } from "./report-category-badges";

type ReportListRowBaseProps = {
  report: ReportListItem;
  detailHref?: (id: string) => string;
  listLinkState?: ItemReportsListLocationState;
  className?: string;
  /**
   * When false, titles render as plain text instead of links to the report
   * detail page. Used by logged-out surfaces that only expose an allowlisted
   * subset of rows. Defaults to true.
   */
  linkReports?: boolean;
  /**
   * When true, linked titles show a trailing arrow so clickable rows stand out
   * (e.g. public dashboard preview allowlist). Unlinked rows in the same mode
   * show a lock icon in the same slot.
   */
  showLinkArrow?: boolean;
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
 * Keeps summary, category accent, and title styling in one place.
 */
export function ReportListRow(props: ReportListRowProps) {
  const {
    report,
    detailHref = itemReportsDetailHref,
    listLinkState,
    className,
    linkReports = true,
    showLinkArrow = false,
  } = props;
  const ui = useItemReportsUi();
  const locale = useItemReportsLocale();
  const style = getCategoryStyle(report.category, locale);
  const CategoryIcon = style.icon;
  const summary = resolveDisplaySummary(report.summary);
  const date = resolveDisplayDate(report, locale);
  const title = report.title ?? ui.common.untitled;

  if (props.layout === "related") {
    const similarityLabel = getSimilarityLabel(props.similarityLevel, locale);

    const relatedContent = (
      <>
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
        {summary ? (
          <p className="text-muted-foreground line-clamp-2 text-xs leading-5">
            {summary}
          </p>
        ) : null}
        {linkReports ? (
          <ArrowRightIcon className="text-muted-foreground size-3 self-end opacity-0 transition-opacity group-hover:opacity-100" />
        ) : null}
      </>
    );

    if (!linkReports) {
      return (
        <div
          className={cn(
            "flex flex-col gap-1 rounded-md border-l-[3px] px-3 py-2.5",
            style.accentBorder,
            className,
          )}
        >
          {relatedContent}
        </div>
      );
    }

    return (
      <Link
        to={detailHref(report.id)}
        state={listLinkState}
        viewTransition
        className={cn(
          "hover:bg-accent/50 group flex flex-col gap-1 rounded-md border-l-[3px] px-3 py-2.5 transition-colors",
          style.accentBorder,
          className,
        )}
      >
        {relatedContent}
      </Link>
    );
  }

  const compact = props.compact ?? false;

  const timelineTitleContent = (
    <>
      <h4
        className={cn(
          "font-semibold transition-colors",
          linkReports
            ? "group-hover:text-primary"
            : "text-muted-foreground",
          compact ? "text-sm leading-snug" : "text-base leading-snug md:text-lg",
        )}
      >
        {title}
      </h4>
      {summary && !compact ? (
        <p
          className={cn(
            "text-muted-foreground mt-1 text-sm leading-6",
            "line-clamp-4 max-w-5xl",
            "md:line-clamp-3 md:max-w-6xl",
            "lg:line-clamp-2 lg:max-w-none",
          )}
        >
          {summary}
        </p>
      ) : null}
    </>
  );

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
            !linkReports && "opacity-50",
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
          <ReportCategoryBadges
            category={report.category}
            showReportType={false}
            showTier={false}
          />
        </div>

        {linkReports ? (
          <Link
            to={detailHref(report.id)}
            state={listLinkState}
            viewTransition
            className={cn(
              "group",
              showLinkArrow ? "flex items-start gap-2" : "block",
            )}
          >
            <div className={showLinkArrow ? "min-w-0 flex-1" : undefined}>
              {timelineTitleContent}
            </div>
            {showLinkArrow ? (
              <ArrowRightIcon
                className={cn(
                  "text-primary mt-0.5 size-4 shrink-0 transition-transform",
                  "opacity-70 group-hover:translate-x-0.5 group-hover:opacity-100",
                )}
                aria-hidden
              />
            ) : null}
          </Link>
        ) : (
          <div
            className={cn(
              showLinkArrow ? "flex items-start gap-2" : "block",
            )}
          >
            <div className={showLinkArrow ? "min-w-0 flex-1" : undefined}>
              {timelineTitleContent}
            </div>
            {showLinkArrow ? (
              <LockIcon
                className="text-muted-foreground mt-0.5 size-4 shrink-0 opacity-70"
                aria-hidden
              />
            ) : null}
          </div>
        )}
      </div>
    </li>
  );
}
