import { fetchFearGreedSnapshot as fetchCryptoFearGreedSnapshot } from "./providers/crypto-fear-greed-provider";
import { fetchFmpMarketItems } from "./providers/fmp-market-provider";
import { fetchFmpTreasuryItems } from "./providers/fmp-treasury-provider";
import { fetchFearGreedSnapshot as fetchFearGreedChartSnapshot } from "./providers/feargreedchart-provider";
import { fetchRapidApiMarketItems } from "./providers/rapidapi-quote-provider";
import { fetchTwelveMarketItems } from "./providers/twelve-market-provider";
import {
  fearGreedSourceForTarget,
  quoteConfigsForProvider,
} from "./market-snapshot.config";

import type {
  FearGreedSnapshot,
  MarketSnapshotItem,
  MarketSnapshotPayload,
} from "./market-snapshot.types";

export type {
  FearGreedSnapshot,
  MarketFearGreedProvider,
  MarketFearGreedSourceConfig,
  MarketFearGreedTarget,
  MarketItemConfig,
  MarketQuoteItemConfig,
  MarketQuoteProvider,
  MarketSnapshotItem,
  MarketSnapshotItemId,
  MarketSnapshotPayload,
} from "./market-snapshot.types";

export {
  MARKET_FEAR_GREED_SOURCES,
  MARKET_SNAPSHOT_QUOTE_SOURCES,
  fearGreedSourceForTarget,
  quoteConfigsForProvider,
} from "./market-snapshot.config";

function mergeSettledResults(
  results: PromiseSettledResult<MarketSnapshotItem>[],
  items: MarketSnapshotItem[],
  errors: string[],
) {
  for (const result of results) {
    if (result.status === "fulfilled") {
      items.push(result.value);
      continue;
    }

    console.error("[market-snapshot] provider fetch failed", result.reason);
    errors.push(
      result.reason instanceof Error
        ? result.reason.message
        : "Unknown quote fetch error",
    );
  }
}

function withStaleMetadata(items: MarketSnapshotItem[]): MarketSnapshotItem[] {
  const now = Date.now();
  const staleThresholdMinutes = 180;

  return items.map((item) => {
    if (!item.asOf) {
      return { ...item, isStale: true, staleMinutes: null };
    }

    const asOfMs = Date.parse(item.asOf);
    if (!Number.isFinite(asOfMs)) {
      return { ...item, isStale: true, staleMinutes: null };
    }

    const staleMinutes = Math.max(0, Math.floor((now - asOfMs) / 60000));
    return {
      ...item,
      isStale: staleMinutes >= staleThresholdMinutes,
      staleMinutes,
    };
  });
}

async function fetchFearGreedForTarget(
  target: "market" | "crypto",
): Promise<FearGreedSnapshot | null> {
  const source = fearGreedSourceForTarget(target);
  if (!source) {
    throw new Error(`No Fear & Greed source configured for target: ${target}`);
  }

  switch (source.provider) {
    case "feargreedchart":
      return fetchFearGreedChartSnapshot();
    case "alternative-me":
      return fetchCryptoFearGreedSnapshot();
    default: {
      const _exhaustive: never = source.provider;
      throw new Error(`Unsupported Fear & Greed provider: ${_exhaustive}`);
    }
  }
}

export async function getMarketSnapshot(): Promise<MarketSnapshotPayload> {
  const [fmpResults, fmpTreasuryResults, twelveResults, rapidResults] =
    await Promise.all([
      fetchFmpMarketItems(quoteConfigsForProvider("fmp")),
      fetchFmpTreasuryItems(quoteConfigsForProvider("fmp-treasury")),
      fetchTwelveMarketItems(quoteConfigsForProvider("twelve")),
      fetchRapidApiMarketItems(quoteConfigsForProvider("rapidapi")),
    ]);

  const items: MarketSnapshotItem[] = [];
  const errors: string[] = [];
  mergeSettledResults(fmpResults, items, errors);
  mergeSettledResults(fmpTreasuryResults, items, errors);
  mergeSettledResults(twelveResults, items, errors);
  mergeSettledResults(rapidResults, items, errors);

  let cryptoFearGreed: FearGreedSnapshot | null = null;
  try {
    cryptoFearGreed = await fetchFearGreedForTarget("crypto");
  } catch (error) {
    console.error("[market-snapshot] crypto fear-greed fetch failed", error);
    errors.push(
      error instanceof Error
        ? error.message
        : "Unknown Crypto Fear & Greed fetch error",
    );
  }

  let marketFearGreed: FearGreedSnapshot | null = null;
  try {
    marketFearGreed = await fetchFearGreedForTarget("market");
  } catch (error) {
    console.error("[market-snapshot] market fear-greed fetch failed", error);
    errors.push(
      error instanceof Error
        ? error.message
        : "Unknown Market Fear & Greed fetch error",
    );
  }

  return {
    provider: "composite",
    fetchedAt: new Date().toISOString(),
    items: withStaleMetadata(items),
    fearGreed: marketFearGreed,
    cryptoFearGreed,
    errors,
  };
}
