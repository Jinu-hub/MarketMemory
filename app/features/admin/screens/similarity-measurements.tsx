import type { Route } from "./+types/similarity-measurements";

import { ArrowUpRightIcon, CalendarDaysIcon, Share2Icon } from "lucide-react";
import { Link } from "react-router";

import { AdminPageHeader, AdminSection } from "../components/admin-ui";
import { NexCard } from "~/core/components/nex";
import { requireAdmin } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";

export const meta: Route.MetaFunction = () => [
  { title: `유사도 측정 | ${import.meta.env.VITE_APP_NAME}` },
];

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  await requireAdmin(client);
  return {};
}

export default function AdminSimilarityMeasurementsScreen() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <AdminPageHeader
        title="유사도 측정"
        description="콘텐츠·엔티티 간 유사도를 계산·검증하는 허브 화면입니다. 측정 항목은 계속 확장됩니다."
      />

      <AdminSection
        title="측정 목록"
        description="아래 항목을 선택해 개별 유사도 측정 페이지로 이동하세요."
      >
        <ul className="grid gap-5 sm:grid-cols-2">
          <li>
            <Link
              to="/admin/item-similarities"
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
                    <Share2Icon className="size-5" aria-hidden />
                  </div>
                  <ArrowUpRightIcon
                    className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 opacity-0 transition-all group-hover:opacity-100"
                    aria-hidden
                  />
                </div>
                <h2 className="text-foreground mt-4 text-lg font-semibold tracking-tight">
                  리포트 유사도
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  item_contents 기준 유사도 엣지를 보고 재생성합니다.
                </p>
              </NexCard>
            </Link>
          </li>
          <li>
            <Link
              to="/admin/dmm-similarities"
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
                  일별 마켓 메모리 유사도
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  daily_market_memories·embeddings 기준 유사도 엣지를 보고 재생성합니다.
                </p>
              </NexCard>
            </Link>
          </li>
        </ul>
      </AdminSection>
    </div>
  );
}
