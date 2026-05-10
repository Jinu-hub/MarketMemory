import type { AdminQueryClient } from "./db";

export async function listPipelines(client: AdminQueryClient) {
  return client.from("pipelines").select("*").order("name", { ascending: true });
}

export async function listPipelinesForSelector(client: AdminQueryClient) {
  return client.from("pipelines").select("pipeline_key, name").order("name");
}

export async function getPipelineByKey(client: AdminQueryClient, pipelineKey: string) {
  return client.from("pipelines").select("*").eq("pipeline_key", pipelineKey).maybeSingle();
}

export async function listPipelineStepsByKey(client: AdminQueryClient, pipelineKey: string) {
  return client
    .from("pipeline_steps")
    .select("*")
    .eq("pipeline_key", pipelineKey)
    .order("step", { ascending: true });
}

export async function getLastPipelineStepByKey(client: AdminQueryClient, pipelineKey: string) {
  return client
    .from("pipeline_steps")
    .select("step")
    .eq("pipeline_key", pipelineKey)
    .order("step", { ascending: false })
    .limit(1)
    .maybeSingle();
}
