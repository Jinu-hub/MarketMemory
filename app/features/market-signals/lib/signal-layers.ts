import type { MarketSignalItemRow } from "../queries.server";

/** Geo layer — high-frequency anchors that dominate mixed rankings. */
export const GEO_SIGNAL_TYPES = new Set(["country", "region"]);

export type SignalLayer = "theme" | "geo";

export function parseSignalLayer(value: string | null): SignalLayer {
  return value === "geo" ? "geo" : "theme";
}

export function isGeoSignalType(signalType: string): boolean {
  return GEO_SIGNAL_TYPES.has(signalType);
}

export function matchesSignalLayer(
  signalType: string,
  layer: SignalLayer,
): boolean {
  const isGeo = isGeoSignalType(signalType);
  return layer === "geo" ? isGeo : !isGeo;
}

/**
 * Filter items to a layer and re-rank within that layer by current_count.
 * Keeps original DB rank available via unchanged fields when needed; display
 * uses the new sequential rank.
 */
export function filterItemsByLayer(
  items: MarketSignalItemRow[],
  layer: SignalLayer,
  limit = 50,
): MarketSignalItemRow[] {
  const filtered = items
    .filter((item) => matchesSignalLayer(item.signalType, layer))
    .sort((a, b) => {
      const countDiff = (b.currentCount ?? 0) - (a.currentCount ?? 0);
      if (countDiff !== 0) return countDiff;
      return a.displayName.localeCompare(b.displayName);
    })
    .slice(0, limit);

  return filtered.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}
