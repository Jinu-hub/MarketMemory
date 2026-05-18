import { ActivityIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { cn } from "~/core/lib/utils";

import {
  formatChangePercent,
  formatPrice,
  getChangeColorClass,
  getFearGreedColorClass,
  resolveSnapshotEntries,
  type ResolvedSnapshotEntry,
} from "../lib/market-snapshot";
import type { MarketSnapshotData } from "../types";

type MarketSnapshotBarProps = {
  snapshot: MarketSnapshotData | null;
  className?: string;
};

/**
 * Editorial market ticker that lives at the top of `/dashboard`.
 *
 * Renders 6 fixed slots (S&P 500 / NASDAQ / DOW / BTC / Gold / Fear & Greed)
 * inside a responsive grid:
 *  - `< sm` : 2 columns × 3 rows  (no horizontal scroll on phones)
 *  - `sm`   : 3 columns × 2 rows  (tablet)
 *  - `lg+`  : 6 columns × 1 row   (desktop ticker)
 *
 * Dividers come for free from a `gap-px` + `bg-border` trick, which keeps
 * the look clean in light / dark / warm themes without per-cell border
 * arithmetic.
 *
 * Missing items render as placeholders so the bar stays visually stable
 * even on slow / empty days.
 */
export function MarketSnapshotBar({
  snapshot,
  className,
}: MarketSnapshotBarProps) {
  const entries = resolveSnapshotEntries(snapshot);

  return (
    <section
      aria-label="시장 스냅샷"
      className={cn(
        "border-border bg-border overflow-hidden rounded-2xl border",
        className,
      )}
    >
      <ul
        className="grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-6"
        role="list"
      >
        {entries.map((entry) => (
          <li
            key={entry.id}
            className="bg-card/80 px-3 py-3 sm:px-4 sm:py-3.5 md:px-5 md:py-4"
          >
            <SnapshotCell entry={entry} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function SnapshotCell({ entry }: { entry: ResolvedSnapshotEntry }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 sm:gap-1">
      <div className="flex min-w-0 items-baseline justify-between gap-2">
        <span className="text-foreground truncate text-[11px] font-semibold tracking-wide uppercase sm:text-xs">
          {entry.label}
        </span>
        {entry.sublabel ? (
          <span className="text-muted-foreground hidden truncate text-[10px] tracking-wide uppercase lg:inline">
            {entry.sublabel}
          </span>
        ) : null}
      </div>

      {entry.kind === "quote" ? (
        <QuoteValue entry={entry} />
      ) : entry.kind === "fear-greed" ? (
        <FearGreedValue entry={entry} />
      ) : (
        <EmptyValue />
      )}
    </div>
  );
}

function QuoteValue({
  entry,
}: {
  entry: Extract<ResolvedSnapshotEntry, { kind: "quote" }>;
}) {
  const { item } = entry;
  const colorClass = getChangeColorClass(item.changePercent);
  const TrendIcon =
    item.changePercent == null
      ? ActivityIcon
      : item.changePercent > 0
        ? TrendingUpIcon
        : item.changePercent < 0
          ? TrendingDownIcon
          : ActivityIcon;

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className="text-foreground text-base font-semibold tabular-nums sm:text-lg">
        {formatPrice(item.price, item.currency)}
      </span>
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-[11px] font-medium tabular-nums sm:text-xs",
          colorClass,
        )}
      >
        <TrendIcon className="size-3 sm:size-3.5" aria-hidden />
        {formatChangePercent(item.changePercent)}
      </span>
    </div>
  );
}

function FearGreedValue({
  entry,
}: {
  entry: Extract<ResolvedSnapshotEntry, { kind: "fear-greed" }>;
}) {
  const colorClass = getFearGreedColorClass(entry.value);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span
        className={cn(
          "text-base font-semibold tabular-nums sm:text-lg",
          colorClass,
        )}
      >
        {Math.round(entry.value)}
      </span>
      <span className="text-muted-foreground truncate text-[11px] sm:text-xs">
        {entry.classification}
      </span>
    </div>
  );
}

function EmptyValue() {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className="text-muted-foreground text-base font-semibold tabular-nums sm:text-lg">
        —
      </span>
      <span className="text-muted-foreground text-[11px] sm:text-xs">
        데이터 없음
      </span>
    </div>
  );
}
