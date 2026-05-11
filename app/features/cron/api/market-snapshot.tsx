import type { Route } from "./+types/market-snapshot";

import * as Sentry from "@sentry/node";
import { data } from "react-router";

import { getMarketSnapshot } from "~/features/cron/lib/market-snapshot";

export async function action({ request }: Route.ActionArgs) {
  if (
    request.method !== "POST" ||
    request.headers.get("Authorization") !== process.env.CRON_SECRET
  ) {
    return data({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const snapshot = await getMarketSnapshot();
    return data(snapshot, { status: 200 });
  } catch (error) {
    Sentry.captureException(
      error instanceof Error ? error : new Error(String(error)),
    );
    return data({ error: "Failed to fetch market snapshot" }, { status: 500 });
  }
}
