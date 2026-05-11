import { fetchFearGreedSnapshot as fetchCryptoFearGreedSnapshot } from "./providers/crypto-fear-greed-provider";
import { fetchFmpMarketItems } from "./providers/fmp-market-provider";
import { fetchFearGreedSnapshot as fetchRapidApiFearGreedSnapshot } from "./providers/rapidapi-provider";
import { fetchTwelveMarketItems } from "./providers/twelve-market-provider";

import type {
  MarketItemConfig,
  MarketSnapshotItem,
  MarketSnapshotPayload,
} from "./market-snapshot.types";

export type {
  FearGreedSnapshot,
  MarketSnapshotItem,
  MarketSnapshotItemId,
  MarketSnapshotPayload,
} from "./market-snapshot.types";

const fmpMarketConfigs: MarketItemConfig[] = [
  { id: "sp500", label: "S&P 500", symbol: "^GSPC" },
  { id: "nasdaq", label: "NASDAQ", symbol: "^IXIC" },
  { id: "dow", label: "DOW", symbol: "^DJI" },
  { id: "bitcoin", label: "Bitcoin", symbol: "BTCUSD" },
];

const twelveMarketConfigs: MarketItemConfig[] = [
  { id: "gold", label: "Gold", symbol: "XAU/USD" },
];

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

    // Provider failures should be visible in server logs for ops/debug.
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

export async function getMarketSnapshot(): Promise<MarketSnapshotPayload> {
  const [fmpResults, twelveResults] = await Promise.all([
    fetchFmpMarketItems(fmpMarketConfigs),
    fetchTwelveMarketItems(twelveMarketConfigs),
  ]);

  const items: MarketSnapshotItem[] = [];
  const errors: string[] = [];
  mergeSettledResults(fmpResults, items, errors);
  mergeSettledResults(twelveResults, items, errors);

  let cryptoFearGreed = null;
  try {
    cryptoFearGreed = await fetchCryptoFearGreedSnapshot();
  } catch (error) {
    console.error("[market-snapshot] crypto fear-greed fetch failed", error);
    errors.push(
      error instanceof Error
        ? error.message
        : "Unknown Crypto Fear & Greed fetch error",
    );
  }

  let marketFearGreed = null;
  try {
    marketFearGreed = await fetchRapidApiFearGreedSnapshot();
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
