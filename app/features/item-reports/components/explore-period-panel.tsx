import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon } from "lucide-react";
import { Link } from "react-router";

import { NexBadge } from "~/core/components/nex";

import {
  formatItemReportsCopy,
  useItemReportsUi,
} from "../i18n";
import type { PeriodMonthFacet, PeriodYearFacet, ReportListItem } from "../types";
import { ExploreFacetLinkCard } from "./explore-facet-link-card";
import { ReportCard } from "./report-card";
import {
  itemReportsExploreHref,
  itemReportsListHref,
} from "../lib/item-reports-urls";
import { REPORT_DATE_PARAM_KEYS } from "../lib/report-date-params";

type ExplorePeriodPanelProps = {
  yearFacets: PeriodYearFacet[];
  selectedYear: number | null;
  monthFacets: PeriodMonthFacet[];
  highlights: ReportListItem[];
};

export function ExplorePeriodPanel({
  yearFacets,
  selectedYear,
  monthFacets,
  highlights,
}: ExplorePeriodPanelProps) {
  const ui = useItemReportsUi();
  const copy = ui.explorePeriod;

  if (yearFacets.length === 0) {
    return <p className="text-muted-foreground text-sm">{copy.empty}</p>;
  }

  if (selectedYear === null) {
    return (
      <div className="space-y-4">
        <TabScopeIntro title={copy.yearTitle} description={copy.yearDescription} />
        <ul
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          role="list"
        >
          {yearFacets.map(({ year, count }) => (
            <li key={year}>
              <ExploreFacetLinkCard
                to={itemReportsExploreHref({
                  [REPORT_DATE_PARAM_KEYS.year]: year,
                })}
                ariaLabel={formatItemReportsCopy(copy.yearExploreAria, { year })}
                icon={<CalendarIcon className="size-4" aria-hidden />}
                title={formatItemReportsCopy(copy.yearLabel, { year })}
                count={count}
                description={copy.yearCardDescription}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={itemReportsExploreHref({})}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
        >
          <ArrowLeftIcon className="size-3.5" aria-hidden />
          {copy.allYears}
        </Link>
        <NexBadge variant="outline" size="sm">
          {formatItemReportsCopy(copy.yearLabel, { year: selectedYear })}
        </NexBadge>
      </div>

      <section className="space-y-4">
        <TabScopeIntro title={copy.monthTitle} description={copy.monthDescription} />
        {monthFacets.length === 0 ? (
          <p className="text-muted-foreground text-sm">{copy.noReportsInYear}</p>
        ) : (
          <ul
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
            role="list"
          >
            {monthFacets.map(({ month, count }) => (
              <li key={month}>
                <ExploreFacetLinkCard
                  to={itemReportsListHref({
                    [REPORT_DATE_PARAM_KEYS.year]: selectedYear,
                    [REPORT_DATE_PARAM_KEYS.month]: month,
                  })}
                  ariaLabel={formatItemReportsCopy(copy.monthListAria, {
                    year: selectedYear,
                    month,
                  })}
                  icon={<CalendarIcon className="size-4" aria-hidden />}
                  title={formatItemReportsCopy(copy.monthLabel, { month })}
                  count={count}
                  description={formatItemReportsCopy(copy.monthCardDescription, {
                    year: selectedYear,
                    month,
                  })}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {highlights.length > 0 ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-base font-semibold tracking-tight md:text-lg">
              {formatItemReportsCopy(copy.recentTitle, { year: selectedYear })}
            </h4>
            <Link
              to={itemReportsListHref({
                [REPORT_DATE_PARAM_KEYS.year]: selectedYear,
              })}
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium"
            >
              {formatItemReportsCopy(copy.yearViewAll, { year: selectedYear })}
              <ArrowRightIcon className="size-3.5" />
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {highlights.map((report, index) => (
              <li
                key={report.id}
                className={index >= 3 ? "max-md:hidden" : undefined}
              >
                <ReportCard report={report} density="compact" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function TabScopeIntro({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="space-y-1">
      <h4 className="text-base font-semibold tracking-tight md:text-lg">
        {title}
      </h4>
      <p className="text-muted-foreground text-sm">{description}</p>
    </header>
  );
}
