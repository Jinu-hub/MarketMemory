import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "database.types";

import adminClient from "~/core/lib/supa-admin-client.server";
import { notifyDailyMarketMemoryN8n } from "~/features/cron/lib/daily-market-memory-n8n.server";
import {
  DailyMarketMemoryInputDateError,
  formatEmptyReportsError,
  formatReportInputDateMismatchError,
  normalizeReportMarketDate,
  resolveReportInputDateQuery,
  validatePipelineReports,
  type ResolvedReportInputDateQuery,
  type ReportInputDateQueryMode,
} from "~/features/cron/lib/daily-market-memory-input-date";
import { persistDailyMarketMemoryToDb } from "~/features/cron/lib/daily-market-memory-persist.server";
import { getMarketSnapshot } from "~/features/cron/lib/market-snapshot";
import { loadLatestMarketSnapshotStaging } from "~/features/cron/lib/market-snapshot-staging.server";
import type {
  MarketSnapshotItem,
  MarketSnapshotPayload,
} from "~/features/cron/lib/market-snapshot.types";

export type DailyMarketMemoryVisibility = "public_only" | "all_active";

export interface RunDailyMarketMemoryPipelineParams {
  /** 대상 시장일 (YYYY-MM-DD). `daily_market_memories.market_date` 및 리포트 매칭 기준. */
  marketDate: string;
  /**
   * 선택: 커버리지 시작(ISO 또는 YYYY-MM-DD).
   * `coverageEndAt`과 함께 유효한 구간일 때만 `item_contents.market_date` 범위 조회.
   */
  coverageStartAt?: string | null;
  /** 선택: 커버리지 종료(ISO 또는 YYYY-MM-DD). */
  coverageEndAt?: string | null;
  langCode?: string;
  visibility?: DailyMarketMemoryVisibility;
  /** 시장 범위 (예: global, us). 미지정 시 env `DAILY_MARKET_MEMORY_SCOPE` 또는 `global`. */
  marketScope?: string;
  /** true이면 `daily_market_memories` / `daily_market_memory_sources`에 저장. */
  persistToDb?: boolean;
  /** true면 staging을 건너뛰고 항상 시장 스냅샷 API를 호출합니다. */
  skipStagingSnapshot?: boolean;
  /** 주입 가능한 클라이언트(테스트용). 미지정 시 service role admin 클라이언트 사용. */
  db?: SupabaseClient<Database>;
}

type ItemContentRow = Database["public"]["Tables"]["item_contents"]["Row"];

export interface AggregatedReportRow {
  id: string;
  market_memory_item_id: string;
  report_type: ItemContentRow["report_type"];
  market_date: ItemContentRow["market_date"];
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
    reportMarketDate: ItemContentRow["market_date"];
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
  reportInputMode: ReportInputDateQueryMode;
  reportMarketDateStart: string;
  reportMarketDateEnd: string;
  langCode: string;
  visibility: DailyMarketMemoryVisibility;
  marketSnapshot: MarketSnapshotPayload;
  /** staging 재사용 vs live API fetch */
  marketSnapshotSource: "staging" | "api";
  stagingSnapshotId: string | null;
  reports: AggregatedReportRow[];
  aiInput: DailyMarketMemoryAiInputV1;
  /** 정상 경로 진행·재사용 등 진단용 (오류 아님) */
  info: string[];
  errors: string[];
  savedToDb: boolean;
  dailyMarketMemoryId: string | null;
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
      reportMarketDate: r.market_date,
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
  inputDateQuery: ResolvedReportInputDateQuery,
  errors: string[],
): Promise<ItemContentRow[]> {
  const langCode = params.langCode ?? "ko";
  const visibility = params.visibility ?? "public_only";

  let q = db
    .from("item_contents")
    .select(
      "id, market_memory_item_id, report_type, market_date, lang_code, title, summary, category, regions, countries, confidence, metadata, is_active, is_public, report_tier",
    )
    .eq("is_active", true)
    .eq("lang_code", langCode);

  if (visibility === "public_only") {
    q = q.eq("is_public", true);
  }

  if (inputDateQuery.mode === "coverage_range") {
    q = q
      .gte("market_date", inputDateQuery.marketDateStart)
      .lte("market_date", inputDateQuery.marketDateEnd);
  } else {
    q = q.eq("market_date", params.marketDate);
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
 * Step 2: 대상 리포트 조회 (`item_contents.market_date` = `marketDate` 또는 유효한 coverage 구간)
 * Step 3: item_content_cores 집계
 * Step 4: AI 입력용 구조화 JSON
 */
export async function runDailyMarketMemoryPipeline(
  params: RunDailyMarketMemoryPipelineParams,
): Promise<DailyMarketMemoryPipelineResult> {
  const ranAt = new Date().toISOString();
  const info: string[] = [];
  const errors: string[] = [];
  const db = params.db ?? adminClient;

  const inputDateQuery = resolveReportInputDateQuery(
    params.marketDate,
    params.coverageStartAt,
    params.coverageEndAt,
  );
  errors.push(...inputDateQuery.warnings);

  const marketScope =
    params.marketScope?.trim() ||
    process.env.DAILY_MARKET_MEMORY_SCOPE?.trim() ||
    "global";

  let marketSnapshot: MarketSnapshotPayload;
  let marketSnapshotSource: "staging" | "api" = "api";
  let stagingSnapshotId: string | null = null;

  if (!params.skipStagingSnapshot) {
    try {
      const staged = await loadLatestMarketSnapshotStaging(db, {
        marketDate: params.marketDate,
        marketScope,
      });
      if (staged) {
        marketSnapshot = staged.snapshot;
        marketSnapshotSource = "staging";
        stagingSnapshotId = staged.id;
        info.push(
          `시장 스냅샷: daily_market_snapshot_staging 재사용 (id=${staged.id}, fetched_at=${staged.fetchedAt}, status=${staged.status})`,
        );
      } else {
        marketSnapshot = await getMarketSnapshot();
        errors.push(...marketSnapshot.errors);
      }
    } catch (stagingLoadError) {
      errors.push(
        stagingLoadError instanceof Error
          ? `staging 조회 실패, API fetch로 대체: ${stagingLoadError.message}`
          : "staging 조회 실패, API fetch로 대체",
      );
      marketSnapshot = await getMarketSnapshot();
      errors.push(...marketSnapshot.errors);
    }
  } else {
    marketSnapshot = await getMarketSnapshot();
    errors.push(...marketSnapshot.errors);
  }

  const contents = await fetchTargetReports(db, params, inputDateQuery, errors);
  const ids = contents.map((c) => c.id);
  const coreByContent = await fetchLatestCoresByContentId(db, ids, errors);

  let reports: AggregatedReportRow[] = contents.map((c) => {
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
      market_date: c.market_date,
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

  reports = reports.filter((r) => {
    const normalized = normalizeReportMarketDate(r.market_date);
    if (!normalized) {
      return false;
    }
    return (
      normalized >= inputDateQuery.marketDateStart &&
      normalized <= inputDateQuery.marketDateEnd
    );
  });

  const dateValidation = validatePipelineReports(
    params.marketDate,
    inputDateQuery,
    reports,
  );
  if (!dateValidation.ok) {
    const mismatchMessage = formatReportInputDateMismatchError(
      inputDateQuery,
      params.marketDate,
      dateValidation.mismatches,
    );
    errors.push(mismatchMessage);
    if (params.persistToDb) {
      throw new DailyMarketMemoryInputDateError(mismatchMessage);
    }
    reports = [];
  }

  if (params.persistToDb && reports.length === 0) {
    throw new DailyMarketMemoryInputDateError(
      formatEmptyReportsError(inputDateQuery, params.marketDate),
    );
  }

  if (reports.length === 0) {
    errors.push(formatEmptyReportsError(inputDateQuery, params.marketDate));
  }

  const aiInput = buildAiInput(params.marketDate, marketSnapshot, reports);

  const pipelineResult: DailyMarketMemoryPipelineResult = {
    ranAt,
    marketDate: params.marketDate,
    coverageStartAt: inputDateQuery.coverageStartAt,
    coverageEndAt: inputDateQuery.coverageEndAt,
    reportInputMode: inputDateQuery.mode,
    reportMarketDateStart: inputDateQuery.marketDateStart,
    reportMarketDateEnd: inputDateQuery.marketDateEnd,
    langCode: params.langCode ?? "ko",
    visibility: params.visibility ?? "public_only",
    marketSnapshot,
    marketSnapshotSource,
    stagingSnapshotId,
    reports,
    aiInput,
    info,
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
        info: [...pipelineResult.info],
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
