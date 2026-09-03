/**
 * Market Signal pipeline — cron entrypoint.
 * POST with Authorization: CRON_SECRET
 *
 * Initial backfill (once — weekly leaf, then monthly/yearly rollup):
 * {
 *   "mode": "backfill",
 *   "scopeKey": "global-market-issues",
 *   "periodTypes": ["weekly", "monthly", "yearly"],
 *   "finalize": false
 * }
 *
 * Daily cron (weekly only — current ISO week, pending sources only):
 * {
 *   "mode": "discover_and_aggregate",
 *   "scopeKey": "global-market-issues",
 *   "periodTypes": ["weekly"]
 * }
 * Also auto-finalizes closed periods still in draft (status-only or re-aggregate if pending).
 *
 * Weekly cron (monthly rollup — current month from weekly snapshots):
 * {
 *   "mode": "discover_and_aggregate",
 *   "scopeKey": "global-market-issues",
 *   "periodTypes": ["monthly"]
 * }
 *
 * Monthly cron (yearly rollup — current year from monthly snapshots):
 * {
 *   "mode": "discover_and_aggregate",
 *   "scopeKey": "global-market-issues",
 *   "periodTypes": ["yearly"]
 * }
 *
 * Dry run (no DB writes):
 * { "mode": "backfill", "dryRun": true }
 */
import type { Route } from "./+types/market-signal";

import * as Sentry from "@sentry/node";
import { data } from "react-router";

import { runMarketSignalPipeline } from "~/features/cron/lib/market-signal/pipeline.server";
import type {
  MarketSignalPeriodType,
  MarketSignalPipelineMode,
} from "~/features/cron/lib/market-signal/types";

function parsePeriodTypes(value: unknown): MarketSignalPeriodType[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const allowed = new Set<MarketSignalPeriodType>([
    "daily",
    "weekly",
    "monthly",
    "yearly",
  ]);
  const parsed = value.filter(
    (item): item is MarketSignalPeriodType =>
      typeof item === "string" && allowed.has(item as MarketSignalPeriodType),
  );
  return parsed.length > 0 ? parsed : undefined;
}

export async function action({ request }: Route.ActionArgs) {
  if (
    request.method !== "POST" ||
    request.headers.get("Authorization") !== process.env.CRON_SECRET
  ) {
    return data({ error: "Unauthorized" }, { status: 401 });
  }

  let scopeKey = "global-market-issues";
  let mode: MarketSignalPipelineMode = "backfill";
  let periodType: MarketSignalPeriodType | undefined;
  let periodTypes: MarketSignalPeriodType[] | undefined;
  let periodKey: string | undefined;
  let from: string | undefined;
  let to: string | undefined;
  let finalize = true;
  let minCount = 2;
  let dryRun = false;

  const contentType = request.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    const body: unknown = await request.json().catch(() => null);
    if (body && typeof body === "object" && !Array.isArray(body)) {
      const b = body as Record<string, unknown>;
      if (typeof b.scopeKey === "string" && b.scopeKey.trim() !== "") {
        scopeKey = b.scopeKey.trim();
      }
      if (
        b.mode === "backfill" ||
        b.mode === "period" ||
        b.mode === "discover_and_aggregate"
      ) {
        mode = b.mode;
      }
      if (
        b.periodType === "daily" ||
        b.periodType === "weekly" ||
        b.periodType === "monthly" ||
        b.periodType === "yearly"
      ) {
        periodType = b.periodType;
      }
      periodTypes = parsePeriodTypes(b.periodTypes);
      if (typeof b.periodKey === "string" && b.periodKey.trim() !== "") {
        periodKey = b.periodKey.trim();
      }
      if (typeof b.from === "string" && b.from.trim() !== "") {
        from = b.from.trim();
      }
      if (typeof b.to === "string" && b.to.trim() !== "") {
        to = b.to.trim();
      }
      if (typeof b.finalize === "boolean") {
        finalize = b.finalize;
      }
      if (typeof b.minCount === "number" && Number.isFinite(b.minCount) && b.minCount >= 1) {
        minCount = Math.floor(b.minCount);
      }
      if (typeof b.dryRun === "boolean") {
        dryRun = b.dryRun;
      }
    }
  }

  try {
    const result = await runMarketSignalPipeline({
      scopeKey,
      mode,
      periodType,
      periodTypes,
      periodKey,
      from,
      to,
      finalize,
      minCount,
      dryRun,
      persistToDb: !dryRun,
    });
    return data(result, { status: result.errors.length > 0 ? 207 : 200 });
  } catch (error) {
    Sentry.captureException(
      error instanceof Error ? error : new Error(String(error)),
    );
    return data({ error: "Failed to run market signal pipeline" }, { status: 500 });
  }
}
