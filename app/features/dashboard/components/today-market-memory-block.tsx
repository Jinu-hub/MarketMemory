import {
  BrainCircuitIcon,
  CalendarIcon,
  FileTextIcon,
  HashIcon,
  SparklesIcon,
} from "lucide-react";

import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import {
  getMarketMoodDescription,
  getMarketMoodLabel,
  getMarketMoodStyle,
  getMarketMoodSubdescription,
} from "../lib/market-mood";
import {
  getTrendStatusLabel,
  getTrendStatusStyle,
} from "../lib/trend-status";
import type { DailyMarketMemorySnapshot, DailyMemoryTheme } from "../types";

type TodayMarketMemoryBlockProps = {
  memory: DailyMarketMemorySnapshot | null;
  /** User locale (e.g. 'ko' / 'en' / 'ja') — used to localize the mood label. */
  locale: string;
  className?: string;
};

/**
 * The hero / most-important block on the dashboard.
 *
 * Combines three sub-sections in a single content-layer container:
 *  1. 핵심 요약 (core_summary)         — short editorial digest
 *  2. 오늘의 주요 테마 3 (top_themes)    — directional theme cards
 *  3. 시장 분위기 (mood_type + summary) — AI-synthesized mood read
 *
 * Built on the Nex base layer (NexBadge) and follows the Content Layer
 * rules: directional accents, semantic icons, theme-aware tokens, no
 * hardcoded colors.
 */
export function TodayMarketMemoryBlock({
  memory,
  locale,
  className,
}: TodayMarketMemoryBlockProps) {
  if (!memory) {
    return <TodayMemoryEmptyState className={className} />;
  }

  const themes = (memory.top_themes ?? []).slice(0, 3);
  // Prefer the language-independent SSOT (`core_data.market_mood.type`); fall
  // back to the legacy denormalized column if `core_data` is missing.
  const moodSource =
    memory.core_data?.market_mood?.type ?? memory.market_mood_type ?? null;
  const moodStyle = getMarketMoodStyle(moodSource);
  const moodLabel = getMarketMoodLabel(moodStyle.key, locale);
  const moodDescription = getMarketMoodDescription(moodStyle.key, locale);
  const moodSubdescription = getMarketMoodSubdescription(moodStyle.key, locale);
  const MoodIcon = moodStyle.icon;
  const date = formatMarketDate(memory.market_date);

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
            Today&apos;s Market Memory
          </p>
          <h2
            id="today-market-memory-heading"
            className="text-xl leading-tight font-bold tracking-tight sm:text-2xl md:text-3xl"
          >
            {memory.display_title ?? "오늘의 시장 메모리"}
          </h2>
          {memory.display_subtitle ? (
            <p className="text-muted-foreground max-w-2xl text-xs sm:text-sm md:text-base">
              {memory.display_subtitle}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] sm:text-xs">
          {date ? (
            <span className="text-muted-foreground inline-flex items-center gap-1">
              <CalendarIcon className="size-3.5" aria-hidden />
              {date}
            </span>
          ) : null}
          {memory.source_report_count > 0 ? (
            <NexBadge variant="outline" size="sm">
              <FileTextIcon className="mr-1 size-3" aria-hidden />
              {memory.source_report_count}개 리포트
            </NexBadge>
          ) : null}
          {memory.status === "draft" ? (
            <NexBadge variant="warning" size="sm">
              Draft
            </NexBadge>
          ) : null}
        </div>
      </header>

      {/*
       * Two-row content layout (lg+):
       *
       *  ┌──────────────────────────┬───────────────────┐
       *  │ 1. 핵심 요약              │ 3. 시장 분위기     │   ← row 1
       *  ├──────────────────────────┴───────────────────┤
       *  │ 2. 오늘의 주요 테마 (풀폭 3-col 그리드)         │   ← row 2
       *  └──────────────────────────────────────────────┘
       *
       * DOM order intentionally follows the product spec (요약 → 테마 → 분위기)
       * so the mobile single-column stack reads in narrative order. On `lg+`
       * we use grid `order` utilities to lift mood up next to the summary
       * and push themes full-width below.
       */}
      <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
        {/* 1. 핵심 요약 — row 1 col 1 */}
        <section
          aria-labelledby="memory-summary-heading"
          className="space-y-3 px-5 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8"
        >
          <SectionLabel
            id="memory-summary-heading"
            icon={SparklesIcon}
            label="핵심 요약"
            hint="오늘 시장을 어떻게 봐야 하는지에 대한 해석"
          />
          {memory.core_summary ? (
            <ReadingProse>{memory.core_summary}</ReadingProse>
          ) : (
            <ReadingEmpty>핵심 요약이 아직 준비되지 않았습니다.</ReadingEmpty>
          )}
          {memory.top_tags && memory.top_tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {memory.top_tags.slice(0, 6).map((tag) => (
                <span
                  key={tag}
                  className="text-muted-foreground bg-muted/60 inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[11px]"
                >
                  <HashIcon className="size-2.5" aria-hidden />
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </section>

        {/* 2. 오늘의 주요 테마 — row 2 (full width on lg+) */}
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
            label="오늘의 주요 테마"
            hint="현재 시장에서 의미 있는 흐름 3가지"
          />
          {themes.length === 0 ? (
            <ReadingEmpty>오늘 추출된 주요 테마가 없습니다.</ReadingEmpty>
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {themes.map((theme, index) => (
                <li
                  key={resolveThemeKey(theme, index)}
                  className={cn(
                    // On `sm` (2-col) the 3rd card sits alone on its row —
                    // span it across both columns so it doesn't look orphaned.
                    index === 2 ? "sm:col-span-2 md:col-span-1" : null,
                  )}
                >
                  <ThemeCard theme={theme} index={index} locale={locale} />
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 3. 시장 분위기 — row 1 col 2 on lg+, stacks under themes on mobile
         *
         * The mood panel reads as a *companion* of the summary, not as a
         * louder peer. Color identity is restricted to:
         *  - a 3px accent border on the column edge (lg+) / left edge (mobile)
         *  - a small accent-tinted pill that names the mood
         * Everything else stays in the neutral content-layer tone so the
         * page's visual weight stays on the core summary + themes.
         */}
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
            label="시장 분위기"
            hint="지수·자산·테마·리스크를 종합한 AI 해석"
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
          <div className="space-y-2 sm:space-y-2.5">
            {moodStyle.key ? (
              <p className="text-muted-foreground text-[11px] leading-5 sm:text-xs md:text-sm md:leading-6">
                {moodSubdescription}
              </p>
            ) : null}
          </div>
          {memory.market_mood_summary ? (
            <ReadingProse>{memory.market_mood_summary}</ReadingProse>
          ) : (
            <ReadingEmpty>
              분위기 해석이 아직 준비되지 않았습니다.
            </ReadingEmpty>
          )}
        </aside>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 *  Sub-components
 * ──────────────────────────────────────────────────────────── */

function ThemeCard({
  theme,
  index,
  locale,
}: {
  theme: DailyMemoryTheme;
  index: number;
  locale: string;
}) {
  const title = theme.theme_title ?? theme.title ?? `Theme ${index + 1}`;
  const summary = theme.summary ?? null;
  const trend = getTrendStatusStyle(theme.trend_status);
  const trendLabel = getTrendStatusLabel(trend.key, locale);
  const TrendIcon = trend.icon;
  const tags = (theme.related_tags ?? []).slice(0, 3);
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
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-muted-foreground bg-muted/60 inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[11px]"
            >
              <HashIcon className="size-2.5" aria-hidden />
              {tag}
            </span>
          ))}
          {relatedCount != null ? (
            <span className="text-muted-foreground ml-auto inline-flex items-center gap-1 text-[11px]">
              <FileTextIcon className="size-3" aria-hidden />
              관련 {relatedCount}건
            </span>
          ) : null}
        </div>
      )}
    </article>
  );
}

function SectionLabel({
  id,
  icon: Icon,
  label,
  hint,
  trailing,
}: {
  id?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between gap-3">
        <h3
          id={id}
          className="text-foreground inline-flex min-w-0 items-center gap-1.5 text-sm font-semibold tracking-tight"
        >
          <Icon className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
          {label}
        </h3>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
      {hint ? (
        <p className="text-muted-foreground text-xs">{hint}</p>
      ) : null}
    </div>
  );
}

function ReadingProse({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-foreground max-w-prose whitespace-pre-line",
        "text-sm leading-6 sm:text-[15px] sm:leading-7",
        className,
      )}
    >
      {children}
    </p>
  );
}

function ReadingEmpty({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-border text-muted-foreground rounded-lg border border-dashed px-3 py-2 text-sm">
      {children}
    </p>
  );
}

function TodayMemoryEmptyState({ className }: { className?: string }) {
  return (
    <section
      aria-label="오늘의 시장 메모리"
      className={cn(
        "border-border bg-card flex flex-col gap-3 rounded-2xl border px-5 py-8 text-center sm:px-6 sm:py-10",
        className,
      )}
    >
      <p className="text-primary inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase sm:text-xs">
        <BrainCircuitIcon className="size-3.5" aria-hidden />
        Today&apos;s Market Memory
      </p>
      <h2 className="text-lg font-semibold tracking-tight sm:text-xl md:text-2xl">
        오늘의 시장 메모리가 아직 준비되지 않았습니다
      </h2>
      <p className="text-muted-foreground mx-auto max-w-md text-xs sm:text-sm">
        AI 파이프라인이 오늘 데이터를 생성하면 핵심 요약, 주요 테마, 시장 분위기가
        이 영역에 표시됩니다.
      </p>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
 *  Helpers
 * ──────────────────────────────────────────────────────────── */

function formatMarketDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

function resolveRelatedCount(
  related: DailyMemoryTheme["related_reports"],
): number | null {
  if (typeof related === "number" && Number.isFinite(related)) {
    return related;
  }
  if (Array.isArray(related)) return related.length;
  return null;
}

function resolveThemeKey(theme: DailyMemoryTheme, index: number): string {
  return theme.theme_title ?? theme.title ?? `theme-${index}`;
}
