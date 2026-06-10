import type { Database } from "database.types";

import {
  ITEM_CONTENT_I18N_TRACKING_KEY,
  ITEM_CONTENT_I18N_WEBHOOK,
  type ItemContentI18nLangCode,
} from "../lib/item-content-i18n.config";
import { invokeN8nWebhooks, type N8nWebhookInvokeResult } from "../lib/n8n-webhook-test.server";
import type { AdminDb } from "./types";

export type ItemContentI18nWebhookJob = {
  itemContentId: string;
  langCode: ItemContentI18nLangCode;
  sourceLangCode: string;
};

export type ItemContentI18nWebhookJobResult = {
  job: ItemContentI18nWebhookJob;
  webhook: N8nWebhookInvokeResult;
};

function resolveWebhookTarget() {
  const url = ITEM_CONTENT_I18N_WEBHOOK.url.trim();
  if (!url) {
    return null;
  }
  return {
    url,
    secret: ITEM_CONTENT_I18N_WEBHOOK.secret?.trim() ? ITEM_CONTENT_I18N_WEBHOOK.secret.trim() : null,
  };
}

export function isItemContentI18nWebhookConfigured(): boolean {
  return ITEM_CONTENT_I18N_WEBHOOK.url.trim() !== "";
}

export async function recordItemContentI18nWebhookRun(
  client: AdminDb,
  itemContentId: string,
  langCode: ItemContentI18nLangCode,
  ranAt: string,
) {
  const { data, error } = await client
    .from("item_contents")
    .select("tracking")
    .eq("id", itemContentId)
    .maybeSingle();

  if (error) {
    return { error };
  }
  if (!data) {
    return { error: new Error("item_contents를 찾을 수 없습니다.") };
  }

  const tracking =
    data.tracking && typeof data.tracking === "object" && !Array.isArray(data.tracking)
      ? ({ ...(data.tracking as Record<string, unknown>) } as Record<string, unknown>)
      : {};

  const runs =
    tracking[ITEM_CONTENT_I18N_TRACKING_KEY] &&
    typeof tracking[ITEM_CONTENT_I18N_TRACKING_KEY] === "object" &&
    !Array.isArray(tracking[ITEM_CONTENT_I18N_TRACKING_KEY])
      ? ({
          ...(tracking[ITEM_CONTENT_I18N_TRACKING_KEY] as Record<string, unknown>),
        } as Record<string, string>)
      : {};

  runs[langCode] = ranAt;
  tracking[ITEM_CONTENT_I18N_TRACKING_KEY] = runs;

  return client
    .from("item_contents")
    .update({
      tracking: tracking as Database["public"]["Tables"]["item_contents"]["Update"]["tracking"],
    })
    .eq("id", itemContentId);
}

export async function invokeItemContentI18nWebhookJobs(
  jobs: ItemContentI18nWebhookJob[],
): Promise<{ results: ItemContentI18nWebhookJobResult[]; error: string | null }> {
  const target = resolveWebhookTarget();
  if (!target) {
    return { results: [], error: "다언어 생성 Webhook URL이 설정되지 않았습니다." };
  }

  const results: ItemContentI18nWebhookJobResult[] = [];

  for (const job of jobs) {
    const payload = {
      item_content_id: job.itemContentId,
      lang_code: job.langCode,
      source_lang_code: job.sourceLangCode,
    };
    const [webhook] = await invokeN8nWebhooks([target], payload, { stagger: false });
    results.push({ job, webhook: webhook! });
  }

  const failed = results.filter((r) => !r.webhook.ok).length;
  if (failed > 0) {
    return {
      results,
      error: `${failed}/${results.length} Webhook 호출에 실패했습니다.`,
    };
  }

  return { results, error: null };
}
