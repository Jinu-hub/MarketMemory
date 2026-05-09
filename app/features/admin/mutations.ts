import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json, TablesInsert } from "database.types";

import { fetchEmbeddingSourceItemIds } from "./queries";

type DB = SupabaseClient<Database>;

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
  client: DB,
  sourceItemContentId: string,
  status: Database["public"]["Enums"]["similarity_status"],
) {
  const { error } = await client
    .from("item_contents")
    .update({ similarity_status: status })
    .eq("id", sourceItemContentId);
  return { error };
}

/**
 * 새 에이전트를 생성한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param values 생성할 에이전트 값(`agent_key`, `display_name`)
 * @returns insert 실행 결과
 */
export async function createAgent(
  client: DB,
  values: {
    agent_key: string;
    display_name: string | null;
  },
) {
  return client.from("agents").insert(values);
}

/**
 * `agent_key` 기준으로 에이전트 표시 이름만 수정한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param values 수정 대상 키와 새 표시 이름
 * @returns update 실행 결과
 */
export async function updateAgentDisplayName(
  client: DB,
  values: {
    agent_key: string;
    display_name: string | null;
  },
) {
  return client
    .from("agents")
    .update({
      display_name: values.display_name,
    })
    .eq("agent_key", values.agent_key);
}

/**
 * `agent_key` 기준으로 에이전트를 삭제한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param agentKey 삭제할 에이전트 키
 * @returns delete 실행 결과
 */
export async function deleteAgentByKey(client: DB, agentKey: string) {
  return client.from("agents").delete().eq("agent_key", agentKey);
}

/**
 * 새 파이프라인을 생성한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param values 생성할 파이프라인 메타데이터
 * @returns insert 실행 결과
 */
export async function createPipeline(
  client: DB,
  values: {
    pipeline_key: string;
    name: string;
    description: string | null;
    status: Database["public"]["Enums"]["pipeline_status"];
    updated_at: string;
  },
) {
  return client.from("pipelines").insert(values);
}

/**
 * `pipeline_key` 기준으로 파이프라인 메타데이터를 수정한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param pipelineKey 수정 대상 파이프라인 키
 * @param values 변경할 이름/설명/상태/수정시각
 * @returns update 실행 결과
 */
export async function updatePipelineByKey(
  client: DB,
  pipelineKey: string,
  values: {
    name: string;
    description: string | null;
    status: Database["public"]["Enums"]["pipeline_status"];
    updated_at: string;
  },
) {
  return client.from("pipelines").update(values).eq("pipeline_key", pipelineKey);
}

/**
 * 파이프라인을 row `id` 기준으로 삭제한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param id 삭제할 파이프라인 UUID
 * @returns delete 실행 결과
 */
export async function deletePipelineById(client: DB, id: string) {
  return client.from("pipelines").delete().eq("id", id);
}

/**
 * 프롬프트 템플릿의 새 버전을 생성한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param values 템플릿 버전 레코드 전체 입력값
 * @returns insert 실행 결과
 */
export async function createPromptTemplate(
  client: DB,
  values: {
    agent_key: string;
    name: string;
    template: string;
    version: number;
    status: Database["public"]["Enums"]["prompt_status"];
    temperature: number | null;
    api_mode: Database["public"]["Enums"]["api_mode"];
    input_schema: Json | null;
    output_schema: Json | null;
    default_provider: string | null;
    default_model: string | null;
    default_params: Json | null;
    is_backward_compatible: boolean;
    changelog: string | null;
    created_by: string | null;
    updated_at: string;
  },
) {
  return client.from("prompt_templates").insert(values);
}

/**
 * 템플릿 id 기준으로 기존 프롬프트 템플릿을 수정한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param id 수정할 템플릿 UUID
 * @param values 변경할 템플릿 속성들
 * @returns update 실행 결과
 */
export async function updatePromptTemplateById(
  client: DB,
  id: string,
  values: {
    name: string;
    template: string;
    status: Database["public"]["Enums"]["prompt_status"];
    temperature: number | null;
    api_mode: Database["public"]["Enums"]["api_mode"];
    changelog: string | null;
    default_provider: string | null;
    default_model: string | null;
    input_schema: Json | null;
    output_schema: Json | null;
    default_params: Json | null;
    is_backward_compatible: boolean;
    updated_at: string;
  },
) {
  return client.from("prompt_templates").update(values).eq("id", id);
}

/**
 * 템플릿 id 기준으로 프롬프트 템플릿을 삭제한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param id 삭제할 템플릿 UUID
 * @returns delete 실행 결과
 */
export async function deletePromptTemplateById(client: DB, id: string) {
  return client.from("prompt_templates").delete().eq("id", id);
}

/**
 * 파이프라인 단계 1건을 추가한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param values 추가할 단계 데이터
 * @returns insert 실행 결과
 */
export async function createPipelineStep(
  client: DB,
  values: {
    pipeline_key: string;
    step: number;
    target_type: Database["public"]["Enums"]["target_type"];
    target_key: string;
    is_required: boolean;
  },
) {
  return client.from("pipeline_steps").insert(values);
}

/**
 * 파이프라인 단계 다건을 일괄 추가한다.
 * 주로 재정렬 후 재삽입 시 사용한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param values 삽입할 단계 배열
 * @returns bulk insert 실행 결과
 */
export async function createPipelineStepsBulk(
  client: DB,
  values: {
    pipeline_key: string;
    step: number;
    target_type: Database["public"]["Enums"]["target_type"];
    target_key: string;
    is_required: boolean;
  }[],
) {
  return client.from("pipeline_steps").insert(values);
}

/**
 * 단계 id 기준으로 파이프라인 단계를 삭제한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param id 삭제할 단계 UUID
 * @returns delete 실행 결과
 */
export async function deletePipelineStepById(client: DB, id: string) {
  return client.from("pipeline_steps").delete().eq("id", id);
}

/**
 * 특정 파이프라인에 속한 모든 단계를 삭제한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param pipelineKey 대상 파이프라인 키
 * @returns delete 실행 결과
 */
export async function deletePipelineStepsByPipelineKey(client: DB, pipelineKey: string) {
  return client.from("pipeline_steps").delete().eq("pipeline_key", pipelineKey);
}

/**
 * `(agent_key, environment)` 유니크 키 기준으로 릴리스를 upsert 한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param values 릴리스 고정 데이터
 * @returns upsert 실행 결과
 */
export async function upsertPromptRelease(
  client: DB,
  values: {
    agent_key: string;
    environment: string;
    active_prompt_id: string;
    release_note: string | null;
    released_by: string | null;
    updated_at: string;
  },
) {
  return client.from("prompt_releases").upsert(values, {
    onConflict: "agent_key,environment",
  });
}

/**
 * 릴리스 row를 id 기준으로 삭제한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param id 삭제할 릴리스 UUID
 * @returns delete 실행 결과
 */
export async function deletePromptReleaseById(client: DB, id: string) {
  return client.from("prompt_releases").delete().eq("id", id);
}

/**
 * 특정 source·버전에 해당하는 유사도 엣지를 모두 삭제한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param sourceItemId `item_contents.id` (source)
 * @param methodVersion 스코어링 버전 키
 * @returns delete 실행 결과
 */
export async function deleteSimilarityEdgesBySource(
  client: DB,
  sourceItemId: string,
  methodVersion: string,
) {
  return client
    .from("item_similarity_edges")
    .delete()
    .eq("source_item_id", sourceItemId)
    .eq("method_version", methodVersion);
}

/**
 * 유사도 엣지를 일괄 삽입한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param rows 삽입 행 배열
 * @returns insert 실행 결과(빈 배열이면 no-op)
 */
export async function insertSimilarityEdges(
  client: DB,
  rows: TablesInsert<"item_similarity_edges">[],
) {
  if (rows.length === 0) {
    return { error: null };
  }
  return client.from("item_similarity_edges").insert(rows);
}

/**
 * RPC로 후보를 계산한 뒤, 해당 source의 기존 엣지를 지우고 새로 저장한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param sourceItemId 기준 `item_contents.id`
 * @param methodVersion `method_version` (기본 hybrid_v1)
 * @returns 삽입된 엣지 수와 오류
 */
export async function regenerateItemSimilarityEdges(
  client: DB,
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

/**
 * 임베딩 조건을 만족하는 모든 source에 대해 `regenerateItemSimilarityEdges`를 순차 실행한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param methodVersion 엣지 버전 키
 * @returns 처리 건수·총 삽입 수·개별 오류 목록
 */
export async function regenerateAllItemSimilarityEdges(
  client: DB,
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
