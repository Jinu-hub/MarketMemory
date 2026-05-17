import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "database.types";

import adminClient from "~/core/lib/supa-admin-client.server";
import { notifyDailyMarketMemoryN8n } from "~/features/cron/lib/daily-market-memory-n8n.server";
import { persistDailyMarketMemoryToDb } from "~/features/cron/lib/daily-market-memory-persist.server";
import { getMarketSnapshot } from "~/features/cron/lib/market-snapshot";
import type {
  MarketSnapshotItem,
  MarketSnapshotPayload,
} from "~/features/cron/lib/market-snapshot.types";

export type DailyMarketMemoryVisibility = "public_only" | "all_active";

export interface RunDailyMarketMemoryPipelineParams {
  /** 대상 시장일 (YYYY-MM-DD). 리포트는 기본적으로 `item_contents.input_date`로 매칭합니다. */
  marketDate: string;
  /** 선택: 커버리지 시작(ISO). 지정 시 `input_date`가 이 구간(일 단위) 안에 있는 행만 조회합니다. */
  coverageStartAt?: string | null;
  /** 선택: 커버리지 종료(ISO). */
  coverageEndAt?: string | null;
  langCode?: string;
  visibility?: DailyMarketMemoryVisibility;
  /** 시장 범위 (예: global, us). 미지정 시 env `DAILY_MARKET_MEMORY_SCOPE` 또는 `global`. */
  marketScope?: string;
  /** true이면 `daily_market_memories` / `daily_market_memory_sources`에 저장. */
  persistToDb?: boolean;
  /** 주입 가능한 클라이언트(테스트용). 미지정 시 service role admin 클라이언트 사용. */
  db?: SupabaseClient<Database>;
}

type ItemContentRow = Database["public"]["Tables"]["item_contents"]["Row"];

export interface AggregatedReportRow {
  id: string;
  market_memory_item_id: string;
  report_type: ItemContentRow["report_type"];
  input_date: ItemContentRow["input_date"];
  lang_code: string;
  title: string | null;
  summary: string | null;
  category: string | null;
  regions: ItemContentRow["regions"];
  countries: ItemContentRow["countries"];
  confidence: ItemContentRow["confidence"];
  /** `item_contents.metadata`에서 분해: `tags.core[].tag` 만. */
  tags: string[];
  /** `metadata.entitys` (또는 `entities`). 없으면 `{}`. */
  entitys: Json;
  /** `metadata.asset_classes`. 없으면 `[]`. */
  asset_classes: Json;
  /** 최신 `item_content_cores.core_type` (정규화 실패·미지원 타입이어도 기록). */
  core_type: string | null;
  /**
   * `item_content_cores.core_data`를 `core_type`별 규칙으로 축약한 JSON.
   * 지원하지 않는 `core_type`이면 `null`.
   */
  core_data: Json | null;
}

export interface DailyMarketMemoryAiInputV1 {
  marketDate: string;
  marketSnapshot: {
    fetchedAt: string;
    items: Array<Omit<MarketSnapshotItem, "source">>;
    fearGreed: MarketSnapshotPayload["fearGreed"];
  };
  reports: Array<{
    itemContentId: string;
    marketMemoryItemId: string;
    reportType: ItemContentRow["report_type"];
    inputDate: ItemContentRow["input_date"];
    category: string | null;
    regions: ItemContentRow["regions"];
    countries: ItemContentRow["countries"];
    confidence: ItemContentRow["confidence"];
    /** `metadata.tags.core[].tag` 만 추출 (topHardTags 등 제외). */
    tags: string[];
    /** `metadata.entitys` 그대로 (스키마 철자 유지). 없으면 `{}`. */
    entitys: Json;
    /** `metadata.asset_classes` 그대로. 없으면 `[]`. */
    asset_classes: Json;
    coreType: string | null;
    /** `core_type`별 축약 `core_data` (파이프라인 출력 규칙). */
    coreData: Json | null;
  }>;
}

export interface DailyMarketMemoryPipelineResult {
  ranAt: string;
  marketDate: string;
  coverageStartAt: string | null;
  coverageEndAt: string | null;
  langCode: string;
  visibility: DailyMarketMemoryVisibility;
  marketSnapshot: MarketSnapshotPayload;
  reports: AggregatedReportRow[];
  aiInput: DailyMarketMemoryAiInputV1;
  errors: string[];
  savedToDb: boolean;
  dailyMarketMemoryId: string | null;
}

function toDateOnly(iso: string): string | null {
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) {
    return null;
  }
  return d.toISOString().slice(0, 10);
}

function extractCoreTagStrings(metadata: Json | null): string[] {
  if (metadata === null || typeof metadata !== "object" || Array.isArray(metadata)) {
    return [];
  }
  const tagsRoot = (metadata as Record<string, unknown>).tags;
  if (tagsRoot === null || typeof tagsRoot !== "object" || Array.isArray(tagsRoot)) {
    return [];
  }
  const core = (tagsRoot as Record<string, unknown>).core;
  if (!Array.isArray(core)) {
    return [];
  }
  const out: string[] = [];
  for (const item of core) {
    if (item !== null && typeof item === "object" && !Array.isArray(item)) {
      const tag = (item as Record<string, unknown>).tag;
      if (typeof tag === "string" && tag.trim() !== "") {
        out.push(tag);
      }
    }
  }
  return out;
}

function pickEntitysFromMetadata(metadata: Json | null): Json {
  if (metadata === null || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }
  const o = metadata as Record<string, unknown>;
  const raw = o.entitys ?? o.entities;
  if (raw !== null && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Json;
  }
  return {};
}

function pickAssetClassesFromMetadata(metadata: Json | null): Json {
  if (metadata === null || typeof metadata !== "object" || Array.isArray(metadata)) {
    return [];
  }
  const o = metadata as Record<string, unknown>;
  const ac = o.asset_classes ?? o.assetClasses;
  return Array.isArray(ac) ? (ac as Json) : [];
}

type CoreRowPayload = {
  core_type: string;
  core_data: Json;
};

function asObjectRecord(json: Json | null): Record<string, unknown> | null {
  if (json === null || typeof json !== "object" || Array.isArray(json)) {
    return null;
  }
  return json as Record<string, unknown>;
}

function readStringField(o: Record<string, unknown>, key: string): string {
  const v = o[key];
  return typeof v === "string" ? v : "";
}

function readStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) {
    return [];
  }
  return v.filter((x): x is string => typeof x === "string");
}

/**
 * `item_content_cores` 원본 `core_data`를 데일리 파이프라인 출력 형식으로 축약.
 *
 * - `core_analysis`: topic, summary.summary → `summary`, summary.key → `key_takeaways`
 * - `core_digest`: topic, summary, highlights
 * - `core_thesis`: topic, summary.summary → `summary`, summary.key_takeaways → `key_takeaways`
 */
export function normalizePipelineCoreData(coreType: string, raw: Json): Json | null {
  const d = asObjectRecord(raw);
  if (!d) {
    return null;
  }

  switch (coreType) {
    case "core_analysis": {
      const summaryBlock = asObjectRecord(d.summary as Json);
      const summaryText = summaryBlock ? readStringField(summaryBlock, "summary") : "";
      const key_takeaways = summaryBlock ? readStringArray(summaryBlock.key) : [];
      return {
        topic: readStringField(d, "topic"),
        summary: summaryText,
        key_takeaways,
      };
    }
    case "core_digest": {
      const summaryVal = d.summary;
      const summary =
        typeof summaryVal === "string"
          ? summaryVal
          : typeof summaryVal === "number" || typeof summaryVal === "boolean"
            ? String(summaryVal)
            : "";
      const highlights = Array.isArray(d.highlights) ? (d.highlights as Json) : [];
      return {
        topic: readStringField(d, "topic"),
        summary,
        highlights,
      };
    }
    case "core_thesis": {
      const summaryBlock = asObjectRecord(d.summary as Json);
      const summaryText = summaryBlock ? readStringField(summaryBlock, "summary") : "";
      const key_takeaways = summaryBlock
        ? readStringArray(summaryBlock.key_takeaways)
        : [];
      return {
        topic: readStringField(d, "topic"),
        summary: summaryText,
        key_takeaways,
      };
    }
    default:
      return null;
  }
}

function buildAiInput(
  marketDate: string,
  snapshot: MarketSnapshotPayload,
  reports: AggregatedReportRow[],
): DailyMarketMemoryAiInputV1 {
  return {
    marketDate,
    marketSnapshot: {
      fetchedAt: snapshot.fetchedAt,
      items: snapshot.items.map(({ source: _source, ...item }) => item),
      fearGreed: snapshot.fearGreed,
    },
    reports: reports.map((r) => ({
      itemContentId: r.id,
      marketMemoryItemId: r.market_memory_item_id,
      reportType: r.report_type,
      inputDate: r.input_date,
      category: r.category,
      regions: r.regions,
      countries: r.countries,
      confidence: r.confidence,
      tags: r.tags,
      entitys: r.entitys,
      asset_classes: r.asset_classes,
      coreType: r.core_type,
      coreData: r.core_data,
    })),
  };
}

async function fetchTargetReports(
  db: SupabaseClient<Database>,
  params: RunDailyMarketMemoryPipelineParams,
  errors: string[],
): Promise<ItemContentRow[]> {
  const langCode = params.langCode ?? "ko";
  const visibility = params.visibility ?? "public_only";

  let q = db
    .from("item_contents")
    .select(
      "id, market_memory_item_id, report_type, input_date, lang_code, title, summary, category, regions, countries, confidence, metadata, is_active, is_public, report_tier",
    )
    .eq("is_active", true)
    .eq("lang_code", langCode);

  if (visibility === "public_only") {
    q = q.eq("is_public", true);
  }

  if (params.coverageStartAt && params.coverageEndAt) {
    const start = toDateOnly(params.coverageStartAt);
    const end = toDateOnly(params.coverageEndAt);
    if (!start || !end) {
      errors.push(
        "coverageStartAt / coverageEndAt 날짜 파싱 실패 — marketDate 기준 단일일로 되돌립니다.",
      );
      q = q.eq("input_date", params.marketDate);
    } else {
      q = q.gte("input_date", start).lte("input_date", end);
    }
  } else {
    q = q.eq("input_date", params.marketDate);
  }

  const { data, error } = await q.order("created_at", { ascending: false });

  if (error) {
    errors.push(`리포트 조회 실패: ${error.message}`);
    return [];
  }

  return (data ?? []) as ItemContentRow[];
}

async function fetchLatestCoresByContentId(
  db: SupabaseClient<Database>,
  itemContentIds: string[],
  errors: string[],
): Promise<Map<string, CoreRowPayload>> {
  const map = new Map<string, CoreRowPayload>();
  if (itemContentIds.length === 0) {
    return map;
  }

  const { data, error } = await db
    .from("item_content_cores")
    .select("item_content_id, core_type, core_data, created_at")
    .in("item_content_id", itemContentIds)
    .order("created_at", { ascending: false });

  if (error) {
    errors.push(`item_content_cores 조회 실패: ${error.message}`);
    return map;
  }

  for (const row of data ?? []) {
    const id = row.item_content_id as string;
    if (!map.has(id)) {
      map.set(id, {
        core_type: row.core_type as string,
        core_data: row.core_data as Json,
      });
    }
  }

  return map;
}

/**
 * 하루 1회(또는 수동) 데일리 마켓 메모리 입력 파이프라인.
 *
 * Step 1: 시장 스냅샷 (기존 getMarketSnapshot)
 * Step 2: 대상 리포트 조회 (input_date 또는 coverage 구간)
 * Step 3: item_content_cores 집계
 * Step 4: AI 입력용 구조화 JSON
 *
 * DB 스키마상 `item_contents`에는 `coverage_start_at` 컬럼이 없으므로,
 * coverage 옵션이 있으면 그 날짜 범위로 `input_date`를 필터합니다.
 */
export async function runDailyMarketMemoryPipeline(
  params: RunDailyMarketMemoryPipelineParams,
): Promise<DailyMarketMemoryPipelineResult> {
  const ranAt = new Date().toISOString();
  const errors: string[] = [];
  const db = params.db ?? adminClient;

  const marketSnapshot = await getMarketSnapshot();
  errors.push(...marketSnapshot.errors);

  const contents = await fetchTargetReports(db, params, errors);
  const ids = contents.map((c) => c.id);
  const coreByContent = await fetchLatestCoresByContentId(db, ids, errors);

  const reports: AggregatedReportRow[] = contents.map((c) => {
    const meta = c.metadata;
    const core = coreByContent.get(c.id);
    const core_type = core?.core_type ?? null;
    const core_data = core
      ? normalizePipelineCoreData(core.core_type, core.core_data)
      : null;
    return {
      id: c.id,
      market_memory_item_id: c.market_memory_item_id,
      report_type: c.report_type,
      input_date: c.input_date,
      lang_code: c.lang_code,
      title: c.title,
      summary: c.summary,
      category: c.category,
      regions: c.regions,
      countries: c.countries,
      confidence: c.confidence,
      tags: extractCoreTagStrings(meta),
      entitys: pickEntitysFromMetadata(meta),
      asset_classes: pickAssetClassesFromMetadata(meta),
      core_type,
      core_data,
    };
  });

  const aiInput = buildAiInput(params.marketDate, marketSnapshot, reports);

  const pipelineResult: DailyMarketMemoryPipelineResult = {
    ranAt,
    marketDate: params.marketDate,
    coverageStartAt: params.coverageStartAt ?? null,
    coverageEndAt: params.coverageEndAt ?? null,
    langCode: params.langCode ?? "ko",
    visibility: params.visibility ?? "public_only",
    marketSnapshot,
    reports,
    aiInput,
    errors,
    savedToDb: false,
    dailyMarketMemoryId: null,
  };

  if (params.persistToDb) {
    try {
      const persisted = await persistDailyMarketMemoryToDb(db, params, pipelineResult);
      pipelineResult.savedToDb = true;
      pipelineResult.dailyMarketMemoryId = persisted.dailyMarketMemoryId;
    } catch (error) {
      errors.push(
        error instanceof Error
          ? `DB 저장 실패: ${error.message}`
          : "DB 저장 실패: unknown error",
      );
    }
  }

  // Step 6: n8n 웹훅 (옵션 A, 복수 URL)
  // — `persistToDb`로 draft 저장에 성공하고 `dailyMarketMemoryId`가 있을 때만 호출합니다.
  // — URL은 `daily-market-memory-n8n.config.ts`의 `DAILY_MARKET_MEMORY_N8N_WEBHOOKS`에서 설정합니다.
  // — 2번째 URL부터는 이전 호출 전 5초 대기. URL이 비어 있으면 스킵. 실패는 `errors`에만 기록합니다.
  if (pipelineResult.savedToDb && pipelineResult.dailyMarketMemoryId) {
    try {
      await notifyDailyMarketMemoryN8n({
        event: "daily_market_memory.pipeline.completed",
        ranAt: pipelineResult.ranAt,
        marketDate: pipelineResult.marketDate,
        dailyMarketMemoryId: pipelineResult.dailyMarketMemoryId,
        savedToDb: true,
        reportCount: pipelineResult.reports.length,
        errors: [...pipelineResult.errors],
        aiInput: pipelineResult.aiInput,
      });
    } catch (error) {
      errors.push(
        error instanceof Error
          ? `n8n 웹훅 실패: ${error.message}`
          : "n8n 웹훅 실패: unknown error",
      );
    }
  }

  return pipelineResult;
}

/** 크론 기본 타임존(데일리 마켓 메모리 스키마와 동일). */
export function formatMarketDateInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
