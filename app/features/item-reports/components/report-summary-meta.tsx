import {
  LightbulbIcon,
  MessageSquareTextIcon,
  SparklesIcon,
  TargetIcon,
} from "lucide-react";

import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import { useItemReportsLocale, useItemReportsUi } from "../i18n";
import { parseSummaryMeta } from "../lib/summary-meta";
import { getCategoryStyle } from "../lib/category-style";
import { TalkingPointsCarousel } from "./talking-points-carousel";

type ReportSummaryMetaProps = {
  value: unknown;
  category?: string | null;
  className?: string;
};

export function ReportSummaryMeta({
  value,
  category,
  className,
}: ReportSummaryMetaProps) {
  const ui = useItemReportsUi();
  const locale = useItemReportsLocale();
  const meta = parseSummaryMeta(value);
  if (!meta) return null;

  const hasHeadline = !!meta.headline_angle;
  const hasTakeaway = !!meta.one_line_takeaway;
  const hooks = Array.isArray(meta.hooks) ? meta.hooks.filter(Boolean) : [];
  const sns = meta.summary_sns_short;

  if (!hasHeadline && !hasTakeaway && hooks.length === 0 && !sns) {
    return null;
  }

  const style = getCategoryStyle(category, locale);

  return (
    <section
      aria-label={ui.summaryMeta.ariaLabel}
      className={cn(
        "bg-card border-border overflow-hidden rounded-xl border border-l-[3px]",
        style.accentBorder,
        className,
      )}
    >
      <div className="space-y-5 px-6 pt-6 pb-5 md:px-8 md:pt-8">
        <div className="flex items-center gap-2">
          <NexBadge variant={style.badgeVariant} size="sm">
            <SparklesIcon className="mr-1 size-3" />
            {ui.summaryMeta.editorialAngle}
          </NexBadge>
          {hasTakeaway && hasHeadline ? (
            <span className="text-muted-foreground text-[11px] tracking-wide uppercase">
              {ui.summaryMeta.insightBlock}
            </span>
          ) : null}
        </div>

        {hasHeadline ? (
          <h2 className="text-foreground text-xl leading-tight font-semibold tracking-tight md:text-2xl">
            {meta.headline_angle}
          </h2>
        ) : null}

        {hasTakeaway ? (
          <div className="flex gap-3">
            <TargetIcon
              className={cn("mt-1 size-4 shrink-0", style.accentText)}
            />
            <div className="min-w-0">
              <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-wider uppercase">
                {ui.summaryMeta.keyTakeaway}
              </p>
              <p className="text-foreground/90 text-base leading-[1.8] md:text-lg">
                {meta.one_line_takeaway}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {hooks.length > 0 ? (
        <div
          className={cn(
            "border-border border-t px-6 py-5 md:px-8",
            style.accentBg,
          )}
        >
          <div className="mb-4 flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
            <div className="flex items-center gap-2">
              <LightbulbIcon className={cn("size-4", style.accentText)} />
              <h3 className="text-foreground text-xs font-semibold tracking-wider uppercase">
                {ui.summaryMeta.talkingPoints}
              </h3>
            </div>
          </div>
          <TalkingPointsCarousel
            points={hooks}
            style={style}
            aria-label={ui.summaryMeta.talkingPointsAria}
          />
        </div>
      ) : null}

      {sns ? (
        <figure className="border-border bg-muted/20 border-t px-6 py-5 md:px-8">
          <div className="flex gap-3">
            <MessageSquareTextIcon
              className="text-muted-foreground mt-0.5 size-4 shrink-0 opacity-60"
              aria-hidden
            />
            <div className="min-w-0">
              <blockquote className="text-foreground/80 text-sm leading-7 italic md:text-base">
                {sns}
              </blockquote>
              <figcaption className="text-muted-foreground mt-2 text-[11px] tracking-wide uppercase not-italic">
                {ui.summaryMeta.editorialSummary}
              </figcaption>
            </div>
          </div>
        </figure>
      ) : null}
    </section>
  );
}
