/**
 * Item Reports — Explore Hub (/item_reports/explore)
 *
 * Editorial discovery page combining:
 *  - Featured hero (most-recent report) promoted via `FeaturedReportBlock`
 *  - Collapsible recent-report timeline below hero
 *  - Tab shell: controls on top strip; results in left-accent panel (scope heading)
 *
 * Goal: feel like a content hub (Substack + Obsidian), not a dashboard.
 */
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ClockIcon,
  FileTextIcon,
  HashIcon,
  LayoutGridIcon,
  MapPinnedIcon,
  SparklesIcon,
} from "lucide-react";
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
import { cn } from "~/core/lib/utils";
import makeServerClient from "~/core/lib/supa-client.server";

import type { Route } from "./+types/explore";
import { FeaturedReportBlock } from "../components/featured-report-block";
import { ReportCard } from "../components/report-card";
import { ReportTimeline } from "../components/report-timeline";
import {
  REPORT_CATEGORIES,
  REPORT_CATEGORY_LABELS_KO,
  REPORT_REGION_LABELS_KO,
  REPORT_TYPE_LABELS_KO,
  type ReportRegion,
  type ReportType,
} from "../constants";
import { getCategoryStyle } from "../lib/category-style";
import {
  getCategoryHighlights,
  getFacets,
  getRecentReports,
} from "../queries";

export const meta: Route.MetaFunction = () => {
  return [
    { title: `Explore Reports | ${import.meta.env.VITE_APP_NAME}` },
    {
      name: "description",
      content: "카테고리, 태그, 지역별 리포트 탐색 허브",
    },
  ];
};

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  const facets = await getFacets(client);

  const activeCategories = REPORT_CATEGORIES.filter(
    (category) => (facets.categories[category] ?? 0) > 0,
  );

  const [highlights, recent] = await Promise.all([
    getCategoryHighlights(client, {
      categories: activeCategories,
      perCategory: 3,
    }),
    getRecentReports(client, 10),
  ]);

  return { facets, highlights, activeCategories, recent };
}

export default function ItemReportsExplore({
  loaderData,
}: Route.ComponentProps) {
  const { facets, highlights, activeCategories, recent } = loaderData;

  //const featured = recent[0] ?? null;
  const timelineRows = recent.slice(0, 7);

  const topRegions = Object.entries(facets.regions)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  const topTypes = Object.entries(facets.reportTypes).sort(
    (a, b) => b[1] - a[1],
  );

  return (
    <div className="flex flex-1 flex-col gap-10 px-4 pt-2 pb-16 md:px-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-primary text-xs font-medium tracking-wide uppercase">
            Explore
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            리포트 탐색
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
            관심 있는 주제부터 시작해 보세요. 카테고리, 태그, 지역별로 주요 리포트를
            한 눈에 둘러볼 수 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NexBadge variant="secondary" size="sm">
            <SparklesIcon className="mr-1 size-3" />
            최근 업데이트
          </NexBadge>
        </div>
      </header>
      {/* Featured Report Block 
      {featured ? <FeaturedReportBlock report={featured} /> : null}
      */}
      {timelineRows.length > 0 ? (
        <Collapsible defaultOpen className="group/collapsible">
          <section
            className="border-border bg-card/60 rounded-xl border p-5"
            aria-labelledby="explore-recent-timeline-heading"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <CollapsibleTrigger
                type="button"
                className={cn(
                  "hover:bg-muted/50 -mx-2 -my-1 flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1 text-left transition-colors",
                  "focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
                )}
                aria-controls="explore-recent-timeline-panel"
              >
                <ChevronDownIcon
                  className="text-muted-foreground size-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180"
                  aria-hidden
                />
                <ClockIcon className="text-muted-foreground size-4 shrink-0" aria-hidden />
                <h2
                  id="explore-recent-timeline-heading"
                  className="text-base font-semibold tracking-tight"
                >
                  최근 리포트
                </h2>
                <NexBadge variant="outline" size="sm" className="shrink-0">
                  {timelineRows.length}건
                </NexBadge>
              </CollapsibleTrigger>
              <Link
                to="/item_reports/timeline"
                viewTransition
                className="text-primary hover:text-primary/80 inline-flex shrink-0 items-center gap-1 pt-1 text-xs font-medium"
              >
                전체
                <ArrowRightIcon className="size-3" />
              </Link>
            </div>
            <CollapsibleContent
              id="explore-recent-timeline-panel"
              className={cn(
                "overflow-hidden",
                "data-[state=closed]:animate-collapsible-up",
                "data-[state=open]:animate-collapsible-down",
              )}
            >
              <div className="pt-4">
                <ReportTimeline
                  reports={timelineRows}
                  compact
                  showGroupCounts={false}
                />
              </div>
            </CollapsibleContent>
          </section>
        </Collapsible>
      ) : null}

      <section className="space-y-6">
        <Tabs defaultValue="category" className="gap-0">
          <div className="border-border overflow-hidden rounded-2xl border bg-card/40 shadow-xs">
            <div className="border-border space-y-4 border-b bg-card/80 px-4 py-5 md:px-6">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight md:text-xl">
                  탐색 기준
                </h2>
                <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
                  탭은 상위 기준이고, 아래 영역은 선택한 기준에 속한 결과입니다.
                </p>
              </div>
              <TabsList
                variant="line"
                aria-label="리포트 탐색 기준"
                className="flex h-auto min-h-0 w-full max-w-full flex-wrap items-center justify-start gap-x-2 gap-y-2 pb-0.5"
              >
                <TabsTrigger value="category" className="flex-none gap-1.5">
                  <LayoutGridIcon className="size-3.5" aria-hidden />
                  카테고리별
                </TabsTrigger>
                <TabsTrigger value="type" className="flex-none gap-1.5">
                  <FileTextIcon className="size-3.5" aria-hidden />
                  리포트 유형별
                </TabsTrigger>
                <TabsTrigger value="region" className="flex-none gap-1.5">
                  <MapPinnedIcon className="size-3.5" aria-hidden />
                  지역별
                </TabsTrigger>
                <TabsTrigger value="tags" className="flex-none gap-1.5">
                  <HashIcon className="size-3.5" aria-hidden />
                  태그별
                </TabsTrigger>
              </TabsList>
            </div>

            <div
              className="border-primary/30 bg-muted/15 border-l-[3px] px-4 py-6 md:px-6 md:py-8"
              role="region"
              aria-label="선택한 탐색 기준에 대한 결과"
            >
              <TabsContent value="category" className="mt-0 outline-none">
                <div className="space-y-6">
                  <TabScopeHeading
                    scope="카테고리별"
                    title="하이라이트"
                    description="카테고리마다 가장 최근의 대표 리포트를 모았습니다."
                  />

                  {activeCategories.length === 0 ? (
                    <div className="border-border text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
                      아직 공개된 리포트가 없습니다.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-10">
                      {activeCategories.map((category) => {
                        const rows = highlights[category] ?? [];
                        if (rows.length === 0) return null;
                        const style = getCategoryStyle(category);
                        const CategoryIcon = style.icon;
                        return (
                          <div key={category} className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <CategoryIcon
                                  className={`size-5 ${style.accentText}`}
                                />
                                <h4 className="text-base font-semibold tracking-tight md:text-lg">
                                  {REPORT_CATEGORY_LABELS_KO[category]}
                                </h4>
                                <NexBadge variant="outline" size="sm">
                                  {facets.categories[category] ?? 0}건
                                </NexBadge>
                              </div>
                              <Link
                                to={`/item_reports?category=${category}`}
                                className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium"
                              >
                                전체 보기
                                <ArrowRightIcon className="size-3.5" />
                              </Link>
                            </div>
                            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-2">
                              {rows.map((report) => (
                                <li key={report.id}>
                                  <ReportCard report={report} />
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
                  scope="리포트 유형별"
                  title="포맷별 바로가기"
                  description="작성 포맷에 따라 목록으로 이동합니다."
                />
                <FacetPanel embedded hideHeader>
                  <div className="flex flex-wrap gap-2">
                    {topTypes.length === 0 ? (
                      <EmptyFacet>데이터가 아직 부족합니다.</EmptyFacet>
                    ) : (
                      topTypes.map(([type, count]) => (
                        <Link
                          key={type}
                          to={`/item_reports?report_type=${type}`}
                          className="border-border hover:border-primary/40 bg-background inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors"
                        >
                          <span className="font-medium">
                            {REPORT_TYPE_LABELS_KO[type as ReportType] ?? type}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {count}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                </FacetPanel>
              </TabsContent>

              <TabsContent value="region" className="mt-0 outline-none">
                <TabScopeHeading
                  scope="지역별"
                  title="권역별 바로가기"
                  description="국가·권역 기준으로 목록을 엽니다."
                />
                <FacetPanel embedded hideHeader>
                  <div className="flex flex-wrap gap-2">
                    {topRegions.length === 0 ? (
                      <EmptyFacet>등록된 지역 데이터가 없습니다.</EmptyFacet>
                    ) : (
                      topRegions.map(([region, count]) => (
                        <Link
                          key={region}
                          to={`/item_reports?region=${region}`}
                          className="border-border hover:border-primary/40 bg-background inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors"
                        >
                          <span className="font-medium">
                            {REPORT_REGION_LABELS_KO[region as ReportRegion] ??
                              region}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {count}
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                </FacetPanel>
              </TabsContent>

              <TabsContent value="tags" className="mt-0 space-y-4 outline-none">
                <TabScopeHeading
                  scope="태그별"
                  title="자주 등장하는 태그"
                  description="특정 주제·키워드로 빠르게 진입하세요."
                />
                {facets.topTags.length === 0 ? (
                  <div className="border-border text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
                    아직 수집된 태그가 없습니다.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {facets.topTags.map(({ tag, count }) => (
                      <Link
                        key={tag}
                        to={`/item_reports?tag=${encodeURIComponent(tag)}`}
                        className="bg-muted/60 hover:bg-muted inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm transition-colors"
                      >
                        <span>#{tag}</span>
                        <span className="text-muted-foreground text-xs">
                          {count}
                        </span>
                      </Link>
                    ))}
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

function FacetPanel({
  title,
  description,
  children,
  embedded = false,
  hideHeader = false,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  embedded?: boolean;
  hideHeader?: boolean;
}) {
  return (
    <div
      className={cn(
        "space-y-3",
        embedded
          ? "border-border/70 bg-background/40 mt-3 rounded-lg border p-4"
          : "border-border bg-card/60 rounded-xl border p-5",
      )}
    >
      {!hideHeader && title ? (
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="text-muted-foreground text-xs">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

function EmptyFacet({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground text-sm">{children}</p>;
}
