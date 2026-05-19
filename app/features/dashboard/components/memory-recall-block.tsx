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
import { pickDashboardUi } from "../i18n";
import { MEMORY_RECALL_ACCENT } from "../lib/memory-recall-style";
import {
  DashboardBlockHeader,
  DashboardBlockShell,
} from "./dashboard-block-shell";
import { SectionLabel } from "./section-label";

type MemoryRecallBlockProps = {
  locale?: string;
  className?: string;
};

export function MemoryRecallBlock({
  locale,
  className,
}: MemoryRecallBlockProps) {
  const ui = pickDashboardUi(locale).memoryRecall;

  return (
    <DashboardBlockShell
      ariaLabelledBy="dashboard-memory-recall-heading"
      className={className}
    >
      <DashboardBlockHeader
        eyebrowIcon={BrainIcon}
        eyebrow={ui.eyebrow}
        title={ui.title}
        titleId="dashboard-memory-recall-heading"
        description={ui.description}
        trailing={
          <NexBadge variant="outline" size="sm">
            {ui.preview}
          </NexBadge>
        }
      />

      <div className="grid gap-0 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3 px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6">
          <SectionLabel
            icon={RotateCcwIcon}
            label={ui.similar.title}
            hint={ui.similar.hint}
          />
          <ul className="space-y-2 sm:space-y-2.5">
            {MOCK_SIMILAR_MEMORIES.map((item) => (
              <li key={item.id}>
                <RecallRow {...item} locale={locale} />
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
            label={ui.patterns.title}
            hint={ui.patterns.hint}
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
                    {pattern.occurrences}
                    {ui.patterns.occurrencesSuffix}
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
  locale,
}: (typeof MOCK_SIMILAR_MEMORIES)[number] & { locale?: string }) {
  const similar = pickDashboardUi(locale).memoryRecall.similar;

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
            {similar.similarity} {similarity}
            {similar.similaritySuffix}
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
