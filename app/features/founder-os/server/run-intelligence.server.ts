import type { FounderOsDb } from "../lib/db";
import { OBSERVATION_INTELLIGENCE_WEBHOOK } from "../lib/observation-intelligence.config";

import { invokeN8nWebhooks } from "~/features/admin/lib/n8n-webhook-test.server";

export type RunIntelligenceResult = {
  runIds: string[];
  updatedCount: number;
  webhookOk: boolean;
  webhookError: string | null;
};

/**
 * 선택된 collection_runs의 intelligence_number를 +1 하고
 * n8n 웹훅에 run id 목록을 전달한다.
 */
export async function runObservationIntelligence(
  client: FounderOsDb,
  runIds: string[],
): Promise<RunIntelligenceResult> {
  const uniqueIds = [...new Set(runIds.filter((id) => id.length > 0))];
  if (uniqueIds.length === 0) {
    throw new Error("선택된 수집 실행이 없습니다.");
  }

  const { data: rows, error: selectError } = await client
    .from("collection_runs")
    .select("id, intelligence_number")
    .in("id", uniqueIds);

  if (selectError) {
    throw new Error(selectError.message);
  }

  const found = rows ?? [];
  if (found.length === 0) {
    throw new Error("선택한 수집 실행을 찾을 수 없습니다.");
  }

  const updateResults = await Promise.all(
    found.map((row) =>
      client
        .from("collection_runs")
        .update({ intelligence_number: (row.intelligence_number ?? 0) + 1 })
        .eq("id", row.id),
    ),
  );

  const updateError = updateResults.find((result) => result.error)?.error;
  if (updateError) {
    throw new Error(updateError.message);
  }

  const updatedIds = found.map((row) => row.id);
  const [webhook] = await invokeN8nWebhooks(
    [
      {
        url: OBSERVATION_INTELLIGENCE_WEBHOOK.url,
        secret: OBSERVATION_INTELLIGENCE_WEBHOOK.secret,
      },
    ],
    {
      collection_run_ids: updatedIds,
    },
    { stagger: false },
  );

  return {
    runIds: updatedIds,
    updatedCount: updatedIds.length,
    webhookOk: webhook?.ok ?? false,
    webhookError: webhook?.ok
      ? null
      : (webhook?.error ?? "웹훅 호출에 실패했습니다."),
  };
}
