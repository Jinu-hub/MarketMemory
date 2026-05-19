import {
  ArrowUpRightIcon,
  BrainIcon,
  RepeatIcon,
  RotateCcwIcon,
} from "lucide-react";

import { NexBadge } from "~/core/components/nex";
import { ContentTagList } from "~/core/components/content/content-tag-list";
import { cn } from "~/core/lib/utils";

import {
  MOCK_RECALL_PATTERNS,
  MOCK_SIMILAR_MEMORIES,
} from "../fixtures/memory-recall";
import { MEMORY_RECALL_ACCENT } from "../lib/memory-recall-style";
import {
  DashboardBlockHeader,
  DashboardBlockShell,
} from "./dashboard-block-shell";
import { SectionLabel } from "./section-label";

type MemoryRecallBlockProps = {
  className?: string;
};

export function MemoryRecallBlock({ className }: MemoryRecallBlockProps) {
  return (
    <DashboardBlockShell
      ariaLabelledBy="dashboard-memory-recall-heading"
      className={className}
    >
      <DashboardBlockHeader
        eyebrowIcon={BrainIcon}
        eyebrow="Memory Recall"
        title="현재 이슈와 닮은 과거의 기억"
        titleId="dashboard-memory-recall-heading"
        description="오늘 시장 메모리와 유사한 과거 리포트, 그리고 반복되는 시장 패턴을 보여줍니다."
        trailing={
          <NexBadge variant="outline" size="sm">
            Preview
          </NexBadge>
        }
      />

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
            {MOCK_RECALL_PATTERNS.map((pattern) => (
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
    </DashboardBlockShell>
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
        "bg-background border-border hover:border-primary/30 group flex items-center gap-3 rounded-lg border border-l-[3px] p-2.5 transition-colors sm:p-3",
        MEMORY_RECALL_ACCENT.accentBorder,
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
        <ContentTagList tags={[...tags]} max={6} />
      </div>
      <ArrowUpRightIcon
        className="text-muted-foreground size-4 shrink-0 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
        aria-hidden
      />
    </article>
  );
}
