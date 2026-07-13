/**
 * Public Dashboard (/public-dashboard)
 *
 * A logged-out, read-only mirror of the private `/dashboard` reading surface.
 * Data is fetched server-side through the service-role client (see
 * `../queries.server`) with `finalOnly` enforced, so anonymous visitors only
 * ever see published content.
 *
 * Differences from `/dashboard`:
 *  - Market Date is fixed to the latest edition (no date picker / navigation).
 *  - "Latest Reports" has no "view all" link and its rows are not linked.
 *  - No admin-only affordances (reconcile button, draft states).
 */
import { LockIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import i18next from "~/core/lib/i18next.server";
import { parseMarketDateParam } from "~/features/dashboard/lib/dates";
import { DashboardMarketDate } from "~/features/dashboard/components/dashboard-market-date";
import { MarketSnapshotBar } from "~/features/dashboard/components/market-snapshot-bar";
import { TodayMarketMemoryBlock } from "~/features/dashboard/components/today-market-memory-block";
import { LatestReportsBlock } from "~/features/dashboard/components/latest-reports-block";
import { MemoryRecallBlock } from "~/features/dashboard/components/memory-recall-block";
import { SignalRadarBlock } from "~/features/dashboard/components/signal-radar-block";

import type { Route } from "./+types/public-dashboard";
import { FloatingJoinCta } from "../components/floating-join-cta";
import { getPublicDashboardData } from "../queries.server";

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  const locale = await i18next.getLocale(request);

  const url = new URL(request.url);
  const requestedDate = parseMarketDateParam(url.searchParams.get("date"));

  // Service-role read, final-only — mirrors the private dashboard dataset
  // (minus admin-only fields) for logged-out visitors.
  const { memory, sourceReports, summaryPost, recentReports } =
    await getPublicDashboardData({ locale, marketDate: requestedDate });

  return {
    memory,
    sourceReports,
    summaryPost,
    recentReports,
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

export default function PublicDashboard({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { memory, sourceReports, summaryPost, recentReports, locale } =
    loaderData;

  return (
    <div className="mx-auto -mt-10 flex w-full max-w-screen-2xl flex-1 flex-col gap-6 px-4 pb-12 sm:gap-7 sm:px-6 md:-mt-24 md:gap-8 md:px-8 md:pb-16">
      <div
        role="status"
        className="border-primary/25 bg-primary/[0.06] flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border px-3.5 py-2.5 text-xs sm:text-sm"
      >
        <LockIcon className="text-primary size-3.5 shrink-0" aria-hidden />
        <span className="text-muted-foreground min-w-0 flex-1">
          {t("publicDashboard.headerLoginNotice")}
        </span>
        <Link
          to="/login"
          viewTransition
          className="text-primary hover:text-primary/80 inline-flex shrink-0 items-center font-medium transition-colors"
        >
          {t("auth.signIn")}
        </Link>
      </div>

      <header className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-primary text-[11px] font-medium tracking-wide uppercase sm:text-xs">
            {t("dashboard.page.eyebrow")}
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl md:text-3xl">
            {t("dashboard.page.title")}
          </h1>
          <p className="text-muted-foreground mt-1.5 max-w-5xl text-xs leading-relaxed sm:mt-2 sm:text-sm md:text-base">
            {t("dashboard.page.subtitle")}
          </p>
        </div>
        {memory?.market_date ? (
          // Static edition marker — public visitors always see the latest
          // Market Date and cannot switch dates.
          <DashboardMarketDate
            marketDate={memory.market_date}
            locale={locale}
            labels={{
              tradingDay: t("dashboard.page.tradingDay"),
              publishedAt: t("dashboard.page.publishedAtLabel"),
              statusLabel: t("dashboard.page.statusLabel"),
              draftNote: t("dashboard.page.draftNote"),
              timezoneAbbr: t("dashboard.page.timezoneAbbr"),
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
        summaryPost={summaryPost}
        locale={locale}
        isAdmin={false}
        sourceConsistency={null}
        linkSourceReports={false}
      />

      <LatestReportsBlock
        reports={recentReports}
        locale={locale}
        showViewAll={false}
        linkReports={false}
      />

      <MemoryRecallBlock locale={locale} />

      <SignalRadarBlock locale={locale} />

      <FloatingJoinCta />
    </div>
  );
}
