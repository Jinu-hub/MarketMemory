export const MOCK_SIMILAR_MEMORIES = [
  {
    id: "m1",
    date: "2024-04-12",
    title: "연준 동결 + 고용 강세 → 인플레 재점화 우려",
    similarity: 87,
    tags: ["연준", "인플레이션", "고용"],
  },
  {
    id: "m2",
    date: "2023-10-23",
    title: "에너지 가격 급등기 — 방어주·금 동반 강세",
    similarity: 76,
    tags: ["원유", "금", "방어주"],
  },
  {
    id: "m3",
    date: "2023-08-09",
    title: "AI 인프라 모멘텀 확장 (전력·반도체 동조)",
    similarity: 71,
    tags: ["AI", "데이터센터", "반도체"],
  },
] as const;

export const MOCK_RECALL_PATTERNS = [
  {
    id: "p1",
    title: "동결 → 단기 안도 → 데이터 재점화",
    occurrences: 4,
    summary:
      "연준 동결 직후 단기 랠리 후 강한 고용·에너지 데이터로 인플레 우려가 재점화되는 흐름.",
  },
  {
    id: "p2",
    title: "AI 캐펙스 확장 → 인프라 동조 상승",
    occurrences: 6,
    summary:
      "AI 데이터센터 수요 확장 시 전력·변압기·냉각 등 인프라 공급망이 함께 재평가되는 패턴.",
  },
] as const;
