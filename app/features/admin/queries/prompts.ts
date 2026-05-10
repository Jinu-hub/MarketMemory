import type { AdminQueryClient } from "./db";

export async function listPromptTemplates(client: AdminQueryClient) {
  return client
    .from("prompt_templates")
    .select("*")
    .order("updated_at", { ascending: false });
}

export async function listPromptTemplatesForSelector(client: AdminQueryClient) {
  return client
    .from("prompt_templates")
    .select("id, name, version, agent_key")
    .order("agent_key");
}

export async function getPromptTemplateById(client: AdminQueryClient, id: string) {
  return client.from("prompt_templates").select("*").eq("id", id).maybeSingle();
}

export async function getLatestPromptTemplateByAgentKey(client: AdminQueryClient, agentKey: string) {
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

export async function listPromptReleases(client: AdminQueryClient) {
  return client
    .from("prompt_releases")
    .select("*")
    .order("agent_key", { ascending: true })
    .order("environment", { ascending: true });
}
