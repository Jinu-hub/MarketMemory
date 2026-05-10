import type { AdminDb } from "./types";

export async function upsertPromptRelease(
  client: AdminDb,
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

export async function deletePromptReleaseById(client: AdminDb, id: string) {
  return client.from("prompt_releases").delete().eq("id", id);
}
