import type { Database } from "database.types";

import type { AdminQueryClient } from "./db";
import type {
  ItemContentI18nListRow,
  ItemContentI18nRecordRow,
} from "../lib/item-content-i18n-utils";

const CONTENT_ID_IN_CHUNK = 120;

export type ItemContentI18nListFilters = {
  isActive?: boolean;
  isPublic?: boolean;
  reportType?: Database["public"]["Enums"]["report_type"];
  reportTier?: Database["public"]["Enums"]["report_tier"];
};

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export async function listItemContentsForI18n(
  client: AdminQueryClient,
  filters: ItemContentI18nListFilters,
) {
  let q = client
    .from("item_contents")
    .select(
      "id, title, lang_code, category, report_type, report_tier, market_date, is_active, is_public, tracking, created_at",
    )
    .order("created_at", { ascending: false });

  if (filters.isActive !== undefined) {
    q = q.eq("is_active", filters.isActive);
  }
  if (filters.isPublic !== undefined) {
    q = q.eq("is_public", filters.isPublic);
  }
  if (filters.reportType !== undefined) {
    q = q.eq("report_type", filters.reportType);
  }
  if (filters.reportTier !== undefined) {
    q = q.eq("report_tier", filters.reportTier);
  }

  return q;
}

export async function listItemContentI18nByContentIds(
  client: AdminQueryClient,
  contentIds: string[],
) {
  if (contentIds.length === 0) {
    return { data: [] as ItemContentI18nRecordRow[], error: null };
  }

  const all: ItemContentI18nRecordRow[] = [];

  for (const chunk of chunkArray(contentIds, CONTENT_ID_IN_CHUNK)) {
    const { data, error } = await client
      .from("item_content_i18n")
      .select("id, item_content_id, lang_code, status, is_public, created_at, updated_at")
      .in("item_content_id", chunk);

    if (error) {
      return { data: null, error };
    }
    all.push(...((data ?? []) as ItemContentI18nRecordRow[]));
  }

  return { data: all, error: null };
}

export async function fetchItemContentSourceLang(
  client: AdminQueryClient,
  itemContentId: string,
) {
  return client.from("item_contents").select("lang_code").eq("id", itemContentId).maybeSingle();
}
