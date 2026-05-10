import type { AdminDb } from "./types";

/**
 * 새 에이전트를 생성한다.
 */
export async function createAgent(
  client: AdminDb,
  values: {
    agent_key: string;
    display_name: string | null;
  },
) {
  return client.from("agents").insert(values);
}

/**
 * `agent_key` 기준으로 에이전트 표시 이름만 수정한다.
 */
export async function updateAgentDisplayName(
  client: AdminDb,
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
 */
export async function deleteAgentByKey(client: AdminDb, agentKey: string) {
  return client.from("agents").delete().eq("agent_key", agentKey);
}
