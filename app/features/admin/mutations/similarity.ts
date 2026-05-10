import type { Database, Json, TablesInsert } from "database.types";

import {
  fetchEmbeddingSourceItemIds,
  fetchReadyItemContentIds,
} from "../queries";

import type { AdminDb } from "./types";

/** `item_similarity_edges.method_version` 기본값 — RPC 시그니처와 동일 */
export const DEFAULT_SIMILARITY_METHOD_VERSION = "hybrid_v1" as const;

function numericFieldToDb(value: number | null | undefined): number | null {
  if (value == null || Number.isNaN(value)) {
    return null;
  }
  return value;
}

function toSimilarityLevel(
  score: number | null | undefined,
): Database["public"]["Enums"]["similarity_level"] {
  const n = score ?? 0;
  if (n >= 0.8) return "strong";
  if (n >= 0.7) return "high";
  if (n >= 0.6) return "medium";
  return "weak";
}

async function updateSimilarityStatusBySourceContentId(
  client: AdminDb,
  sourceItemContentId: string,
  status: Database["public"]["Enums"]["similarity_status"],
) {
  const { error } = await client
    .from("item_contents")
    .update({ similarity_status: status })
    .eq("id", sourceItemContentId);
  return { error };
}

export async function deleteSimilarityEdgesBySource(
  client: AdminDb,
  sourceItemId: string,
  methodVersion: string,
) {
  return client
    .from("item_similarity_edges")
    .delete()
    .eq("source_item_id", sourceItemId)
    .eq("method_version", methodVersion);
}

export async function insertSimilarityEdges(
  client: AdminDb,
  rows: TablesInsert<"item_similarity_edges">[],
) {
  if (rows.length === 0) {
    return { error: null };
  }
  return client.from("item_similarity_edges").insert(rows);
}

export async function regenerateItemSimilarityEdges(
  client: AdminDb,
  sourceItemId: string,
  methodVersion: string = DEFAULT_SIMILARITY_METHOD_VERSION,
): Promise<{ inserted: number; error: { message: string } | null }> {
  const { data: rows, error: fnErr } = await client.rpc("compute_item_similarity_edges", {
    p_source_item_id: sourceItemId,
    p_method_version: methodVersion,
  });

  if (fnErr) {
    return { inserted: 0, error: fnErr };
  }

  const { error: delErr } = await deleteSimilarityEdgesBySource(
    client,
    sourceItemId,
    methodVersion,
  );
  if (delErr) {
    return { inserted: 0, error: delErr };
  }

  const list = rows ?? [];
  if (list.length === 0) {
    const { error: statusErr } = await updateSimilarityStatusBySourceContentId(
      client,
      sourceItemId,
      "nothing",
    );
    if (statusErr) {
      return { inserted: 0, error: statusErr };
    }
    return { inserted: 0, error: null };
  }

  const { data: sourceContent, error: sourceErr } = await client
    .from("item_contents")
    .select("market_memory_item_id")
    .eq("id", sourceItemId)
    .maybeSingle();
  if (sourceErr) {
    return { inserted: 0, error: sourceErr };
  }

  const targetIds = [...new Set(list.map((r) => r.target_item_id))];
  const { data: activeTargets, error: activeErr } = await client
    .from("item_contents")
    .select("id, market_memory_item_id")
    .eq("is_active", true)
    .in("id", targetIds);
  if (activeErr) {
    return { inserted: 0, error: activeErr };
  }

  const sourceMarketMemoryItemId = sourceContent?.market_memory_item_id ?? null;
  const validTargetIdSet = new Set(
    (activeTargets ?? [])
      .filter((t) =>
        sourceMarketMemoryItemId == null
          ? true
          : t.market_memory_item_id !== sourceMarketMemoryItemId,
      )
      .map((t) => t.id),
  );
  const filtered = list.filter((r) => validTargetIdSet.has(r.target_item_id));
  if (filtered.length === 0) {
    const { error: statusErr } = await updateSimilarityStatusBySourceContentId(
      client,
      sourceItemId,
      "nothing",
    );
    if (statusErr) {
      return { inserted: 0, error: statusErr };
    }
    return { inserted: 0, error: null };
  }

  const ranked = [...filtered].sort((a, b) => {
    const af = a.final_score ?? Number.NEGATIVE_INFINITY;
    const bf = b.final_score ?? Number.NEGATIVE_INFINITY;
    if (bf !== af) return bf - af;
    return a.target_item_id.localeCompare(b.target_item_id);
  });

  const insertRows: TablesInsert<"item_similarity_edges">[] = ranked.map((r, idx) => ({
    source_item_id: sourceItemId,
    target_item_id: r.target_item_id,
    vector_score: numericFieldToDb(r.vector_score),
    tag_score: numericFieldToDb(r.tag_score),
    final_score: numericFieldToDb(r.final_score),
    similarity_level: toSimilarityLevel(r.final_score),
    ranking: idx + 1,
    shared_tags: (r.shared_tag_ids ?? null) as Json | null,
    method_version: methodVersion,
  }));

  const { error: insErr } = await insertSimilarityEdges(client, insertRows);
  if (insErr) {
    return { inserted: 0, error: insErr };
  }

  const { error: statusErr } = await updateSimilarityStatusBySourceContentId(
    client,
    sourceItemId,
    "done",
  );
  if (statusErr) {
    return { inserted: 0, error: statusErr };
  }

  return { inserted: ranked.length, error: null };
}

export async function regenerateAllItemSimilarityEdges(
  client: AdminDb,
  methodVersion: string = DEFAULT_SIMILARITY_METHOD_VERSION,
): Promise<{
  processed: number;
  totalInserted: number;
  errors: { sourceItemId: string; message: string }[];
}> {
  const { ids, error: idErr } = await fetchEmbeddingSourceItemIds(client);
  if (idErr) {
    return {
      processed: 0,
      totalInserted: 0,
      errors: [{ sourceItemId: "_fetch", message: idErr.message }],
    };
  }

  const errors: { sourceItemId: string; message: string }[] = [];
  let totalInserted = 0;

  for (const id of ids) {
    const { inserted, error } = await regenerateItemSimilarityEdges(client, id, methodVersion);
    if (error) {
      errors.push({ sourceItemId: id, message: error.message });
    } else {
      totalInserted += inserted;
    }
  }

  return { processed: ids.length, totalInserted, errors };
}

export async function regenerateReadyItemSimilarityEdges(
  client: AdminDb,
  methodVersion: string = DEFAULT_SIMILARITY_METHOD_VERSION,
): Promise<{
  processed: number;
  totalInserted: number;
  errors: { sourceItemId: string; message: string }[];
}> {
  const { ids, error: idErr } = await fetchReadyItemContentIds(client);
  if (idErr) {
    return {
      processed: 0,
      totalInserted: 0,
      errors: [{ sourceItemId: "_fetch", message: idErr.message }],
    };
  }

  const errors: { sourceItemId: string; message: string }[] = [];
  let totalInserted = 0;

  for (const id of ids) {
    const { inserted, error } = await regenerateItemSimilarityEdges(client, id, methodVersion);
    if (error) {
      errors.push({ sourceItemId: id, message: error.message });
    } else {
      totalInserted += inserted;
    }
  }

  return { processed: ids.length, totalInserted, errors };
}
