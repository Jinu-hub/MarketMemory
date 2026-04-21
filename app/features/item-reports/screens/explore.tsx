/**
 * Item Reports — Explore Hub (/item_reports/explore)
 *
 * Editorial discovery page combining:
 *  - Featured hero (most-recent report) promoted via `FeaturedReportBlock`
 *  - Two-column region: category highlight grid + compact `ReportTimeline`
 *  - Supporting facet rails (report types, regions, popular tags)
 *
 * Goal: feel like a content hub (Substack + Obsidian), not a dashboard.
 */
import { ArrowRightIcon, ClockIcon, SparklesIcon } from "lucide-react";
import { Link } from "react-router";

import { NexBadge } from "~/core/components/nex";
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

  const featured = recent[0] ?? null;
  const timelineRows = recent.slice(1, 8);

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

      {featured ? <FeaturedReportBlock report={featured} /> : null}

      {timelineRows.length > 0 ? (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight md:text-xl">
                  카테고리별 하이라이트
                </h2>
                <p className="text-muted-foreground text-sm">
                  카테고리마다 가장 최근의 대표 리포트를 모았습니다.
                </p>
              </div>
            </div>

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
                          <h3 className="text-base font-semibold tracking-tight md:text-lg">
                            {REPORT_CATEGORY_LABELS_KO[category]}
                          </h3>
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

          <aside className="border-border bg-card/60 h-fit rounded-xl border p-5 lg:sticky lg:top-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClockIcon className="text-muted-foreground size-4" />
                <h2 className="text-sm font-semibold tracking-tight">
                  최근 연대기
                </h2>
              </div>
              <Link
                to="/item_reports/timeline"
                viewTransition
                className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs font-medium"
              >
                전체
                <ArrowRightIcon className="size-3" />
              </Link>
            </div>
            <ReportTimeline reports={timelineRows} compact />
          </aside>
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FacetPanel title="리포트 유형" description="작성 포맷으로 고르기">
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

        <FacetPanel title="주요 지역" description="국가/권역 기준 탐색">
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
                    {REPORT_REGION_LABELS_KO[region as ReportRegion] ?? region}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {count}
                  </span>
                </Link>
              ))
            )}
          </div>
        </FacetPanel>
      </section>

      {facets.topTags.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight md:text-xl">
                자주 등장하는 태그
              </h2>
              <p className="text-muted-foreground text-sm">
                특정 주제·키워드로 빠르게 진입하세요.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {facets.topTags.map(({ tag, count }) => (
              <Link
                key={tag}
                to={`/item_reports?tag=${encodeURIComponent(tag)}`}
                className="bg-muted/60 hover:bg-muted inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm transition-colors"
              >
                <span>#{tag}</span>
                <span className="text-muted-foreground text-xs">{count}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function FacetPanel({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border bg-card/60 space-y-3 rounded-xl border p-5">
      <div>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-muted-foreground text-xs">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function EmptyFacet({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground text-sm">{children}</p>;
}
