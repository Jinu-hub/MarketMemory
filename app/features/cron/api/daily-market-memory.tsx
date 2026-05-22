/**
 * Daily market memory pipeline — cron entrypoint.
 * POST with Authorization: CRON_SECRET (same pattern as mailer / market-snapshot).
 *
 * Optional JSON body:
 * { "marketDate": "YYYY-MM-DD", "coverageStartAt"?: ISO, "coverageEndAt"?: ISO, "visibility": ... }
 * coverage가 양쪽 모두 유효하면 item_contents.market_date 구간 조회, 아니면 market_date 단일일.
 */
import type { Route } from "./+types/daily-market-memory";

import * as Sentry from "@sentry/node";
import { data } from "react-router";

import {
  formatMarketDateInTimeZone,
  runDailyMarketMemoryPipeline,
  type DailyMarketMemoryVisibility,
} from "~/features/cron/lib/daily-market-memory-pipeline";

export async function action({ request }: Route.ActionArgs) {
  if (
    request.method !== "POST" ||
    request.headers.get("Authorization") !== process.env.CRON_SECRET
  ) {
    return data({ error: "Unauthorized" }, { status: 401 });
  }

  const timeZone =
    process.env.DAILY_MARKET_MEMORY_TZ?.trim() || "Asia/Tokyo";

  let marketDate = formatMarketDateInTimeZone(new Date(), timeZone);
  let visibility: DailyMarketMemoryVisibility = "public_only";
  let coverageStartAt: string | null = null;
  let coverageEndAt: string | null = null;

  const contentType = request.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    const body: unknown = await request.json().catch(() => null);
    if (body && typeof body === "object" && !Array.isArray(body)) {
      const b = body as Record<string, unknown>;
      if (typeof b.marketDate === "string" && b.marketDate.trim() !== "") {
        marketDate = b.marketDate.trim();
      }
      if (typeof b.coverageStartAt === "string") {
        coverageStartAt = b.coverageStartAt;
      }
      if (typeof b.coverageEndAt === "string") {
        coverageEndAt = b.coverageEndAt;
      }
      if (b.visibility === "public_only" || b.visibility === "all_active") {
        visibility = b.visibility;
      }
    }
  }

  try {
    const result = await runDailyMarketMemoryPipeline({
      marketDate,
      coverageStartAt,
      coverageEndAt,
      visibility,
      persistToDb: true,
    });
    return data(result, { status: 200 });
  } catch (error) {
    Sentry.captureException(
      error instanceof Error ? error : new Error(String(error)),
    );
    return data(
      { error: "Failed to run daily market memory pipeline" },
      { status: 500 },
    );
  }
}
