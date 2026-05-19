import type { RiskSignal } from "../types";

export const MOCK_RISK_SIGNALS: RiskSignal[] = [
  {
    title: "에너지 가격 리스크",
    description:
      "중동 불안과 원유 공급 우려가 겹치며 인플레이션 재점화 가능성이 다시 부각되고 있습니다.",
    severity: "high",
    tags: ["원유", "지정학", "인플레이션"],
  },
  {
    title: "금리 인하 기대 약화",
    description:
      "연준의 동결과 강한 고용 데이터가 겹치며 장기금리·성장주 밸류에이션에 부담이 되고 있습니다.",
    severity: "medium",
    tags: ["연준", "장기금리", "성장주"],
  },
  {
    title: "AI 캐펙스 과열 가능성",
    description:
      "데이터센터·전력 인프라로 자본이 집중되면서 일부 구간에서 과열 신호가 감지되고 있습니다.",
    severity: "medium",
    tags: ["AI", "캐펙스", "데이터센터"],
  },
  {
    title: "외환 변동성 확대",
    description:
      "달러 강세와 신흥국 통화 약세가 동시 진행되며 변동성 환경이 확대되는 흐름입니다.",
    severity: "low",
    tags: ["FX", "달러", "신흥국"],
  },
];
