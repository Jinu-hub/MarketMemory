import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "database.types";

import { formatMarketDateInTimeZone } from "./daily-market-memory-pipeline";
import type { MarketSnapshotPayload } from "./market-snapshot.types";

const STAGING_TTL_DAYS = 7;

function defaultExpiresAt(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + STAGING_TTL_DAYS);
  return d.toISOString();
}

export type PersistMarketSnapshotStagingParams = {
  snapshot: MarketSnapshotPayload;
  marketDate?: string;
  marketScope?: string;
  generationTimezone?: string;
};

export type PersistMarketSnapshotStagingResult = {
  id: string;
  marketDate: string;
  marketScope: string;
};

/**
 * 동일 `market_date`·`market_scope`의 active 행을 superseded로 두고
 * 새 스냅샷을 active로 저장합니다.
 */
export async function persistMarketSnapshotStaging(
  db: SupabaseClient<Database>,
  params: PersistMarketSnapshotStagingParams,
): Promise<PersistMarketSnapshotStagingResult> {
  const generationTimezone =
    params.generationTimezone?.trim() ||
    process.env.DAILY_MARKET_MEMORY_TZ?.trim() ||
    "Asia/Tokyo";
  const marketScope =
    params.marketScope?.trim() ||
    process.env.DAILY_MARKET_MEMORY_SCOPE?.trim() ||
    "global";
  const marketDate =
    params.marketDate?.trim() ||
    formatMarketDateInTimeZone(
      new Date(params.snapshot.fetchedAt),
      generationTimezone,
    );

  const now = new Date().toISOString();

  const { error: supersedeError } = await db
    .from("daily_market_snapshot_staging")
    .update({ status: "superseded", updated_at: now })
    .eq("market_date", marketDate)
    .eq("market_scope", marketScope)
    .eq("status", "active");

  if (supersedeError) {
    throw new Error(
      `daily_market_snapshot_staging supersede 실패: ${supersedeError.message}`,
    );
  }

  const { data, error } = await db
    .from("daily_market_snapshot_staging")
    .insert({
      market_date: marketDate,
      market_scope: marketScope,
      generation_timezone: generationTimezone,
      fetched_at: params.snapshot.fetchedAt,
      snapshot: params.snapshot as unknown as Json,
      status: "active",
      expires_at: defaultExpiresAt(),
      updated_at: now,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(
      `daily_market_snapshot_staging 저장 실패: ${error?.message ?? "unknown"}`,
    );
  }

  return { id: data.id, marketDate, marketScope };
}
