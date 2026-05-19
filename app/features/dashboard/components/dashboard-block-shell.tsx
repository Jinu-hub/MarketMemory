import type { LucideIcon } from "lucide-react";

import { cn } from "~/core/lib/utils";

type DashboardBlockShellProps = {
  children: React.ReactNode;
  className?: string;
  /** `default` — standard card; `subtle` — lighter surface (e.g. latest reports) */
  tone?: "default" | "subtle";
  ariaLabelledBy?: string;
  ariaLabel?: string;
};

export function DashboardBlockShell({
  children,
  className,
  tone = "default",
  ariaLabelledBy,
  ariaLabel,
}: DashboardBlockShellProps) {
  return (
    <section
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabel}
      className={cn(
        "border-border overflow-hidden rounded-2xl border",
        tone === "subtle" ? "bg-card/60" : "bg-card",
        className,
      )}
    >
      {children}
    </section>
  );
}

type DashboardBlockHeaderProps = {
  eyebrowIcon: LucideIcon;
  eyebrow: string;
  title: string;
  titleId: string;
  description?: string;
  trailing?: React.ReactNode;
  className?: string;
};

/** Standard dashboard block header (Risk Radar, Memory Recall, etc.). */
export function DashboardBlockHeader({
  eyebrowIcon: EyebrowIcon,
  eyebrow,
  title,
  titleId,
  description,
  trailing,
  className,
}: DashboardBlockHeaderProps) {
  return (
    <header
      className={cn(
        "border-border flex flex-wrap items-center justify-between gap-3 border-b bg-card/50 px-4 py-3.5 sm:px-5 sm:py-4 md:px-6",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-primary inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase sm:text-xs">
          <EyebrowIcon className="size-3.5" aria-hidden />
          {eyebrow}
        </p>
        <h2
          id={titleId}
          className="mt-0.5 text-sm font-semibold tracking-tight sm:text-base md:text-lg"
        >
          {title}
        </h2>
        {description ? (
          <p className="text-muted-foreground mt-0.5 max-w-xl text-[11px] sm:text-xs md:text-sm">
            {description}
          </p>
        ) : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </header>
  );
}
