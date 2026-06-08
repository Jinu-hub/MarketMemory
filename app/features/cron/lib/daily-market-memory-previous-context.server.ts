import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "database.types";

import { normalizeReportMarketDate } from "~/features/cron/lib/daily-market-memory-input-date";
import type {
  DailyMarketMemoryAiInputMarketMood,
  DailyMarketMemoryAiInputMarketSnapshot,
  DailyMarketMemoryPreviousMarketContext,
} from "~/features/cron/lib/daily-market-memory-pipeline";
import type {
  MarketSnapshotItem,
  MarketSnapshotPayload,
} from "~/features/cron/lib/market-snapshot.types";

type PreviousMemoryRow = {
  market_date: string;
  market_snapshot: Json | null;
  core_data: Json | null;
  status: string;
};

function asObjectRecord(json: Json | null | undefined): Record<string, unknown> | null {
  if (json === null || json === undefined || typeof json !== "object" || Array.isArray(json)) {
    return null;
  }
  return json as Record<string, unknown>;
}

function readStringField(o: Record<string, unknown>, key: string): string {
  const v = o[key];
  return typeof v === "string" ? v : "";
}

/** AI 입력용 시장 스냅샷 축약 (`source`·staging 메타 제외). */
export function compactMarketSnapshotForAiInput(
  asOfDate: string,
  snapshot: Pick<MarketSnapshotPayload, "fetchedAt" | "items" | "fearGreed">,
): DailyMarketMemoryAiInputMarketSnapshot {
  return {
    asOfDate,
    fetchedAt: snapshot.fetchedAt,
    items: snapshot.items.map(({ source: _source, ...item }) => item),
    fearGreed: snapshot.fearGreed,
  };
}

function parseStoredMarketSnapshot(
  raw: Json | null,
): Pick<MarketSnapshotPayload, "fetchedAt" | "items" | "fearGreed"> | null {
  const o = asObjectRecord(raw);
  if (!o || !Array.isArray(o.items)) {
    return null;
  }

  const items = o.items.filter(
    (item): item is MarketSnapshotItem =>
      item !== null && typeof item === "object" && !Array.isArray(item),
  );

  return {
    fetchedAt: readStringField(o, "fetchedAt"),
    items,
    fearGreed: (o.fearGreed as MarketSnapshotPayload["fearGreed"]) ?? null,
  };
}

export function extractMarketMoodFromCoreData(
  coreData: Json | null,
): DailyMarketMemoryAiInputMarketMood | null {
  const root = asObjectRecord(coreData);
  if (!root) {
    return null;
  }

  const mood = root.market_mood;
  if (mood === null || typeof mood !== "object" || Array.isArray(mood)) {
    return null;
  }

  const type = readStringField(mood as Record<string, unknown>, "type");
  if (!type) {
    return null;
  }

  return mood as Json;
}

export function buildPreviousMarketContextFromMemoryRow(
  row: PreviousMemoryRow,
): DailyMarketMemoryPreviousMarketContext | null {
  const asOfDate = normalizeReportMarketDate(row.market_date);
  if (!asOfDate) {
    return null;
  }

  const storedSnapshot = parseStoredMarketSnapshot(row.market_snapshot);
  if (!storedSnapshot) {
    return null;
  }

  const marketMood = extractMarketMoodFromCoreData(row.core_data);
  if (!marketMood) {
    return null;
  }

  return {
    asOfDate,
    marketSnapshot: compactMarketSnapshotForAiInput(asOfDate, storedSnapshot),
    marketMood,
  };
}

/**
 * `marketDate`보다 이전인 가장 최근 `daily_market_memories` row.
 * 휴장·미발행일(캘린더 전일 row 없음)을 건너뛰기 위해 캘린더 -1일이 아닌 DB 기준 직전 row를 사용합니다.
 */
async function fetchLatestPriorDailyMarketMemoryRow(
  db: SupabaseClient<Database>,
  marketDate: string,
  marketScope: string,
): Promise<PreviousMemoryRow | null> {
  const normalizedMarketDate = normalizeReportMarketDate(marketDate);
  if (!normalizedMarketDate) {
    return null;
  }

  const select =
    "market_date, market_snapshot, core_data, status, generated_at" as const;

  const { data: finalRow, error: finalError } = await db
    .from("daily_market_memories")
    .select(select)
    .eq("market_scope", marketScope)
    .eq("status", "final")
    .lt("market_date", normalizedMarketDate)
    .order("market_date", { ascending: false })
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (finalError) {
    throw new Error(
      `직전 daily_market_memories(final) 조회 실패: ${finalError.message}`,
    );
  }

  if (finalRow) {
    return finalRow as PreviousMemoryRow;
  }

  const { data: draftRow, error: draftError } = await db
    .from("daily_market_memories")
    .select(select)
    .eq("market_scope", marketScope)
    .lt("market_date", normalizedMarketDate)
    .order("market_date", { ascending: false })
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (draftError) {
    throw new Error(`직전 daily_market_memories 조회 실패: ${draftError.message}`);
  }

  return draftRow ? (draftRow as PreviousMemoryRow) : null;
}

/**
 * `marketDate` 이전의 가장 최근 `daily_market_memories`에서 `previousMarketContext`를 조립합니다.
 * `market_snapshot` + `core_data.market_mood`가 모두 유효할 때만 반환합니다.
 */
export async function fetchPreviousMarketContext(
  db: SupabaseClient<Database>,
  marketDate: string,
  marketScope: string,
  info: string[],
): Promise<DailyMarketMemoryPreviousMarketContext | null> {
  const normalizedMarketDate = normalizeReportMarketDate(marketDate);
  if (!normalizedMarketDate) {
    info.push(
      `직전 컨텍스트: marketDate(${marketDate}) 파싱 실패 — previousMarketContext 생략`,
    );
    return null;
  }

  const row = await fetchLatestPriorDailyMarketMemoryRow(
    db,
    normalizedMarketDate,
    marketScope,
  );
  if (!row) {
    info.push(
      `직전 컨텍스트: ${normalizedMarketDate} 이전·${marketScope} daily_market_memories 없음 — previousMarketContext 생략`,
    );
    return null;
  }

  const priorMarketDate = normalizeReportMarketDate(row.market_date);
  const context = buildPreviousMarketContextFromMemoryRow(row);
  if (!context) {
    info.push(
      `직전 컨텍스트: ${priorMarketDate ?? row.market_date}·${marketScope}(${row.status})에 market_snapshot 또는 core_data.market_mood 부족 — previousMarketContext 생략`,
    );
    return null;
  }

  const moodType =
    readStringField(asObjectRecord(context.marketMood) ?? {}, "type") || "unknown";
  info.push(
    `직전 컨텍스트: ${context.asOfDate}·${marketScope}(${row.status}) 재사용 — 기준일 ${normalizedMarketDate} (mood=${moodType})`,
  );
  return context;
}
