import { AlertTriangleIcon, HashIcon, RadarIcon } from "lucide-react";

import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import { getRiskSeverityStyle } from "../lib/risk-severity";
import type { RiskSignal } from "../types";

type RiskRadarBlockProps = {
  /** Pulled from `daily_market_memories.risk_signals` JSONB. */
  signals: RiskSignal[] | null;
  className?: string;
};

/**
 * Risk Radar — surfaces the top risk signals the pipeline flagged for
 * today. When real signals are present, they render as left-accent
 * cards. When `signals` is null/empty, a small mock is shown so the
 * dashboard still has a sense of place during the early MVP.
 */
export function RiskRadarBlock({ signals, className }: RiskRadarBlockProps) {
  const rows = (signals ?? []).filter((s) => resolveTitle(s)).slice(0, 4);
  const usingMock = rows.length === 0;
  const display = usingMock ? MOCK_RISKS : rows;

  return (
    <section
      aria-labelledby="dashboard-risk-radar-heading"
      className={cn(
        "border-border bg-card overflow-hidden rounded-2xl border",
        className,
      )}
    >
      <header className="border-border flex flex-wrap items-center justify-between gap-3 border-b bg-card/50 px-4 py-3.5 sm:px-5 sm:py-4 md:px-6">
        <div className="min-w-0 flex-1">
          <p className="text-primary inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase sm:text-xs">
            <RadarIcon className="size-3.5" aria-hidden />
            Risk Radar
          </p>
          <h2
            id="dashboard-risk-radar-heading"
            className="mt-0.5 text-sm font-semibold tracking-tight sm:text-base md:text-lg"
          >
            오늘의 리스크 신호
          </h2>
          <p className="text-muted-foreground mt-0.5 max-w-xl text-[11px] sm:text-xs md:text-sm">
            시장 메모리 파이프라인이 식별한 주의해야 할 리스크입니다.
          </p>
        </div>
        {usingMock ? (
          <NexBadge variant="outline" size="sm" className="shrink-0">
            Preview
          </NexBadge>
        ) : (
          <NexBadge variant="outline" size="sm" className="shrink-0">
            {rows.length}건
          </NexBadge>
        )}
      </header>

      <ul className="grid grid-cols-1 gap-2.5 px-4 py-4 sm:grid-cols-2 sm:gap-3 sm:px-5 sm:py-5 md:px-6 md:py-6">
        {display.map((signal, index) => (
          <li key={resolveTitle(signal) ?? `risk-${index}`}>
            <RiskCard signal={signal} index={index} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function RiskCard({ signal, index }: { signal: RiskSignal; index: number }) {
  const title = resolveTitle(signal) ?? `Risk ${index + 1}`;
  const style = getRiskSeverityStyle(signal.severity);
  const Icon = style.icon;
  const tags = (signal.tags ?? []).slice(0, 3);

  return (
    <article
      className={cn(
        "border-border h-full rounded-xl border border-l-[3px] p-3.5 sm:p-4",
        "flex flex-col gap-2",
        style.accentBorder,
        style.accentBg,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex min-w-0 items-center gap-1",
            style.accentText,
          )}
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          <span className="truncate text-[11px] font-semibold tracking-wider uppercase">
            Risk {String(index + 1).padStart(2, "0")}
          </span>
        </span>
        <NexBadge variant={style.badgeVariant} size="sm" className="shrink-0">
          {style.label}
        </NexBadge>
      </div>
      <h3 className="text-sm leading-snug font-semibold tracking-tight md:text-base">
        {title}
      </h3>
      {signal.description ? (
        <p className="text-muted-foreground line-clamp-3 text-xs leading-5 sm:text-sm sm:leading-6">
          {signal.description}
        </p>
      ) : null}
      {tags.length > 0 ? (
        <div className="border-border/60 mt-auto flex flex-wrap gap-1.5 border-t pt-2.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-muted-foreground bg-background inline-flex items-center gap-0.5 rounded-md border-0 px-2 py-0.5 text-[11px]"
            >
              <HashIcon className="size-2.5" aria-hidden />
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function resolveTitle(signal: RiskSignal): string | null {
  const title = signal.title ?? signal.label ?? null;
  if (!title) return null;
  return typeof title === "string" ? title : null;
}

/* ────────────────────────────────────────────────────────────
 *  Mock signals — used when the JSONB column is empty
 * ──────────────────────────────────────────────────────────── */

const MOCK_RISKS: RiskSignal[] = [
  {
    title: "에너지 가격 리스크",
    description:
      "중동 불안과 원유 공급 우려가 겹치며 인플레이션 재점화 가능성이 다시 부각되고 있습니다.",
    severity: "high",
    tags: ["원유", "지정학", "인플레이션"],
  },
  {
    title: "금리 인하 기대 약화",
    description:
      "연준의 동결과 강한 고용 데이터가 겹치며 장기금리·성장주 밸류에이션에 부담이 되고 있습니다.",
    severity: "medium",
    tags: ["연준", "장기금리", "성장주"],
  },
  {
    title: "AI 캐펙스 과열 가능성",
    description:
      "데이터센터·전력 인프라로 자본이 집중되면서 일부 구간에서 과열 신호가 감지되고 있습니다.",
    severity: "medium",
    tags: ["AI", "캐펙스", "데이터센터"],
  },
  {
    title: "외환 변동성 확대",
    description:
      "달러 강세와 신흥국 통화 약세가 동시 진행되며 변동성 환경이 확대되는 흐름입니다.",
    severity: "low",
    tags: ["FX", "달러", "신흥국"],
  },
];
