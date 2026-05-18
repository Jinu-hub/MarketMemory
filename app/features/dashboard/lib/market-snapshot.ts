/**
 * Display helpers for the Market Snapshot Bar.
 *
 * The dashboard uses a fixed list of 6 metrics (S&P 500, NASDAQ, DOW, BTC,
 * Gold, Fear & Greed) so the bar reads like a market ticker. This module
 * provides:
 *  - resolution from raw `market_snapshot.items[]` keyed by id
 *  - sane labels / fallback Korean copy
 *  - price + change formatting in light, dark, and warm themes
 */
import type {
  MarketSnapshotData,
  MarketSnapshotItem,
  MarketSnapshotItemId,
} from "../types";

export type SnapshotDisplayId =
  | MarketSnapshotItemId
  | "fear_greed"
  | "crypto_fear_greed";

export type SnapshotDisplaySlot = {
  id: SnapshotDisplayId;
  label: string;
  sublabel?: string;
};

export const SNAPSHOT_DISPLAY_SLOTS: SnapshotDisplaySlot[] = [
  { id: "sp500", label: "S&P 500", sublabel: "US Equities" },
  { id: "nasdaq", label: "NASDAQ", sublabel: "US Tech" },
  { id: "dow", label: "DOW", sublabel: "US Industrials" },
  { id: "bitcoin", label: "BTC", sublabel: "Bitcoin" },
  { id: "gold", label: "Gold", sublabel: "Safe Haven" },
  { id: "fear_greed", label: "Fear & Greed", sublabel: "Market Sentiment" },
];

export type ResolvedSnapshotEntry =
  | {
      kind: "quote";
      id: SnapshotDisplayId;
      label: string;
      sublabel?: string;
      item: MarketSnapshotItem;
    }
  | {
      kind: "fear-greed";
      id: SnapshotDisplayId;
      label: string;
      sublabel?: string;
      value: number;
      classification: string;
      asOf?: string | null;
    }
  | {
      kind: "empty";
      id: SnapshotDisplayId;
      label: string;
      sublabel?: string;
    };

/**
 * Convert the raw JSONB payload into a normalized list of entries for each
 * slot. Items that are missing render as an `empty` placeholder rather than
 * being dropped — keeping the bar visually stable across days.
 */
export function resolveSnapshotEntries(
  snapshot: MarketSnapshotData | null | undefined,
): ResolvedSnapshotEntry[] {
  const items = snapshot?.items ?? [];
  const byId = new Map<string, MarketSnapshotItem>();
  for (const item of items) {
    if (item?.id) byId.set(item.id, item);
  }

  return SNAPSHOT_DISPLAY_SLOTS.map((slot) => {
    if (slot.id === "fear_greed") {
      const fg = snapshot?.fearGreed;
      if (!fg) {
        return {
          kind: "empty",
          id: slot.id,
          label: slot.label,
          sublabel: slot.sublabel,
        } as ResolvedSnapshotEntry;
      }
      return {
        kind: "fear-greed",
        id: slot.id,
        label: slot.label,
        sublabel: slot.sublabel,
        value: fg.value,
        classification: fg.classification,
        asOf: fg.asOf ?? null,
      };
    }

    const item = byId.get(slot.id);
    if (!item) {
      return {
        kind: "empty",
        id: slot.id,
        label: slot.label,
        sublabel: slot.sublabel,
      };
    }
    return {
      kind: "quote",
      id: slot.id,
      label: slot.label,
      sublabel: slot.sublabel,
      item,
    };
  });
}

/** Format a numeric price using locale-aware grouping. Returns `—` on null. */
export function formatPrice(
  price: number | null | undefined,
  currency?: string | null,
): string {
  if (price == null || !Number.isFinite(price)) return "—";

  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: price >= 1000 ? 0 : 2,
    }).format(price);
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: price >= 1000 ? 0 : 2,
  }).format(price);
}

/** Format a change-% value as `+1.23%` / `-0.45%` / `—`. */
export function formatChangePercent(
  changePercent: number | null | undefined,
): string {
  if (changePercent == null || !Number.isFinite(changePercent)) return "—";
  const sign = changePercent > 0 ? "+" : "";
  return `${sign}${changePercent.toFixed(2)}%`;
}

/**
 * Direction-aware color classes for change-%.
 * - positive → emerald
 * - negative → rose
 * - zero / null → muted
 *
 * Returns `text-*` class string only (no background) so it works in any theme.
 */
export function getChangeColorClass(
  changePercent: number | null | undefined,
): string {
  if (changePercent == null || !Number.isFinite(changePercent)) {
    return "text-muted-foreground";
  }
  if (changePercent > 0) return "text-emerald-600 dark:text-emerald-400";
  if (changePercent < 0) return "text-rose-600 dark:text-rose-400";
  return "text-muted-foreground";
}

/**
 * Map a Fear & Greed value (0–100) to a coarse band so we can color it.
 * Returns one of: "extreme-fear" | "fear" | "neutral" | "greed" | "extreme-greed".
 */
export function getFearGreedBand(
  value: number,
): "extreme-fear" | "fear" | "neutral" | "greed" | "extreme-greed" {
  if (value < 25) return "extreme-fear";
  if (value < 45) return "fear";
  if (value <= 55) return "neutral";
  if (value <= 75) return "greed";
  return "extreme-greed";
}

export function getFearGreedColorClass(value: number): string {
  const band = getFearGreedBand(value);
  switch (band) {
    case "extreme-fear":
      return "text-rose-600 dark:text-rose-400";
    case "fear":
      return "text-orange-600 dark:text-orange-400";
    case "neutral":
      return "text-amber-600 dark:text-amber-400";
    case "greed":
      return "text-lime-600 dark:text-lime-400";
    case "extreme-greed":
      return "text-emerald-600 dark:text-emerald-400";
  }
}
