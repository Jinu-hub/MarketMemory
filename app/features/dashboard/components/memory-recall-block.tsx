import {
  ArrowUpRightIcon,
  BrainIcon,
  HashIcon,
  RepeatIcon,
  RotateCcwIcon,
} from "lucide-react";

import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

type MemoryRecallBlockProps = {
  className?: string;
};

/**
 * Memory Recall — surfaces past daily memories that resonate with today's
 * issues, and repeating market patterns.
 *
 * Wired to mock data for now; will switch to
 * `daily_market_memory_similarity_edges` when the recall pipeline is live.
 */
export function MemoryRecallBlock({ className }: MemoryRecallBlockProps) {
  return (
    <section
      aria-labelledby="dashboard-memory-recall-heading"
      className={cn(
        "border-border bg-card overflow-hidden rounded-2xl border",
        className,
      )}
    >
      <header className="border-border flex flex-wrap items-center justify-between gap-3 border-b bg-card/50 px-4 py-3.5 sm:px-5 sm:py-4 md:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-primary inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase sm:text-xs">
            <BrainIcon className="size-3.5" aria-hidden />
            Memory Recall
          </p>
          <h2
            id="dashboard-memory-recall-heading"
            className="mt-0.5 text-sm font-semibold tracking-tight sm:text-base md:text-lg"
          >
            현재 이슈와 닮은 과거의 기억
          </h2>
          <p className="text-muted-foreground mt-0.5 max-w-xl text-[11px] sm:text-xs md:text-sm">
            오늘 시장 메모리와 유사한 과거 리포트, 그리고 반복되는 시장 패턴을 보여줍니다.
          </p>
        </div>
        <NexBadge variant="outline" size="sm" className="shrink-0">
          Preview
        </NexBadge>
      </header>

      <div className="grid gap-0 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3 px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6">
          <SectionLabel
            icon={RotateCcwIcon}
            label="유사한 과거 메모리"
            hint="태그·테마·분위기가 함께 겹쳤던 날들"
          />
          <ul className="space-y-2 sm:space-y-2.5">
            {MOCK_SIMILAR_MEMORIES.map((item) => (
              <li key={item.id}>
                <RecallRow {...item} />
              </li>
            ))}
          </ul>
        </div>

        <aside
          className={cn(
            "border-border bg-muted/20 space-y-3 border-t px-4 py-4 sm:px-5 sm:py-5 md:border-t-0 md:border-l md:px-6 md:py-6",
          )}
        >
          <SectionLabel
            icon={RepeatIcon}
            label="반복되는 시장 패턴"
            hint="비슷한 흐름이 반복되었던 패턴 신호"
          />
          <ul className="space-y-2">
            {MOCK_PATTERNS.map((pattern) => (
              <li
                key={pattern.id}
                className="bg-background border-border rounded-lg border p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="text-foreground min-w-0 flex-1 text-sm font-medium">
                    {pattern.title}
                  </span>
                  <NexBadge variant="secondary" size="sm" className="shrink-0">
                    {pattern.occurrences}회
                  </NexBadge>
                </div>
                <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-5">
                  {pattern.summary}
                </p>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}

function RecallRow({
  date,
  title,
  similarity,
  tags,
}: (typeof MOCK_SIMILAR_MEMORIES)[number]) {
  return (
    <article
      className={cn(
        "bg-background border-border hover:border-primary/30 group flex items-center gap-3 rounded-lg border border-l-[3px] border-l-indigo-500 p-2.5 transition-colors sm:p-3",
        "dark:border-l-indigo-400",
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <time className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase sm:text-[11px]">
            {date}
          </time>
          <NexBadge variant="secondary" size="sm">
            유사도 {similarity}%
          </NexBadge>
        </div>
        <h3 className="group-hover:text-primary line-clamp-2 text-sm font-semibold transition-colors sm:line-clamp-1">
          {title}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-muted-foreground bg-muted/60 inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[11px]"
            >
              <HashIcon className="size-2.5" aria-hidden />
              {tag}
            </span>
          ))}
        </div>
      </div>
      <ArrowUpRightIcon
        className="text-muted-foreground size-4 shrink-0 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
        aria-hidden
      />
    </article>
  );
}

function SectionLabel({
  icon: Icon,
  label,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
}) {
  return (
    <div className="space-y-0.5">
      <h3 className="text-foreground inline-flex items-center gap-1.5 text-sm font-semibold tracking-tight">
        <Icon className="text-muted-foreground size-3.5" aria-hidden />
        {label}
      </h3>
      {hint ? <p className="text-muted-foreground text-xs">{hint}</p> : null}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
 *  Mock data — will be replaced by similarity-edges query later
 * ──────────────────────────────────────────────────────────── */

const MOCK_SIMILAR_MEMORIES = [
  {
    id: "m1",
    date: "2024-04-12",
    title: "연준 동결 + 고용 강세 → 인플레 재점화 우려",
    similarity: 87,
    tags: ["연준", "인플레이션", "고용"],
  },
  {
    id: "m2",
    date: "2023-10-23",
    title: "에너지 가격 급등기 — 방어주·금 동반 강세",
    similarity: 76,
    tags: ["원유", "금", "방어주"],
  },
  {
    id: "m3",
    date: "2023-08-09",
    title: "AI 인프라 모멘텀 확장 (전력·반도체 동조)",
    similarity: 71,
    tags: ["AI", "데이터센터", "반도체"],
  },
] as const;

const MOCK_PATTERNS = [
  {
    id: "p1",
    title: "동결 → 단기 안도 → 데이터 재점화",
    occurrences: 4,
    summary:
      "연준 동결 직후 단기 랠리 후 강한 고용·에너지 데이터로 인플레 우려가 재점화되는 흐름.",
  },
  {
    id: "p2",
    title: "AI 캐펙스 확장 → 인프라 동조 상승",
    occurrences: 6,
    summary:
      "AI 데이터센터 수요 확장 시 전력·변압기·냉각 등 인프라 공급망이 함께 재평가되는 패턴.",
  },
] as const;
