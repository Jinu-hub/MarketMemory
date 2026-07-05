import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

import {
  ITEM_CONTENT_I18N_SUPPORTED_LANGS,
  ITEM_CONTENT_I18N_WEBHOOK,
  type ItemContentI18nLangCode,
} from "~/features/admin/lib/item-content-i18n.config";
import { groupItemContentI18nByContentAndLang } from "~/features/admin/lib/item-content-i18n-utils";
import type { N8nWebhookInvokeResult } from "~/features/admin/lib/n8n-webhook-test.server";
import { invokeN8nWebhooks } from "~/features/admin/lib/n8n-webhook-test.server";
import { listItemContentI18nByContentIds } from "~/features/admin/queries/item-content-i18n";

export type ItemContentI18nCronWebhookItem = {
  job_code: string;
  id: string;
  market_date: string;
  report_type: string;
  ko_dt: string;
  en_dt: string;
  ja_dt: string;
  ko_execute: boolean;
  en_execute: boolean;
  ja_execute: boolean;
};

type ContentRow = {
  id: string;
  lang_code: string;
  market_date: string | null;
  report_type: string | null;
  market_memory_items: { job_code: string } | { job_code: string }[] | null;
};

function resolveJobCode(row: ContentRow): string | null {
  const mmi = row.market_memory_items;
  if (!mmi) return null;
  if (Array.isArray(mmi)) return mmi[0]?.job_code ?? null;
  return mmi.job_code;
}

function buildWebhookItem(
  content: ContentRow,
  i18nByLang: Map<ItemContentI18nLangCode, { updated_at: string | null }>,
): ItemContentI18nCronWebhookItem | null {
  const jobCode = resolveJobCode(content);
  if (!jobCode) return null;

  const sourceLang = content.lang_code;
  const execute: Record<ItemContentI18nLangCode, boolean> = { ko: false, en: false, ja: false };
  const dt: Record<ItemContentI18nLangCode, string> = { ko: "", en: "", ja: "" };

  for (const lang of ITEM_CONTENT_I18N_SUPPORTED_LANGS) {
    const record = i18nByLang.get(lang);
    if (record?.updated_at) {
      dt[lang] = record.updated_at;
    }
    if (lang !== sourceLang && !record) {
      execute[lang] = true;
    }
  }

  if (!execute.ko && !execute.en && !execute.ja) {
    return null;
  }

  return {
    job_code: jobCode,
    id: content.id,
    market_date: content.market_date ?? "",
    report_type: content.report_type ?? "",
    ko_dt: dt.ko,
    en_dt: dt.en,
    ja_dt: dt.ja,
    ko_execute: execute.ko,
    en_execute: execute.en,
    ja_execute: execute.ja,
  };
}

export type ItemContentI18nCronResult =
  | { ok: true; skipped: true; itemCount: 0; items: [] }
  | {
      ok: true;
      skipped: false;
      itemCount: number;
      items: ItemContentI18nCronWebhookItem[];
      webhook: N8nWebhookInvokeResult;
    }
  | {
      ok: false;
      error: string;
      itemCount: number;
      items?: ItemContentI18nCronWebhookItem[];
      webhook?: N8nWebhookInvokeResult;
    };

export async function runItemContentI18nCron(
  client: SupabaseClient<Database>,
): Promise<ItemContentI18nCronResult> {
  const { data: contents, error: contentError } = await client
    .from("item_contents")
    .select("id, lang_code, market_date, report_type, market_memory_items!inner(job_code)")
    .eq("is_active", true);

  if (contentError) {
    return { ok: false, error: contentError.message, itemCount: 0 };
  }

  const contentRows = (contents ?? []) as ContentRow[];
  if (contentRows.length === 0) {
    return { ok: true, skipped: true, itemCount: 0, items: [] };
  }

  const { data: i18nRows, error: i18nError } = await listItemContentI18nByContentIds(
    client,
    contentRows.map((row) => row.id),
  );
  if (i18nError) {
    return { ok: false, error: i18nError.message, itemCount: 0 };
  }

  const i18nMap = groupItemContentI18nByContentAndLang(i18nRows ?? []);
  const items: ItemContentI18nCronWebhookItem[] = [];

  for (const content of contentRows) {
    const item = buildWebhookItem(content, i18nMap.get(content.id) ?? new Map());
    if (item) items.push(item);
  }

  if (items.length === 0) {
    return { ok: true, skipped: true, itemCount: 0, items: [] };
  }

  const url = ITEM_CONTENT_I18N_WEBHOOK.url.trim();
  if (!url) {
    return { ok: false, error: "Webhook URL not configured", itemCount: items.length, items };
  }

  const payload = {
    trigger: "execute_i18n",
    triggeredAt: new Date().toISOString(),
    items,
  };

  const [webhook] = await invokeN8nWebhooks(
    [{ url, secret: ITEM_CONTENT_I18N_WEBHOOK.secret?.trim() || null }],
    payload,
    { stagger: false },
  );

  if (!webhook?.ok) {
    return {
      ok: false,
      error: webhook?.error ?? "Webhook failed",
      itemCount: items.length,
      items,
      webhook,
    };
  }

  return { ok: true, skipped: false, itemCount: items.length, items, webhook };
}
