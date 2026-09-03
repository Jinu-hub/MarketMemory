import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "database.types";

import type {
  ItemContentSignalSource,
  MarketSignalScopeType,
  MarketSignalSourceKind,
} from "~/features/cron/lib/market-signal/types";

/** scope 내 snapshot_sources에 기록된 source_id → input_hash */
export async function fetchIndexedSnapshotSources(
  db: SupabaseClient<Database>,
  params: {
    scopeType: MarketSignalScopeType;
    scopeKey: string;
    sourceKind: MarketSignalSourceKind;
  },
): Promise<Map<string, string | null>> {
  const { data: snapshots, error: snapshotError } = await db
    .from("market_signal_snapshots")
    .select("id")
    .eq("scope_type", params.scopeType)
    .eq("scope_key", params.scopeKey);

  if (snapshotError) {
    throw new Error(`snapshot id 조회 실패: ${snapshotError.message}`);
  }

  const snapshotIds = (snapshots ?? []).map((row) => row.id);
  if (snapshotIds.length === 0) {
    return new Map();
  }

  const { data: sources, error: sourcesError } = await db
    .from("market_signal_snapshot_sources")
    .select("source_id, input_hash")
    .eq("source_kind", params.sourceKind)
    .in("snapshot_id", snapshotIds);

  if (sourcesError) {
    throw new Error(`snapshot sources 조회 실패: ${sourcesError.message}`);
  }

  const indexed = new Map<string, string | null>();
  for (const row of sources ?? []) {
    if (!indexed.has(row.source_id)) {
      indexed.set(row.source_id, row.input_hash);
    }
  }
  return indexed;
}

/** 아직 snapshot에 반영되지 않았거나 input_hash가 바뀐 source */
export function filterSourcesNeedingProcessing(
  sources: ItemContentSignalSource[],
  indexed: Map<string, string | null>,
): ItemContentSignalSource[] {
  return sources.filter((source) => {
    if (!indexed.has(source.id)) {
      return true;
    }
    const storedHash = indexed.get(source.id) ?? null;
    const currentHash = source.input_hash ?? null;
    return storedHash !== currentHash;
  });
}
