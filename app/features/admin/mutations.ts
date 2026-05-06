import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "database.types";

type DB = SupabaseClient<Database>;

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
