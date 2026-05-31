/**
 * Weekly AI Issue Digest — Series Landing (/weekly-ai-issue-digest)
 *
 * A Substack-like series home: an editorial masthead describing the series,
 * the latest episode promoted as a hero, then the back-catalogue rendered as
 * either a card grid or a chronological timeline. Reports are scoped to
 * `report_series.slug = weekly-ai-issues`.
 *
 * View, sort + page state all live in the URL so links are shareable:
 *   - default (no `view` param) → full run grouped by month (timeline)
 *   - `?view=card`              → paginated card grid + featured hero
 */
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  LayoutGridIcon,
  NewspaperIcon,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";

import { NexBadge } from "~/core/components/nex";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/core/components/ui/select";
import { cn } from "~/core/lib/utils";
import { FeaturedReportBlock } from "~/features/item-reports/components/featured-report-block";
import { ReportCard } from "~/features/item-reports/components/report-card";
import { ReportEmptyState } from "~/features/item-reports/components/report-empty-state";
import { ReportTimeline } from "~/features/item-reports/components/report-timeline";

import type { Route } from "./+types/list";
import {
  PAGE_SIZE,
  WEEKLY_AI_ISSUES_FALLBACK_DESCRIPTION,
  WEEKLY_AI_ISSUES_FALLBACK_TITLE,
  WEEKLY_AI_ISSUES_SLUG,
} from "../constants";
import {
  getAllSeriesReports,
  getSeriesBySlug,
  getSeriesReports,
} from "../queries";
import { weeklyDigestDetailHref, weeklyDigestListPath } from "../lib/urls";

type DigestView = "card" | "timeline";

export const meta: Route.MetaFunction = ({ data }) => {
  const title = data?.series?.title ?? WEEKLY_AI_ISSUES_FALLBACK_TITLE;
  const description =
    data?.series?.description ?? WEEKLY_AI_ISSUES_FALLBACK_DESCRIPTION;
  return [
    { title: `${title} | ${import.meta.env.VITE_APP_NAME}` },
    { name: "description", content: description },
  ];
};

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const view: DigestView =
    url.searchParams.get("view") === "card" ? "card" : "timeline";
  const pageParam = Number.parseInt(url.searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const sort = url.searchParams.get("sort") === "oldest" ? "oldest" : "newest";

  const series = await getSeriesBySlug(WEEKLY_AI_ISSUES_SLUG);

  // No series row yet → render an empty-but-valid landing instead of 404,
  // so the surface exists the moment content starts flowing in.
  if (!series) {
    return {
      series,
      view,
      sort,
      reports: { rows: [], total: 0, page, pageSize: PAGE_SIZE },
      timelineReports: [],
    };
  }

  // Timeline shows the full run grouped by month, so we skip pagination and
  // fetch everything (bounded) instead.
  if (view === "timeline") {
    const timelineReports = await getAllSeriesReports({
      seriesId: series.id,
      sort,
    });
    return {
      series,
      view,
      sort,
      reports: {
        rows: [],
        total: timelineReports.length,
        page: 1,
        pageSize: PAGE_SIZE,
      },
      timelineReports,
    };
  }

  const reports = await getSeriesReports({ seriesId: series.id, page, sort });
  return { series, view, sort, reports, timelineReports: [] };
}

export default function WeeklyDigestList({ loaderData }: Route.ComponentProps) {
  const { series, reports, sort, view, timelineReports } = loaderData;
  const [params, setParams] = useSearchParams();

  const isTimeline = view === "timeline";
  const title = series?.title ?? WEEKLY_AI_ISSUES_FALLBACK_TITLE;
  const description = series?.description ?? WEEKLY_AI_ISSUES_FALLBACK_DESCRIPTION;
  const totalPages = Math.max(1, Math.ceil(reports.total / PAGE_SIZE));

  // Promote the most recent episode as a hero only in the card view, on the
  // first page, in the default (newest-first) ordering — otherwise the
  // "featured" framing lies. The timeline view is inherently chronological so
  // it never pulls an episode out as a hero.
  const showFeatured =
    !isTimeline &&
    sort === "newest" &&
    reports.page === 1 &&
    reports.rows.length > 0;
  const featured = showFeatured ? reports.rows[0] : null;
  const gridRows = showFeatured ? reports.rows.slice(1) : reports.rows;

  const updateSort = (value: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === "newest") next.delete("sort");
        else next.set("sort", value);
        next.delete("page");
        return next;
      },
      { replace: true },
    );
  };

  const buildPageHref = (nextPage: number) => {
    const next = new URLSearchParams(params);
    if (nextPage <= 1) next.delete("page");
    else next.set("page", String(nextPage));
    return weeklyDigestListPath(next.toString());
  };

  const buildViewHref = (nextView: DigestView) => {
    const next = new URLSearchParams(params);
    if (nextView === "timeline") next.delete("view");
    else next.set("view", "card");
    next.delete("page");
    return weeklyDigestListPath(next.toString());
  };

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 pt-2 pb-10 md:px-8">
      <header className="border-border bg-card relative overflow-hidden rounded-2xl border">
        <div className="bg-primary/80 absolute inset-x-0 top-0 h-1" />
        <div className="flex flex-col gap-4 px-6 py-8 md:px-10 md:py-10">
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary inline-flex size-9 items-center justify-center rounded-lg">
              <NewspaperIcon className="size-5" />
            </span>
            <NexBadge variant="secondary" size="sm">
              Series
            </NexBadge>
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
              {title}
            </h1>
            <p className="text-muted-foreground max-w-4xl text-sm leading-relaxed md:text-base">
              {description}
            </p>
          </div>
        </div>

        {/* Header footer bar: episode count + view/sort controls. */}
        <div className="border-border/60 flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4 md:px-10">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <span className="text-foreground font-semibold">
              {reports.total.toLocaleString("ko-KR")}
            </span>
            개 회차
          </div>
          <div className="flex items-center gap-2">
            <ViewToggle
              view={view}
              cardHref={buildViewHref("card")}
              timelineHref={buildViewHref("timeline")}
            />
            {/* Timeline is inherently newest-first chronological, so the
                explicit sort control only applies to the card view. */}
            {isTimeline ? null : (
              <Select value={sort} onValueChange={updateSort}>
                <SelectTrigger size="sm" className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">최신순</SelectItem>
                  <SelectItem value="oldest">오래된순</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </header>

      {featured ? (
        <FeaturedReportBlock
          report={featured}
          detailHref={weeklyDigestDetailHref}
          footnote="이 시리즈의 가장 최근 회차입니다."
        />
      ) : null}

      <section className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold tracking-tight">
            {showFeatured ? "지난 회차" : "전체 회차"}
          </h2>
        </div>

        {isTimeline ? (
          timelineReports.length === 0 ? (
            <ReportEmptyState />
          ) : (
            <ReportTimeline
              reports={timelineReports}
              detailHref={weeklyDigestDetailHref}
              showGroupCounts
            />
          )
        ) : (
          <>
            {reports.rows.length === 0 ? (
              <ReportEmptyState />
            ) : gridRows.length === 0 ? null : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {gridRows.map((report) => (
                  <li key={report.id}>
                    <ReportCard
                      report={report}
                      detailHref={weeklyDigestDetailHref}
                    />
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
          </>
        )}
      </section>
    </div>
  );
}

/**
 * Segmented card/timeline switch. URL-driven (Link) so the chosen view is
 * shareable and survives back/forward, consistent with sort + page state.
 */
function ViewToggle({
  view,
  cardHref,
  timelineHref,
}: {
  view: DigestView;
  cardHref: string;
  timelineHref: string;
}) {
  const items: Array<{
    value: DigestView;
    href: string;
    label: string;
    icon: typeof LayoutGridIcon;
  }> = [
    { value: "timeline", href: timelineHref, label: "타임라인", icon: ClockIcon },
    { value: "card", href: cardHref, label: "카드", icon: LayoutGridIcon },
  ];

  return (
    <div
      role="group"
      aria-label="보기 전환"
      className="border-border bg-muted/50 inline-flex items-center gap-0.5 rounded-md border p-0.5"
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = view === item.value;
        return (
          <Link
            key={item.value}
            to={item.href}
            replace
            aria-current={active ? "true" : undefined}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-sm font-medium transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}
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
      className="border-border hover:border-primary/40 hover:bg-accent inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm transition-colors"
    >
      {children}
    </Link>
  );
}
