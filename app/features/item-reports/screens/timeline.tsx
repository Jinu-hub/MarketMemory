/**
 * Item Reports — Timeline View (/item_reports/timeline)
 *
 * A chronological, narrative-first view of recently published reports.
 * Each entry is grouped by month and rendered through the `ReportTimeline`
 * component so users can track how the research story evolves over time.
 */
import { ArrowLeftIcon, ClockIcon } from "lucide-react";
import { Link } from "react-router";

import { NexBadge, NexButton } from "~/core/components/nex";
import makeServerClient from "~/core/lib/supa-client.server";

import type { Route } from "./+types/timeline";
import { ReportTimeline } from "../components/report-timeline";
import { getRecentReports } from "../queries";

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
  const [client] = makeServerClient(request);
  const reports = await getRecentReports(client, 60);
  return { reports };
}

export default function ItemReportsTimeline({
  loaderData,
}: Route.ComponentProps) {
  const { reports } = loaderData;

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
            최근 {reports.length.toLocaleString("ko-KR")}건
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

      <section className="border-border bg-card/60 rounded-xl border p-5 md:p-8">
        <ReportTimeline reports={reports} />
      </section>
    </div>
  );
}
