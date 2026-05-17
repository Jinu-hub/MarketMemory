import type { TablesInsert } from "database.types";

import {
  fetchEmbeddingSourceItemIds,
  fetchReadyItemContentIds,
} from "../queries";

import type { AdminDb } from "./types";

/** `item_similarity_edges.method_version` 기본값 — RPC 시그니처와 동일 */
export const DEFAULT_SIMILARITY_METHOD_VERSION = "hybrid_v1" as const;

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

/**
 * 소스 리포트 1건의 `item_similarity_edges` 재생성.
 * DB `regenerate_similarity_edges_once`와 동일 로직(compute → delete → insert → status).
 */
export async function regenerateItemSimilarityEdges(
  client: AdminDb,
  sourceItemId: string,
  methodVersion: string = DEFAULT_SIMILARITY_METHOD_VERSION,
): Promise<{ inserted: number; error: { message: string } | null }> {
  const { data, error } = await client.rpc("regenerate_similarity_edges_once", {
    p_source_item_id: sourceItemId,
    p_method_version: methodVersion,
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
