import { formatMarketDateInTimeZone } from "~/features/cron/lib/daily-market-memory-pipeline";
import type { NotifyDailyMarketMemoryN8nPayload } from "~/features/cron/lib/daily-market-memory-n8n.server";

export function buildDailyMarketMemoryN8nTestPayload(): Record<string, unknown> {
  const marketDate = formatMarketDateInTimeZone(
    new Date(),
    process.env.DAILY_MARKET_MEMORY_TZ?.trim() || "Asia/Tokyo",
  );

  const payload: NotifyDailyMarketMemoryN8nPayload = {
    event: "daily_market_memory.pipeline.completed",
    ranAt: new Date().toISOString(),
    marketDate,
    dailyMarketMemoryId: "api-test-manual",
    savedToDb: true,
    reportCount: 0,
    errors: ["api-test: manual n8n webhook invocation"],
    aiInput: {
      marketDate,
      marketSnapshot: {
        fetchedAt: new Date().toISOString(),
        items: [],
        fearGreed: null,
      },
      reports: [],
    },
  };

  return payload as unknown as Record<string, unknown>;
}

const MARKET_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** 폼 `market_date` (YYYY-MM-DD) 검증. 빈 값은 undefined. */
export function parseOptionalMarketDateParam(
  raw: string | undefined,
): { ok: true; marketDate: string | undefined } | { ok: false; error: string } {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) {
    return { ok: true, marketDate: undefined };
  }
  if (!MARKET_DATE_PATTERN.test(trimmed)) {
    return { ok: false, error: "market_date는 YYYY-MM-DD 형식이어야 합니다." };
  }
  return { ok: true, marketDate: trimmed };
}

/**
 * n8n 테스트 POST body에 market_date를 반영합니다.
 * 입력값이 있으면 `market_date`, `marketDate`, `aiInput.marketDate`를 덮어씁니다.
 */
export function applyMarketDateToN8nPayload(
  payload: Record<string, unknown>,
  marketDate: string | undefined,
): Record<string, unknown> {
  const trimmed = marketDate?.trim();
  if (!trimmed) {
    return payload;
  }

  const next: Record<string, unknown> = {
    ...payload,
    market_date: trimmed,
    marketDate: trimmed,
  };

  const aiInput = next.aiInput;
  if (aiInput && typeof aiInput === "object" && !Array.isArray(aiInput)) {
    next.aiInput = {
      ...(aiInput as Record<string, unknown>),
      marketDate: trimmed,
    };
  }

  return next;
}

export function resolveN8nTestInvokePayload(
  payloadJson: string | undefined,
  fallback: Record<string, unknown>,
  marketDate: string | undefined,
): { ok: true; payload: Record<string, unknown> } | { ok: false; error: string } {
  const payloadResult = parseN8nTestPayloadJson(payloadJson, fallback);
  if (!payloadResult.ok) {
    return payloadResult;
  }
  return {
    ok: true,
    payload: applyMarketDateToN8nPayload(payloadResult.payload, marketDate),
  };
}

export function parseN8nTestPayloadJson(
  raw: string | undefined,
  fallback: Record<string, unknown>,
): { ok: true; payload: Record<string, unknown> } | { ok: false; error: string } {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) {
    return { ok: true, payload: fallback };
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, error: "JSON은 객체여야 합니다." };
    }
    return { ok: true, payload: parsed as Record<string, unknown> };
  } catch {
    return { ok: false, error: "JSON 파싱에 실패했습니다." };
  }
}
