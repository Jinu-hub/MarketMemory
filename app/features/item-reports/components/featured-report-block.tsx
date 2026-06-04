import {
  ArrowRightIcon,
  CalendarIcon,
  GlobeIcon,
  HashIcon,
  MapPinIcon,
} from "lucide-react";
import { Link } from "react-router";

import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import { getCategoryStyle } from "../lib/category-style";
import { resolveDisplayDate } from "../lib/dates";
import { formatRegion, formatReportType } from "../lib/labels";
import { resolveTakeaway } from "../lib/summary-meta";
import { itemReportsDetailHref, itemReportsListHref } from "../lib/item-reports-urls";
import type { ReportListItem } from "../types";
import { ReportCategoryBadges } from "./report-category-badges";

type FeaturedReportBlockProps = {
  report: ReportListItem;
  className?: string;
  /**
   * Override the detail link target so the hero can live inside a series
   * (e.g. /weekly-ai-issue-digest/:id). Defaults to /item_reports/:id.
   */
  detailHref?: (id: string) => string;
  /** Optional override for the small footer note under the meta column. */
  footnote?: string;
};

/**
 * A hero-style block that promotes the most recent report at the top of the
 * list / explore screens. Applies the showcase ReportBlock pattern (header +
 * headline + summary + single CTA) but reserves the full Key Points grid for
 * the detail view.
 */
export function FeaturedReportBlock({
  report,
  className,
  detailHref = itemReportsDetailHref,
  footnote = "이 리포트는 현재 공개된 가장 최근의 AI 리서치 콘텐츠입니다.",
}: FeaturedReportBlockProps) {
  const takeaway = resolveTakeaway(report.summary, report.summary_meta);
  const date = resolveDisplayDate(report);
  const primaryRegion = report.regions?.[0];
  const primaryCountry = report.countries?.[0];
  const style = getCategoryStyle(report.category);
  const CategoryIcon = style.icon;
  const topTags = (report.tags ?? []).slice(0, 4);

  return (
    <article
      className={cn(
        "bg-card border-border relative overflow-hidden rounded-2xl border",
        className,
      )}
    >
      <div className={cn("absolute inset-x-0 top-0 h-1", style.accentBg)}>
        <div
          className={cn("h-full w-24 md:w-48", style.accentBorder, "border-t-4")}
        />
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5 px-6 pt-8 pb-6 md:px-10 md:pt-10">
          <ReportCategoryBadges
            category={report.category}
            reportTier={report.report_tier}
            showReportType={false}
            leading={
              <NexBadge variant="secondary" size="sm">
                Featured
              </NexBadge>
            }
          />

          <h2 className="text-2xl leading-tight font-bold tracking-tight md:text-3xl lg:text-4xl">
            <Link
              to={detailHref(report.id)}
              viewTransition
              className="hover:text-primary transition-colors"
            >
              {report.title ?? "Untitled report"}
            </Link>
          </h2>

          {takeaway ? (
            <p className="text-muted-foreground max-w-4xl text-base leading-relaxed md:text-lg">
              {takeaway}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to={detailHref(report.id)}
              viewTransition
              className="bg-primary text-primary-foreground ring-primary/30 hover:bg-primary/90 focus-visible:ring-primary/50 inline-flex min-w-44 items-center justify-center gap-2 rounded-lg px-7 py-3 text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2"
              aria-label={`${report.title ?? "리포트"} 읽기`}
            >
              리포트 읽기
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
        </div>

        <div
          className={cn(
            "border-border flex flex-col justify-between gap-4 border-t p-6 lg:border-t-0 lg:border-l",
            style.accentBg,
          )}
        >
          <dl className="w-full space-y-3 text-sm">
            {date ? (
              <div>
                <dt className="text-muted-foreground mb-1 text-[11px] tracking-wider uppercase">
                  발행일
                </dt>
                <dd className="flex items-center gap-2">
                  <CalendarIcon className="text-muted-foreground size-4" />
                  <span className="font-medium">{date}</span>
                </dd>
              </div>
            ) : null}

            <div>
              <dt className="text-muted-foreground mb-1 text-[11px] tracking-wider uppercase">
                카테고리
              </dt>
              <dd className="flex items-center gap-2">
                <CategoryIcon className={cn("size-4", style.accentText)} />
                <span className="font-medium">{style.label}</span>
              </dd>
            </div>

            {report.report_type ? (
              <div>
                <dt className="text-muted-foreground mb-1 text-[11px] tracking-wider uppercase">
                  유형
                </dt>
                <dd>
                  <Link
                    to={itemReportsListHref({ report_type: report.report_type })}
                    className="inline-flex items-center gap-2 font-medium underline-offset-4 hover:underline"
                  >
                    <HashIcon className="text-muted-foreground size-4" />
                    {formatReportType(report.report_type)}
                  </Link>
                </dd>
              </div>
            ) : null}

            {primaryRegion ? (
              <div>
                <dt className="text-muted-foreground mb-1 text-[11px] tracking-wider uppercase">
                  지역
                </dt>
                <dd className="flex items-center gap-2">
                  <MapPinIcon className="text-muted-foreground size-4" />
                  <span className="font-medium">{formatRegion(primaryRegion)}</span>
                </dd>
              </div>
            ) : null}

            {primaryCountry ? (
              <div>
                <dt className="text-muted-foreground mb-1 text-[11px] tracking-wider uppercase">
                  국가
                </dt>
                <dd className="flex items-center gap-2">
                  <GlobeIcon className="text-muted-foreground size-4" />
                  <span className="font-medium">{primaryCountry}</span>
                </dd>
              </div>
            ) : null}

            {topTags.length > 0 ? (
              <div>
                <dt className="text-muted-foreground mb-1 text-[11px] tracking-wider uppercase">
                  태그
                </dt>
                <dd className="flex flex-wrap gap-1.5">
                  {topTags.map((tag) => (
                    <Link
                      key={tag}
                      to={itemReportsListHref({ tag })}
                      className="text-muted-foreground bg-muted/60 hover:bg-muted rounded-md px-2 py-1 text-xs transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>

          <div className="text-muted-foreground text-[11px] leading-5">
            {footnote}
          </div>
        </div>
      </div>
    </article>
  );
}
