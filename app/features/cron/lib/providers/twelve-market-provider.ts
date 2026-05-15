import { z } from "zod";

import type { MarketQuoteItemConfig, MarketSnapshotItem } from "../market-snapshot.types";

const twelveDataQuoteSchema = z
  .object({
    status: z.string().optional(),
    message: z.string().optional(),
    close: z.string().optional(),
    change: z.string().optional(),
    percent_change: z.string().optional(),
    datetime: z.string().optional(),
    timestamp: z.number().optional(),
    currency: z.string().optional(),
  })
  .passthrough();

function toNumber(value: unknown): number | null {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toIsoFromTimestamp(value: number | undefined): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return new Date(value * 1000).toISOString();
}

async function fetchTwelveQuote(
  config: MarketQuoteItemConfig,
): Promise<MarketSnapshotItem> {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("Missing TWELVE_DATA_API_KEY");
  }

  const search = new URLSearchParams({
    symbol: config.symbol,
    apikey: apiKey,
  });

  const response = await fetch(`https://api.twelvedata.com/quote?${search}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(
      `Twelve Data quote request failed (${config.symbol}): ${response.status}`,
    );
  }

  const rawJson: unknown = await response.json();
  const parsed = twelveDataQuoteSchema.safeParse(rawJson);
  if (!parsed.success) {
    throw new Error(`Twelve Data parse failed (${config.symbol})`);
  }
  if (parsed.data.status === "error") {
    throw new Error(
      `Twelve Data error (${config.symbol}): ${parsed.data.message ?? "unknown"}`,
    );
  }

  return {
    id: config.id,
    label: config.label,
    symbol: config.symbol,
    source: "twelve-data",
    price: toNumber(parsed.data.close),
    change: toNumber(parsed.data.change),
    changePercent: toNumber(parsed.data.percent_change),
    currency: parsed.data.currency ?? "USD",
    asOf: parsed.data.datetime ?? toIsoFromTimestamp(parsed.data.timestamp),
  };
}

export async function fetchTwelveMarketItems(
  configs: MarketQuoteItemConfig[],
): Promise<PromiseSettledResult<MarketSnapshotItem>[]> {
  return Promise.allSettled(configs.map((config) => fetchTwelveQuote(config)));
}
