/**
 * RoadmapBlock — public-dashboard teaser for upcoming capabilities.
 *
 * Replaces mock-preview blocks (Memory Recall / Signal Radar) with a clear
 * “we keep expanding” message and a compact list of planned directions.
 *
 * Accent colors follow the same light/dark-safe pattern as category-style
 * (muted fill + directional border + icon tint) so the block isn’t stuck in
 * grayscale when `--primary` is achromatic.
 */
import {
  ArchiveIcon,
  BellIcon,
  BookmarkIcon,
  BrainIcon,
  CalendarRangeIcon,
  CompassIcon,
  LanguagesIcon,
  LayersIcon,
  SearchIcon,
  type LucideIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "~/core/lib/utils";
import { DashboardBlockShell } from "~/features/dashboard/components/dashboard-block-shell";

type RoadmapItemKey =
  | "archive"
  | "themes"
  | "digests"
  | "personalization"
  | "alerts"
  | "i18nQuality"
  | "searchFilters"
  | "memoryRecall";

type RoadmapAccent = {
  border: string;
  bg: string;
  text: string;
  iconBg: string;
  rail: string;
};

const ROADMAP_ITEMS: {
  key: RoadmapItemKey;
  icon: LucideIcon;
  accent: RoadmapAccent;
}[] = [
  {
    key: "archive",
    icon: ArchiveIcon,
    accent: {
      border: "border-l-sky-500 dark:border-l-sky-400",
      bg: "bg-sky-500/[0.015] dark:bg-sky-400/[0.025]",
      text: "text-sky-600 dark:text-sky-400",
      iconBg: "bg-sky-500/10 dark:bg-sky-400/15 ring-sky-500/20 dark:ring-sky-400/25",
      rail: "from-sky-500/0 via-sky-500/50 to-sky-500/0 dark:via-sky-400/50",
    },
  },
  {
    key: "memoryRecall",
    icon: BrainIcon,
    accent: {
      border: "border-l-violet-500 dark:border-l-violet-400",
      bg: "bg-violet-500/[0.015] dark:bg-violet-400/[0.025]",
      text: "text-violet-600 dark:text-violet-400",
      iconBg:
        "bg-violet-500/10 dark:bg-violet-400/15 ring-violet-500/20 dark:ring-violet-400/25",
      rail: "from-violet-500/0 via-violet-500/50 to-violet-500/0 dark:via-violet-400/50",
    },
  },
  {
    key: "themes",
    icon: LayersIcon,
    accent: {
      border: "border-l-amber-500 dark:border-l-amber-400",
      bg: "bg-amber-500/[0.015] dark:bg-amber-400/[0.025]",
      text: "text-amber-600 dark:text-amber-400",
      iconBg:
        "bg-amber-500/10 dark:bg-amber-400/15 ring-amber-500/20 dark:ring-amber-400/25",
      rail: "from-amber-500/0 via-amber-500/50 to-amber-500/0 dark:via-amber-400/50",
    },
  },
  {
    key: "digests",
    icon: CalendarRangeIcon,
    accent: {
      border: "border-l-emerald-500 dark:border-l-emerald-400",
      bg: "bg-emerald-500/[0.015] dark:bg-emerald-400/[0.025]",
      text: "text-emerald-600 dark:text-emerald-400",
      iconBg:
        "bg-emerald-500/10 dark:bg-emerald-400/15 ring-emerald-500/20 dark:ring-emerald-400/25",
      rail: "from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 dark:via-emerald-400/50",
    },
  },
  {
    key: "personalization",
    icon: BookmarkIcon,
    accent: {
      border: "border-l-rose-500 dark:border-l-rose-400",
      bg: "bg-rose-500/[0.015] dark:bg-rose-400/[0.025]",
      text: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-500/10 dark:bg-rose-400/15 ring-rose-500/20 dark:ring-rose-400/25",
      rail: "from-rose-500/0 via-rose-500/50 to-rose-500/0 dark:via-rose-400/50",
    },
  },
  {
    key: "alerts",
    icon: BellIcon,
    accent: {
      border: "border-l-orange-500 dark:border-l-orange-400",
      bg: "bg-orange-500/[0.015] dark:bg-orange-400/[0.025]",
      text: "text-orange-600 dark:text-orange-400",
      iconBg:
        "bg-orange-500/10 dark:bg-orange-400/15 ring-orange-500/20 dark:ring-orange-400/25",
      rail: "from-orange-500/0 via-orange-500/50 to-orange-500/0 dark:via-orange-400/50",
    },
  },
  {
    key: "i18nQuality",
    icon: LanguagesIcon,
    accent: {
      border: "border-l-teal-500 dark:border-l-teal-400",
      bg: "bg-teal-500/[0.015] dark:bg-teal-400/[0.025]",
      text: "text-teal-600 dark:text-teal-400",
      iconBg: "bg-teal-500/10 dark:bg-teal-400/15 ring-teal-500/20 dark:ring-teal-400/25",
      rail: "from-teal-500/0 via-teal-500/50 to-teal-500/0 dark:via-teal-400/50",
    },
  },
  {
    key: "searchFilters",
    icon: SearchIcon,
    accent: {
      border: "border-l-blue-500 dark:border-l-blue-400",
      bg: "bg-blue-500/[0.015] dark:bg-blue-400/[0.025]",
      text: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-500/10 dark:bg-blue-400/15 ring-blue-500/20 dark:ring-blue-400/25",
      rail: "from-blue-500/0 via-blue-500/50 to-blue-500/0 dark:via-blue-400/50",
    },
  },
];

export type RoadmapBlockProps = {
  className?: string;
};

export function RoadmapBlock({ className }: RoadmapBlockProps) {
  const { t } = useTranslation();
  const titleId = "public-dashboard-roadmap-heading";

  return (
    <DashboardBlockShell
      ariaLabelledBy={titleId}
      className={cn("relative overflow-hidden", className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-sky-500/20 blur-3xl dark:bg-sky-400/15"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -left-20 size-64 rounded-full bg-violet-500/15 blur-3xl dark:bg-violet-400/12"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.28] [background-image:linear-gradient(var(--color-border)_1px,transparent_1px),linear-gradient(90deg,var(--color-border)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_72%)]"
      />

      <header className="border-border/70 relative z-10 flex flex-wrap items-start justify-between gap-3 border-b px-4 py-4 sm:px-5 sm:py-5 md:px-6">
        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.18em] text-sky-600 uppercase sm:text-xs dark:text-sky-400">
            <span className="relative inline-flex size-6 items-center justify-center rounded-full bg-sky-500/15 dark:bg-sky-400/15">
              <CompassIcon className="size-3.5" aria-hidden />
              <span className="absolute -top-0.5 -right-0.5 size-1.5 animate-pulse rounded-full bg-sky-500 dark:bg-sky-400" />
            </span>
            {t("publicDashboard.roadmap.eyebrow")}
          </p>
          <h2
            id={titleId}
            className="from-foreground via-foreground to-sky-700/70 mt-1.5 bg-gradient-to-br bg-clip-text text-base font-semibold tracking-tight text-transparent sm:text-lg md:text-xl dark:to-sky-300/70"
          >
            {t("publicDashboard.roadmap.title")}
          </h2>
          <p className="text-muted-foreground mt-1.5 max-w-2xl text-[11px] leading-relaxed sm:text-xs md:text-sm">
            {t("publicDashboard.roadmap.description")}
          </p>
        </div>

        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1",
            "border-sky-500/35 bg-sky-500/10 text-sky-700 dark:border-sky-400/35 dark:bg-sky-400/10 dark:text-sky-300",
            "text-[10px] font-semibold tracking-[0.14em] uppercase sm:text-[11px]",
            "ring-1 ring-sky-500/15 dark:ring-sky-400/20",
          )}
        >
          <span className="size-1.5 animate-pulse rounded-full bg-sky-500 dark:bg-sky-400" />
          {t("publicDashboard.roadmap.badge")}
        </span>
      </header>

      <ul className="relative z-10 grid grid-cols-1 gap-2.5 px-4 py-4 sm:grid-cols-2 sm:gap-3 sm:px-5 sm:py-5 md:px-6 md:py-6">
        {ROADMAP_ITEMS.map(({ key, icon: Icon, accent }) => (
          <li key={key}>
            <div
              className={cn(
                "group border-border/70 relative flex items-start gap-3 overflow-hidden rounded-xl border border-l-[3px] px-3.5 py-3.5 backdrop-blur-sm",
                "transition-[border-color,background-color,box-shadow,transform] duration-300",
                "hover:-translate-y-0.5",
                accent.border,
                accent.bg,
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-y-3 left-0 w-px bg-gradient-to-b opacity-50 transition-opacity group-hover:opacity-100",
                  accent.rail,
                )}
              />

              <span
                className={cn(
                  "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg ring-1",
                  "transition-[background-color,box-shadow] duration-300",
                  "group-hover:shadow-[0_0_18px_-6px_currentColor]",
                  accent.text,
                  accent.iconBg,
                )}
                aria-hidden
              >
                <Icon className="size-4" />
              </span>

              <span className="text-foreground min-w-0 flex-1 pt-1.5 text-sm leading-snug font-medium tracking-tight">
                {t(`publicDashboard.roadmap.items.${key}`)}
              </span>
            </div>
          </li>
        ))}
      </ul>

      <div className="border-border/70 relative z-10 border-t bg-card/50 px-4 py-3.5 backdrop-blur-sm sm:px-5 md:px-6">
        <p className="text-muted-foreground text-xs sm:text-sm">
          {t("publicDashboard.roadmap.footer")}
        </p>
      </div>
    </DashboardBlockShell>
  );
}
