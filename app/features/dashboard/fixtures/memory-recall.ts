import {
  resolveDashboardLocale,
  type DashboardLocale,
} from "../i18n/resolve";

export type SimilarMemory = {
  id: string;
  date: string;
  title: string;
  similarity: number;
  tags: readonly string[];
};

export type RecallPattern = {
  id: string;
  title: string;
  occurrences: number;
  summary: string;
};

const MOCK_SIMILAR_MEMORIES: Record<DashboardLocale, SimilarMemory[]> = {
  ko: [
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
  ],
  en: [
    {
      id: "m1",
      date: "2024-04-12",
      title: "Fed hold + strong jobs → inflation re-ignition concerns",
      similarity: 87,
      tags: ["Fed", "Inflation", "Jobs"],
    },
    {
      id: "m2",
      date: "2023-10-23",
      title: "Energy price spike — defensives and gold rally together",
      similarity: 76,
      tags: ["Oil", "Gold", "Defensives"],
    },
    {
      id: "m3",
      date: "2023-08-09",
      title: "AI infrastructure momentum broadens (power and semis in sync)",
      similarity: 71,
      tags: ["AI", "Data centers", "Semiconductors"],
    },
  ],
  ja: [
    {
      id: "m1",
      date: "2024-04-12",
      title: "FRB据え置き＋堅調な雇用 → インフレ再燃懸念",
      similarity: 87,
      tags: ["FRB", "インフレ", "雇用"],
    },
    {
      id: "m2",
      date: "2023-10-23",
      title: "エネルギー価格急騰期 — ディフェンシブ・金が同時に強い",
      similarity: 76,
      tags: ["原油", "金", "ディフェンシブ"],
    },
    {
      id: "m3",
      date: "2023-08-09",
      title: "AIインフラのモメンタム拡大（電力・半導体が同調）",
      similarity: 71,
      tags: ["AI", "データセンター", "半導体"],
    },
  ],
};

const MOCK_RECALL_PATTERNS: Record<DashboardLocale, RecallPattern[]> = {
  ko: [
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
  ],
  en: [
    {
      id: "p1",
      title: "Hold → short relief → data re-ignites",
      occurrences: 4,
      summary:
        "A short rally after a Fed hold, then inflation fears return on strong jobs and energy data.",
    },
    {
      id: "p2",
      title: "AI capex expansion → infrastructure moves in sync",
      occurrences: 6,
      summary:
        "As AI data-center demand grows, power, transformers, and cooling in the supply chain get repriced together.",
    },
  ],
  ja: [
    {
      id: "p1",
      title: "据え置き → 短期安心 → データで再燃",
      occurrences: 4,
      summary:
        "FRB据え置き直後の短期ラリー後、堅調な雇用・エネルギーデータでインフレ懸念が再燃する流れ。",
    },
    {
      id: "p2",
      title: "AI CAPEX拡大 → インフラが同調上昇",
      occurrences: 6,
      summary:
        "AIデータセンター需要の拡大に伴い、電力・変圧器・冷却などインフラサプライチェーンが一緒に再評価されるパターン。",
    },
  ],
};

export function pickSimilarMemories(locale?: string | null): SimilarMemory[] {
  return MOCK_SIMILAR_MEMORIES[resolveDashboardLocale(locale)];
}

export function pickRecallPatterns(locale?: string | null): RecallPattern[] {
  return MOCK_RECALL_PATTERNS[resolveDashboardLocale(locale)];
}
