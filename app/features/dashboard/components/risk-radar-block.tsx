import { RadarIcon } from "lucide-react";

import { NexBadge } from "~/core/components/nex";
import { ContentTagList } from "~/core/components/content/content-tag-list";
import { cn } from "~/core/lib/utils";

import { MOCK_RISK_SIGNALS } from "../fixtures/risk-radar";
import { pickDashboardUi } from "../i18n";
import {
  getRiskSeverityLabel,
  getRiskSeverityStyle,
} from "../lib/risk-severity";
import { resolveRiskSignalTitle } from "../lib/pipeline-fields";
import type { RiskSignal } from "../types";
import {
  DashboardBlockHeader,
  DashboardBlockShell,
} from "./dashboard-block-shell";

type RiskRadarBlockProps = {
  signals: RiskSignal[] | null;
  locale?: string;
  className?: string;
};

export function RiskRadarBlock({
  signals,
  locale,
  className,
}: RiskRadarBlockProps) {
  const ui = pickDashboardUi(locale).riskRadar;
  const rows = (signals ?? [])
    .filter((s) => resolveRiskSignalTitle(s))
    .slice(0, 4);
  const usingMock = rows.length === 0;
  const display = usingMock ? MOCK_RISK_SIGNALS : rows;

  return (
    <DashboardBlockShell
      ariaLabelledBy="dashboard-risk-radar-heading"
      className={className}
    >
      <DashboardBlockHeader
        eyebrowIcon={RadarIcon}
        eyebrow={ui.eyebrow}
        title={ui.title}
        titleId="dashboard-risk-radar-heading"
        description={ui.description}
        trailing={
          <NexBadge variant="outline" size="sm">
            {usingMock
              ? ui.preview
              : `${rows.length}${ui.countSuffix}`}
          </NexBadge>
        }
      />

      <ul className="grid grid-cols-1 gap-2.5 px-4 py-4 sm:grid-cols-2 sm:gap-3 sm:px-5 sm:py-5 md:px-6 md:py-6">
        {display.map((signal, index) => (
          <li key={resolveRiskSignalTitle(signal) ?? `risk-${index}`}>
            <RiskCard signal={signal} index={index} locale={locale} />
          </li>
        ))}
      </ul>
    </DashboardBlockShell>
  );
}

function RiskCard({
  signal,
  index,
  locale,
}: {
  signal: RiskSignal;
  index: number;
  locale?: string;
}) {
  const ui = pickDashboardUi(locale).riskRadar;
  const title =
    resolveRiskSignalTitle(signal) ??
    `${ui.riskIndex} ${index + 1}`;
  const style = getRiskSeverityStyle(signal.severity);
  const severityLabel = getRiskSeverityLabel(style.key, locale);
  const Icon = style.icon;
  const tags = signal.tags ?? [];

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
            {ui.riskIndex} {String(index + 1).padStart(2, "0")}
          </span>
        </span>
        <NexBadge variant={style.badgeVariant} size="sm" className="shrink-0">
          {severityLabel}
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
        <div className="border-border/60 mt-auto border-t pt-2.5">
          <ContentTagList tags={tags} max={3} variant="plain" />
        </div>
      ) : null}
    </article>
  );
}
