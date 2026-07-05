/**
 * item_content i18n cron — missing translations → n8n webhook.
 * POST with Authorization: CRON_SECRET.
 */
import type { Route } from "./+types/item-content-i18n";

import * as Sentry from "@sentry/node";
import { data } from "react-router";

import adminClient from "~/core/lib/supa-admin-client.server";
import { runItemContentI18nCron } from "~/features/cron/lib/item-content-i18n-cron.server";

export async function action({ request }: Route.ActionArgs) {
  if (
    request.method !== "POST" ||
    request.headers.get("Authorization") !== process.env.CRON_SECRET
  ) {
    return data({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runItemContentI18nCron(adminClient);

    if (!result.ok) {
      Sentry.captureMessage(`item-content-i18n cron: ${result.error}`);
      return data(
        {
          error: result.error,
          itemCount: result.itemCount,
          items: result.items,
        },
        { status: 500 },
      );
    }

    return data(
      {
        skipped: result.skipped,
        itemCount: result.itemCount,
        items: result.items,
      },
      { status: 200 },
    );
  } catch (error) {
    Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
    return data({ error: "Failed to run item-content-i18n cron" }, { status: 500 });
  }
}
