import type { SimilarityEdgeListRow } from "../queries";

/** URL 쿼리 `active` / `public` 등 삼태 필터 (1=예, 0=아니오, all=전체). */
export function parseTriStateQueryParam(v: string | null): "all" | "1" | "0" {
  if (v === "1" || v === "0") {
    return v;
  }
  return "all";
}

export function groupSimilarityEdgesBySource(
  edges: SimilarityEdgeListRow[],
): Map<string, SimilarityEdgeListRow[]> {
  const m = new Map<string, SimilarityEdgeListRow[]>();
  for (const e of edges) {
    const list = m.get(e.source_item_id) ?? [];
    list.push(e);
    m.set(e.source_item_id, list);
  }
  return m;
}
