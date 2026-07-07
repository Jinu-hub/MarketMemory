import type {
  MarketFearGreedSourceConfig,
  MarketItemConfig,
  MarketQuoteProvider,
  MarketQuoteItemConfig,
} from "./market-snapshot.types";

/**
 * 마켓 스냅샷 시세 항목 SSOT.
 * `provider`로 fmp / fmp-treasury / twelve / rapidapi 라우팅 (`getMarketSnapshot`).
 */
export const MARKET_SNAPSHOT_QUOTE_SOURCES: MarketItemConfig[] = [
  { provider: "fmp", id: "sp500", label: "S&P 500", symbol: "^GSPC" },
  { provider: "fmp", id: "nasdaq", label: "NASDAQ", symbol: "^IXIC" },
  { provider: "fmp", id: "dow", label: "DOW", symbol: "^DJI" },
  { provider: "fmp", id: "bitcoin", label: "Bitcoin", symbol: "BTCUSD" },
  { provider: "fmp", id: "brent_crude", label: "Brent Crude", symbol: "BZUSD" },
  {
    provider: "fmp-treasury",
    id: "us_10y",
    label: "US 10Y Treasury",
    symbol: "^TNX",
  },
  { provider: "twelve", id: "gold", label: "Gold", symbol: "XAU/USD" },
];

/**
 * Fear & Greed 지수 SSOT.
 * `target`: `fearGreed`(주식) / `cryptoFearGreed`(크립토) 필드 매핑.
 */
export const MARKET_FEAR_GREED_SOURCES: MarketFearGreedSourceConfig[] = [
  { provider: "feargreedchart", target: "market" },
  { provider: "alternative-me", target: "crypto" },
];

export function quoteConfigsForProvider(
  provider: MarketQuoteProvider,
): MarketQuoteItemConfig[] {
  return MARKET_SNAPSHOT_QUOTE_SOURCES.filter((c) => c.provider === provider).map(
    ({ provider: _provider, ...quote }) => quote,
  );
}

export function fearGreedSourceForTarget(
  target: MarketFearGreedSourceConfig["target"],
): MarketFearGreedSourceConfig | undefined {
  return MARKET_FEAR_GREED_SOURCES.find((s) => s.target === target);
}
