/**
 * Item Reports — List Screen (/item_reports)
 */
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  GridIcon,
} from "lucide-react";
import { Link } from "react-router";

import { NexButton } from "~/core/components/nex";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/core/components/ui/select";
import i18next from "~/core/lib/i18next.server";
import makeServerClient from "~/core/lib/supa-client.server";

import type { Route } from "./+types/list";
import { FeaturedReportBlock } from "../components/featured-report-block";
import { ReportActiveFilters } from "../components/report-active-filters";
import { ReportCard } from "../components/report-card";
import { ReportEmptyState } from "../components/report-empty-state";
import { ReportFilterPanel } from "../components/report-filter-panel";
import { PAGE_SIZE } from "../constants";
import { pickItemReportsUi, formatCount } from "../i18n";
import { itemReportsListPath } from "../lib/item-reports-urls";
import { buildItemReportsListLinkState } from "../lib/list-navigation-state";
import { hasActiveListFilter } from "../lib/list-filter-active";
import { parseListFilter } from "../lib/parse-list-filter";
import { useItemReportsSearchParams } from "../lib/use-item-reports-search-params";
import { localizeItemContents } from "../lib/item-content-localization";
import {
  getExplorePeriodYearFacets,
  getFacets,
  getReports,
} from "../queries";

export async function loader({ request }: Route.LoaderArgs) {
  const locale = await i18next.getLocale(request);
  const [client] = makeServerClient(request);
  const url = new URL(request.url);
  const filter = parseListFilter(url);

  const [reports, facets, yearFacets] = await Promise.all([
    getReports(client, filter),
    getFacets(client),
    getExplorePeriodYearFacets(client),
  ]);

  reports.rows = await localizeItemContents(client, reports.rows, locale);

  const availableYears = yearFacets.map((facet) => facet.year);
  const ui = pickItemReportsUi(locale);

  return {
    reports,
    facets,
    filter,
    availableYears,
    locale,
    meta: {
      title: ui.list.metaTitle,
      description: ui.list.metaDescription,
    },
  };
}

export const meta: Route.MetaFunction = ({ data }) => {
  const title = data?.meta.title ?? "Item Reports";
  const description = data?.meta.description ?? "";
  return [
    { title: `${title} | ${import.meta.env.VITE_APP_NAME}` },
    { name: "description", content: description },
  ];
};

export default function ItemReportsList({ loaderData }: Route.ComponentProps) {
  const { reports, facets, filter, availableYears, locale } = loaderData;
  const ui = pickItemReportsUi(locale);
  const { searchParams, setSortParam } = useItemReportsSearchParams();
  const listLinkState = buildItemReportsListLinkState(searchParams);
  const totalPages = Math.max(1, Math.ceil(reports.total / PAGE_SIZE));

  const showFeatured =
    !hasActiveListFilter(filter) && filter.page === 1 && reports.rows.length > 0;
  const featured = showFeatured ? reports.rows[0] : null;
  const gridRows = showFeatured ? reports.rows.slice(1) : reports.rows;

  const updateSort = (value: string) => {
    setSortParam(value === "oldest" ? "oldest" : "newest");
  };

  const buildPageHref = (nextPage: number) => {
    const next = new URLSearchParams(searchParams);
    if (nextPage <= 1) {
      next.delete("page");
    } else {
      next.set("page", String(nextPage));
    }
    return itemReportsListPath(next.toString());
  };

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 pt-2 pb-10 md:px-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-primary text-xs font-medium tracking-wide uppercase">
              {ui.list.eyebrow}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              {ui.list.title}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-5xl text-sm leading-relaxed whitespace-pre-line md:text-base">
              {ui.list.subtitle}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link to="/item_reports/timeline" viewTransition>
              <NexButton
                className="cursor-pointer"
                variant="secondary"
                size="sm"
                leftIcon={<ClockIcon className="size-4" />}
              >
                {ui.common.timeline}
              </NexButton>
            </Link>
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
          </div>
        </div>
      </header>

      {featured ? (
        <FeaturedReportBlock report={featured} listLinkState={listLinkState} />
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="lg:sticky lg:top-4 lg:self-start">
          <ReportFilterPanel facets={facets} availableYears={availableYears} />
        </div>

        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ReportActiveFilters />
            <div className="ml-auto flex items-center gap-3">
              <span className="text-muted-foreground text-xs">
                {formatCount(reports.total, locale)}
              </span>
              <Select
                value={filter.sort ?? "newest"}
                onValueChange={updateSort}
              >
                <SelectTrigger size="sm" className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">{ui.list.sortNewest}</SelectItem>
                  <SelectItem value="oldest">{ui.list.sortOldest}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {reports.rows.length === 0 ? (
            <ReportEmptyState />
          ) : gridRows.length === 0 ? null : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {gridRows.map((report) => (
                <li key={report.id}>
                  <ReportCard report={report} listLinkState={listLinkState} />
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 ? (
            <nav
              aria-label={ui.list.paginationAria}
              className="mt-4 flex items-center justify-center gap-3"
            >
              <PageLink
                to={buildPageHref(reports.page - 1)}
                disabled={reports.page <= 1}
                ariaLabel={ui.list.previousPageAria}
              >
                <ChevronLeftIcon className="size-4" />
                {ui.common.previous}
              </PageLink>
              <span className="text-muted-foreground text-sm">
                {reports.page} / {totalPages}
              </span>
              <PageLink
                to={buildPageHref(reports.page + 1)}
                disabled={reports.page >= totalPages}
                ariaLabel={ui.list.nextPageAria}
              >
                {ui.common.next}
                <ChevronRightIcon className="size-4" />
              </PageLink>
            </nav>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function PageLink({
  to,
  disabled,
  children,
  ariaLabel,
}: {
  to: string;
  disabled?: boolean;
  children: React.ReactNode;
  ariaLabel: string;
}) {
  if (disabled) {
    return (
      <span
        className="border-border text-muted-foreground inline-flex cursor-not-allowed items-center gap-1 rounded-md border px-3 py-1.5 text-sm opacity-50"
        aria-disabled
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      to={to}
      aria-label={ariaLabel}
      preventScrollReset={false}
      className="border-border hover:border-primary/40 hover:bg-accent inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm transition-colors"
    >
      {children}
    </Link>
  );
}
