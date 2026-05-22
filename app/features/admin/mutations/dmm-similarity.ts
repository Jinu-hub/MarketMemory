import {
  buildDmmPreviewSummary,
  DMM_SIMILARITY_PREVIEW_LIMIT,
  partitionDmmPreviewCandidates,
  type DmmPreviewCandidateRow,
  type DmmPreviewPartition,
  type DmmPreviewSummary,
} from "../lib/dmm-similarity-preview";
import {
  countEligibleDmmSimilarityTargets,
  fetchDailyMarketMemoryForPreview,
  fetchEmbeddingDailyMarketMemoryIds,
  fetchReadyDailyMarketMemoryIds,
} from "../queries/dmm-similarity";

import type { AdminDb } from "./types";

export const DEFAULT_DMM_SIMILARITY_METHOD = "hybrid_v1" as const;

export type PreviewDailyMarketMemorySimilarityResult = {
  source: {
    id: string;
    market_date: string;
    market_scope: string;
    status: string;
    similarity_status: string | null;
  };
  candidates: DmmPreviewCandidateRow[];
  partition: DmmPreviewPartition;
  summary: DmmPreviewSummary;
  error: { message: string } | null;
};

export async function previewDailyMarketMemorySimilarity(
  client: AdminDb,
  sourceDailyMarketMemoryId: string,
  similarityMethod: string = DEFAULT_DMM_SIMILARITY_METHOD,
): Promise<PreviewDailyMarketMemorySimilarityResult> {
  const empty = {
    source: {
      id: sourceDailyMarketMemoryId,
      market_date: "",
      market_scope: "",
      status: "",
      similarity_status: null,
    },
    candidates: [] as DmmPreviewCandidateRow[],
    partition: { passedCandidates: [], belowThresholdTop: [] },
    summary: buildDmmPreviewSummary([], 0),
    error: null as { message: string } | null,
  };

  const [{ data: source, error: sourceErr }, { count: eligibleTargetCount, error: eligErr }] =
    await Promise.all([
      fetchDailyMarketMemoryForPreview(client, sourceDailyMarketMemoryId),
      countEligibleDmmSimilarityTargets(client, sourceDailyMarketMemoryId),
    ]);

  if (sourceErr) {
    return { ...empty, error: sourceErr };
  }
  if (!source) {
    return { ...empty, error: { message: "소스 일별 마켓 메모리를 찾을 수 없습니다." } };
  }
  if (eligErr) {
    return { ...empty, error: eligErr };
  }

  const { data, error } = await client.rpc("preview_daily_market_memory_similarity_edges", {
    p_source_daily_market_memory_id: sourceDailyMarketMemoryId,
    p_similarity_method: similarityMethod,
    p_min_final_score: 0,
    p_result_limit: DMM_SIMILARITY_PREVIEW_LIMIT,
  });

  if (error) {
    return { ...empty, error };
  }

  const candidates = (data ?? []) as DmmPreviewCandidateRow[];
  const partition = partitionDmmPreviewCandidates(candidates);

  return {
    source: {
      id: source.id,
      market_date: source.market_date,
      market_scope: source.market_scope,
      status: source.status,
      similarity_status: source.similarity_status,
    },
    candidates,
    partition,
    summary: buildDmmPreviewSummary(candidates, eligibleTargetCount, partition),
    error: null,
  };
}

export async function regenerateDailyMarketMemorySimilarity(
  client: AdminDb,
  sourceDailyMarketMemoryId: string,
  similarityMethod: string = DEFAULT_DMM_SIMILARITY_METHOD,
): Promise<{ inserted: number; error: { message: string } | null }> {
  const { data, error } = await client.rpc("regenerate_daily_market_memory_similarity_once", {
    p_source_daily_market_memory_id: sourceDailyMarketMemoryId,
    p_similarity_method: similarityMethod,
  });

  if (error) {
    return { inserted: 0, error };
  }

  const row = data?.[0];
  return {
    inserted: row?.inserted_count ?? 0,
    error: null,
  };
}

export type RegenerateDmmSimilarityWithSecondaryResult = {
  inserted: number;
  secondaryRewrites: number;
  topTargetIds: string[];
  error: { message: string } | null;
};

export async function regenerateDailyMarketMemorySimilarityWithSecondary(
  client: AdminDb,
  sourceDailyMarketMemoryId: string,
  similarityMethod: string = DEFAULT_DMM_SIMILARITY_METHOD,
): Promise<RegenerateDmmSimilarityWithSecondaryResult> {
  const { data, error } = await client.rpc(
    "regenerate_daily_market_memory_similarity_with_secondary",
    {
      p_source_daily_market_memory_id: sourceDailyMarketMemoryId,
      p_similarity_method: similarityMethod,
    },
  );

  if (error) {
    return {
      inserted: 0,
      secondaryRewrites: 0,
      topTargetIds: [],
      error,
    };
  }

  const payload = data as {
    inserted_count?: number;
    secondary_rewrites?: number;
    top_target_ids?: string[];
  } | null;

  return {
    inserted: payload?.inserted_count ?? 0,
    secondaryRewrites: payload?.secondary_rewrites ?? 0,
    topTargetIds: payload?.top_target_ids ?? [],
    error: null,
  };
}

export async function regenerateAllDailyMarketMemorySimilarity(
  client: AdminDb,
  similarityMethod: string = DEFAULT_DMM_SIMILARITY_METHOD,
): Promise<{
  processed: number;
  totalInserted: number;
  errors: { sourceId: string; message: string }[];
}> {
  const { ids, error: idErr } = await fetchEmbeddingDailyMarketMemoryIds(client);
  if (idErr) {
    return {
      processed: 0,
      totalInserted: 0,
      errors: [{ sourceId: "_fetch", message: idErr.message }],
    };
  }

  const errors: { sourceId: string; message: string }[] = [];
  let totalInserted = 0;

  for (const id of ids) {
    const { inserted, error } = await regenerateDailyMarketMemorySimilarity(
      client,
      id,
      similarityMethod,
    );
    if (error) {
      errors.push({ sourceId: id, message: error.message });
    } else {
      totalInserted += inserted;
    }
  }

  return { processed: ids.length, totalInserted, errors };
}

export async function regenerateReadyDailyMarketMemorySimilarity(
  client: AdminDb,
  similarityMethod: string = DEFAULT_DMM_SIMILARITY_METHOD,
): Promise<{
  processed: number;
  totalInserted: number;
  errors: { sourceId: string; message: string }[];
}> {
  const { ids, error: idErr } = await fetchReadyDailyMarketMemoryIds(client);
  if (idErr) {
    return {
      processed: 0,
      totalInserted: 0,
      errors: [{ sourceId: "_fetch", message: idErr.message }],
    };
  }

  const errors: { sourceId: string; message: string }[] = [];
  let totalInserted = 0;

  for (const id of ids) {
    const { inserted, error } = await regenerateDailyMarketMemorySimilarity(
      client,
      id,
      similarityMethod,
    );
    if (error) {
      errors.push({ sourceId: id, message: error.message });
    } else {
      totalInserted += inserted;
    }
  }

  return { processed: ids.length, totalInserted, errors };
}
