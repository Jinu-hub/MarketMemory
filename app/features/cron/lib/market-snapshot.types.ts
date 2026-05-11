export type MarketSnapshotItemId =
  | "sp500"
  | "nasdaq"
  | "dow"
  | "bitcoin"
  | "gold";

export interface MarketSnapshotItem {
  id: MarketSnapshotItemId;
  label: string;
  symbol: string;
  source: "financial-modeling-prep" | "twelve-data";
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

export interface MarketItemConfig {
  id: MarketSnapshotItemId;
  label: string;
  symbol: string;
}
