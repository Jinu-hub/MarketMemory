/**
 * Public Dashboard — server-only queries
 *
 * The `/public-dashboard` screen is shown to logged-out visitors. The
 * `daily_market_memories` table only exposes a `select` RLS policy to the
 * `authenticated` role, so anonymous requests read nothing through the normal
 * client. To surface the daily market memory publicly we therefore go through
 * the service-role `adminClient` (which bypasses RLS) and **hard-enforce
 * `status = 'final'`** (via `finalOnly`) so unpublished drafts can never leak.
 *
 * This module is the single, audited entry point for public dashboard data —
 * keep the service-role access confined here. It mirrors the data the private
 * `/dashboard` loader collects, minus admin-only concerns (`isAdmin`,
 * `sourceConsistency`, and the reconcile action).
 */
import adminClient from "~/core/lib/supa-admin-client.server";
import {
  getAvailableMarketMemoryDates,
  getDailyMarketMemoryByDate,
  getDailyMarketMemorySources,
  getDailyMarketSummaryPost,
  getLatestDailyMarketMemory,
  type MarketSummaryPost,
} from "~/features/dashboard/queries";
import type { DailyMarketMemorySnapshot } from "~/features/dashboard/types";
import { localizeItemContents } from "~/features/item-reports/lib/item-content-localization";
import { getRecentReports } from "~/features/item-reports/queries";
import type { ReportListItem } from "~/features/item-reports/types";

/** How many latest reports the dashboard's "Latest Reports" section shows. */
const RECENT_REPORTS_LIMIT = 7;

export type PublicDashboardData = {
  /** Latest finalized daily market memory (or the one for `marketDate`). */
  memory: DailyMarketMemorySnapshot | null;
  /** Source reports that fed the memory, localized to the reader's language. */
  sourceReports: ReportListItem[];
  /** Published market-summary post for the memory's trading day. */
  summaryPost: MarketSummaryPost | null;
  /** 7 most recent public reports, localized. */
  recentReports: ReportListItem[];
  /** Finalized trading days available for the date picker (newest first). */
  availableDates: string[];
};

/**
 * Collect everything the public dashboard needs to render, mirroring the
 * private `/dashboard` loader but reading through the service-role client with
 * `finalOnly` enforced so only published data reaches logged-out visitors.
 *
 * All row-level reads are additionally gated by the public visibility filters
 * baked into the underlying queries (`is_public`/`is_active`/`status`), so
 * bypassing RLS here cannot leak non-public content.
 */
export async function getPublicDashboardData(params: {
  locale: string;
  marketDate?: string | null;
}): Promise<PublicDashboardData> {
  const { locale, marketDate } = params;

  const [memory, recentReportsRows, availableDates] = await Promise.all([
    (marketDate
      ? getDailyMarketMemoryByDate(adminClient, locale, marketDate, {
          finalOnly: true,
        })
      : getLatestDailyMarketMemory(adminClient, locale, { finalOnly: true })
    ).catch(() => null),
    getRecentReports(adminClient, RECENT_REPORTS_LIMIT).catch(() => []),
    getAvailableMarketMemoryDates(adminClient, { finalOnly: true }).catch(
      () => [],
    ),
  ]);

  const sourceReportsRows = memory
    ? await getDailyMarketMemorySources(adminClient, memory.id).catch(() => [])
    : [];

  const summaryPost = memory
    ? await getDailyMarketSummaryPost(
        adminClient,
        memory.market_date,
        locale,
      ).catch(() => null)
    : null;

  // Localize reports to the reader's language (item_content_i18n), falling back
  // to the original-language rows when no translation exists.
  const [sourceReports, recentReports] = await Promise.all([
    localizeItemContents(adminClient, sourceReportsRows, locale),
    localizeItemContents(adminClient, recentReportsRows, locale),
  ]);

  return {
    memory,
    sourceReports,
    summaryPost,
    recentReports,
    availableDates,
  };
}

/**
 * Latest finalized `daily_market_memories` row only, localized to the reader's
 * language. Thin wrapper kept for callers that just need the memory.
 */
export async function getPublicLatestDailyMarketMemory(
  preferredLang: string,
): Promise<DailyMarketMemorySnapshot | null> {
  return getLatestDailyMarketMemory(adminClient, preferredLang, {
    finalOnly: true,
  });
}
