import type { Json } from "database.types";

import type {
  CollectionPresetRow,
  FounderOsDb,
} from "../lib/db";
import type { CollectFormValues } from "../lib/collect-form-values";

import { strategyFromFormValues } from "../lib/collect-form-values";

export const PRESETS_LIMIT = 30;

export type { CollectionPresetRow };

const PRESET_COLUMNS =
  "id, name, source, keywords, content_type, sort_mode, time_range, requested_limit, observation_strategy, last_used_at, created_at, updated_at";

export async function listCollectionPresets(client: FounderOsDb) {
  return client
    .from("collection_presets")
    .select(PRESET_COLUMNS)
    .order("last_used_at", { ascending: false, nullsFirst: false })
    .order("updated_at", { ascending: false })
    .limit(PRESETS_LIMIT);
}

export async function createCollectionPreset(
  client: FounderOsDb,
  input: { name: string; values: CollectFormValues },
) {
  const name = input.name.trim();
  if (name.length === 0) {
    return { data: null, error: { message: "프리셋 이름을 입력해 주세요." } };
  }
  if (input.values.keywords.length === 0) {
    return {
      data: null,
      error: { message: "저장하려면 검색 키워드가 한 개 이상 필요합니다." },
    };
  }

  const now = new Date().toISOString();
  return client
    .from("collection_presets")
    .insert({
      name,
      source: input.values.source,
      keywords: input.values.keywords,
      content_type: input.values.contentType,
      sort_mode: input.values.sortMode,
      time_range: input.values.timeRange,
      requested_limit: input.values.limit,
      observation_strategy: (strategyFromFormValues(input.values) ??
        null) as Json | null,
      last_used_at: now,
      updated_at: now,
    })
    .select(PRESET_COLUMNS)
    .single();
}

export async function deleteCollectionPreset(
  client: FounderOsDb,
  presetId: string,
) {
  return client.from("collection_presets").delete().eq("id", presetId);
}

export async function touchCollectionPreset(
  client: FounderOsDb,
  presetId: string,
) {
  const now = new Date().toISOString();
  return client
    .from("collection_presets")
    .update({ last_used_at: now, updated_at: now })
    .eq("id", presetId);
}
