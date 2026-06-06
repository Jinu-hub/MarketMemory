import type { ReactNode } from "react";

import { CalendarIcon } from "lucide-react";

import { cn } from "~/core/lib/utils";

import { formatMarketDate, formatMemoryPublishedAt } from "../lib/dates";

export type DashboardEditionLabels = {
  tradingDay: string;
  publishedAt: string;
  statusLabel: string;
  draftNote: string;
  timezoneAbbr: string;
};

type DashboardMarketDateProps = {
  marketDate: string;
  locale: string;
  labels: DashboardEditionLabels;
  /** `daily_market_memories.updated_at` or `generated_at` */
  publishedAt?: string | null;
  status?: string;
  className?: string;
  /** Optional affordance rendered on the date row (e.g. a calendar chevron). */
  trailing?: ReactNode;
};

function EditionMetaRow({
  label,
  children,
  className,
  muted = false,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  /** Secondary meta line (e.g. publish time) — label and value both muted. */
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline gap-x-1 text-[11px] leading-snug sm:text-xs",
        muted && "text-muted-foreground",
        className,
      )}
    >
      <span className="shrink-0 font-medium">{label}</span>
      <span
        className={cn("shrink-0", muted ? "text-muted-foreground/80" : "text-muted-foreground/60")}
        aria-hidden
      >
        :
      </span>
      <span
        className={cn(
          "min-w-0",
          muted ? "font-medium" : "text-foreground font-semibold",
        )}
      >
        {children}
      </span>
    </div>
  );
}

export function DashboardMarketDate({
  marketDate,
  locale,
  labels,
  publishedAt,
  status,
  className,
  trailing,
}: DashboardMarketDateProps) {
  const formatted = formatMarketDate(marketDate, locale);
  if (!formatted) return null;

  const isDraft = status === "draft";
  const publishedFormatted = formatMemoryPublishedAt(publishedAt, locale);

  return (
    <div
      className={cn(
        "border-primary/25 bg-primary/5 flex w-fit max-w-full flex-col gap-2 rounded-xl border px-5 py-3 sm:min-w-[16rem] sm:px-6 sm:py-3.5",
        className,
      )}
    >
      <span className="text-primary text-[10px] font-semibold tracking-wider uppercase sm:text-[11px]">
        {labels.tradingDay}
      </span>
      <div className="flex items-center justify-between gap-3">
        <time
          dateTime={marketDate}
          className="text-foreground inline-flex min-w-0 items-center gap-2 text-sm font-semibold sm:text-base"
        >
          <CalendarIcon
            className="text-primary size-4 shrink-0 sm:size-[1.125rem]"
            aria-hidden
          />
          <span className="min-w-0 leading-snug">{formatted}</span>
        </time>
        {trailing}
      </div>
      {isDraft ? (
        <EditionMetaRow
          muted
          label={labels.statusLabel}
          className="border-border/60 border-t border-dashed pt-2"
        >
          {labels.draftNote}
        </EditionMetaRow>
      ) : publishedFormatted ? (
        <EditionMetaRow
          muted
          label={labels.publishedAt}
          className="border-border/60 border-t border-dashed pt-2"
        >
          <time dateTime={publishedAt ?? undefined} className="tabular-nums">
            {publishedFormatted}
          </time>{" "}
          <span>({labels.timezoneAbbr})</span>
        </EditionMetaRow>
      ) : null}
    </div>
  );
}
