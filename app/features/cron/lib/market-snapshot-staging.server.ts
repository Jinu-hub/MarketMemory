import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "database.types";

import { marketDateFromFetchedAt } from "./market-snapshot-staging-date";
import type { MarketSnapshotPayload } from "./market-snapshot.types";

export { marketDateFromFetchedAt } from "./market-snapshot-staging-date";

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

export type LoadedMarketSnapshotStaging = {
  id: string;
  marketDate: string;
  marketScope: string;
  fetchedAt: string;
  status: string;
  snapshot: MarketSnapshotPayload;
};

function resolveMarketScope(marketScope?: string): string {
  return (
    marketScope?.trim() ||
    process.env.DAILY_MARKET_MEMORY_SCOPE?.trim() ||
    "global"
  );
}

function parseMarketSnapshotPayload(raw: Json): MarketSnapshotPayload | null {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const o = raw as Record<string, unknown>;
  if (typeof o.fetchedAt !== "string" || !Array.isArray(o.items)) {
    return null;
  }
  return raw as unknown as MarketSnapshotPayload;
}

/**
 * 해당 `market_date`·`market_scope`의 staging 중 `fetched_at` 최신 1건.
 * status 무관(여러 active가 있을 수 있는 edge case 포함).
 */
export async function loadLatestMarketSnapshotStaging(
  db: SupabaseClient<Database>,
  params: { marketDate: string; marketScope?: string },
): Promise<LoadedMarketSnapshotStaging | null> {
  const marketScope = resolveMarketScope(params.marketScope);

  const { data, error } = await db
    .from("daily_market_snapshot_staging")
    .select("id, market_date, market_scope, fetched_at, status, snapshot")
    .eq("market_date", params.marketDate)
    .eq("market_scope", marketScope)
    .order("fetched_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(
      `daily_market_snapshot_staging 조회 실패: ${error.message}`,
    );
  }

  if (!data) {
    return null;
  }

  const snapshot = parseMarketSnapshotPayload(data.snapshot);
  if (!snapshot) {
    return null;
  }

  return {
    id: data.id,
    marketDate: data.market_date,
    marketScope: data.market_scope,
    fetchedAt: data.fetched_at,
    status: data.status,
    snapshot,
  };
}

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
    marketDateFromFetchedAt(params.snapshot.fetchedAt);

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
