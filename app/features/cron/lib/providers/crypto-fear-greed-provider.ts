import { z } from "zod";

import type { FearGreedSnapshot } from "../market-snapshot.types";

const fearGreedSchema = z.object({
  data: z.array(
    z.object({
      value: z.string(),
      value_classification: z.string(),
      timestamp: z.string().optional(),
    }),
  ),
});

function toIsoFromTimestamp(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return new Date(parsed * 1000).toISOString();
}

export async function fetchFearGreedSnapshot(): Promise<FearGreedSnapshot | null> {
  const response = await fetch("https://api.alternative.me/fng/?limit=1", {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Fear & Greed request failed: ${response.status}`);
  }

  const rawJson: unknown = await response.json();
  const parsed = fearGreedSchema.parse(rawJson);
  const current = parsed.data[0];

  if (!current) {
    return null;
  }

  return {
    source: "alternative-me",
    value: Number.parseInt(current.value, 10),
    classification: current.value_classification,
    asOf: toIsoFromTimestamp(current.timestamp),
  };
}
