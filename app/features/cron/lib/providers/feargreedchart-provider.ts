import { z } from "zod";

import type { FearGreedSnapshot } from "../market-snapshot.types";

const fearGreedChartSchema = z.object({
  ts: z.number(),
  score: z.object({
    score: z.number(),
  }),
  recent: z
    .array(
      z.object({
        date: z.string(),
        score: z.number(),
      }),
    )
    .optional(),
});

function classificationFromScore(value: number): string {
  if (value < 25) return "Extreme Fear";
  if (value < 45) return "Fear";
  if (value <= 55) return "Neutral";
  if (value <= 75) return "Greed";
  return "Extreme Greed";
}

function snapshotFromHistoryEntry(entry: {
  date: string;
  score: number;
}): { value: number; classification: string } {
  return {
    value: entry.score,
    classification: classificationFromScore(entry.score),
  };
}

function findHistoryScore(
  recent: { date: string; score: number }[] | undefined,
  daysAgo: number,
): { value: number; classification: string } | undefined {
  if (!recent?.length) {
    return undefined;
  }

  const target = new Date();
  target.setUTCDate(target.getUTCDate() - daysAgo);
  const targetKey = target.toISOString().slice(0, 10);

  let best: { date: string; score: number } | undefined;
  for (const entry of recent) {
    if (entry.date > targetKey) {
      continue;
    }
    if (!best || entry.date > best.date) {
      best = entry;
    }
  }

  return best ? snapshotFromHistoryEntry(best) : undefined;
}

/**
 * CNN-style stock Fear & Greed via feargreedchart.com (no API key).
 * RapidAPI's fear-and-greed-index API was removed ("API doesn't exists").
 */
export async function fetchFearGreedSnapshot(): Promise<FearGreedSnapshot | null> {
  const baseUrl =
    process.env.FEAR_GREED_CHART_URL ?? "https://feargreedchart.com/api/";
  const url = new URL(baseUrl);
  url.searchParams.set("action", "all");

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Fear & Greed Chart request failed: ${response.status}`);
  }

  const rawJson: unknown = await response.json();
  const parsed = fearGreedChartSchema.parse(rawJson);
  const value = parsed.score.score;

  const recent = parsed.recent ?? [];
  const previousClose =
    recent.length >= 2
      ? snapshotFromHistoryEntry(recent[recent.length - 2]!)
      : undefined;

  return {
    source: "feargreedchart-cnn",
    value,
    classification: classificationFromScore(value),
    asOf: new Date(parsed.ts).toISOString(),
    previousClose,
    oneWeekAgo: findHistoryScore(recent, 7),
    oneMonthAgo: findHistoryScore(recent, 30),
    oneYearAgo: findHistoryScore(recent, 365),
  };
}
