import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "database.types";

import type {
  AggregatedReportRow,
  DailyMarketMemoryPipelineResult,
  RunDailyMarketMemoryPipelineParams,
} from "~/features/cron/lib/daily-market-memory-pipeline";

type DailyMarketMemoryInsert =
  Database["public"]["Tables"]["daily_market_memories"]["Insert"];
type DailyMarketMemorySourceInsert =
  Database["public"]["Tables"]["daily_market_memory_sources"]["Insert"];

export interface PersistDailyMarketMemoryResult {
  dailyMarketMemoryId: string;
  sourceCount: number;
}

function reportTypeToText(
  reportType: AggregatedReportRow["report_type"],
): string | null {
  return reportType ?? null;
}

function buildSourceRows(
  dailyMarketMemoryId: string,
  reports: AggregatedReportRow[],
): DailyMarketMemorySourceInsert[] {
  const weight =
    reports.length > 0
      ? Number((1 / reports.length).toFixed(4))
      : null;

  return reports.map((r) => ({
    daily_market_memory_id: dailyMarketMemoryId,
    item_content_id: r.id,
    market_memory_item_id: r.market_memory_item_id,
    report_title_snapshot: r.title,
    report_type: reportTypeToText(r.report_type),
    lang_code: r.lang_code,
    source_weight: weight,
    inclusion_reason: "pipeline_input",
  }));
}

function buildMemoryRow(
  params: RunDailyMarketMemoryPipelineParams,
  result: DailyMarketMemoryPipelineResult,
  marketScope: string,
  generationTimezone: string,
): DailyMarketMemoryInsert {
  return {
    market_date: params.marketDate,
    market_scope: marketScope,
    coverage_start_at: params.coverageStartAt ?? null,
    coverage_end_at: params.coverageEndAt ?? null,
    generation_timezone: generationTimezone,
    status: "draft",
    generated_at: result.ranAt,
    source_report_count: result.reports.length,
    core_lang_code: params.langCode ?? "en",
    market_snapshot: result.marketSnapshot as unknown as Json,
    input_context: result.aiInput as unknown as Json,
    model_info: {
      pipeline: "daily_market_memory",
      visibility: result.visibility,
      langCode: result.langCode,
      ranAt: result.ranAt,
    } as Json,
    updated_at: result.ranAt,
  };
}

async function findLatestDraftMemoryId(
  db: SupabaseClient<Database>,
  marketDate: string,
  marketScope: string,
): Promise<string | null> {
  const { data, error } = await db
    .from("daily_market_memories")
    .select("id")
    .eq("market_date", marketDate)
    .eq("market_scope", marketScope)
    .eq("status", "draft")
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`기존 draft 조회 실패: ${error.message}`);
  }

  return data?.id ?? null;
}

/**
 * `daily_market_memories` + `daily_market_memory_sources` 저장.
 * 동일 `market_date`·`market_scope`의 최신 draft가 있으면 갱신하고 sources는 교체합니다.
 */
export async function persistDailyMarketMemoryToDb(
  db: SupabaseClient<Database>,
  params: RunDailyMarketMemoryPipelineParams,
  result: DailyMarketMemoryPipelineResult,
  options?: {
    marketScope?: string;
    generationTimezone?: string;
  },
): Promise<PersistDailyMarketMemoryResult> {
  const marketScope =
    options?.marketScope ??
    params.marketScope ??
    process.env.DAILY_MARKET_MEMORY_SCOPE?.trim() ??
    "global";
  const generationTimezone =
    options?.generationTimezone ??
    process.env.DAILY_MARKET_MEMORY_TZ?.trim() ??
    "Asia/Tokyo";

  const memoryRow = buildMemoryRow(params, result, marketScope, generationTimezone);
  const existingId = await findLatestDraftMemoryId(
    db,
    params.marketDate,
    marketScope,
  );

  let dailyMarketMemoryId: string;

  if (existingId) {
    const { error: updateError } = await db
      .from("daily_market_memories")
      .update(memoryRow)
      .eq("id", existingId);

    if (updateError) {
      throw new Error(`daily_market_memories 갱신 실패: ${updateError.message}`);
    }

    dailyMarketMemoryId = existingId;

    const { error: deleteSourcesError } = await db
      .from("daily_market_memory_sources")
      .delete()
      .eq("daily_market_memory_id", dailyMarketMemoryId);

    if (deleteSourcesError) {
      throw new Error(
        `daily_market_memory_sources 삭제 실패: ${deleteSourcesError.message}`,
      );
    }
  } else {
    const { data: inserted, error: insertError } = await db
      .from("daily_market_memories")
      .insert(memoryRow)
      .select("id")
      .single();

    if (insertError || !inserted) {
      throw new Error(
        `daily_market_memories 저장 실패: ${insertError?.message ?? "unknown"}`,
      );
    }

    dailyMarketMemoryId = inserted.id;
  }

  const sourceRows = buildSourceRows(dailyMarketMemoryId, result.reports);
  if (sourceRows.length > 0) {
    const { error: sourcesError } = await db
      .from("daily_market_memory_sources")
      .insert(sourceRows);

    if (sourcesError) {
      throw new Error(
        `daily_market_memory_sources 저장 실패: ${sourcesError.message}`,
      );
    }
  }

  return {
    dailyMarketMemoryId,
    sourceCount: sourceRows.length,
  };
}
