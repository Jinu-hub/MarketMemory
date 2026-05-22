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
  RelatedReportItem,
  ReportListItem,
} from "./types";

const LIST_COLUMNS =
  "id,title,summary,summary_meta,category,report_type,report_tier,regions,countries,tags,market_date,created_at,lang_code";

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
    .order("market_date", { ascending: asc, nullsFirst: asc })
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
    .order("market_date", { ascending: false, nullsFirst: false })
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

const DEFAULT_SIMILARITY_METHOD_VERSION = "hybrid_v1";

/**
 * Fetch related reports from `item_similarity_edges` (source -> target).
 * Used in the detail screen right column.
 */
export async function getRelatedReports(
  client: DB,
  {
    id,
    category: _category,
    limit = 5,
  }: { id: string; category?: string | null; limit?: number },
): Promise<RelatedReportItem[]> {
  const { data: edgeRows, error: edgeError } = await client
    .from("item_similarity_edges")
    .select("target_item_id, ranking, final_score, similarity_level")
    .eq("source_item_id", id)
    .eq("method_version", DEFAULT_SIMILARITY_METHOD_VERSION)
    .order("ranking", { ascending: true })
    .order("final_score", { ascending: false })
    .limit(Math.max(limit * 3, 12));

  if (edgeError) throw edgeError;
  if (!edgeRows || edgeRows.length === 0) return [];

  const rankedTargetIds = edgeRows
    .map((r) => r.target_item_id)
    .filter((targetId): targetId is string => targetId !== id);
  if (rankedTargetIds.length === 0) return [];

  const { data: reports, error: reportError } = await client
    .from("item_contents")
    .select(LIST_COLUMNS)
    .in("id", rankedTargetIds)
    .eq("is_public", true)
    .eq("is_active", true)
    .limit(limit);

  if (reportError) throw reportError;
  if (!reports || reports.length === 0) return [];

  const rankMap = new Map<string, number>();
  const edgeMetaMap = new Map<
    string,
    {
      ranking: number | null;
      final_score: number | null;
      similarity_level: Database["public"]["Enums"]["similarity_level"] | null;
    }
  >();
  rankedTargetIds.forEach((targetId, idx) => {
    if (!rankMap.has(targetId)) rankMap.set(targetId, idx);
  });
  edgeRows.forEach((row) => {
    if (!edgeMetaMap.has(row.target_item_id)) {
      edgeMetaMap.set(row.target_item_id, {
        ranking: row.ranking,
        final_score: row.final_score,
        similarity_level: row.similarity_level,
      });
    }
  });

  return [...(reports as unknown as ReportListItem[])]
    .map((report) => {
      const edgeMeta = edgeMetaMap.get(report.id);
      return {
        ...report,
        ranking: edgeMeta?.ranking ?? null,
        final_score: edgeMeta?.final_score ?? null,
        similarity_level: edgeMeta?.similarity_level ?? null,
      } satisfies RelatedReportItem;
    })
    .sort((a, b) => {
      const rankA = a.ranking ?? 9999;
      const rankB = b.ranking ?? 9999;
      if (rankA !== rankB) return rankA - rankB;
      return (rankMap.get(a.id) ?? 9999) - (rankMap.get(b.id) ?? 9999);
    })
    .slice(0, limit);
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
        .order("market_date", { ascending: false, nullsFirst: false })
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
