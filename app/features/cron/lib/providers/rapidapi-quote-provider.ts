import { z } from "zod";

import type { MarketQuoteItemConfig, MarketSnapshotItem } from "../market-snapshot.types";

const PRICE_KEYS = [
  "regularMarketPrice",
  "price",
  "lastPrice",
  "last",
  "close",
  "regular_market_price",
] as const;

const CHANGE_KEYS = [
  "regularMarketChange",
  "change",
  "netChange",
  "regular_market_change",
] as const;

const CHANGE_PERCENT_KEYS = [
  "regularMarketChangePercent",
  "changePercent",
  "percentChange",
  "percent_change",
  "regular_market_change_percent",
] as const;

const TIME_KEYS = [
  "regularMarketTime",
  "marketTime",
  "quoteTime",
  "updatedAt",
  "timestamp",
] as const;

const CURRENCY_KEYS = ["currency", "currencyCode"] as const;

const rapidApiErrorSchema = z
  .object({
    message: z.string().optional(),
    error: z.string().optional(),
  })
  .passthrough();

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }
  const parsed = Number.parseFloat(value.replaceAll("%", "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

/** Yahoo / RapidAPI often wraps scalars as `{ raw, fmt }`. */
function unwrapScalar(value: unknown): unknown {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }
  const record = value as Record<string, unknown>;
  if ("raw" in record) {
    return record.raw;
  }
  if ("fmt" in record) {
    return record.fmt;
  }
  return value;
}

function pickField(
  record: Record<string, unknown>,
  keys: readonly string[],
): number | null {
  for (const key of keys) {
    const n = toNumber(unwrapScalar(record[key]));
    if (n !== null) {
      return n;
    }
  }
  return null;
}

function pickString(
  record: Record<string, unknown>,
  keys: readonly string[],
): string | null {
  for (const key of keys) {
    const v = unwrapScalar(record[key]);
    if (typeof v === "string" && v.trim() !== "") {
      return v;
    }
  }
  return null;
}

function toIsoFromMarketTime(value: unknown): string | null {
  const unwrapped = unwrapScalar(value);
  if (typeof unwrapped === "number" && Number.isFinite(unwrapped)) {
    const ms = unwrapped > 1e12 ? unwrapped : unwrapped * 1000;
    return new Date(ms).toISOString();
  }
  if (typeof unwrapped === "string" && unwrapped.trim() !== "") {
    const asNum = Number.parseInt(unwrapped, 10);
    if (Number.isFinite(asNum)) {
      const ms = asNum > 1e12 ? asNum : asNum * 1000;
      return new Date(ms).toISOString();
    }
    const parsed = Date.parse(unwrapped);
    return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
  }
  return null;
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

function assertNoTopLevelApiError(raw: unknown, symbol: string): void {
  const parsed = rapidApiErrorSchema.safeParse(raw);
  if (!parsed.success) {
    return;
  }
  const msg = parsed.data.message ?? parsed.data.error;
  if (msg && msg.trim() !== "") {
    throw new Error(`RapidAPI error (${symbol}): ${msg}`);
  }
}

function collectQuoteRecords(raw: unknown, depth = 0): Record<string, unknown>[] {
  if (depth > 8 || raw === null || typeof raw !== "object") {
    return [];
  }

  const out: Record<string, unknown>[] = [];

  if (Array.isArray(raw)) {
    for (const item of raw) {
      out.push(...collectQuoteRecords(item, depth + 1));
    }
    return out;
  }

  const record = raw as Record<string, unknown>;

  const hasPrice = PRICE_KEYS.some((key) => {
    const v = unwrapScalar(record[key]);
    return toNumber(v) !== null;
  });
  const hasSymbol = typeof record.symbol === "string";

  if (hasPrice || hasSymbol) {
    out.push(record);
  }

  for (const value of Object.values(record)) {
    out.push(...collectQuoteRecords(value, depth + 1));
  }

  return out;
}

function extractQuoteFromResponse(
  raw: unknown,
  symbol: string,
): {
  price: number;
  change: number | null;
  changePercent: number | null;
  currency: string | null;
  asOf: string | null;
} | null {
  assertNoTopLevelApiError(raw, symbol);

  const normalizedSymbol = symbol.replace(/^\^/, "").toUpperCase();
  const candidates = collectQuoteRecords(raw);

  const ranked = candidates
    .map((record) => {
      const recordSymbol =
        typeof record.symbol === "string"
          ? record.symbol.replace(/^\^/, "").toUpperCase()
          : null;
      const price = pickField(record, PRICE_KEYS);
      return { record, recordSymbol, price };
    })
    .filter((c): c is typeof c & { price: number } => c.price !== null);

  if (ranked.length === 0) {
    return null;
  }

  const match =
    ranked.find((c) => c.recordSymbol === normalizedSymbol) ??
    ranked.find((c) => c.recordSymbol?.includes("TNX")) ??
    ranked[0];

  const { record, price } = match;
  const change = pickField(record, CHANGE_KEYS);
  const changePercent =
    pickField(record, CHANGE_PERCENT_KEYS) ??
    derivePercentFromPriceAndChange(price, change);

  return {
    price,
    change,
    changePercent,
    currency: pickString(record, CURRENCY_KEYS),
    asOf: (() => {
      for (const key of TIME_KEYS) {
        const iso = toIsoFromMarketTime(record[key]);
        if (iso) {
          return iso;
        }
      }
      return null;
    })(),
  };
}

type QuoteEndpointCandidate = { path: string; tickerParam: string };

const QUOTE_ENDPOINT_CANDIDATES: QuoteEndpointCandidate[] = [
  { path: "/api/v1/markets/quote", tickerParam: "ticker" },
  { path: "/api/v1/markets/stock/quotes", tickerParam: "ticker" },
];

async function fetchRapidApiQuoteJson(
  config: MarketQuoteItemConfig,
  rapidApiKey: string,
  rapidApiHost: string,
  endpoint: QuoteEndpointCandidate,
  symbol: string,
): Promise<unknown> {
  const search = new URLSearchParams({
    [endpoint.tickerParam]: symbol,
  });
  const url = `https://${rapidApiHost}${endpoint.path}?${search}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "x-rapidapi-host": rapidApiHost,
      "x-rapidapi-key": rapidApiKey,
    },
  });

  if (!response.ok) {
    throw new Error(
      `RapidAPI quote request failed (${symbol}, ${endpoint.path}): ${response.status}`,
    );
  }

  return response.json();
}

async function fetchRapidApiQuote(
  config: MarketQuoteItemConfig,
): Promise<MarketSnapshotItem> {
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  const rapidApiHost =
    process.env.RAPIDAPI_QUOTE_HOST ?? "yahoo-finance15.p.rapidapi.com";

  if (!rapidApiKey || rapidApiKey.trim() === "") {
    throw new Error("Missing RAPIDAPI_KEY");
  }

  const customPath = process.env.RAPIDAPI_QUOTE_PATH;
  const customTickerParam = process.env.RAPIDAPI_QUOTE_TICKER_PARAM;
  const endpoints =
    customPath && customTickerParam
      ? [{ path: customPath, tickerParam: customTickerParam }]
      : [...QUOTE_ENDPOINT_CANDIDATES];

  const symbolsToTry = [
    config.symbol,
    config.symbol.replace(/^\^/, ""),
  ].filter((s, i, arr) => arr.indexOf(s) === i);

  let lastError: Error | null = null;

  for (const symbol of symbolsToTry) {
    for (const endpoint of endpoints) {
      try {
        const rawJson = await fetchRapidApiQuoteJson(
          config,
          rapidApiKey,
          rapidApiHost,
          endpoint,
          symbol,
        );
        const extracted = extractQuoteFromResponse(rawJson, config.symbol);
        if (!extracted) {
          lastError = new Error(
            `RapidAPI quote parse failed (${config.symbol}, ${endpoint.path}): no price in response`,
          );
          continue;
        }

        return {
          id: config.id,
          label: config.label,
          symbol: config.symbol,
          source: "rapidapi-yahoo-finance",
          price: extracted.price,
          change: extracted.change,
          changePercent: extracted.changePercent,
          currency: extracted.currency,
          asOf: extracted.asOf,
        };
      } catch (error) {
        lastError =
          error instanceof Error
            ? error
            : new Error(`RapidAPI quote failed (${config.symbol})`);
      }
    }
  }

  throw (
    lastError ??
    new Error(`RapidAPI quote failed (${config.symbol}): no usable response`)
  );
}

export async function fetchRapidApiMarketItems(
  configs: MarketQuoteItemConfig[],
): Promise<PromiseSettledResult<MarketSnapshotItem>[]> {
  return Promise.allSettled(configs.map((config) => fetchRapidApiQuote(config)));
}
