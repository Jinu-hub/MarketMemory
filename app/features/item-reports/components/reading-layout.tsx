import { QuoteIcon, ShareIcon, ZapIcon } from "lucide-react";

import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import { getCategoryStyle } from "../lib/category-style";
import { estimateReadingTime, formatDate } from "../lib/format";
import type { ReportDetail } from "../types";

/**
 * Long-form reading layout for the detail screen.
 *
 * Wraps the existing `<article>` content and introduces reading-first
 * patterns from the showcase `ReadingLayoutDemo`:
 *   - strong typographic hero (category badge, title, read-time)
 *   - generous measure for body content (handled by `<ReadingBody>` wrapper)
 *
 * The component itself only renders a header + optional footer; body content
 * is rendered as children so the detail screen can compose its own mix of
 * `ReportSummaryMeta`, `ReportMarkdown`, highlight boxes, etc.
 */
type ReadingHeaderProps = {
  report: ReportDetail;
  className?: string;
};

export function ReadingHeader({ report, className }: ReadingHeaderProps) {
  const style = getCategoryStyle(report.category);
  const CategoryIcon = style.icon;
  const date = formatDate(report.input_date ?? report.created_at);
  const readTime = estimateReadingTime(
    report.summary,
    report.content,
    report.content_sns,
  );

  return (
    <header className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {report.category ? (
          <NexBadge variant={style.badgeVariant} size="sm">
            <CategoryIcon className="mr-1 size-3" />
            {style.label}
          </NexBadge>
        ) : null}
        {report.report_type ? (
          <NexBadge variant="outline" size="sm">
            {report.report_type.replace(/-report$/u, "")}
          </NexBadge>
        ) : null}
        <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
          <span aria-hidden>·</span>
          {readTime} min read
        </span>
        {date ? (
          <span className="text-muted-foreground text-xs">· {date}</span>
        ) : null}
      </div>
      <h1 className="text-3xl leading-tight font-bold tracking-tight md:text-4xl lg:text-5xl">
        {report.title ?? "Untitled report"}
      </h1>
    </header>
  );
}

/**
 * Decorative pull-quote block, adapted from the showcase ReadingLayoutDemo.
 * Pass a category to tint the left accent.
 */
type ReadingPullQuoteProps = {
  children: React.ReactNode;
  cite?: React.ReactNode;
  category?: string | null;
  className?: string;
};

export function ReadingPullQuote({
  children,
  cite,
  category,
  className,
}: ReadingPullQuoteProps) {
  const style = getCategoryStyle(category);
  return (
    <blockquote
      className={cn(
        "relative my-8 border-l-[3px] py-4 pl-6",
        style.accentBorder,
        className,
      )}
    >
      <QuoteIcon
        aria-hidden
        className={cn(
          "absolute -top-2 -left-3 size-6 opacity-25",
          style.accentText,
        )}
      />
      <p className="text-foreground/90 text-lg leading-relaxed font-medium italic">
        {children}
      </p>
      {cite ? (
        <cite className="text-muted-foreground mt-3 block text-sm not-italic">
          {cite}
        </cite>
      ) : null}
    </blockquote>
  );
}

/**
 * Inline highlight box matching the showcase "Key Metric" pattern. Use to
 * surface an important fact or metric inside the reading flow.
 */
type ReadingHighlightBoxProps = {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  category?: string | null;
  className?: string;
};

export function ReadingHighlightBox({
  title,
  children,
  icon,
  category,
  className,
}: ReadingHighlightBoxProps) {
  const style = getCategoryStyle(category);
  const resolvedIcon = icon ?? (
    <ZapIcon className={cn("size-5 shrink-0", style.accentText)} />
  );
  return (
    <aside
      className={cn(
        "border-border my-8 flex items-start gap-3 rounded-lg border p-5",
        style.accentBg,
        className,
      )}
    >
      <span aria-hidden className="mt-0.5">
        {resolvedIcon}
      </span>
      <div className="min-w-0">
        <p className="text-foreground mb-1 text-sm font-semibold">{title}</p>
        <div className="text-muted-foreground text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </aside>
  );
}

/**
 * Footer block that renders a report's SNS / share-ready summary as an
 * editorial pull-out, matching the showcase "Related Insight" pattern.
 */
type ShareSummaryBlockProps = {
  children?: string | null;
  category?: string | null;
  className?: string;
};

export function ShareSummaryBlock({
  children,
  category,
  className,
}: ShareSummaryBlockProps) {
  if (!children) return null;
  const style = getCategoryStyle(category);
  return (
    <section
      aria-label="SNS 공유용 요약"
      className={cn(
        "my-8 flex items-start gap-3 rounded-lg border border-l-[3px] p-5",
        "border-border",
        style.accentBorder,
        style.accentBg,
        className,
      )}
    >
      <ShareIcon className={cn("mt-0.5 size-4 shrink-0", style.accentText)} />
      <div className="min-w-0 space-y-1">
        <p className="text-foreground text-sm font-semibold">공유용 요약</p>
        <p className="text-foreground/85 text-sm leading-7 whitespace-pre-line">
          {children}
        </p>
      </div>
    </section>
  );
}
