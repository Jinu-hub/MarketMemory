/**
 * Dashboard (/dashboard)
 *
 * Market Memory's daily reading dashboard. Composed of 5 sections:
 *
 *  1. Market Snapshot Bar          — ticker-style market metrics
 *  2. Daily Market Memory           — hero block (trading-day narrative + themes + mood)
 *  3. Latest Reports               — 7 most recent published reports
 *  4. Memory Recall                — past memories that resonate today (preview UI)
 *  5. Signal Radar                 — risk / opportunity / turning-point signals (preview UI)
 *
 * Data sources:
 *  - `daily_market_memories` + `daily_market_memory_i18n` for sections 1–2
 *  - `item_contents` (public + active) for section 3
 *  - Sections 4 & 5 are mock-only previews ("Coming Soon" by default)
 *
 * Note: `daily_market_memories` is currently RLS-restricted to admins. The
 * loader returns `null` gracefully when access is denied so the screen still
 * renders with helpful empty states.
 */
import { useTranslation } from "react-i18next";

import type { Route } from "./+types/dashboard";

import i18next from "~/core/lib/i18next.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { MarketDatePicker } from "~/features/dashboard/components/market-date-picker";
import { MarketSnapshotBar } from "~/features/dashboard/components/market-snapshot-bar";
import { TodayMarketMemoryBlock } from "~/features/dashboard/components/today-market-memory-block";
import { LatestReportsBlock } from "~/features/dashboard/components/latest-reports-block";
import { MemoryRecallBlock } from "~/features/dashboard/components/memory-recall-block";
import { SignalRadarBlock } from "~/features/dashboard/components/signal-radar-block";
import { parseMarketDateParam } from "~/features/dashboard/lib/dates";
import {
  getAvailableMarketMemoryDates,
  getDailyMarketMemoryByDate,
  getDailyMarketMemorySources,
  getLatestDailyMarketMemory,
} from "~/features/dashboard/queries";
import { getRecentReports } from "~/features/item-reports/queries";
import { localizeItemContents } from "~/features/item-reports/lib/item-content-localization";

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  const t = await i18next.getFixedT(request);
  const locale = await i18next.getLocale(request);

  const url = new URL(request.url);
  const requestedDate = parseMarketDateParam(url.searchParams.get("date"));

  const [memory, recentReportsRows, availableDates] = await Promise.all([
    (requestedDate
      ? getDailyMarketMemoryByDate(client, locale, requestedDate)
      : getLatestDailyMarketMemory(client, locale)
    ).catch(() => null),
    getRecentReports(client, 7).catch(() => []),
    getAvailableMarketMemoryDates(client).catch(() => []),
  ]);

  const sourceReportsRows = memory
    ? await getDailyMarketMemorySources(client, memory.id).catch(() => [])
    : [];

  // Localize report content to the reader's language (item_content_i18n),
  // falling back to the original-language rows when no translation exists.
  const [sourceReports, recentReports] = await Promise.all([
    localizeItemContents(client, sourceReportsRows, locale),
    localizeItemContents(client, recentReportsRows, locale),
  ]);

  return {
    memory,
    sourceReports,
    recentReports,
    availableDates,
    locale,
    meta: {
      title: `${t("dashboard.meta.title")} | ${import.meta.env.VITE_APP_NAME}`,
      description: t("dashboard.meta.description"),
    },
  };
}

export const meta: Route.MetaFunction = ({ data }) => {
  const title = data?.meta.title ?? "Dashboard";
  const description = data?.meta.description ?? "";
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ];
};

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { memory, sourceReports, recentReports, availableDates, locale } =
    loaderData;

  return (
    <div className="flex flex-1 flex-col gap-6 px-3 pt-2 pb-10 sm:gap-7 sm:px-4 sm:pb-12 md:gap-8 md:px-6 md:pb-16 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-primary text-[11px] font-medium tracking-wide uppercase sm:text-xs">
            {t("dashboard.page.eyebrow")}
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">
            {t("dashboard.page.title")}
          </h1>
          <p className="text-muted-foreground mt-1.5 max-w-2xl text-xs sm:mt-2 sm:text-sm md:text-base">
            {t("dashboard.page.subtitle")}
          </p>
        </div>
        {memory?.market_date ? (
          <MarketDatePicker
            marketDate={memory.market_date}
            availableDates={availableDates}
            locale={locale}
            labels={{
              tradingDay: t("dashboard.page.tradingDay"),
              publishedAt: t("dashboard.page.publishedAtLabel"),
              statusLabel: t("dashboard.page.statusLabel"),
              draftNote: t("dashboard.page.draftNote"),
              timezoneAbbr: t("dashboard.page.timezoneAbbr"),
            }}
            pickerLabels={{
              triggerLabel: t("dashboard.page.datePicker.triggerLabel"),
              title: t("dashboard.page.datePicker.title"),
              hint: t("dashboard.page.datePicker.hint"),
              latest: t("dashboard.page.datePicker.latest"),
            }}
            publishedAt={memory.updated_at ?? memory.generated_at}
            status={memory.status}
            className="shrink-0"
          />
        ) : null}
      </header>

      <MarketSnapshotBar
        snapshot={memory?.market_snapshot ?? null}
        locale={locale}
        showCaption={Boolean(memory)}
      />

      <TodayMarketMemoryBlock
        memory={memory}
        sourceReports={sourceReports}
        locale={locale}
      />

      <LatestReportsBlock reports={recentReports} locale={locale} />

      <MemoryRecallBlock locale={locale} />

      <SignalRadarBlock locale={locale} />
    </div>
  );
}
