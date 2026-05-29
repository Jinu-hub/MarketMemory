/**
 * Weekly AI Issue Digest — queries
 *
 * Series membership lives on `market_memory_items.series_id` → `report_series`,
 * both of which are admin-only under RLS. The reader content itself
 * (`item_contents`) is public-readable. To resolve "reports in this series" for
 * normal authenticated users we therefore use the service-role `adminClient`
 * (which bypasses RLS) **and explicitly enforce `is_public = true` and
 * `is_active = true`** so non-public content can never leak through this path.
 */
import adminClient from "~/core/lib/supa-admin-client.server";
import type {
  ReportDetail,
  ReportListItem,
} from "~/features/item-reports/types";

import { PAGE_SIZE } from "./constants";

const LIST_COLUMNS =
  "id,title,summary,summary_meta,category,report_type,report_tier,regions,countries,tags,market_date,created_at,lang_code";

export type SeriesMeta = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
};

export type PagedSeriesReports = {
  rows: ReportListItem[];
  total: number;
  page: number;
  pageSize: number;
};

/**
 * Resolve the series row by slug. Returns null when the series has not been
 * created yet so screens can fall back to static copy.
 */
export async function getSeriesBySlug(slug: string): Promise<SeriesMeta | null> {
  const { data, error } = await adminClient
    .from("report_series")
    .select("id,slug,title,description")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

/**
 * Strip the embedded `market_memory_items` join used purely for filtering so
 * callers receive a clean `ReportListItem`.
 */
function toListItem(row: Record<string, unknown>): ReportListItem {
  const { market_memory_items: _join, ...rest } = row;
  return rest as unknown as ReportListItem;
}

/**
 * Fetch a chronological page of public reports that belong to `seriesId`.
 */
export async function getSeriesReports({
  seriesId,
  page = 1,
  sort = "newest",
}: {
  seriesId: string;
  page?: number;
  sort?: "newest" | "oldest";
}): Promise<PagedSeriesReports> {
  const safePage = page > 0 ? page : 1;
  const asc = sort === "oldest";
  const from = Math.max(0, (safePage - 1) * PAGE_SIZE);
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await adminClient
    .from("item_contents")
    .select(`${LIST_COLUMNS},market_memory_items!inner(series_id)`, {
      count: "exact",
    })
    .eq("market_memory_items.series_id", seriesId)
    .eq("is_public", true)
    .eq("is_active", true)
    .order("market_date", { ascending: asc, nullsFirst: asc })
    .order("created_at", { ascending: asc })
    .range(from, to);

  if (error) throw error;

  return {
    rows: (data ?? []).map((row) => toListItem(row as Record<string, unknown>)),
    total: count ?? 0,
    page: safePage,
    pageSize: PAGE_SIZE,
  };
}

/**
 * Fetch every public report in the series in chronological order — used by the
 * timeline view, which groups by month client-side and shows the full run
 * rather than paginating. Bounded by `limit` as a safety cap.
 */
export async function getAllSeriesReports({
  seriesId,
  sort = "newest",
  limit = 200,
}: {
  seriesId: string;
  sort?: "newest" | "oldest";
  limit?: number;
}): Promise<ReportListItem[]> {
  const asc = sort === "oldest";
  const { data, error } = await adminClient
    .from("item_contents")
    .select(`${LIST_COLUMNS},market_memory_items!inner(series_id)`)
    .eq("market_memory_items.series_id", seriesId)
    .eq("is_public", true)
    .eq("is_active", true)
    .order("market_date", { ascending: asc, nullsFirst: asc })
    .order("created_at", { ascending: asc })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => toListItem(row as Record<string, unknown>));
}

/**
 * Fetch a single public report by id, scoped to the series so that direct
 * links to non-series reports 404 inside this surface.
 */
export async function getSeriesReport({
  seriesId,
  id,
}: {
  seriesId: string;
  id: string;
}): Promise<ReportDetail | null> {
  const { data, error } = await adminClient
    .from("item_contents")
    .select("*,market_memory_items!inner(series_id)")
    .eq("id", id)
    .eq("market_memory_items.series_id", seriesId)
    .eq("is_public", true)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const { market_memory_items: _join, ...rest } = data as Record<
    string,
    unknown
  >;
  return rest as unknown as ReportDetail;
}

/**
 * Fetch other recent episodes in the series (for the detail right-rail),
 * excluding the currently open report.
 */
export async function getOtherEpisodes({
  seriesId,
  excludeId,
  limit = 8,
}: {
  seriesId: string;
  excludeId: string;
  limit?: number;
}): Promise<ReportListItem[]> {
  const { data, error } = await adminClient
    .from("item_contents")
    .select(`${LIST_COLUMNS},market_memory_items!inner(series_id)`)
    .eq("market_memory_items.series_id", seriesId)
    .eq("is_public", true)
    .eq("is_active", true)
    .neq("id", excludeId)
    .order("market_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map((row) => toListItem(row as Record<string, unknown>));
}
