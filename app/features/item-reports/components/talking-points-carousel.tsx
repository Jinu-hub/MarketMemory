import { useCallback, useState, type KeyboardEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { NexButton } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import type { CategoryStyle } from "../lib/category-style";

type TalkingPointsCarouselProps = {
  points: string[];
  style: CategoryStyle;
  /** Accessible label, e.g. "이 리포트의 주목 포인트" */
  "aria-label"?: string;
  className?: string;
};

/**
 * One talking point per "slide" with editorial pull-quote treatment.
 * Navigation sits *below* the card so chevrons never overlap text (NexCarousel
 * hovers absolute arrows on the track, which collides with content + peeks).
 */
export function TalkingPointsCarousel({
  points,
  style,
  "aria-label": ariaLabel = "이 리포트의 주목 포인트",
  className,
}: TalkingPointsCarouselProps) {
  const n = points.length;
  const [index, setIndex] = useState(0);
  const canPrev = index > 0;
  const canNext = index < n - 1;

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(n - 1, i + 1));
  }, [n]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && canPrev) {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight" && canNext) {
        e.preventDefault();
        goNext();
      }
    },
    [canPrev, canNext, goPrev, goNext],
  );

  if (n === 0) return null;

  return (
    <div
      className={cn("w-full", className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={`${ariaLabel} · 총 ${n}개, 방향 키로 이동할 수 있음.`}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className="border-border bg-card/85 ring-border/40 relative w-full overflow-hidden rounded-xl border shadow-sm ring-1 backdrop-blur-sm">
        <div
          className="flex transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{
            width: `${n * 100}%`,
            transform: `translateX(-${(index * 100) / n}%)`,
          }}
        >
          {points.map((point, i) => (
            <div
              key={`tp-${i}-${point.slice(0, 16)}`}
              className="min-w-0 px-0"
              style={{ width: `${100 / n}%` }}
              aria-hidden={i !== index}
            >
              <article
                className="flex flex-col gap-3 p-5 md:p-6"
                aria-current={i === index ? "true" : undefined}
              >
                <header className="flex items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex size-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold",
                      "bg-background border-border border",
                      style.accentText,
                    )}
                  >
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground text-[11px] tracking-wider uppercase">
                    {i + 1} / {n}
                  </span>
                </header>
                {/* No `"` icon here — the bottom SNS block already carries the
                    pull-quote motif. Talking points = category accent + bar
                    only, so the two blocks don't repeat the same glyph. */}
                <div
                  className={cn(
                    "min-w-0 border-l-2 border-current pl-4",
                    style.accentText,
                  )}
                >
                  <p className="text-foreground/95 font-serif text-base leading-8 font-medium md:text-lg md:leading-9">
                    {point}
                  </p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      {/* Dots + prev/next: below the card so nothing overlaps the quote */}
      {n > 1 ? (
        <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div
            className="flex flex-1 items-center justify-center gap-1.5 sm:justify-start"
            role="group"
            aria-label="슬라이드 위치"
          >
            {points.map((_, i) => (
              <button
                key={`dot-${i}`}
                type="button"
                aria-pressed={i === index}
                aria-label={`${i + 1}번째 포인트로 이동`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none",
                  i === index
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/35 hover:bg-muted-foreground/55 w-1.5",
                )}
                onClick={() => {
                  setIndex(i);
                }}
              />
            ))}
          </div>
          <div className="flex items-center justify-center gap-1 sm:justify-end">
            <NexButton
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canPrev}
              aria-label="이전 포인트"
              className="shrink-0"
              leftIcon={<ChevronLeft className="size-4" aria-hidden />}
              onClick={goPrev}
            >
              이전
            </NexButton>
            <span className="text-muted-foreground px-1 text-xs tabular-nums sm:hidden">
              {index + 1} / {n}
            </span>
            <NexButton
              type="button"
              variant="ghost"
              size="sm"
              disabled={!canNext}
              aria-label="다음 포인트"
              className="shrink-0"
              rightIcon={<ChevronRight className="size-4" aria-hidden />}
              onClick={goNext}
            >
              다음
            </NexButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
