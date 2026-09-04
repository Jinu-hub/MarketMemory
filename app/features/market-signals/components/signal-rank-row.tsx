import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import { SignalTrendBadge } from "./signal-trend-badge";
import type { MarketSignalItemRow } from "../queries.server";

type SignalRankRowProps = {
  item: MarketSignalItemRow;
  maxCount: number;
  trendLabel: string;
  typeLabel: string;
};

export function SignalRankRow({
  item,
  maxCount,
  trendLabel,
  typeLabel,
}: SignalRankRowProps) {
  const count = item.currentCount ?? 0;
  const widthPct =
    maxCount > 0 ? Math.max(4, Math.round((count / maxCount) * 100)) : 0;

  return (
    <article
      className={cn(
        "border-border/70 bg-card/40 hover:bg-card/70 rounded-xl border px-4 py-3 transition-colors",
        "border-l-[3px] border-l-primary/70",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-muted-foreground w-8 shrink-0 pt-0.5 text-right font-mono text-sm tabular-nums">
          {item.rank ?? "—"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-foreground text-base font-semibold tracking-tight">
              {item.displayName}
            </h3>
            <NexBadge variant="outline" size="sm">
              {typeLabel}
            </NexBadge>
            <SignalTrendBadge trendType={item.trendType} label={trendLabel} />
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="bg-muted h-1.5 min-w-0 flex-1 overflow-hidden rounded-full">
              <div
                className="bg-primary/80 h-full rounded-full transition-[width]"
                style={{ width: `${widthPct}%` }}
                aria-hidden
              />
            </div>
            <span className="text-foreground w-10 shrink-0 text-right font-mono text-sm tabular-nums">
              {count}
            </span>
          </div>
          {item.previousCount != null || item.changeRate != null ? (
            <p className="text-muted-foreground mt-1.5 text-xs">
              {item.previousCount != null ? `prev ${item.previousCount}` : null}
              {item.previousCount != null && item.changeRate != null ? " · " : null}
              {item.changeRate != null
                ? `${item.changeRate > 0 ? "+" : ""}${(item.changeRate * 100).toFixed(0)}%`
                : null}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}
