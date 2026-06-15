/**
 * Item Reports — Explore Hub (/item_reports/explore)
 */
import {
  ArrowRightIcon,
  CalendarIcon,
  ChevronDownIcon,
  FileTextIcon,
  HashIcon,
  LayoutGridIcon,
  MapPinnedIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router";

import { NexBadge } from "~/core/components/nex";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/core/components/ui/collapsible";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/core/components/ui/tabs";
import i18next from "~/core/lib/i18next.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";

import type { Route } from "./+types/explore";
import { ExploreFacetLinkCard } from "../components/explore-facet-link-card";
import { ExplorePeriodPanel } from "../components/explore-period-panel";
import { ReportCard } from "../components/report-card";
import { REPORT_CATEGORIES } from "../constants";
import {
  formatCount,
  formatItemReportsCopy,
  pickItemReportsUi,
} from "../i18n";
import {
  getRegionCardTitle,
  getRegionExploreIcon,
  getRegionExploreIntro,
} from "../lib/report-region-explore";
import { getReportTypeExploreIcon } from "../lib/report-type-explore";
import { getCategoryStyle } from "../lib/category-style";
import {
  getRegionLabel,
  getReportTypeExploreIntro,
  getReportTypeLabel,
} from "../i18n/labels";
import { itemReportsListHref } from "../lib/item-reports-urls";
import { parseReportYearParam } from "../lib/report-date-params";
import {
  localizeItemContents,
  type LocalizableRow,
} from "../lib/item-content-localization";
import {
  getCategoryHighlights,
  getExplorePeriodMonthFacets,
  getExplorePeriodYearFacets,
  getFacets,
  getPeriodHighlights,
} from "../queries";

const EXPLORE_TAG_CARD_LEADING = 6;

/**
 * Localize category highlight buckets with a single batched i18n lookup:
 * flatten all rows, translate once, then regroup back into their categories.
 */
async function localizeHighlightsByCategory<T extends LocalizableRow>(
  client: Parameters<typeof localizeItemContents<T>>[0],
  byCategory: Record<string, T[]>,
  locale: string,
): Promise<Record<string, T[]>> {
  const flat = Object.values(byCategory).flat();
  if (flat.length === 0) {
    return byCategory;
  }

  const localized = await localizeItemContents(client, flat, locale);
  const byId = new Map(localized.map((row) => [row.id, row]));

  const out: Record<string, T[]> = {};
  for (const [category, rows] of Object.entries(byCategory)) {
    out[category] = rows.map((row) => byId.get(row.id) ?? row);
  }
  return out;
}

export async function loader({ request }: Route.LoaderArgs) {
  const locale = await i18next.getLocale(request);
  const [client] = makeServerClient(request);
  const url = new URL(request.url);
  const periodYear = parseReportYearParam(url.searchParams.get("year"));

  const [facets, yearFacets] = await Promise.all([
    getFacets(client),
    getExplorePeriodYearFacets(client),
  ]);

  const activeCategories = REPORT_CATEGORIES.filter(
    (category) => (facets.categories[category] ?? 0) > 0,
  );

  const validPeriodYear =
    periodYear && yearFacets.some((facet) => facet.year === periodYear)
      ? periodYear
      : null;

  const [rawHighlights, monthFacets, periodHighlights] = await Promise.all([
    getCategoryHighlights(client, {
      categories: activeCategories,
      perCategory: 6,
    }),
    validPeriodYear
      ? getExplorePeriodMonthFacets(client, validPeriodYear)
      : Promise.resolve([]),
    validPeriodYear
      ? getPeriodHighlights(client, { year: validPeriodYear, limit: 6 })
      : Promise.resolve([]),
  ]);

  // Localize every report-bearing result. Category highlights are flattened
  // into a single i18n lookup, then regrouped, to avoid one query per category.
  const localizedPeriodHighlights = await localizeItemContents(
    client,
    periodHighlights,
    locale,
  );
  const highlights = await localizeHighlightsByCategory(
    client,
    rawHighlights,
    locale,
  );

  const ui = pickItemReportsUi(locale);

  return {
    facets,
    highlights,
    activeCategories,
    yearFacets,
    selectedPeriodYear: validPeriodYear,
    monthFacets,
    periodHighlights: localizedPeriodHighlights,
    locale,
    meta: {
      title: ui.explore.metaTitle,
      description: ui.explore.metaDescription,
    },
  };
}

export const meta: Route.MetaFunction = ({ data }) => {
  const title = data?.meta.title ?? "Explore Reports";
  const description = data?.meta.description ?? "";
  return [
    { title: `${title} | ${import.meta.env.VITE_APP_NAME}` },
    { name: "description", content: description },
  ];
};

export default function ItemReportsExplore({
  loaderData,
}: Route.ComponentProps) {
  const {
    facets,
    highlights,
    activeCategories,
    yearFacets,
    selectedPeriodYear,
    monthFacets,
    periodHighlights,
    locale,
  } = loaderData;

  const ui = pickItemReportsUi(locale);
  const exploreTabDefault = selectedPeriodYear ? "period" : "category";

  const topRegions = Object.entries(facets.regions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  const topTypes = Object.entries(facets.reportTypes).sort(
    (a, b) => b[1] - a[1],
  );

  const tagFeatured = facets.topTags.slice(0, EXPLORE_TAG_CARD_LEADING);
  const tagMore = facets.topTags.slice(EXPLORE_TAG_CARD_LEADING);

  return (
    <div className="flex flex-1 flex-col gap-10 px-4 pt-2 pb-16 md:px-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-primary text-xs font-medium tracking-wide uppercase">
            {ui.explore.eyebrow}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            {ui.explore.title}
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
            {ui.explore.subtitle}
          </p>
        </div>
      </header>

      <section className="space-y-6">
        <Tabs
          key={exploreTabDefault}
          defaultValue={exploreTabDefault}
          className="gap-0"
        >
          <div className="border-border overflow-hidden rounded-2xl border bg-card/40 shadow-xs">
            <div className="border-border space-y-4 border-b bg-card/80 px-4 py-5 md:px-6">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight md:text-xl">
                  {ui.explore.criteriaTitle}
                </h2>
                <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
                  {ui.explore.criteriaDescription}
                </p>
              </div>
              <TabsList
                variant="line"
                aria-label={ui.explore.criteriaTabsAria}
                className="flex h-auto min-h-0 w-full max-w-full flex-wrap items-center justify-start gap-x-2 gap-y-2 pb-0.5"
              >
                <TabsTrigger value="category" className="flex-none gap-1.5">
                  <LayoutGridIcon className="size-3.5" aria-hidden />
                  {ui.explore.tabs.category}
                </TabsTrigger>
                <TabsTrigger value="type" className="flex-none gap-1.5">
                  <FileTextIcon className="size-3.5" aria-hidden />
                  {ui.explore.tabs.type}
                </TabsTrigger>
                <TabsTrigger value="region" className="flex-none gap-1.5">
                  <MapPinnedIcon className="size-3.5" aria-hidden />
                  {ui.explore.tabs.region}
                </TabsTrigger>
                <TabsTrigger value="tags" className="flex-none gap-1.5">
                  <HashIcon className="size-3.5" aria-hidden />
                  {ui.explore.tabs.tags}
                </TabsTrigger>
                <TabsTrigger value="period" className="flex-none gap-1.5">
                  <CalendarIcon className="size-3.5" aria-hidden />
                  {ui.explore.tabs.period}
                </TabsTrigger>
              </TabsList>
            </div>

            <div
              className="border-primary/30 bg-muted/15 border-l-[3px] px-4 py-6 md:px-6 md:py-8"
              role="region"
              aria-label={ui.explore.resultsRegionAria}
            >
              <TabsContent value="category" className="mt-0 outline-none">
                <div className="space-y-6">
                  <TabScopeHeading
                    scope={ui.explore.tabs.category}
                    title=""
                    description={ui.explore.categoryDescription}
                  />

                  {activeCategories.length === 0 ? (
                    <ExploreEmptyHint>{ui.explore.noPublicReports}</ExploreEmptyHint>
                  ) : (
                    <div className="flex flex-col gap-10">
                      {activeCategories.map((category) => {
                        const rows = highlights[category] ?? [];
                        if (rows.length === 0) return null;
                        const style = getCategoryStyle(category, locale);
                        const CategoryIcon = style.icon;
                        return (
                          <div key={category} className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <CategoryIcon
                                  className={`size-5 ${style.accentText}`}
                                />
                                <h4 className="text-base font-semibold tracking-tight md:text-lg">
                                  {style.label}
                                </h4>
                                <NexBadge variant="outline" size="sm">
                                  {formatCount(
                                    facets.categories[category] ?? 0,
                                    locale,
                                  )}
                                </NexBadge>
                              </div>
                              <Link
                                to={itemReportsListHref({ category })}
                                className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium"
                              >
                                {ui.common.viewAll}
                                <ArrowRightIcon className="size-3.5" />
                              </Link>
                            </div>
                            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                              {rows.map((report, index) => (
                                <li
                                  key={report.id}
                                  className={index >= 3 ? "max-md:hidden" : undefined}
                                >
                                  <ReportCard
                                    report={report}
                                    density="compact"
                                  />
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="type" className="mt-0 outline-none">
                <TabScopeHeading
                  scope={ui.explore.tabs.type}
                  title={ui.explore.typeTitle}
                  description={ui.explore.typeDescription}
                />
                {topTypes.length === 0 ? (
                  <p className="text-muted-foreground mt-3 text-sm">
                    {ui.explore.insufficientData}
                  </p>
                ) : (
                  <ul
                    className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
                    role="list"
                  >
                    {topTypes.map(([type, count]) => {
                      const label = getReportTypeLabel(type, locale);
                      const TypeIcon = getReportTypeExploreIcon(type);
                      const cardTitle =
                        type === "full-report"
                          ? ui.explore.fullReportTitle
                          : `${label} ${ui.explore.reportTitleSuffix}`;
                      const intro = getReportTypeExploreIntro(type, locale);
                      return (
                        <li key={type}>
                          <ExploreFacetLinkCard
                            to={itemReportsListHref({ report_type: type })}
                            ariaLabel={`${cardTitle} ${ui.explore.typeListAria}`}
                            icon={
                              <TypeIcon className="size-4" aria-hidden />
                            }
                            title={cardTitle}
                            count={count}
                            description={intro}
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </TabsContent>

              <TabsContent value="region" className="mt-0 outline-none">
                <TabScopeHeading
                  scope={ui.explore.tabs.region}
                  title={ui.explore.regionTitle}
                  description={ui.explore.regionDescription}
                />
                {topRegions.length === 0 ? (
                  <p className="text-muted-foreground mt-3 text-sm">
                    {ui.explore.noRegionData}
                  </p>
                ) : (
                  <ul
                    className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
                    role="list"
                  >
                    {topRegions.map(([region, count]) => {
                      const label = getRegionLabel(region, locale);
                      const RegionIcon = getRegionExploreIcon(region);
                      const cardTitle = getRegionCardTitle(region, label, locale);
                      const intro = getRegionExploreIntro(region, locale);
                      return (
                        <li key={region}>
                          <ExploreFacetLinkCard
                            to={itemReportsListHref({ region })}
                            ariaLabel={`${cardTitle} ${ui.explore.regionListAria}`}
                            icon={
                              <RegionIcon className="size-4" aria-hidden />
                            }
                            title={cardTitle}
                            count={count}
                            description={intro}
                          />
                        </li>
                      );
                    })}
                  </ul>
                )}
              </TabsContent>

              <TabsContent value="period" className="mt-0 outline-none">
                <div className="space-y-6">
                  <TabScopeHeading
                    scope={ui.explore.tabs.period}
                    title={
                      selectedPeriodYear
                        ? formatItemReportsCopy(ui.explore.periodYearSelected, {
                            year: selectedPeriodYear,
                          })
                        : ui.explore.periodYearTitle
                    }
                    description={ui.explore.periodDescription}
                  />
                  <ExplorePeriodPanel
                    yearFacets={yearFacets}
                    selectedYear={selectedPeriodYear}
                    monthFacets={monthFacets}
                    highlights={periodHighlights}
                  />
                </div>
              </TabsContent>

              <TabsContent value="tags" className="mt-0 space-y-4 outline-none">
                <TabScopeHeading
                  scope={ui.explore.tabs.tags}
                  title={ui.explore.tagsTitle}
                  description={ui.explore.tagsDescription}
                />
                {facets.topTags.length === 0 ? (
                  <ExploreEmptyHint>{ui.explore.noTags}</ExploreEmptyHint>
                ) : (
                  <div className="space-y-8">
                    <section
                      className="space-y-3"
                      aria-labelledby="explore-tags-featured-heading"
                    >
                      <div>
                        <h4
                          id="explore-tags-featured-heading"
                          className="text-foreground text-sm font-semibold tracking-tight"
                        >
                          {ui.explore.popularTags}
                        </h4>
                        <p className="text-muted-foreground mt-0.5 text-xs">
                          {formatItemReportsCopy(ui.explore.popularTagsHint, {
                            count: tagFeatured.length,
                          })}
                        </p>
                      </div>
                      <ul
                        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
                        role="list"
                      >
                        {tagFeatured.map(({ tag, count }) => (
                          <li key={tag}>
                            <ExploreFacetLinkCard
                              to={itemReportsListHref({ tag })}
                              ariaLabel={`#${tag} ${ui.explore.tagListAria}`}
                              variant="tag"
                              icon={
                                <HashIcon className="size-4" aria-hidden />
                              }
                              title={`#${tag}`}
                              count={count}
                              description={ui.explore.tagCardDescription}
                            />
                          </li>
                        ))}
                      </ul>
                    </section>

                    {tagMore.length > 0 ? (
                      <Collapsible
                        defaultOpen={false}
                        className="group/more-tags"
                      >
                        <CollapsibleTrigger
                          type="button"
                          className={cn(
                            "border-border bg-muted/20 hover:bg-muted/40 flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                            "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                          )}
                          aria-label={formatItemReportsCopy(
                            ui.explore.moreTagsToggleAria,
                            { count: tagMore.length },
                          )}
                        >
                          <span>
                            <span className="text-foreground font-medium">
                              {ui.explore.moreTags}
                            </span>
                            <span className="text-muted-foreground ml-1.5 font-normal">
                              {formatItemReportsCopy(ui.explore.moreTagsCount, {
                                count: tagMore.length,
                              })}
                            </span>
                          </span>
                          <ChevronDownIcon
                            className="text-muted-foreground size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/more-tags:rotate-180"
                            aria-hidden
                          />
                        </CollapsibleTrigger>
                        <CollapsibleContent
                          className={cn(
                            "overflow-hidden",
                            "data-[state=closed]:animate-collapsible-up",
                            "data-[state=open]:animate-collapsible-down",
                          )}
                        >
                          <div className="border-border/60 flex flex-wrap gap-2 border-t pt-4">
                            {tagMore.map(({ tag, count }) => (
                              <Link
                                key={tag}
                                to={itemReportsListHref({ tag })}
                                className="bg-muted/60 hover:bg-muted inline-flex max-w-full min-w-0 items-center gap-2 rounded-full px-3 py-1 text-sm transition-colors"
                              >
                                <span className="truncate">#{tag}</span>
                                <span className="text-muted-foreground shrink-0 text-xs">
                                  {count}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ) : null}
                  </div>
                )}
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </section>
    </div>
  );
}

function ExploreEmptyHint({ children }: { children: ReactNode }) {
  return (
    <div className="border-border text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
      {children}
    </div>
  );
}

function TabScopeHeading({
  scope,
  title,
  description,
}: {
  scope: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="space-y-1.5 pb-1">
      <p className="text-primary text-xs font-semibold tracking-wider uppercase">
        {scope}
      </p>
      <h3 className="text-base font-semibold tracking-tight md:text-lg">
        {title}
      </h3>
      {description ? (
        <p className="text-muted-foreground text-sm">{description}</p>
      ) : null}
    </header>
  );
}
