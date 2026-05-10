import type { AdminQueryClient } from "./db";

export async function listAgents(client: AdminQueryClient) {
  return client.from("agents").select("*").order("agent_key", { ascending: true });
}

export async function listAgentsWithDisplayName(client: AdminQueryClient) {
  return client.from("agents").select("agent_key, display_name").order("agent_key");
}
