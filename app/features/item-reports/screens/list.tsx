/**
 * Item Reports — List Screen (/item_reports)
 *
 * Filter-first library view. All filters/search state live in the URL so the
 * user can share links, use back/forward, and the page remains loader-driven.
 *
 * Visual hierarchy:
 *   1. Editorial hero with a single `FeaturedReportBlock` (only when no filter
 *      is active and on page 1) — substack-like entry point.
 *   2. Filter rail + sticky sort controls.
 *   3. Responsive card grid with per-category accent.
 *   4. Pagination.
 */
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  GridIcon,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { NexButton } from "~/core/components/nex";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/core/components/ui/select";
import makeServerClient from "~/core/lib/supa-client.server";

import type { Route } from "./+types/list";
import { FeaturedReportBlock } from "../components/featured-report-block";
import { ReportActiveFilters } from "../components/report-active-filters";
import { ReportCard } from "../components/report-card";
import { ReportEmptyState } from "../components/report-empty-state";
import { ReportFilterPanel } from "../components/report-filter-panel";
import { PAGE_SIZE } from "../constants";
import { getFacets, getReports } from "../queries";
import type { ListFilter } from "../types";

export const meta: Route.MetaFunction = () => {
  return [
    { title: `Item Reports | ${import.meta.env.VITE_APP_NAME}` },
    {
      name: "description",
      content: "카테고리·지역·태그별로 정돈된 리포트 라이브러리",
    },
  ];
};

function parseFilter(url: URL): ListFilter {
  const page = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  const sortParam = url.searchParams.get("sort");
  return {
    category: url.searchParams.get("category") ?? undefined,
    reportType: url.searchParams.get("report_type") ?? undefined,
    reportTier: url.searchParams.get("report_tier") ?? undefined,
    region: url.searchParams.get("region") ?? undefined,
    country: url.searchParams.get("country") ?? undefined,
    tag: url.searchParams.get("tag") ?? undefined,
    lang: url.searchParams.get("lang") ?? undefined,
    q: url.searchParams.get("q") ?? undefined,
    sort: sortParam === "oldest" ? "oldest" : "newest",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  const url = new URL(request.url);
  const filter = parseFilter(url);

  const [reports, facets] = await Promise.all([
    getReports(client, filter),
    getFacets(client),
  ]);

  return { reports, facets, filter };
}

function hasActiveFilter(filter: ListFilter): boolean {
  return Boolean(
    filter.category ??
      filter.reportType ??
      filter.reportTier ??
      filter.region ??
      filter.country ??
      filter.tag ??
      filter.lang ??
      filter.q,
  );
}

export default function ItemReportsList({ loaderData }: Route.ComponentProps) {
  const { reports, facets, filter } = loaderData;
  const [params, setParams] = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(reports.total / PAGE_SIZE));

  const showFeatured =
    !hasActiveFilter(filter) && filter.page === 1 && reports.rows.length > 0;
  const featured = showFeatured ? reports.rows[0] : null;
  const gridRows = showFeatured ? reports.rows.slice(1) : reports.rows;

  const updateSort = (value: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === "newest") {
          next.delete("sort");
        } else {
          next.set("sort", value);
        }
        next.delete("page");
        return next;
      },
      { replace: true },
    );
  };

  const buildPageHref = (nextPage: number) => {
    const next = new URLSearchParams(params);
    if (nextPage <= 1) {
      next.delete("page");
    } else {
      next.set("page", String(nextPage));
    }
    const qs = next.toString();
    return qs ? `/item_reports?${qs}` : "/item_reports";
  };

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 pt-2 pb-10 md:px-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-primary text-xs font-medium tracking-wide uppercase">
              Item Reports
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              리포트 라이브러리
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
              카테고리·유형·지역·태그별로 필터링해 읽고 싶은 리포트를 빠르게 찾아보세요.
              모든 필터는 URL에 저장되어 공유와 북마크가 가능합니다.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link to="/item_reports/timeline" viewTransition>
              <NexButton
                variant="secondary"
                size="sm"
                leftIcon={<ClockIcon className="size-4" />}
              >
                Timeline
              </NexButton>
            </Link>
            <Link to="/item_reports/explore" viewTransition>
              <NexButton
                variant="ghost"
                size="sm"
                leftIcon={<GridIcon className="size-4" />}
              >
                Explore
              </NexButton>
            </Link>
          </div>
        </div>
      </header>

      {featured ? <FeaturedReportBlock report={featured} /> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="lg:sticky lg:top-4 lg:self-start">
          <ReportFilterPanel facets={facets} />
        </div>

        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ReportActiveFilters />
            <div className="ml-auto flex items-center gap-3">
              <span className="text-muted-foreground text-xs">
                {reports.total.toLocaleString("ko-KR")}건
              </span>
              <Select
                value={filter.sort ?? "newest"}
                onValueChange={updateSort}
              >
                <SelectTrigger size="sm" className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">최신순</SelectItem>
                  <SelectItem value="oldest">오래된순</SelectItem>
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
                  <ReportCard report={report} />
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 ? (
            <nav
              aria-label="페이지 네비게이션"
              className="mt-4 flex items-center justify-center gap-3"
            >
              <PageLink
                to={buildPageHref(reports.page - 1)}
                disabled={reports.page <= 1}
                ariaLabel="이전 페이지"
              >
                <ChevronLeftIcon className="size-4" />
                이전
              </PageLink>
              <span className="text-muted-foreground text-sm">
                {reports.page} / {totalPages}
              </span>
              <PageLink
                to={buildPageHref(reports.page + 1)}
                disabled={reports.page >= totalPages}
                ariaLabel="다음 페이지"
              >
                다음
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
