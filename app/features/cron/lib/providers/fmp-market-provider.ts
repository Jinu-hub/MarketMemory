import { z } from "zod";

import type { MarketItemConfig, MarketSnapshotItem } from "../market-snapshot.types";

const fmpQuoteSchema = z
  .object({
    symbol: z.string().optional(),
    price: z.number().optional(),
    change: z.number().optional(),
    changesPercentage: z.union([z.number(), z.string()]).optional(),
    currency: z.string().optional(),
    timestamp: z.number().optional(),
  })
  .passthrough();

const fmpErrorSchema = z
  .object({
    Error: z.string().optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  })
  .passthrough();

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value !== "string") {
    return null;
  }

  const cleaned = value.replaceAll("%", "").trim();
  if (cleaned.length === 0) {
    return null;
  }

  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function toIsoFromTimestamp(value: number | undefined): string | null {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return new Date(value * 1000).toISOString();
}

function derivePercentFromPriceAndChange(
  price: number | null,
  change: number | null,
): number | null {
  if (price === null || change === null) {
    return null;
  }

  const previousClose = price - change;
  if (!Number.isFinite(previousClose) || previousClose === 0) {
    return null;
  }

  return (change / previousClose) * 100;
}

async function fetchFmpQuote(config: MarketItemConfig): Promise<MarketSnapshotItem> {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("Missing FMP_API_KEY");
  }

  const search = new URLSearchParams({
    symbol: config.symbol,
    apikey: apiKey,
  });

  const response = await fetch(
    `https://financialmodelingprep.com/stable/quote?${search}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error(`FMP quote request failed (${config.symbol}): ${response.status}`);
  }

  const rawJson: unknown = await response.json();
  const parsedError = fmpErrorSchema.safeParse(rawJson);
  if (parsedError.success) {
    const msg =
      parsedError.data.Error ?? parsedError.data.error ?? parsedError.data.message;
    if (msg) {
      throw new Error(`FMP error (${config.symbol}): ${msg}`);
    }
  }

  const quoteCandidate =
    Array.isArray(rawJson) && rawJson.length > 0 ? rawJson[0] : rawJson;
  const parsed = fmpQuoteSchema.safeParse(quoteCandidate);
  if (!parsed.success) {
    throw new Error(`FMP response parse failed (${config.symbol})`);
  }

  const price = toNumber(parsed.data.price);
  const change = toNumber(parsed.data.change);
  const changePercent =
    toNumber(parsed.data.changesPercentage) ??
    derivePercentFromPriceAndChange(price, change);

  return {
    id: config.id,
    label: config.label,
    symbol: config.symbol,
    source: "financial-modeling-prep",
    price,
    change,
    changePercent,
    currency: parsed.data.currency ?? "USD",
    asOf: toIsoFromTimestamp(parsed.data.timestamp),
  };
}

export async function fetchFmpMarketItems(
  configs: MarketItemConfig[],
): Promise<PromiseSettledResult<MarketSnapshotItem>[]> {
  return Promise.allSettled(configs.map((config) => fetchFmpQuote(config)));
}
