import { DAILY_MARKET_MEMORY_N8N_WEBHOOKS } from "~/features/cron/lib/daily-market-memory-n8n.config";
import type { DailyMarketMemoryAiInputV1 } from "~/features/cron/lib/daily-market-memory-pipeline";

/** 2번째 웹훅부터 적용하는 호출 간격(ms). */
const WEBHOOK_STAGGER_MS = 5_000;

export interface NotifyDailyMarketMemoryN8nPayload {
  event: "daily_market_memory.pipeline.completed";
  ranAt: string;
  marketDate: string;
  dailyMarketMemoryId: string;
  savedToDb: true;
  reportCount: number;
  errors: string[];
  aiInput: DailyMarketMemoryAiInputV1;
}

interface WebhookTarget {
  url: string;
  secret: string | null;
}

function resolveWebhookTargets(): WebhookTarget[] {
  return DAILY_MARKET_MEMORY_N8N_WEBHOOKS.filter((w) => w.url.trim() !== "").map(
    (w) => ({
      url: w.url.trim(),
      secret: w.secret?.trim() ? w.secret.trim() : null,
    }),
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postWebhook(
  target: WebhookTarget,
  payload: NotifyDailyMarketMemoryN8nPayload,
): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (target.secret) {
    headers.Authorization = target.secret;
  }

  const response = await fetch(target.url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `HTTP ${response.status}${body ? `: ${body.slice(0, 200)}` : ""}`,
    );
  }
}

/**
 * n8n Webhook 노드로 POST (복수 URL).
 * URL 목록은 {@link DAILY_MARKET_MEMORY_N8N_WEBHOOKS}에서 설정합니다.
 * 2번째 URL부터는 이전 호출 전에 {@link WEBHOOK_STAGGER_MS}ms 대기합니다.
 */
export async function notifyDailyMarketMemoryN8n(
  payload: NotifyDailyMarketMemoryN8nPayload,
): Promise<void> {
  const targets = resolveWebhookTargets();
  if (targets.length === 0) {
    return;
  }

  const failures: string[] = [];

  for (let i = 0; i < targets.length; i++) {
    if (i > 0) {
      await sleep(WEBHOOK_STAGGER_MS);
    }

    const target = targets[i]!;
    try {
      await postWebhook(target, payload);
    } catch (error) {
      const detail =
        error instanceof Error ? error.message : "unknown error";
      failures.push(`[${i + 1}/${targets.length}] ${target.url}: ${detail}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(
      `n8n webhook failed (${failures.length}/${targets.length}): ${failures.join("; ")}`,
    );
  }
}
