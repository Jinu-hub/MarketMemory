import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import type { SimilarityEdgeListRow } from "../../queries";

function parseNum(s: number | string | null | undefined): number | null {
  if (s == null || s === "") {
    return null;
  }
  const n = typeof s === "number" ? s : Number(s);
  return Number.isFinite(n) ? n : null;
}

/**
 * 한 리포트(`item_contents`)에 연결된 유사도 엣지를 압축해 표시한다.
 */
export function SimilaritySummaryCell({
  edges,
  className,
}: {
  edges: SimilarityEdgeListRow[];
  className?: string;
}) {
  if (edges.length === 0) {
    return (
      <div
        className={cn(
          "text-muted-foreground flex flex-wrap items-center gap-2 text-xs",
          className,
        )}
      >
        <span className="border-border text-muted-foreground rounded-md border border-dashed px-2 py-1 font-medium">
          엣지 없음
        </span>
        <span className="text-muted-foreground/80 hidden sm:inline">유사도 생성으로 채울 수 있습니다</span>
      </div>
    );
  }

  const scores = edges.map((e) => parseNum(e.final_score)).filter((n): n is number => n != null);
  const maxScore = scores.length ? Math.max(...scores) : null;
  const avgScore =
    scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
  const topTargets = [...edges]
    .sort((a, b) => (parseNum(b.final_score) ?? 0) - (parseNum(a.final_score) ?? 0))
    .slice(0, 3)
    .map((e) => e.target_item_id);

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <NexBadge variant="outline" size="sm">
          엣지 {edges.length}
        </NexBadge>
        {maxScore != null ? (
          <span className="text-muted-foreground text-[11px] tabular-nums">
            max {maxScore.toFixed(2)}
            {avgScore != null ? ` · avg ${avgScore.toFixed(2)}` : null}
          </span>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1">
        {topTargets.map((id) => (
          <code
            key={id}
            className="bg-muted/60 text-foreground/90 max-w-full truncate rounded px-1.5 py-0.5 font-mono text-[10px]"
            title={id}
          >
            {id.slice(0, 8)}…
          </code>
        ))}
      </div>
    </div>
  );
}
