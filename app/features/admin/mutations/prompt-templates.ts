import type { Database, Json } from "database.types";

import type { AdminDb } from "./types";

export async function createPromptTemplate(
  client: AdminDb,
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

export async function updatePromptTemplateById(
  client: AdminDb,
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

export async function deletePromptTemplateById(client: AdminDb, id: string) {
  return client.from("prompt_templates").delete().eq("id", id);
}
