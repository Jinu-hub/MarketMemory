import { useMemo, useState } from "react";
import {
  ChevronRightIcon,
  NotebookPenIcon,
  SparklesIcon,
} from "lucide-react";

import { useIsMobile } from "~/core/hooks/use-mobile";
import { cn } from "~/core/lib/utils";
import { ContentEmptyState } from "~/core/components/content/content-empty-state";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/core/components/ui/sheet";

import type { MarketSummaryPost } from "../queries";
import { pickDashboardUi } from "../i18n";

type SummarySheetProps = {
  post: MarketSummaryPost | null;
  marketDate: string;
  locale: string;
  className?: string;
};

/** A parsed content block: a lead paragraph, a numbered point, memo callout, or plain text. */
type SummaryBlock =
  | { kind: "lead"; text: string }
  | { kind: "point"; index: string; text: string }
  | { kind: "memo"; label: string; text: string }
  | { kind: "text"; text: string };

const NUMBERED_POINT = /^(\d+)\s*[/.)]\s*([\s\S]*)$/;

/** Straight and typographic apostrophes (AI output often uses U+2019). */
function normalizeMemoText(text: string): string {
  return text.replace(/[\u2018\u2019\u201B`´]/g, "'");
}

const MEMO_LABEL_PATTERN =
  "(?:Today's\\s+market\\s+memo|오늘의\\s+시장\\s+메모|今日のマーケットメモ)";

const MARKET_MEMO_HEADER = new RegExp(
  `^(${MEMO_LABEL_PATTERN}[:：])\\s*`,
  "i",
);

const MARKET_MEMO_LABEL_ONLY = new RegExp(
  `^${MEMO_LABEL_PATTERN}[:：]?\\s*$`,
  "i",
);

const MARKET_MEMO_SUFFIX = new RegExp(
  `(${MEMO_LABEL_PATTERN}[:：])\\s*([\\s\\S]+)$`,
  "i",
);

function parseMemoBlock(text: string): { label: string; body: string } | null {
  const trimmed = normalizeMemoText(text.trim());
  const match = trimmed.match(MARKET_MEMO_HEADER);
  if (!match) return null;

  const body = trimmed.slice(match[0].length).trim();
  if (!body) return null;

  return { label: match[1], body };
}

function extractTrailingMemo(
  text: string,
): { prefix: string; label: string; body: string } | null {
  const trimmed = normalizeMemoText(text.trim());
  const match = trimmed.match(MARKET_MEMO_SUFFIX);
  if (!match) return null;

  const body = match[2].trim();
  if (!body) return null;

  const prefix = trimmed.slice(0, match.index).trim();
  return { prefix, label: match[1], body };
}

function expandEmbeddedMemos(blocks: SummaryBlock[]): SummaryBlock[] {
  const expanded: SummaryBlock[] = [];

  for (const block of blocks) {
    if (block.kind === "memo" || block.kind === "point") {
      expanded.push(block);
      continue;
    }

    const extracted = extractTrailingMemo(block.text);
    if (!extracted) {
      expanded.push(block);
      continue;
    }

    if (extracted.prefix) {
      expanded.push(
        block.kind === "lead"
          ? { kind: "lead", text: extracted.prefix }
          : { kind: "text", text: extracted.prefix },
      );
    }

    expanded.push({
      kind: "memo",
      label: extracted.label,
      text: extracted.body,
    });
  }

  return expanded;
}

function mergeSplitMemoBlocks(blocks: SummaryBlock[]): SummaryBlock[] {
  const merged: SummaryBlock[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const next = blocks[i + 1];

    if (
      (block.kind === "text" || block.kind === "lead") &&
      MARKET_MEMO_LABEL_ONLY.test(normalizeMemoText(block.text.trim())) &&
      next?.kind === "text"
    ) {
      const normalized = normalizeMemoText(block.text.trim());
      const label = normalized.replace(/[:：]?\s*$/, "");
      merged.push({
        kind: "memo",
        label: `${label}${normalized.includes("：") ? "：" : ":"}`,
        text: next.text,
      });
      i += 1;
      continue;
    }

    merged.push(block);
  }

  return merged;
}

function parseSummaryBlocks(content: string): SummaryBlock[] {
  const raw = content.trim();
  if (!raw) return [];

  // Prefer blank-line separated paragraphs; fall back to single newlines when
  // the post has no double breaks so we never collapse into one wall of text.
  const parts = (raw.includes("\n\n") ? raw.split(/\n{2,}/) : raw.split(/\n+/))
    .map((part) => part.trim())
    .filter(Boolean);

  return expandEmbeddedMemos(
    mergeSplitMemoBlocks(
      parts.map((part, i) => {
        const memo = parseMemoBlock(part);
        if (memo) {
          return { kind: "memo", label: memo.label, text: memo.body };
        }

        const numbered = part.match(NUMBERED_POINT);
        if (numbered) {
          return {
            kind: "point",
            index: numbered[1].padStart(2, "0"),
            text: numbered[2].trim(),
          };
        }
        if (i === 0) return { kind: "lead", text: part };
        return { kind: "text", text: part };
      }),
    ),
  );
}

export function SummarySheet({
  post,
  marketDate,
  locale,
  className,
}: SummarySheetProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const t = pickDashboardUi(locale).todayMemory;
  const labels = t.summaryPost;

  const blocks = useMemo(
    () => parseSummaryBlocks(post?.content ?? ""),
    [post?.content],
  );

  if (!post) return null;

  const heading = `${labels.title} (${marketDate})`;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={labels.openAction}
        aria-haspopup="dialog"
        className={cn(
          "border-primary/40 bg-primary/10 text-primary inline-flex items-center rounded-full border cursor-pointer",
          "gap-1 px-4 py-2 text-sm font-semibold shadow-sm transition-colors",
          "hover:bg-primary/15 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
          className,
        )}
      >
        <SparklesIcon className="size-4 shrink-0" aria-hidden />
        {labels.button}
        <ChevronRightIcon className="size-4 shrink-0 opacity-70" aria-hidden />
      </button>

      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "flex w-full flex-col gap-0 p-0",
          isMobile ? "max-h-[85vh] rounded-t-2xl" : "sm:max-w-lg",
        )}
      >
        <SheetHeader className="border-border bg-card/50 shrink-0 border-b px-5 py-4 text-left sm:px-6">
          <SheetTitle className="flex items-center gap-2 text-base sm:text-lg">
            <SparklesIcon className="text-primary size-4 shrink-0" aria-hidden />
            {heading}
          </SheetTitle>
          <SheetDescription>{labels.description}</SheetDescription>
        </SheetHeader>

        {blocks.length === 0 ? (
          <ContentEmptyState className="px-5 py-8">
            {labels.empty}
          </ContentEmptyState>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <article className="mx-auto max-w-prose space-y-4 px-5 py-6 sm:px-6 sm:py-7">
              {blocks.map((block, i) => {
                if (block.kind === "lead") {
                  return (
                    <p
                      key={i}
                      className="text-foreground text-[15px] leading-7 font-semibold tracking-tight whitespace-pre-line sm:text-base sm:leading-8"
                    >
                      {block.text}
                    </p>
                  );
                }

                if (block.kind === "point") {
                  return (
                    <div
                      key={i}
                      className="border-primary/25 bg-muted/30 rounded-r-lg border-l-[3px] py-2.5 pr-3 pl-4"
                    >
                      <span
                        className="text-primary text-[11px] font-bold tracking-wider tabular-nums"
                        aria-hidden
                      >
                        {block.index}
                      </span>
                      <p className="text-foreground/90 mt-1 text-sm leading-7 whitespace-pre-line sm:text-[15px] sm:leading-7">
                        {block.text}
                      </p>
                    </div>
                  );
                }

                if (block.kind === "memo") {
                  return (
                    <aside
                      key={i}
                      aria-label={block.label}
                      className={cn(
                        "bg-primary/10 mt-2 rounded-xl border-y border-r border-border border-l-[3px] border-l-primary/70 p-4 sm:p-5",
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="bg-primary/15 text-primary mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg"
                          aria-hidden
                        >
                          <NotebookPenIcon className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-primary text-[11px] font-semibold tracking-wider uppercase sm:text-xs">
                            {block.label}
                          </p>
                          <p className="text-foreground mt-2 text-sm leading-7 font-medium whitespace-pre-line sm:text-[15px] sm:leading-8">
                            {block.text}
                          </p>
                        </div>
                      </div>
                    </aside>
                  );
                }

                return (
                  <p
                    key={i}
                    className="text-muted-foreground text-sm leading-7 whitespace-pre-line sm:text-[15px] sm:leading-7"
                  >
                    {block.text}
                  </p>
                );
              })}
            </article>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
