import type { Database } from "database.types";

import type { AdminDb } from "./types";

export async function createPipeline(
  client: AdminDb,
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

export async function updatePipelineByKey(
  client: AdminDb,
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

export async function deletePipelineById(client: AdminDb, id: string) {
  return client.from("pipelines").delete().eq("id", id);
}

export async function createPipelineStep(
  client: AdminDb,
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

export async function createPipelineStepsBulk(
  client: AdminDb,
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

export async function deletePipelineStepById(client: AdminDb, id: string) {
  return client.from("pipeline_steps").delete().eq("id", id);
}

export async function deletePipelineStepsByPipelineKey(
  client: AdminDb,
  pipelineKey: string,
) {
  return client.from("pipeline_steps").delete().eq("pipeline_key", pipelineKey);
}
