import {
  EyeIcon,
  EyeOffIcon,
  RadarIcon,
  SparklesIcon,
  TargetIcon,
} from "lucide-react";
import { useState } from "react";

import { NexBadge, NexButton } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import {
  pickSignalRadarMocks,
  type SignalRadarSignal,
} from "../fixtures/signal-radar";
import { pickDashboardUi } from "../i18n";
import {
  getImpactBadgeVariant,
  getSignalTypeStyle,
} from "../lib/signal-radar-style";
import {
  DashboardBlockHeader,
  DashboardBlockShell,
} from "./dashboard-block-shell";

type SignalRadarBlockProps = {
  locale?: string;
  className?: string;
};

export function SignalRadarBlock({
  locale,
  className,
}: SignalRadarBlockProps) {
  const ui = pickDashboardUi(locale).signalRadar;
  const signalMocks = pickSignalRadarMocks(locale);
  const [isPreviewing, setIsPreviewing] = useState(false);

  return (
    <DashboardBlockShell
      ariaLabelledBy="dashboard-signal-radar-heading"
      className={className}
    >
      <DashboardBlockHeader
        eyebrowIcon={RadarIcon}
        eyebrow={ui.eyebrow}
        title={ui.title}
        titleId="dashboard-signal-radar-heading"
        description={ui.description}
        trailing={
          <div className="flex flex-wrap items-center gap-2">
            <NexBadge
              variant={isPreviewing ? "secondary" : "outline"}
              size="sm"
            >
              {isPreviewing ? ui.preview : ui.comingSoon.badge}
            </NexBadge>
            <NexButton
              variant="secondary"
              size="sm"
              leftIcon={
                isPreviewing ? (
                  <EyeOffIcon className="size-3.5" aria-hidden />
                ) : (
                  <EyeIcon className="size-3.5" aria-hidden />
                )
              }
              onClick={() => setIsPreviewing((value) => !value)}
              aria-expanded={isPreviewing}
              aria-controls="dashboard-signal-radar-preview"
            >
              {isPreviewing
                ? ui.comingSoon.hidePreviewCta
                : ui.comingSoon.previewCta}
            </NexButton>
          </div>
        }
      />

      {isPreviewing ? (
        <div
          id="dashboard-signal-radar-preview"
          className="grid grid-cols-1 gap-3 px-4 py-4 sm:gap-3.5 sm:px-5 sm:py-5 md:px-6 md:py-6 lg:grid-cols-3"
        >
          {signalMocks.slice(0, 3).map((signal) => (
            <SignalCard key={signal.id} signal={signal} locale={locale} />
          ))}
        </div>
      ) : (
        <ComingSoonPlaceholder
          title={ui.comingSoon.title}
          description={ui.comingSoon.description}
          hooks={ui.comingSoon.hooks}
        />
      )}
    </DashboardBlockShell>
  );
}

type ComingSoonPlaceholderProps = {
  title: string;
  description: string;
  hooks: readonly string[];
};

function ComingSoonPlaceholder({
  title,
  description,
  hooks,
}: ComingSoonPlaceholderProps) {
  return (
    <div className="px-4 py-8 sm:px-5 sm:py-10 md:px-6 md:py-12">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <span className="bg-muted text-primary inline-flex size-12 items-center justify-center rounded-full">
          <SparklesIcon className="size-5" aria-hidden />
        </span>
        <h3 className="text-foreground mt-4 text-base font-semibold tracking-tight sm:text-lg">
          {title}
        </h3>
        <p className="text-muted-foreground mt-2 text-xs leading-6 sm:text-sm">
          {description}
        </p>
        {hooks.length > 0 ? (
          <ul className="mt-5 grid w-full gap-2 text-left sm:grid-cols-3 sm:gap-2.5">
            {hooks.map((hook) => (
              <li
                key={hook}
                className="border-border bg-background/60 text-muted-foreground rounded-lg border border-l-[3px] border-l-sky-500 px-3 py-2 text-[11px] leading-5 sm:text-xs dark:border-l-sky-400"
              >
                {hook}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

type SignalCardProps = {
  signal: SignalRadarSignal;
  locale?: string;
};

function SignalCard({ signal, locale }: SignalCardProps) {
  const ui = pickDashboardUi(locale).signalRadar;
  const style = getSignalTypeStyle(signal.signal_type);
  const TypeIcon = style.icon;
  const signalTypeLabel = ui.signalType[signal.signal_type];
  const impactLabel = ui.impactLevel[signal.impact_level];

  return (
    <article
      className={cn(
        "border-border h-full rounded-xl border border-l-[3px] p-3.5 sm:p-4",
        "flex flex-col gap-2.5",
        style.accentBorder,
        style.accentBg,
      )}
    >
      <header className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex min-w-0 items-center gap-1.5",
            style.accentText,
          )}
        >
          <TypeIcon className="size-4 shrink-0" aria-hidden />
          <span className="truncate text-[11px] font-semibold tracking-wider uppercase">
            {signalTypeLabel}
          </span>
        </span>
        <NexBadge
          variant={getImpactBadgeVariant(signal.impact_level)}
          size="sm"
          className="shrink-0"
        >
          {ui.labels.impact} · {impactLabel}
        </NexBadge>
      </header>

      <h3 className="text-foreground text-sm leading-snug font-semibold tracking-tight md:text-base">
        {signal.signal_title}
      </h3>

      <p className="text-muted-foreground line-clamp-4 text-xs leading-5 sm:text-sm sm:leading-6">
        {signal.description}
      </p>

      <div className="border-border/60 mt-auto space-y-2 border-t pt-2.5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
            {ui.labels.relatedTheme}
          </span>
          <span className="text-foreground min-w-0 text-xs font-medium">
            {signal.related_theme}
          </span>
        </div>

        {signal.watch_points.length > 0 ? (
          <div className="space-y-1.5">
            <span className="text-muted-foreground inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase">
              <TargetIcon className="size-3" aria-hidden />
              {ui.labels.watchPoints}
            </span>
            <ul className="flex flex-wrap gap-1.5">
              {signal.watch_points.map((point) => (
                <li key={point}>
                  <span className="border-border bg-background/80 text-foreground inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] leading-5">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}
