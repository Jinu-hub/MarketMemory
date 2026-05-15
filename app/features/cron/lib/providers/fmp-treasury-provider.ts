import { z } from "zod";

import type { MarketQuoteItemConfig, MarketSnapshotItem } from "../market-snapshot.types";

const treasuryRowSchema = z
  .object({
    date: z.string(),
    year10: z.union([z.number(), z.string()]).optional(),
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
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function derivePercentFromPriceAndChange(
  price: number,
  change: number | null,
): number | null {
  if (change === null) {
    return null;
  }
  const previous = price - change;
  if (!Number.isFinite(previous) || previous === 0) {
    return null;
  }
  return (change / previous) * 100;
}

function parseTreasuryRows(raw: unknown): z.infer<typeof treasuryRowSchema>[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const rows: z.infer<typeof treasuryRowSchema>[] = [];
  for (const item of raw) {
    const parsed = treasuryRowSchema.safeParse(item);
    if (parsed.success && parsed.data.date) {
      rows.push(parsed.data);
    }
  }
  return rows.sort((a, b) => b.date.localeCompare(a.date));
}

async function fetchFmpUs10yTreasury(
  config: MarketQuoteItemConfig,
): Promise<MarketSnapshotItem> {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("Missing FMP_API_KEY");
  }

  const search = new URLSearchParams({ apikey: apiKey });
  const response = await fetch(
    `https://financialmodelingprep.com/stable/treasury-rates?${search}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error(
      `FMP treasury-rates request failed (${config.symbol}): ${response.status}`,
    );
  }

  const rawJson: unknown = await response.json();
  const parsedError = fmpErrorSchema.safeParse(rawJson);
  if (parsedError.success) {
    const msg =
      parsedError.data.Error ?? parsedError.data.error ?? parsedError.data.message;
    if (msg) {
      throw new Error(`FMP treasury error (${config.symbol}): ${msg}`);
    }
  }

  const rows = parseTreasuryRows(rawJson);
  const latest = rows[0];
  const previous = rows[1];
  const price = latest ? toNumber(latest.year10) : null;

  if (price === null) {
    throw new Error(`FMP treasury parse failed (${config.symbol}): missing year10`);
  }

  const latestYield = price;
  const previousYield = previous ? toNumber(previous.year10) : null;
  const change =
    previousYield !== null ? latestYield - previousYield : null;
  const changePercent = derivePercentFromPriceAndChange(latestYield, change);

  return {
    id: config.id,
    label: config.label,
    symbol: config.symbol,
    source: "financial-modeling-prep-treasury",
    price: latestYield,
    change,
    changePercent,
    currency: null,
    asOf: latest?.date ? `${latest.date}T00:00:00.000Z` : null,
  };
}

export async function fetchFmpTreasuryItems(
  configs: MarketQuoteItemConfig[],
): Promise<PromiseSettledResult<MarketSnapshotItem>[]> {
  return Promise.allSettled(configs.map((config) => fetchFmpUs10yTreasury(config)));
}
