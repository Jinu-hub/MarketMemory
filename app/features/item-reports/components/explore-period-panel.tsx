import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon } from "lucide-react";
import { Link } from "react-router";

import { NexBadge } from "~/core/components/nex";

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

/**
 * Explore hub — period tab (years → months drill-down, shared date filter URLs).
 */
export function ExplorePeriodPanel({
  yearFacets,
  selectedYear,
  monthFacets,
  highlights,
}: ExplorePeriodPanelProps) {
  if (yearFacets.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        기간별로 탐색할 리포트가 아직 없습니다.
      </p>
    );
  }

  if (selectedYear === null) {
    return (
      <div className="space-y-4">
        <TabScopeIntro
          title="연도별 바로가기"
          description="연도를 고르면 월별 미리보기와 목록 필터로 이어집니다. 날짜 기준은 market_date(없으면 created_at)입니다."
        />
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
                ariaLabel={`${year}년 리포트 월별 탐색`}
                icon={<CalendarIcon className="size-4" aria-hidden />}
                title={`${year}년`}
                count={count}
                description="이 해의 월별 분포와 대표 리포트를 봅니다."
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
          전체 연도
        </Link>
        <NexBadge variant="outline" size="sm">
          {selectedYear}년
        </NexBadge>
      </div>

      <section className="space-y-4">
        <TabScopeIntro
          title="월별 바로가기"
          description="월을 선택하면 해당 기간 리포트 목록으로 이동합니다."
        />
        {monthFacets.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            이 연도에 해당하는 리포트가 없습니다.
          </p>
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
                  ariaLabel={`${selectedYear}년 ${month}월 리포트 목록`}
                  icon={<CalendarIcon className="size-4" aria-hidden />}
                  title={`${month}월`}
                  count={count}
                  description={`${selectedYear}년 ${month}월에 발행·게시된 리포트`}
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
              {selectedYear}년 최근 리포트
            </h4>
            <Link
              to={itemReportsListHref({
                [REPORT_DATE_PARAM_KEYS.year]: selectedYear,
              })}
              className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-sm font-medium"
            >
              {selectedYear}년 전체 보기
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
