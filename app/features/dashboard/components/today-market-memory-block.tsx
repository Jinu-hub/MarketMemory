import { BrainCircuitIcon, FileTextIcon, SparklesIcon } from "lucide-react";

import { NexBadge } from "~/core/components/nex";
import { ContentTagList } from "~/core/components/content/content-tag-list";
import { cn } from "~/core/lib/utils";

import { pickDashboardUi } from "../i18n";
import {
  getMarketMoodLabel,
  getMarketMoodStyle,
  getMarketMoodSubdescription,
} from "../lib/market-mood";
import {
  resolveRelatedCount,
  resolveThemeKey,
  resolveThemeTitle,
} from "../lib/pipeline-fields";
import {
  getTrendStatusLabel,
  getTrendStatusStyle,
} from "../lib/trend-status";
import type { DailyMarketMemorySnapshot, DailyMemoryTheme } from "../types";
import { ReadingEmpty, ReadingProse } from "./reading-prose";
import { SectionLabel } from "./section-label";

type TodayMarketMemoryBlockProps = {
  memory: DailyMarketMemorySnapshot | null;
  locale: string;
  className?: string;
};

export function TodayMarketMemoryBlock({
  memory,
  locale,
  className,
}: TodayMarketMemoryBlockProps) {
  const ui = pickDashboardUi(locale);

  if (!memory) {
    return <TodayMemoryEmptyState locale={locale} className={className} />;
  }

  const themes = (memory.top_themes ?? []).slice(0, 3);
  const moodSource =
    memory.core_data?.market_mood?.type ?? memory.market_mood_type ?? null;
  const moodStyle = getMarketMoodStyle(moodSource);
  const moodLabel = getMarketMoodLabel(moodStyle.key, locale);
  const moodSubdescription = getMarketMoodSubdescription(moodStyle.key, locale);
  const MoodIcon = moodStyle.icon;
  const t = ui.todayMemory;

  return (
    <section
      aria-labelledby="today-market-memory-heading"
      className={cn(
        "border-border bg-card overflow-hidden rounded-2xl border",
        className,
      )}
    >
      <header className="border-border flex flex-col gap-3 border-b bg-card/50 px-5 py-4 sm:px-6 sm:py-5 md:flex-row md:flex-wrap md:items-end md:justify-between md:gap-4 md:px-8">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-primary inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase sm:text-xs">
            <BrainCircuitIcon className="size-3.5" aria-hidden />
            {t.eyebrow}
          </p>
          <h2
            id="today-market-memory-heading"
            className="text-xl leading-tight font-bold tracking-tight sm:text-2xl md:text-3xl"
          >
            {memory.display_title ?? t.defaultTitle}
          </h2>
          {memory.display_subtitle ? (
            <p className="text-muted-foreground max-w-2xl text-xs sm:text-sm md:text-base">
              {memory.display_subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] sm:text-xs">
          {memory.source_report_count > 0 ? (
            <NexBadge variant="outline" size="sm">
              <FileTextIcon className="mr-1 size-3" aria-hidden />
              {memory.source_report_count}
              {t.reportCount}
            </NexBadge>
          ) : null}
          {memory.status === "draft" ? (
            <NexBadge variant="warning" size="sm">
              {t.draft}
            </NexBadge>
          ) : null}
        </div>
      </header>

      <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
        <section
          aria-labelledby="memory-summary-heading"
          className="space-y-3 px-5 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8"
        >
          <SectionLabel
            id="memory-summary-heading"
            icon={SparklesIcon}
            label={t.sections.summary.title}
            hint={t.sections.summary.hint}
          />
          {memory.core_summary ? (
            <ReadingProse>{memory.core_summary}</ReadingProse>
          ) : (
            <ReadingEmpty>{t.empty.coreSummary}</ReadingEmpty>
          )}
          {memory.top_tags && memory.top_tags.length > 0 ? (
            <ContentTagList
              tags={memory.top_tags}
              max={6}
              className="pt-1"
            />
          ) : null}
        </section>

        <section
          aria-labelledby="memory-themes-heading"
          className={cn(
            "border-border space-y-3 border-t px-5 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8",
            "lg:order-3 lg:col-span-2",
          )}
        >
          <SectionLabel
            id="memory-themes-heading"
            icon={BrainCircuitIcon}
            label={t.sections.themes.title}
            hint={t.sections.themes.hint}
          />
          {themes.length === 0 ? (
            <ReadingEmpty>{t.empty.themes}</ReadingEmpty>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {themes.map((theme, index) => (
                <li
                  key={resolveThemeKey(theme, index)}
                  className={cn(
                    index === 2 ? "sm:col-span-2 md:col-span-1" : null,
                  )}
                >
                  <ThemeCard theme={theme} index={index} locale={locale} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside
          aria-labelledby="memory-mood-heading"
          className={cn(
            "border-border flex flex-col gap-3.5 border-t px-5 py-5 sm:gap-4 sm:px-6 sm:py-6 md:px-8 md:py-8",
            "lg:order-2 lg:border-t-0 lg:border-l",
            "border-l-[3px]",
            moodStyle.accentBorder,
          )}
        >
          <SectionLabel
            id="memory-mood-heading"
            icon={MoodIcon}
            label={t.sections.mood.title}
            hint={t.sections.mood.hint}
            trailing={
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold sm:text-sm",
                  "border-border",
                  moodStyle.accentBg,
                  moodStyle.accentText,
                )}
              >
                {moodLabel}
              </span>
            }
          />
          {moodStyle.key ? (
            <p className="text-muted-foreground text-[11px] leading-5 sm:text-xs md:text-sm md:leading-6">
              {moodSubdescription}
            </p>
          ) : null}
          {memory.market_mood_summary ? (
            <ReadingProse>{memory.market_mood_summary}</ReadingProse>
          ) : (
            <ReadingEmpty>{t.empty.mood}</ReadingEmpty>
          )}
        </aside>
      </div>
    </section>
  );
}

function ThemeCard({
  theme,
  index,
  locale,
}: {
  theme: DailyMemoryTheme;
  index: number;
  locale: string;
}) {
  const t = pickDashboardUi(locale).todayMemory;
  const title = resolveThemeTitle(theme, index);
  const summary = theme.summary ?? null;
  const trend = getTrendStatusStyle(theme.trend_status);
  const trendLabel = getTrendStatusLabel(trend.key, locale);
  const TrendIcon = trend.icon;
  const tags = theme.related_tags ?? [];
  const relatedCount = resolveRelatedCount(theme.related_reports);

  return (
    <article
      className={cn(
        "bg-background border-border h-full rounded-xl border border-l-[3px] p-3.5 sm:p-4",
        "flex flex-col gap-2 sm:gap-2.5",
        trend.accentBorder,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-[11px] font-semibold tracking-wider tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <NexBadge variant={trend.badgeVariant} size="sm" className="shrink-0">
          <TrendIcon className="mr-1 size-3" aria-hidden />
          {trendLabel}
        </NexBadge>
      </div>
      <h3 className="text-sm leading-snug font-semibold tracking-tight sm:text-base">
        {title}
      </h3>
      {summary ? (
        <p className="text-muted-foreground text-xs leading-5 sm:text-sm sm:leading-6">
          {summary}
        </p>
      ) : null}
      {(tags.length > 0 || relatedCount != null) && (
        <div className="border-border/60 mt-auto flex flex-wrap items-center gap-1.5 border-t pt-2.5">
          <ContentTagList tags={tags} max={3} />
          {relatedCount != null ? (
            <span className="text-muted-foreground ml-auto inline-flex items-center gap-1 text-[11px]">
              <FileTextIcon className="size-3" aria-hidden />
              {t.relatedReports} {relatedCount}
              {t.relatedReportsSuffix}
            </span>
          ) : null}
        </div>
      )}
    </article>
  );
}

function TodayMemoryEmptyState({
  locale,
  className,
}: {
  locale: string;
  className?: string;
}) {
  const t = pickDashboardUi(locale).todayMemory;

  return (
    <section
      aria-label={t.defaultTitle}
      className={cn(
        "border-border bg-card flex flex-col gap-3 rounded-2xl border px-5 py-8 text-center sm:px-6 sm:py-10",
        className,
      )}
    >
      <p className="text-primary inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase sm:text-xs">
        <BrainCircuitIcon className="size-3.5" aria-hidden />
        {t.eyebrow}
      </p>
      <h2 className="text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
        {t.emptyTitle}
      </h2>
      <p className="text-muted-foreground mx-auto max-w-md text-xs sm:text-sm">
        {t.emptyDescription}
      </p>
    </section>
  );
}
