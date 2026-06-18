import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

import { resolveReportInputDateQuery } from "~/features/cron/lib/daily-market-memory-input-date";

type DB = SupabaseClient<Database>;

type MemoryForSourcesRow = {
  id: string;
  market_date: string;
  coverage_start_at: string | null;
  coverage_end_at: string | null;
  source_report_count: number;
  model_info: unknown;
};

type ExpectedSourceReport = {
  id: string;
  market_memory_item_id: string;
  title: string | null;
  report_type: string | null;
  lang_code: string;
};

type SourceRow = {
  item_content_id: string;
  market_memory_item_id: string | null;
};

export type DailyMarketMemorySourcesConsistency = {
  ok: boolean;
  expectedCount: number;
  actualCount: number;
  staleSourceIds: string[];
  missingActiveIds: string[];
  countMismatch: boolean;
};

function resolvePipelineLangCode(modelInfo: unknown): string {
  const langCode = (modelInfo as { langCode?: string } | null)?.langCode?.trim();
  return langCode || "ko";
}

async function loadMemoryForSources(
  client: DB,
  memoryId: string,
): Promise<MemoryForSourcesRow | null> {
  const { data, error } = await client
    .from("daily_market_memories")
    .select(
      "id,market_date,coverage_start_at,coverage_end_at,source_report_count,model_info",
    )
    .eq("id", memoryId)
    .maybeSingle();

  if (error) throw error;
  return data as MemoryForSourcesRow | null;
}

async function fetchExpectedSourceReports(
  client: DB,
  memory: MemoryForSourcesRow,
): Promise<ExpectedSourceReport[]> {
  const inputDateQuery = resolveReportInputDateQuery(
    memory.market_date,
    memory.coverage_start_at,
    memory.coverage_end_at,
  );
  const langCode = resolvePipelineLangCode(memory.model_info);

  let query = client
    .from("item_contents")
    .select("id,market_memory_item_id,title,report_type,lang_code")
    .eq("is_active", true)
    .eq("is_public", true)
    .eq("lang_code", langCode);

  if (inputDateQuery.mode === "coverage_range") {
    query = query
      .gte("market_date", inputDateQuery.marketDateStart)
      .lte("market_date", inputDateQuery.marketDateEnd);
  } else {
    query = query.eq("market_date", memory.market_date);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []) as ExpectedSourceReport[];
}

async function loadCurrentSources(
  client: DB,
  memoryId: string,
): Promise<SourceRow[]> {
  const { data, error } = await client
    .from("daily_market_memory_sources")
    .select("item_content_id,market_memory_item_id")
    .eq("daily_market_memory_id", memoryId);

  if (error) throw error;
  return (data ?? []) as SourceRow[];
}

async function loadInactiveSourceIds(
  client: DB,
  sourceIds: string[],
): Promise<Set<string>> {
  if (sourceIds.length === 0) return new Set();

  const { data, error } = await client
    .from("item_contents")
    .select("id,is_active,is_public")
    .in("id", sourceIds);

  if (error) throw error;

  const stale = new Set<string>();
  for (const row of data ?? []) {
    if (!row.is_active || !row.is_public) {
      stale.add(row.id);
    }
  }

  for (const id of sourceIds) {
    const found = (data ?? []).some((row) => row.id === id);
    if (!found) stale.add(id);
  }

  return stale;
}

function diffSourceSets(
  expected: ExpectedSourceReport[],
  current: SourceRow[],
): Pick<
  DailyMarketMemorySourcesConsistency,
  "staleSourceIds" | "missingActiveIds"
> {
  const expectedIds = new Set(expected.map((row) => row.id));
  const currentIds = new Set(current.map((row) => row.item_content_id));

  const missingActiveIds = [...expectedIds].filter((id) => !currentIds.has(id));
  const extraIds = [...currentIds].filter((id) => !expectedIds.has(id));

  return {
    missingActiveIds,
    staleSourceIds: extraIds,
  };
}

export async function checkDailyMarketMemorySourcesConsistency(
  client: DB,
  memoryId: string,
): Promise<DailyMarketMemorySourcesConsistency | null> {
  const memory = await loadMemoryForSources(client, memoryId);
  if (!memory) return null;

  const [expected, current] = await Promise.all([
    fetchExpectedSourceReports(client, memory),
    loadCurrentSources(client, memoryId),
  ]);

  const { missingActiveIds, staleSourceIds: extraIds } = diffSourceSets(
    expected,
    current,
  );
  const inactiveSourceIds = await loadInactiveSourceIds(
    client,
    current.map((row) => row.item_content_id),
  );

  const staleSourceIds = [...new Set([...extraIds, ...inactiveSourceIds])];
  const countMismatch = memory.source_report_count !== current.length;
  const ok =
    staleSourceIds.length === 0 &&
    missingActiveIds.length === 0 &&
    !countMismatch &&
    expected.length === current.length;

  return {
    ok,
    expectedCount: expected.length,
    actualCount: current.length,
    staleSourceIds,
    missingActiveIds,
    countMismatch,
  };
}

export type ReconcileDailyMarketMemorySourcesResult = {
  sourceCount: number;
};

export async function reconcileDailyMarketMemorySources(
  client: DB,
  memoryId: string,
): Promise<ReconcileDailyMarketMemorySourcesResult> {
  const memory = await loadMemoryForSources(client, memoryId);
  if (!memory) {
    throw new Error("Daily market memory not found");
  }

  const expected = await fetchExpectedSourceReports(client, memory);
  const weight =
    expected.length > 0 ? Number((1 / expected.length).toFixed(4)) : null;

  const { error: deleteError } = await client
    .from("daily_market_memory_sources")
    .delete()
    .eq("daily_market_memory_id", memoryId);

  if (deleteError) {
    throw new Error(
      `daily_market_memory_sources 삭제 실패: ${deleteError.message}`,
    );
  }

  if (expected.length > 0) {
    const sourceRows = expected.map((report) => ({
      daily_market_memory_id: memoryId,
      item_content_id: report.id,
      market_memory_item_id: report.market_memory_item_id,
      report_title_snapshot: report.title,
      report_type: report.report_type,
      lang_code: report.lang_code,
      source_weight: weight,
      inclusion_reason: "admin_reconcile",
    }));

    const { error: insertError } = await client
      .from("daily_market_memory_sources")
      .insert(sourceRows);

    if (insertError) {
      throw new Error(
        `daily_market_memory_sources 저장 실패: ${insertError.message}`,
      );
    }
  }

  const { error: updateError } = await client
    .from("daily_market_memories")
    .update({
      source_report_count: expected.length,
      updated_at: new Date().toISOString(),
    })
    .eq("id", memoryId);

  if (updateError) {
    throw new Error(
      `daily_market_memories 갱신 실패: ${updateError.message}`,
    );
  }

  return { sourceCount: expected.length };
}
