import type { Database } from "database.types";

import type { AdminQueryClient } from "./db";

/** PostgREST `.in()` 안전 상한 — 한 번에 조회할 source id 개수 */
const SOURCE_ID_IN_CHUNK = 120;

export type ItemSimilarityListFilters = {
  isActive?: boolean;
  isPublic?: boolean;
};

export type ItemContentSimilarityListRow = Pick<
  Database["public"]["Tables"]["item_contents"]["Row"],
  | "id"
  | "title"
  | "lang_code"
  | "category"
  | "report_type"
  | "report_tier"
  | "market_date"
  | "is_active"
  | "is_public"
  | "similarity_status"
  | "created_at"
>;

export type SimilarityEdgeListRow = Pick<
  Database["public"]["Tables"]["item_similarity_edges"]["Row"],
  "source_item_id" | "target_item_id" | "final_score" | "vector_score" | "tag_score"
>;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export async function listItemContentsForSimilarity(
  client: AdminQueryClient,
  filters: ItemSimilarityListFilters,
) {
  let q = client
    .from("item_contents")
    .select(
      "id, title, lang_code, category, report_type, report_tier, market_date, is_active, is_public, similarity_status, created_at",
    )
    .order("created_at", { ascending: false });

  if (filters.isActive !== undefined) {
    q = q.eq("is_active", filters.isActive);
  }
  if (filters.isPublic !== undefined) {
    q = q.eq("is_public", filters.isPublic);
  }

  return q;
}

export async function countItemContentsBySimilarityStatus(
  client: AdminQueryClient,
  status: Database["public"]["Enums"]["similarity_status"],
) {
  return client
    .from("item_contents")
    .select("*", { count: "exact", head: true })
    .eq("similarity_status", status);
}

export async function fetchReadyItemContentIds(client: AdminQueryClient) {
  const { data, error } = await client
    .from("item_contents")
    .select("id")
    .eq("similarity_status", "ready")
    .order("created_at", { ascending: true });

  if (error) {
    return { ids: [] as string[], error };
  }

  const ids = (data ?? []).map((r) => r.id);
  return { ids, error: null };
}

export async function fetchEmbeddingSourceItemIds(client: AdminQueryClient) {
  const { data, error } = await client
    .from("item_embeddings")
    .select("item_id")
    .eq("content_type", "summary")
    .eq("lang_code", "en")
    .eq("model", "text-embedding-3-large");

  if (error) {
    return { ids: [] as string[], error };
  }

  const ids = [...new Set((data ?? []).map((r) => r.item_id))];
  return { ids, error: null };
}

export async function listSimilarityEdgesForSources(
  client: AdminQueryClient,
  sourceIds: string[],
  methodVersion: string,
) {
  if (sourceIds.length === 0) {
    return { data: [] as SimilarityEdgeListRow[], error: null };
  }

  const all: SimilarityEdgeListRow[] = [];

  for (const chunk of chunkArray(sourceIds, SOURCE_ID_IN_CHUNK)) {
    const { data, error } = await client
      .from("item_similarity_edges")
      .select("source_item_id, target_item_id, final_score, vector_score, tag_score")
      .eq("method_version", methodVersion)
      .in("source_item_id", chunk);

    if (error) {
      return { data: null, error };
    }
    all.push(...((data ?? []) as SimilarityEdgeListRow[]));
  }

  return { data: all, error: null };
}
