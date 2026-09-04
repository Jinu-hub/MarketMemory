import { hierarchy, pack, type HierarchyCircularNode } from "d3-hierarchy";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { cn } from "~/core/lib/utils";

import type { MarketSignalItemRow } from "../queries.server";

type SignalBubblePackProps = {
  items: MarketSignalItemRow[];
  getTrendLabel: (trend: MarketSignalItemRow["trendType"]) => string;
  className?: string;
};

type BubbleDatum = {
  id: string;
  name: string;
  value: number;
  signalType: string;
  trendType: MarketSignalItemRow["trendType"];
  rank: number | null;
  changeRate: number | null;
};

type PackDatum = {
  id?: string;
  name?: string;
  value?: number;
  signalType?: string;
  trendType?: MarketSignalItemRow["trendType"];
  rank?: number | null;
  changeRate?: number | null;
  children?: BubbleDatum[];
};

type LaidOutBubble = BubbleDatum & {
  x: number;
  y: number;
  r: number;
};

const TREND_FILL: Record<NonNullable<MarketSignalItemRow["trendType"]>, string> = {
  rising: "fill-emerald-500/25 stroke-emerald-500/70",
  falling: "fill-rose-500/25 stroke-rose-500/70",
  new: "fill-sky-500/25 stroke-sky-500/70",
  stable: "fill-violet-500/20 stroke-violet-500/60",
};

function layoutBubbles(
  items: MarketSignalItemRow[],
  width: number,
  height: number,
): LaidOutBubble[] {
  if (width <= 0 || height <= 0 || items.length === 0) {
    return [];
  }

  const leaves: BubbleDatum[] = items.map((item) => ({
    id: item.id,
    name: item.displayName,
    value: Math.max(item.currentCount ?? 0, 0.5),
    signalType: item.signalType,
    trendType: item.trendType,
    rank: item.rank,
    changeRate: item.changeRate,
  }));

  const root = hierarchy<PackDatum>({ children: leaves })
    .sum((d) => d.value ?? 0)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  const packedRoot = pack<PackDatum>()
    .size([width, height])
    .padding(3)(root);

  return packedRoot
    .leaves()
    .filter(
      (node): node is HierarchyCircularNode<PackDatum> & { data: BubbleDatum } =>
        Boolean(node.data.id && node.data.name),
    )
    .map((node) => ({
      id: node.data.id!,
      name: node.data.name!,
      value: node.data.value ?? 0,
      signalType: node.data.signalType ?? "",
      trendType: node.data.trendType ?? null,
      rank: node.data.rank ?? null,
      changeRate: node.data.changeRate ?? null,
      x: node.x,
      y: node.y,
      r: node.r,
    }));
}

export function SignalBubblePack({
  items,
  getTrendLabel,
  className,
}: SignalBubblePackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 640, height: 420 });
  const [activeId, setActiveId] = useState<string | null>(null);
  const titleId = useId();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const width = el.clientWidth;
      const height = Math.max(320, Math.min(520, Math.round(width * 0.62)));
      setSize({ width, height });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const bubbles = useMemo(
    () => layoutBubbles(items, size.width, size.height),
    [items, size.height, size.width],
  );

  const active = bubbles.find((b) => b.id === activeId) ?? null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "border-border bg-card/40 relative w-full overflow-hidden rounded-xl border",
        className,
      )}
    >
      <svg
        role="img"
        aria-labelledby={titleId}
        width={size.width}
        height={size.height}
        className="block w-full"
        viewBox={`0 0 ${size.width} ${size.height}`}
      >
        <title id={titleId}>Packed bubble chart of market signals</title>
        {bubbles.map((bubble) => {
          const fillClass =
            bubble.trendType != null
              ? TREND_FILL[bubble.trendType]
              : "fill-muted stroke-border";
          const showLabel = bubble.r >= 22;
          const showCount = bubble.r >= 30;
          const fontSize = Math.max(9, Math.min(14, bubble.r * 0.38));

          return (
            <g
              key={bubble.id}
              transform={`translate(${bubble.x},${bubble.y})`}
              className="cursor-pointer"
              onMouseEnter={() => setActiveId(bubble.id)}
              onMouseLeave={() =>
                setActiveId((id) => (id === bubble.id ? null : id))
              }
              onFocus={() => setActiveId(bubble.id)}
              onBlur={() => setActiveId((id) => (id === bubble.id ? null : id))}
              tabIndex={0}
              role="button"
              aria-label={`${bubble.name}, ${bubble.signalType}, count ${Math.round(bubble.value)}`}
            >
              <circle
                r={bubble.r}
                className={cn(
                  "stroke-[1.5] transition-[fill,stroke-width] duration-150",
                  fillClass,
                  activeId === bubble.id && "stroke-[2.5]",
                )}
              />
              {showLabel ? (
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-foreground pointer-events-none select-none"
                  style={{ fontSize }}
                >
                  <tspan x={0} dy={showCount ? "-0.35em" : "0"}>
                    {truncateLabel(bubble.name, bubble.r)}
                  </tspan>
                  {showCount ? (
                    <tspan
                      x={0}
                      dy="1.2em"
                      className="fill-muted-foreground"
                      style={{ fontSize: fontSize * 0.85 }}
                    >
                      {Math.round(bubble.value)}
                    </tspan>
                  ) : null}
                </text>
              ) : null}
            </g>
          );
        })}
      </svg>

      {active ? (
        <div
          className="border-border bg-background/95 pointer-events-none absolute right-3 bottom-3 left-3 rounded-lg border px-3 py-2 text-sm shadow-sm backdrop-blur md:right-auto md:left-3 md:max-w-xs"
          role="status"
        >
          <p className="text-foreground font-semibold tracking-tight">
            {active.rank != null ? `#${active.rank} ` : null}
            {active.name}
          </p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            {active.signalType}
            {" · "}
            count {Math.round(active.value)}
            {active.trendType ? ` · ${getTrendLabel(active.trendType)}` : null}
            {active.changeRate != null
              ? ` · ${active.changeRate > 0 ? "+" : ""}${(active.changeRate * 100).toFixed(0)}%`
              : null}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function truncateLabel(name: string, radius: number): string {
  const maxChars = Math.max(3, Math.floor(radius / 4.2));
  if (name.length <= maxChars) return name;
  return `${name.slice(0, Math.max(2, maxChars - 1))}…`;
}
