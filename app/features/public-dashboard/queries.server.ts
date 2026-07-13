/**
 * Public Dashboard — server-only queries
 *
 * The `/public-dashboard` screen is shown to logged-out visitors. Tables such
 * as `daily_market_memories` and `item_contents` only expose `select` RLS to
 * the `authenticated` role, so anonymous requests read nothing through the
 * normal client. Public surfaces therefore go through the service-role
 * `adminClient` (which bypasses RLS) and **hard-enforce** published-only
 * filters (`finalOnly`, `is_public`/`is_active`) so drafts never leak.
 *
 * This module is the single, audited entry point for public-dashboard data —
 * keep the service-role access confined here.
 *
 * Preview report detail (`/public-dashboard/reports/:id`) is gated the same
 * way: only the newest `PUBLIC_PREVIEW_REPORT_LIMIT` public reports may be
 * fetched, even though service-role could otherwise read any row.
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
import {
  localizeItemContents,
  localizeItemContentWithMeta,
  type ItemContentLocalization,
} from "~/features/item-reports/lib/item-content-localization";
import { getRecentReports, getReport } from "~/features/item-reports/queries";
import type {
  ReportDetail,
  ReportListItem,
} from "~/features/item-reports/types";

/** How many latest reports the dashboard's "Latest Reports" section shows. */
const RECENT_REPORTS_LIMIT = 7;

/**
 * How many of the newest public reports anonymous visitors may open in detail
 * under `/public-dashboard/reports/:id`. Keep this tight — service-role bypass
 * means the allowlist is the real access boundary.
 */
export const PUBLIC_PREVIEW_REPORT_LIMIT = 2;

export type PublicDashboardData = {
  /** Latest finalized daily market memory (or the one for `marketDate`). */
  memory: DailyMarketMemorySnapshot | null;
  /** Source reports that fed the memory, localized to the reader's language. */
  sourceReports: ReportListItem[];
  /** Published market-summary post for the memory's trading day. */
  summaryPost: MarketSummaryPost | null;
  /** 7 most recent public reports, localized. */
  recentReports: ReportListItem[];
  /**
   * IDs of the newest reports that may be linked to the public preview detail
   * route. Always a prefix of `recentReports` (length ≤ {@link PUBLIC_PREVIEW_REPORT_LIMIT}).
   */
  previewReportIds: string[];
  /** Finalized trading days available for the date picker (newest first). */
  availableDates: string[];
};

export type PublicPreviewReport = {
  report: ReportDetail;
  localization: ItemContentLocalization;
};

/**
 * Newest public `item_contents` ids (service-role + public visibility filters).
 * Used as the allowlist for `/public-dashboard/reports/:id`.
 */
export async function getPublicPreviewReportIds(
  limit: number = PUBLIC_PREVIEW_REPORT_LIMIT,
): Promise<string[]> {
  const rows = await getRecentReports(adminClient, limit);
  return rows.map((row) => row.id);
}

/**
 * Load a single public report for the anonymous preview detail route.
 *
 * Returns `null` when:
 *  - `id` is not among the newest {@link PUBLIC_PREVIEW_REPORT_LIMIT} public reports, or
 *  - the row is missing / not public+active.
 *
 * Localization mirrors the private `/item_reports/:id` loader.
 */
export async function getPublicPreviewReport(params: {
  id: string;
  locale: string;
}): Promise<PublicPreviewReport | null> {
  const { id, locale } = params;

  const allowedIds = await getPublicPreviewReportIds();
  if (!allowedIds.includes(id)) {
    return null;
  }

  const reportRow = await getReport(adminClient, id);
  if (!reportRow) {
    return null;
  }

  const { row: report, localization } = await localizeItemContentWithMeta(
    adminClient,
    reportRow,
    locale,
  );

  return { report, localization };
}

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

  const previewReportIds = recentReports
    .slice(0, PUBLIC_PREVIEW_REPORT_LIMIT)
    .map((row) => row.id);

  return {
    memory,
    sourceReports,
    summaryPost,
    recentReports,
    previewReportIds,
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
