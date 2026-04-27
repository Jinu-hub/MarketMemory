import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
} from "lucide-react";
import { Link } from "react-router";

import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import { getCategoryStyle } from "../lib/category-style";
import {
  estimateReadingTime,
  formatRegion,
  resolveDisplayDate,
  resolveTakeaway,
} from "../lib/format";
import type { ReportListItem } from "../types";
import { ReportTierBadge } from "./report-tier-badge";

type FeaturedReportBlockProps = {
  report: ReportListItem;
  className?: string;
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
}: FeaturedReportBlockProps) {
  const takeaway = resolveTakeaway(report.summary, report.summary_meta);
  const date = resolveDisplayDate(report);
  const primaryRegion = report.regions?.[0];
  const readTime = estimateReadingTime(report.summary, takeaway);
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

      <div className="grid gap-0 lg:grid-cols-[1fr_260px]">
        <div className="space-y-5 px-6 pt-8 pb-6 md:px-10 md:pt-10">
          <div className="flex flex-wrap items-center gap-2">
            <NexBadge variant="secondary" size="sm">
              Featured
            </NexBadge>
            {report.category ? (
              <NexBadge variant={style.badgeVariant} size="sm">
                <CategoryIcon className="mr-1 size-3" />
                {style.label}
              </NexBadge>
            ) : null}
            <ReportTierBadge tier={report.report_tier} />
            <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
              <ClockIcon className="size-3" />
              {readTime} min read
            </span>
            {date ? (
              <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                <CalendarIcon className="size-3" />
                {date}
              </span>
            ) : null}
          </div>

          <h2 className="text-2xl leading-tight font-bold tracking-tight md:text-3xl lg:text-4xl">
            <Link
              to={`/item_reports/${report.id}`}
              viewTransition
              className="hover:text-primary transition-colors"
            >
              {report.title ?? "Untitled report"}
            </Link>
          </h2>

          {takeaway ? (
            <p className="text-muted-foreground max-w-2xl text-base leading-relaxed md:text-lg">
              {takeaway}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to={`/item_reports/${report.id}`}
              viewTransition
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              리포트 읽기
              <ArrowRightIcon className="size-4" />
            </Link>
            {topTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {topTags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/item_reports?tag=${encodeURIComponent(tag)}`}
                    className="text-muted-foreground bg-muted/60 hover:bg-muted rounded-md px-2 py-1 text-xs transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div
          className={cn(
            "border-border flex flex-col justify-between gap-4 border-t p-6 lg:border-t-0 lg:border-l",
            style.accentBg,
          )}
        >
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-muted-foreground mb-1 text-[11px] tracking-wider uppercase">
                카테고리
              </div>
              <div className="flex items-center gap-2">
                <CategoryIcon className={cn("size-4", style.accentText)} />
                <span className="font-medium">{style.label}</span>
              </div>
            </div>
            {primaryRegion ? (
              <div>
                <div className="text-muted-foreground mb-1 text-[11px] tracking-wider uppercase">
                  지역
                </div>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="text-muted-foreground size-4" />
                  <span className="font-medium">
                    {formatRegion(primaryRegion)}
                  </span>
                </div>
              </div>
            ) : null}
          </div>

          <div className="text-muted-foreground text-[11px] leading-5">
            이 리포트는 현재 공개된 가장 최근의 AI 리서치 콘텐츠입니다.
          </div>
        </div>
      </div>
    </article>
  );
}
