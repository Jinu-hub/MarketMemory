/**
 * Item Reports Queries
 *
 * Supabase data access for the /item_reports reader experience.
 * RLS restricts results to rows where `is_public = true AND is_active = true`
 * when accessed by non-admin authenticated users, so the queries below can
 * optimistically select public data without additional server-side filtering.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

import { PAGE_SIZE } from "./constants";
import type {
  FacetCounts,
  ListFilter,
  PagedReports,
  ReportDetail,
  ReportListItem,
} from "./types";

const LIST_COLUMNS =
  "id,title,summary,summary_meta,category,report_type,report_tier,regions,countries,tags,input_date,created_at,lang_code";

type DB = SupabaseClient<Database>;

/**
 * Fetch a filtered page of public item_contents for the list screen.
 */
export async function getReports(
  client: DB,
  filter: ListFilter,
): Promise<PagedReports> {
  const page = filter.page && filter.page > 0 ? filter.page : 1;
  const sort = filter.sort === "oldest" ? "oldest" : "newest";

  let query = client
    .from("item_contents")
    .select(LIST_COLUMNS, { count: "exact" })
    .eq("is_public", true)
    .eq("is_active", true);

  if (filter.category) {
    query = query.eq(
      "category",
      filter.category as Database["public"]["Enums"]["category"],
    );
  }
  if (filter.reportType) {
    query = query.eq(
      "report_type",
      filter.reportType as Database["public"]["Enums"]["report_type"],
    );
  }
  if (filter.reportTier) {
    query = query.eq(
      "report_tier",
      filter.reportTier as Database["public"]["Enums"]["report_tier"],
    );
  }
  if (filter.lang) {
    query = query.eq("lang_code", filter.lang);
  }
  if (filter.region) {
    query = query.contains("regions", [filter.region]);
  }
  if (filter.country) {
    query = query.contains("countries", [filter.country]);
  }
  if (filter.tag) {
    query = query.contains("tags", [filter.tag]);
  }
  if (filter.q && filter.q.trim().length > 0) {
    const term = filter.q.trim().replace(/%/g, "").replace(/_/g, "");
    query = query.or(
      `title.ilike.%${term}%,summary.ilike.%${term}%`,
    );
  }

  const asc = sort === "oldest";
  const from = Math.max(0, (page - 1) * PAGE_SIZE);
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await query
    .order("input_date", { ascending: asc, nullsFirst: asc })
    .order("created_at", { ascending: asc })
    .range(from, to);
  if (error) {
    throw error;
  }
  return {
    rows: (data ?? []) as unknown as ReportListItem[],
    total: count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  };
}

/**
 * Fetch the most recent public reports without filtering — used by the
 * timeline view and the editorial "recently published" section of the
 * explore hub.
 */
export async function getRecentReports(
  client: DB,
  limit = 40,
): Promise<ReportListItem[]> {
  const { data, error } = await client
    .from("item_contents")
    .select(LIST_COLUMNS)
    .eq("is_public", true)
    .eq("is_active", true)
    .order("input_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }
  return (data ?? []) as unknown as ReportListItem[];
}

/**
 * Fetch a single public item_content record by id.
 * Returns null if no row matches (typical 404 case).
 */
export async function getReport(
  client: DB,
  id: string,
): Promise<ReportDetail | null> {
  const { data, error } = await client
    .from("item_contents")
    .select("*")
    .eq("id", id)
    .eq("is_public", true)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data ?? null;
}

/**
 * Fetch related reports by category, excluding the current id.
 * Used in the detail screen right column.
 */
export async function getRelatedReports(
  client: DB,
  {
    id,
    category,
    limit = 5,
  }: { id: string; category?: string | null; limit?: number },
): Promise<ReportListItem[]> {
  let query = client
    .from("item_contents")
    .select(LIST_COLUMNS)
    .eq("is_public", true)
    .eq("is_active", true)
    .neq("id", id);

  if (category) {
    query = query.eq(
      "category",
      category as Database["public"]["Enums"]["category"],
    );
  }

  const { data, error } = await query
    .order("input_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }
  return (data ?? []) as unknown as ReportListItem[];
}

/**
 * Build facet counts from a representative sample of public reports.
 *
 * We purposefully fetch a bounded set of recent rows (500) instead of running
 * multiple aggregate queries. This keeps the loader fast while producing useful
 * signal for the filter sidebar and explore hub.
 */
export async function getFacets(client: DB): Promise<FacetCounts> {
  const { data, error } = await client
    .from("item_contents")
    .select("category,report_type,report_tier,regions,tags,lang_code")
    .eq("is_public", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    throw error;
  }

  const categories: Record<string, number> = {};
  const reportTypes: Record<string, number> = {};
  const reportTiers: Record<string, number> = {};
  const regions: Record<string, number> = {};
  const languages: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};

  for (const row of data ?? []) {
    if (row.category) {
      categories[row.category] = (categories[row.category] ?? 0) + 1;
    }
    if (row.report_type) {
      reportTypes[row.report_type] = (reportTypes[row.report_type] ?? 0) + 1;
    }
    if (row.report_tier) {
      reportTiers[row.report_tier] = (reportTiers[row.report_tier] ?? 0) + 1;
    }
    if (row.lang_code) {
      languages[row.lang_code] = (languages[row.lang_code] ?? 0) + 1;
    }
    for (const region of row.regions ?? []) {
      if (!region) continue;
      regions[region] = (regions[region] ?? 0) + 1;
    }
    for (const tag of row.tags ?? []) {
      if (!tag) continue;
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([tag, count]) => ({ tag, count }));

  return {
    categories,
    reportTypes,
    reportTiers,
    regions,
    languages,
    topTags,
  };
}

/**
 * Fetch latest reports grouped by category for the explore hub.
 * Returns up to `perCategory` rows for each requested category.
 */
export async function getCategoryHighlights(
  client: DB,
  {
    categories,
    perCategory = 3,
  }: { categories: string[]; perCategory?: number },
): Promise<Record<string, ReportListItem[]>> {
  const result: Record<string, ReportListItem[]> = {};

  await Promise.all(
    categories.map(async (category) => {
      const { data, error } = await client
        .from("item_contents")
        .select(LIST_COLUMNS)
        .eq("is_public", true)
        .eq("is_active", true)
        .eq(
          "category",
          category as Database["public"]["Enums"]["category"],
        )
        .order("input_date", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(perCategory);

      if (error) {
        throw error;
      }
      result[category] = (data ?? []) as unknown as ReportListItem[];
    }),
  );

  return result;
}
