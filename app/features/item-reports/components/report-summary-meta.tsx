import {
  LightbulbIcon,
  QuoteIcon,
  SparklesIcon,
  TargetIcon,
} from "lucide-react";

import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import { parseSummaryMeta } from "../lib/format";
import { getCategoryStyle } from "../lib/category-style";

type ReportSummaryMetaProps = {
  value: unknown;
  category?: string | null;
  className?: string;
};

/**
 * Editorial insight block rendered near the top of a report.
 *
 * Structure inspired by the `DataInsightBlock` showcase pattern:
 *   1. Badge + headline_angle (the angle the author wants to emphasize)
 *   2. Key takeaway highlight (with Target icon) — the "conclusion"
 *   3. Hooks list (numbered, dense) — the "key points"
 *   4. Pull-quote for summary_sns_short — the "editorial note"
 *
 * Returns null if `summary_meta` has no usable content so the detail page
 * doesn't show an empty scaffold.
 */
export function ReportSummaryMeta({
  value,
  category,
  className,
}: ReportSummaryMetaProps) {
  const meta = parseSummaryMeta(value);
  if (!meta) return null;

  const hasHeadline = !!meta.headline_angle;
  const hasTakeaway = !!meta.one_line_takeaway;
  const hooks = Array.isArray(meta.hooks) ? meta.hooks.filter(Boolean) : [];
  const sns = meta.summary_sns_short;

  if (!hasHeadline && !hasTakeaway && hooks.length === 0 && !sns) {
    return null;
  }

  const style = getCategoryStyle(category);

  return (
    <section
      aria-label="핵심 인사이트"
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
            Editorial Angle
          </NexBadge>
          {hasTakeaway && hasHeadline ? (
            <span className="text-muted-foreground text-[11px] tracking-wide uppercase">
              Insight Block
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
                Key Takeaway
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
          <div className="mb-3 flex items-center gap-2">
            <LightbulbIcon className={cn("size-4", style.accentText)} />
            <h3 className="text-foreground text-xs font-semibold tracking-wider uppercase">
              Hooks
            </h3>
          </div>
          <ol className="space-y-2.5">
            {hooks.map((hook, idx) => (
              <li
                key={`${idx}-${hook.slice(0, 12)}`}
                className="flex gap-3 text-sm leading-7 md:text-base"
              >
                <span
                  className={cn(
                    "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-semibold",
                    "bg-background border-border border",
                    style.accentText,
                  )}
                >
                  {idx + 1}
                </span>
                <span className="text-foreground/90">{hook}</span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {sns ? (
        <figure className="border-border bg-muted/20 relative border-t px-6 py-5 md:px-8">
          <QuoteIcon className="text-muted-foreground absolute top-3 left-4 size-5 opacity-20" />
          <blockquote className="text-foreground/80 relative pl-6 text-sm leading-7 italic md:text-base">
            {sns}
          </blockquote>
          <figcaption className="text-muted-foreground mt-2 pl-6 text-[11px] tracking-wide uppercase not-italic">
            — SNS / Editorial summary
          </figcaption>
        </figure>
      ) : null}
    </section>
  );
}
