import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

type DB = SupabaseClient<Database>;

/** PostgREST `.in()` 안전 상한 — 한 번에 조회할 source id 개수 */
const SOURCE_ID_IN_CHUNK = 120;

export type ItemSimilarityListFilters = {
  /** `true` / `false`만 필터; `undefined`면 조건 없음(전체) */
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
  | "input_date"
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

/**
 * Admin 에이전트 전체 목록을 조회한다.
 *
 * @param client Supabase 서버 클라이언트
 * @returns `agents` 테이블 전체 컬럼을 `agent_key` 오름차순으로 정렬한 쿼리 결과
 */
export async function listAgents(client: DB) {
  return client.from("agents").select("*").order("agent_key", { ascending: true });
}

/**
 * 에이전트 선택 UI에 필요한 최소 필드만 조회한다.
 *
 * @param client Supabase 서버 클라이언트
 * @returns `agent_key`, `display_name`만 포함한 정렬 결과
 */
export async function listAgentsWithDisplayName(client: DB) {
  return client.from("agents").select("agent_key, display_name").order("agent_key");
}

/**
 * 파이프라인 목록 화면용 전체 데이터를 조회한다.
 *
 * @param client Supabase 서버 클라이언트
 * @returns `pipelines` 전체 컬럼을 `name` 오름차순으로 정렬한 결과
 */
export async function listPipelines(client: DB) {
  return client.from("pipelines").select("*").order("name", { ascending: true });
}

/**
 * 파이프라인 선택 UI에 필요한 식별/표시 필드만 조회한다.
 *
 * @param client Supabase 서버 클라이언트
 * @returns `pipeline_key`, `name` 필드 목록
 */
export async function listPipelinesForSelector(client: DB) {
  return client.from("pipelines").select("pipeline_key, name").order("name");
}

/**
 * `pipeline_key`로 단일 파이프라인을 조회한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param pipelineKey 조회 대상 파이프라인 키
 * @returns 매칭되는 한 건(`maybeSingle`) 또는 null
 */
export async function getPipelineByKey(client: DB, pipelineKey: string) {
  return client.from("pipelines").select("*").eq("pipeline_key", pipelineKey).maybeSingle();
}

/**
 * 특정 파이프라인의 실행 단계를 순서대로 조회한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param pipelineKey 단계 목록을 조회할 파이프라인 키
 * @returns `step` 오름차순으로 정렬된 `pipeline_steps` 결과
 */
export async function listPipelineStepsByKey(client: DB, pipelineKey: string) {
  return client
    .from("pipeline_steps")
    .select("*")
    .eq("pipeline_key", pipelineKey)
    .order("step", { ascending: true });
}

/**
 * 다음 단계 번호 계산을 위해 마지막 step 값을 조회한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param pipelineKey 대상 파이프라인 키
 * @returns `step` 단일 필드 한 건(`maybeSingle`) 또는 null
 */
export async function getLastPipelineStepByKey(client: DB, pipelineKey: string) {
  return client
    .from("pipeline_steps")
    .select("step")
    .eq("pipeline_key", pipelineKey)
    .order("step", { ascending: false })
    .limit(1)
    .maybeSingle();
}

/**
 * 프롬프트 템플릿 관리 화면의 목록 데이터를 조회한다.
 *
 * @param client Supabase 서버 클라이언트
 * @returns `updated_at` 최신순으로 정렬된 템플릿 목록
 */
export async function listPromptTemplates(client: DB) {
  return client
    .from("prompt_templates")
    .select("*")
    .order("updated_at", { ascending: false });
}

/**
 * 템플릿 선택 UI에 필요한 최소 필드만 조회한다.
 *
 * @param client Supabase 서버 클라이언트
 * @returns `id`, `name`, `version`, `agent_key` 목록
 */
export async function listPromptTemplatesForSelector(client: DB) {
  return client
    .from("prompt_templates")
    .select("id, name, version, agent_key")
    .order("agent_key");
}

/**
 * 템플릿 상세/수정 화면을 위해 id 기준 단건 조회한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param id 템플릿 UUID
 * @returns 매칭되는 템플릿 한 건(`maybeSingle`) 또는 null
 */
export async function getPromptTemplateById(client: DB, id: string) {
  return client.from("prompt_templates").select("*").eq("id", id).maybeSingle();
}

/**
 * 새 템플릿 버전 생성 시 기본값 상속을 위해
 * 특정 에이전트의 최신 템플릿 메타데이터를 조회한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param agentKey 대상 에이전트 키
 * @returns 최신 버전 한 건(`maybeSingle`) 또는 null
 */
export async function getLatestPromptTemplateByAgentKey(client: DB, agentKey: string) {
  return client
    .from("prompt_templates")
    .select(
      "version, temperature, api_mode, input_schema, output_schema, default_provider, default_model, default_params, is_backward_compatible",
    )
    .eq("agent_key", agentKey)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();
}

/**
 * 프롬프트 릴리스 고정 상태를 조회한다.
 *
 * @param client Supabase 서버 클라이언트
 * @returns `(agent_key, environment)` 기준 오름차순 정렬 결과
 */
export async function listPromptReleases(client: DB) {
  return client
    .from("prompt_releases")
    .select("*")
    .order("agent_key", { ascending: true })
    .order("environment", { ascending: true });
}

/**
 * 유사도 리스트 화면용 `item_contents` 행을 조회한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param filters `is_active` / `is_public` 선택 필터(미지정 시 전체)
 * @returns 목록용 컬럼만 포함, `created_at` 내림차순
 */
export async function listItemContentsForSimilarity(
  client: DB,
  filters: ItemSimilarityListFilters,
) {
  let q = client
    .from("item_contents")
    .select(
      "id, title, lang_code, category, report_type, report_tier, input_date, is_active, is_public, similarity_status, created_at",
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

/**
 * 하이브리드 유사도 RPC의 source 후보가 되는 `item_id` 목록을 구한다.
 * `get_item_similarity.sql`과 동일한 임베딩 조건을 사용한다.
 *
 * @param client Supabase 서버 클라이언트
 * @returns 중복 제거된 `item_contents.id` 배열
 */
export async function fetchEmbeddingSourceItemIds(client: DB) {
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

/**
 * 여러 source에 대한 `item_similarity_edges` 행을 묶어서 조회한다.
 *
 * @param client Supabase 서버 클라이언트
 * @param sourceIds `source_item_id` 목록
 * @param methodVersion `method_version` 일치 행만
 * @returns 화면 요약용 엣지 필드 배열
 */
export async function listSimilarityEdgesForSources(
  client: DB,
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
