/**
 * Item Reports — Timeline View (/item_reports/timeline)
 *
 * A chronological, narrative-first view of recently published reports.
 * Each entry is grouped by month and rendered through the `ReportTimeline`
 * component so users can track how the research story evolves over time.
 */
import { ArrowLeftIcon, ChevronDownIcon, ClockIcon } from "lucide-react";
import { Link } from "react-router";

import { NexBadge, NexButton } from "~/core/components/nex";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/core/components/ui/collapsible";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";

import type { Route } from "./+types/timeline";
import { ReportTimeline } from "../components/report-timeline";
import { getRecentReports } from "../queries";

function resolveReportYear(rawDate?: string | null): number | null {
  if (!rawDate) return null;
  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return null;
  return date.getFullYear();
}

export const meta: Route.MetaFunction = () => {
  return [
    { title: `Reports Timeline | ${import.meta.env.VITE_APP_NAME}` },
    {
      name: "description",
      content: "월별 리포트 연대기 — 최근 발행된 리서치를 시간순으로 확인하세요.",
    },
  ];
};

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const yearParam = url.searchParams.get("year");
  const [client] = makeServerClient(request);
  const reports = await getRecentReports(client, 60);

  const years = Array.from(
    new Set(
      reports
        .map((report) =>
          resolveReportYear(report.input_date ?? report.created_at),
        )
        .filter((year): year is number => year !== null),
    ),
  ).sort((a, b) => b - a);

  const parsedYear = yearParam ? Number.parseInt(yearParam, 10) : NaN;
  const selectedYear =
    Number.isFinite(parsedYear) && years.includes(parsedYear)
      ? parsedYear
      : null;

  const filteredReports =
    selectedYear === null
      ? reports
      : reports.filter((report) => {
          const year = resolveReportYear(report.input_date ?? report.created_at);
          return year === selectedYear;
        });

  return {
    reports: filteredReports,
    totalReports: reports.length,
    years,
    selectedYear,
  };
}

export default function ItemReportsTimeline({
  loaderData,
}: Route.ComponentProps) {
  const { reports, totalReports, years, selectedYear } = loaderData;

  return (
    <div className="flex flex-1 flex-col gap-8 px-4 pt-2 pb-16 md:px-8">
      <nav className="flex items-center justify-between">
        <Link
          to="/item_reports"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          라이브러리
        </Link>
        <Link to="/item_reports/explore" viewTransition>
          <NexButton variant="ghost" size="sm">
            Explore
          </NexButton>
        </Link>
      </nav>

      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <NexBadge variant="secondary" size="sm">
            <ClockIcon className="mr-1 size-3" />
            Timeline
          </NexBadge>
          <span className="text-muted-foreground text-xs">
            {selectedYear
              ? `${selectedYear}년 ${reports.length.toLocaleString("ko-KR")}건`
              : `총 ${reports.length.toLocaleString("ko-KR")}건`}
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          리포트 연대기
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
          월별로 정돈된 최근 리포트를 확인하세요. 각 항목의 색상은 카테고리를
          의미합니다 — 시장, 트렌드, 이슈 흐름의 변화를 한눈에 추적할 수 있어요.
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
              <h2 className="text-sm font-semibold tracking-tight">필터링</h2>
              <span className="text-muted-foreground text-xs">
                전체 및 연도별 보기
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
                to="/item_reports/timeline"
                viewTransition
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                  selectedYear === null
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border bg-background hover:border-primary/40",
                )}
              >
                전체
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
                  to={`/item_reports/timeline?year=${year}`}
                  viewTransition
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                    selectedYear === year
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border bg-background hover:border-primary/40",
                  )}
                >
                  {year}년
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
