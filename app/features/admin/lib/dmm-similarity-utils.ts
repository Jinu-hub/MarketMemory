import type { DmmSimilarityEdgeListRow } from "../queries/dmm-similarity";

export function parseTriStateStatusParam(v: string | null): "all" | "final" | "draft" {
  if (v === "final" || v === "draft") {
    return v;
  }
  return "all";
}

export function groupDmmSimilarityEdgesBySource(
  edges: DmmSimilarityEdgeListRow[],
): Map<string, DmmSimilarityEdgeListRow[]> {
  const m = new Map<string, DmmSimilarityEdgeListRow[]>();
  for (const e of edges) {
    const list = m.get(e.source_daily_market_memory_id) ?? [];
    list.push(e);
    m.set(e.source_daily_market_memory_id, list);
  }
  return m;
}
