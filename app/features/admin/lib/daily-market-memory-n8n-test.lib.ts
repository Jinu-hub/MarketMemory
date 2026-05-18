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
