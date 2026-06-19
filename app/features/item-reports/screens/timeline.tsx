/**
 * Item Reports — Timeline View (/item_reports/timeline)
 */
import { ChevronDownIcon, ClockIcon, GridIcon } from "lucide-react";
import { Link, redirect } from "react-router";

import { NexBadge, NexButton } from "~/core/components/nex";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/core/components/ui/collapsible";
import i18next from "~/core/lib/i18next.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";

import type { Route } from "./+types/timeline";
import { ItemReportsNavLink } from "../components/item-reports-nav-link";
import { ReportTimeline } from "../components/report-timeline";
import {
  formatCount,
  formatItemReportsCopy,
  pickItemReportsUi,
} from "../i18n";
import { itemReportsTimelineHref } from "../lib/item-reports-urls";
import { localizeItemContents } from "../lib/item-content-localization";
import {
  getPublicReportsCount,
  getRecentReports,
  getReportsForTimelineYear,
  getTimelineAvailableYears,
  TIMELINE_ALL_LIMIT,
} from "../queries";

export async function loader({ request }: Route.LoaderArgs) {
  const locale = await i18next.getLocale(request);
  const url = new URL(request.url);
  const yearParam = url.searchParams.get("year");
  const [client] = makeServerClient(request);

  const [years, totalReports] = await Promise.all([
    getTimelineAvailableYears(client),
    getPublicReportsCount(client),
  ]);

  const defaultYear = years[0] ?? null;

  if (!yearParam && defaultYear !== null) {
    throw redirect(itemReportsTimelineHref({ year: defaultYear }));
  }

  const parsedYear = yearParam ? Number.parseInt(yearParam, 10) : NaN;
  const selectedYear =
    yearParam === "all"
      ? null
      : Number.isFinite(parsedYear) && years.includes(parsedYear)
        ? parsedYear
        : defaultYear;

  const reportRows =
    selectedYear === null
      ? await getRecentReports(client, TIMELINE_ALL_LIMIT)
      : await getReportsForTimelineYear(client, selectedYear);

  const reports = await localizeItemContents(client, reportRows, locale);

  const ui = pickItemReportsUi(locale);

  return {
    reports,
    totalReports,
    years,
    selectedYear,
    locale,
    meta: {
      title: ui.timeline.metaTitle,
      description: ui.timeline.metaDescription,
    },
  };
}

export const meta: Route.MetaFunction = ({ data }) => {
  const title = data?.meta.title ?? "Reports Timeline";
  const description = data?.meta.description ?? "";
  return [
    { title: `${title} | ${import.meta.env.VITE_APP_NAME}` },
    { name: "description", content: description },
  ];
};

export default function ItemReportsTimeline({
  loaderData,
}: Route.ComponentProps) {
  const { reports, totalReports, years, selectedYear, locale } = loaderData;
  const ui = pickItemReportsUi(locale);

  return (
    <div className="flex flex-1 flex-col gap-8 px-4 pt-2 pb-16 md:px-8">
      <nav className="flex items-center justify-between">
        <ItemReportsNavLink to="/item_reports">{ui.nav.libraryShort}</ItemReportsNavLink>
        <Link to="/item_reports/explore" viewTransition>
          <NexButton
            className="cursor-pointer"
            variant="secondary"
            size="sm"
            leftIcon={<GridIcon className="size-4" />}
          >
            {ui.common.explore}
          </NexButton>
        </Link>
      </nav>

      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <NexBadge variant="secondary" size="sm">
            <ClockIcon className="mr-1 size-3" />
            {ui.timeline.badge}
          </NexBadge>
          <span className="text-muted-foreground text-xs">
            {selectedYear
              ? formatItemReportsCopy(ui.timeline.yearCount, {
                  year: selectedYear,
                  count: formatCount(reports.length, locale),
                })
              : formatItemReportsCopy(ui.timeline.totalCount, {
                  count: formatCount(reports.length, locale),
                })}
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {ui.timeline.title}
        </h1>
        <p className="text-muted-foreground max-w-5xl text-sm leading-relaxed whitespace-pre-line md:text-base">
          {ui.timeline.subtitle}
        </p>
      </header>

      <Collapsible className="group/filter">
        <section className="border-border bg-card/60 rounded-xl border p-4 md:p-5">
          <CollapsibleTrigger
            className={cn(
              "hover:bg-muted/40 focus-visible:ring-ring -mx-2 flex w-[calc(100%+1rem)] items-center justify-between rounded-lg px-2 py-1.5 transition-colors outline-none",
              "focus-visible:ring-2 cursor-pointer",
            )}
            aria-controls="timeline-filter-content"
          >
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold tracking-tight">
                {ui.timeline.filterTitle}
              </h2>
              <span className="text-muted-foreground text-xs">
                {ui.timeline.filterHint}
              </span>
            </div>
            <ChevronDownIcon className="text-muted-foreground size-4 transition-transform duration-200 group-data-[state=open]/filter:rotate-180" />
          </CollapsibleTrigger>

          <CollapsibleContent
            id="timeline-filter-content"
            className={cn(
              "overflow-hidden",
              "data-[state=closed]:animate-collapsible-up",
              "data-[state=open]:animate-collapsible-down",
            )}
          >
            <div className="flex flex-wrap gap-2 pt-3">
              <Link
                to={itemReportsTimelineHref({ year: "all" })}
                viewTransition
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                  selectedYear === null
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border bg-background hover:border-primary/40",
                )}
              >
                {ui.common.all}
                <span
                  className={cn(
                    "text-xs",
                    selectedYear === null
                      ? "text-primary-foreground/90"
                      : "text-muted-foreground",
                  )}
                >
                  {totalReports}
                </span>
              </Link>
              {years.map((year) => (
                <Link
                  key={year}
                  to={itemReportsTimelineHref({ year })}
                  viewTransition
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                    selectedYear === year
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border bg-background hover:border-primary/40",
                  )}
                >
                  {formatItemReportsCopy(
                    pickItemReportsUi(locale).filter.date.yearOption,
                    { year },
                  )}
                </Link>
              ))}
            </div>
          </CollapsibleContent>
        </section>
      </Collapsible>

      <section className="border-border bg-card/60 rounded-xl border p-5 md:p-8">
        <ReportTimeline reports={reports} />
      </section>
    </div>
  );
}
