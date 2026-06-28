/**
 * Market snapshot cron — fetch external quotes and persist to staging.
 * POST with Authorization: CRON_SECRET.
 *
 * Optional JSON body: { "marketDate"?: "YYYY-MM-DD", "marketScope"?: string }
 * marketDate omitted → UTC date from snapshot fetchedAt.
 */
import type { Route } from "./+types/market-snapshot";

import * as Sentry from "@sentry/node";
import { data } from "react-router";

import { getMarketSnapshot } from "~/features/cron/lib/market-snapshot";
import { persistMarketSnapshotStaging } from "~/features/cron/lib/market-snapshot-staging.server";
import adminClient from "~/core/lib/supa-admin-client.server";

export async function action({ request }: Route.ActionArgs) {
  if (
    request.method !== "POST" ||
    request.headers.get("Authorization") !== process.env.CRON_SECRET
  ) {
    return data({ error: "Unauthorized" }, { status: 401 });
  }

  let marketDate: string | undefined;
  let marketScope: string | undefined;

  const contentType = request.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    const body: unknown = await request.json().catch(() => null);
    if (body && typeof body === "object" && !Array.isArray(body)) {
      const b = body as Record<string, unknown>;
      if (typeof b.marketDate === "string" && b.marketDate.trim() !== "") {
        marketDate = b.marketDate.trim();
      }
      if (typeof b.marketScope === "string" && b.marketScope.trim() !== "") {
        marketScope = b.marketScope.trim();
      }
    }
  }

  try {
    const snapshot = await getMarketSnapshot();
    const staging = await persistMarketSnapshotStaging(adminClient, {
      snapshot,
      marketDate,
      marketScope,
    });

    return data({ ...snapshot, staging }, { status: 200 });
  } catch (error) {
    Sentry.captureException(
      error instanceof Error ? error : new Error(String(error)),
    );
    return data({ error: "Failed to fetch or persist market snapshot" }, { status: 500 });
  }
}
