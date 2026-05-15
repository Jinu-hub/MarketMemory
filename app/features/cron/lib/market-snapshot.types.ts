export type MarketSnapshotItemId =
  | "sp500"
  | "nasdaq"
  | "dow"
  | "bitcoin"
  | "gold"
  | "brent_crude"
  | "us_10y";

export interface MarketSnapshotItem {
  id: MarketSnapshotItemId;
  label: string;
  symbol: string;
  source:
    | "financial-modeling-prep"
    | "financial-modeling-prep-treasury"
    | "twelve-data"
    | "rapidapi-yahoo-finance";
  price: number | null;
  change: number | null;
  changePercent: number | null;
  currency: string | null;
  asOf: string | null;
  isStale?: boolean;
  staleMinutes?: number | null;
}

export interface FearGreedSnapshot {
  source: "alternative-me" | "rapidapi-fear-and-greed";
  value: number;
  classification: string;
  asOf: string | null;
  previousClose?: {
    value: number;
    classification: string;
  };
  oneWeekAgo?: {
    value: number;
    classification: string;
  };
  oneMonthAgo?: {
    value: number;
    classification: string;
  };
  oneYearAgo?: {
    value: number;
    classification: string;
  };
}

export interface MarketSnapshotPayload {
  provider: "composite";
  fetchedAt: string;
  items: MarketSnapshotItem[];
  fearGreed: FearGreedSnapshot | null;
  cryptoFearGreed: FearGreedSnapshot | null;
  errors: string[];
}

/** 시세 quote API 라우팅용 프로바이더 키 */
export type MarketQuoteProvider = "fmp" | "twelve" | "rapidapi" | "fmp-treasury";

export interface MarketQuoteItemConfig {
  id: MarketSnapshotItemId;
  label: string;
  symbol: string;
}

/** `market-snapshot.config` SSOT — 항목별 quote 프로바이더 */
export interface MarketItemConfig extends MarketQuoteItemConfig {
  provider: MarketQuoteProvider;
}

/** Fear & Greed 지수 API 라우팅용 프로바이더 키 */
export type MarketFearGreedProvider = "rapidapi" | "alternative-me";

export type MarketFearGreedTarget = "market" | "crypto";

export interface MarketFearGreedSourceConfig {
  provider: MarketFearGreedProvider;
  target: MarketFearGreedTarget;
}
