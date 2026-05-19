/**
 * Dashboard (/dashboard)
 *
 * Market Memory's daily reading dashboard. Composed of 5 sections:
 *
 *  1. Market Snapshot Bar          — ticker-style market metrics
 *  2. Today's Market Memory        — hero block (core summary + themes + mood)
 *  3. Latest Reports               — 7 most recent published reports
 *  4. Memory Recall                — past memories that resonate today (preview UI)
 *  5. Risk Radar                   — risk signals flagged by today's pipeline
 *
 * Data sources:
 *  - `daily_market_memories` + `daily_market_memory_i18n` for sections 1–2,5
 *  - `item_contents` (public + active) for section 3
 *
 * Note: `daily_market_memories` is currently RLS-restricted to admins. The
 * loader returns `null` gracefully when access is denied so the screen still
 * renders with helpful empty states.
 */
import type { Route } from "./+types/dashboard";

import i18next from "~/core/lib/i18next.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { MarketSnapshotBar } from "~/features/dashboard/components/market-snapshot-bar";
import { TodayMarketMemoryBlock } from "~/features/dashboard/components/today-market-memory-block";
import { LatestReportsBlock } from "~/features/dashboard/components/latest-reports-block";
import { MemoryRecallBlock } from "~/features/dashboard/components/memory-recall-block";
import { RiskRadarBlock } from "~/features/dashboard/components/risk-radar-block";
import { pickDashboardUi } from "~/features/dashboard/i18n";
import { getLatestDailyMarketMemory } from "~/features/dashboard/queries";
import { getRecentReports } from "~/features/item-reports/queries";

export const meta: Route.MetaFunction = () => {
  return [
    { title: `Dashboard | ${import.meta.env.VITE_APP_NAME}` },
    {
      name: "description",
      content:
        "오늘의 시장 메모리, 시장 스냅샷, 최신 리포트를 한 화면에서 빠르게 확인합니다.",
    },
  ];
};

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  const locale = await i18next.getLocale(request);

  const [memory, recentReports] = await Promise.all([
    getLatestDailyMarketMemory(client, locale).catch(() => null),
    getRecentReports(client, 7).catch(() => []),
  ]);

  return { memory, recentReports, locale };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { memory, recentReports, locale } = loaderData;
  const page = pickDashboardUi(locale).page;

  return (
    <div className="flex flex-1 flex-col gap-6 px-3 pt-2 pb-10 sm:gap-7 sm:px-4 sm:pb-12 md:gap-8 md:px-6 md:pb-16 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-primary text-[11px] font-medium tracking-wide uppercase sm:text-xs">
            {page.eyebrow}
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">
            {page.title}
          </h1>
          <p className="text-muted-foreground mt-1.5 max-w-2xl text-xs sm:mt-2 sm:text-sm md:text-base">
            {page.subtitle}
          </p>
        </div>
      </header>

      <MarketSnapshotBar
        snapshot={memory?.market_snapshot ?? null}
        locale={locale}
      />

      <TodayMarketMemoryBlock memory={memory} locale={locale} />

      <LatestReportsBlock reports={recentReports} locale={locale} />

      <MemoryRecallBlock locale={locale} />

      <RiskRadarBlock
        signals={memory?.risk_signals ?? null}
        locale={locale}
      />
    </div>
  );
}
