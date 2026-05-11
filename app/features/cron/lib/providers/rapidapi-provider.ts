import { z } from "zod";

import type { FearGreedSnapshot } from "../market-snapshot.types";

const rapidApiFearGreedSchema = z.object({
  lastUpdated: z.object({
    epochUnixSeconds: z.union([z.number(), z.string()]),
    humanDate: z.string().optional(),
  }),
  fgi: z.object({
    previousClose: z
      .object({
        value: z.number(),
        valueText: z.string(),
      })
      .optional(),
    oneWeekAgo: z
      .object({
        value: z.number(),
        valueText: z.string(),
      })
      .optional(),
    oneMonthAgo: z
      .object({
        value: z.number(),
        valueText: z.string(),
      })
      .optional(),
    oneYearAgo: z
      .object({
        value: z.number(),
        valueText: z.string(),
      })
      .optional(),
    now: z.object({
      value: z.number(),
      valueText: z.string(),
    }),
  }),
});

function toIsoFromEpoch(value: number | string): string | null {
  const parsed =
    typeof value === "number" ? value : Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  return new Date(parsed * 1000).toISOString();
}

export async function fetchFearGreedSnapshot(): Promise<FearGreedSnapshot | null> {
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const rapidApiHost =
    process.env.RAPIDAPI_FNG_HOST ?? "fear-and-greed-index.p.rapidapi.com";

  if (!rapidApiKey || rapidApiKey.trim() === "") {
    throw new Error("Missing RAPIDAPI_KEY");
  }

  const response = await fetch(`https://${rapidApiHost}/v1/fgi`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-rapidapi-host": rapidApiHost,
      "x-rapidapi-key": rapidApiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`RapidAPI Fear & Greed request failed: ${response.status}`);
  }

  const rawJson: unknown = await response.json();
  const parsed = rapidApiFearGreedSchema.parse(rawJson);

  return {
    source: "rapidapi-fear-and-greed",
    value: parsed.fgi.now.value,
    classification: parsed.fgi.now.valueText,
    asOf: toIsoFromEpoch(parsed.lastUpdated.epochUnixSeconds),
    previousClose: parsed.fgi.previousClose
      ? {
          value: parsed.fgi.previousClose.value,
          classification: parsed.fgi.previousClose.valueText,
        }
      : undefined,
    oneWeekAgo: parsed.fgi.oneWeekAgo
      ? {
          value: parsed.fgi.oneWeekAgo.value,
          classification: parsed.fgi.oneWeekAgo.valueText,
        }
      : undefined,
    oneMonthAgo: parsed.fgi.oneMonthAgo
      ? {
          value: parsed.fgi.oneMonthAgo.value,
          classification: parsed.fgi.oneMonthAgo.valueText,
        }
      : undefined,
    oneYearAgo: parsed.fgi.oneYearAgo
      ? {
          value: parsed.fgi.oneYearAgo.value,
          classification: parsed.fgi.oneYearAgo.valueText,
        }
      : undefined,
  };
}
