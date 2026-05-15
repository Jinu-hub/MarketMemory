import type { Route } from "./+types/api-tests";

import { ActivityIcon, ArrowUpRightIcon, CalendarDaysIcon } from "lucide-react";
import { Link } from "react-router";

import { AdminPageHeader, AdminSection } from "../components/admin-ui";
import { NexCard } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

export const meta: Route.MetaFunction = () => [
  { title: `API 테스트 | ${import.meta.env.VITE_APP_NAME}` },
];

export async function loader() {
  return {};
}

export default function AdminApiTestsScreen() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <AdminPageHeader
        title="API 테스트"
        description="외부 연동 API를 수동 검증하는 허브 화면입니다. 테스트 항목은 계속 확장됩니다."
      />

      <AdminSection
        title="테스트 목록"
        description="아래 항목을 선택해 개별 API 테스트 페이지로 이동하세요."
      >
        <ul className="grid gap-5 sm:grid-cols-2">
          <li>
            <Link
              to="/admin/daily-market-memory-test"
              className="group block h-full rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <NexCard
                variant="elevated"
                padding="lg"
                hoverable
                className={cn(
                  "border-border bg-card text-card-foreground h-full border shadow-md",
                  "transition-[transform,box-shadow] duration-200",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="bg-muted/80 text-muted-foreground group-hover:bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors">
                    <CalendarDaysIcon className="size-5" aria-hidden />
                  </div>
                  <ArrowUpRightIcon
                    className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 opacity-0 transition-all group-hover:opacity-100"
                    aria-hidden
                  />
                </div>
                <h2 className="text-foreground mt-4 text-lg font-semibold tracking-tight">
                  데일리 마켓 메모리 파이프라인
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  시장 스냅샷·리포트 집계·AI 입력 JSON까지 하루 1회 프로세스를 수동 실행합니다.
                </p>
              </NexCard>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/market-snapshot-test"
              className="group block h-full rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <NexCard
                variant="elevated"
                padding="lg"
                hoverable
                className={cn(
                  "border-border bg-card text-card-foreground h-full border shadow-md",
                  "transition-[transform,box-shadow] duration-200",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="bg-muted/80 text-muted-foreground group-hover:bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors">
                    <ActivityIcon className="size-5" aria-hidden />
                  </div>
                  <ArrowUpRightIcon
                    className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 opacity-0 transition-all group-hover:opacity-100"
                    aria-hidden
                  />
                </div>
                <h2 className="text-foreground mt-4 text-lg font-semibold tracking-tight">
                  마켓 스냅샷 API 테스트
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  지수/원자재/공포탐욕 데이터 수집 응답을 수동 실행해 확인합니다.
                </p>
              </NexCard>
            </Link>
          </li>
        </ul>
      </AdminSection>
    </div>
  );
}
