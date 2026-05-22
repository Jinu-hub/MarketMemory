import type { Database } from "database.types";

import type { AdminQueryClient } from "./db";

const SOURCE_ID_IN_CHUNK = 120;

export type DmmSimilarityListFilters = {
  status?: string;
  marketScope?: string;
};

export type DailyMarketMemorySimilarityListRow = Pick<
  Database["public"]["Tables"]["daily_market_memories"]["Row"],
  | "id"
  | "market_date"
  | "market_scope"
  | "status"
  | "similarity_status"
  | "source_report_count"
  | "market_mood_type"
  | "generated_at"
  | "core_lang_code"
>;

export type DmmSimilarityEdgeListRow = Pick<
  Database["public"]["Tables"]["daily_market_memory_similarity_edges"]["Row"],
  | "source_daily_market_memory_id"
  | "target_daily_market_memory_id"
  | "final_score"
  | "vector_score"
  | "tag_score"
>;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export async function listDailyMarketMemoriesForSimilarity(
  client: AdminQueryClient,
  filters: DmmSimilarityListFilters,
) {
  let q = client
    .from("daily_market_memories")
    .select(
      "id, market_date, market_scope, status, similarity_status, source_report_count, market_mood_type, generated_at, core_lang_code",
    )
    .order("market_date", { ascending: false })
    .order("generated_at", { ascending: false });

  if (filters.status) {
    q = q.eq("status", filters.status);
  }
  if (filters.marketScope) {
    q = q.eq("market_scope", filters.marketScope);
  }

  return q;
}

export async function countDailyMarketMemoriesBySimilarityStatus(
  client: AdminQueryClient,
  status: Database["public"]["Enums"]["similarity_status"],
) {
  return client
    .from("daily_market_memories")
    .select("*", { count: "exact", head: true })
    .eq("similarity_status", status);
}

export async function fetchReadyDailyMarketMemoryIds(client: AdminQueryClient) {
  const { data, error } = await client
    .from("daily_market_memories")
    .select("id")
    .eq("similarity_status", "ready")
    .order("market_date", { ascending: true });

  if (error) {
    return { ids: [] as string[], error };
  }

  const ids = (data ?? []).map((r) => r.id);
  return { ids, error: null };
}

export async function fetchEmbeddingDailyMarketMemoryIds(client: AdminQueryClient) {
  const { data, error } = await client
    .from("daily_market_memory_embeddings")
    .select("daily_market_memory_id");

  if (error) {
    return { ids: [] as string[], error };
  }

  const ids = [...new Set((data ?? []).map((r) => r.daily_market_memory_id))];
  return { ids, error: null };
}

export async function listDmmSimilarityEdgesForSources(
  client: AdminQueryClient,
  sourceIds: string[],
  similarityMethod: string,
) {
  if (sourceIds.length === 0) {
    return { data: [] as DmmSimilarityEdgeListRow[], error: null };
  }

  const all: DmmSimilarityEdgeListRow[] = [];

  for (const chunk of chunkArray(sourceIds, SOURCE_ID_IN_CHUNK)) {
    const { data, error } = await client
      .from("daily_market_memory_similarity_edges")
      .select(
        "source_daily_market_memory_id, target_daily_market_memory_id, final_score, vector_score, tag_score",
      )
      .eq("similarity_method", similarityMethod)
      .in("source_daily_market_memory_id", chunk);

    if (error) {
      return { data: null, error };
    }
    all.push(...((data ?? []) as DmmSimilarityEdgeListRow[]));
  }

  return { data: all, error: null };
}

export async function countEligibleDmmSimilarityTargets(
  client: AdminQueryClient,
  sourceDailyMarketMemoryId: string,
) {
  const { data: source, error: sourceErr } = await client
    .from("daily_market_memories")
    .select("id, market_scope")
    .eq("id", sourceDailyMarketMemoryId)
    .maybeSingle();

  if (sourceErr) {
    return { count: 0, error: sourceErr };
  }
  if (!source) {
    return { count: 0, error: { message: "소스 일별 마켓 메모리를 찾을 수 없습니다." } };
  }

  const { count, error } = await client
    .from("daily_market_memories")
    .select("*", { count: "exact", head: true })
    .eq("market_scope", source.market_scope)
    .eq("status", "final")
    .neq("id", sourceDailyMarketMemoryId);

  if (error) {
    return { count: 0, error };
  }

  return { count: count ?? 0, error: null };
}

export async function fetchDailyMarketMemoryForPreview(
  client: AdminQueryClient,
  sourceDailyMarketMemoryId: string,
) {
  return client
    .from("daily_market_memories")
    .select("id, market_date, market_scope, status, similarity_status")
    .eq("id", sourceDailyMarketMemoryId)
    .maybeSingle();
}
