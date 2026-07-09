/**
 * Signal Radar — mock signals used while the feature is still in preview.
 *
 * Shape matches the planned `daily_market_memories.signal_radar` JSONB
 * payload (see Signal Radar spec, sections 11–13):
 *
 *  - `signal_type` / `impact_level` stay as language-agnostic codes.
 *  - `signal_title` / `description` / `watch_points` are display strings
 *    that would normally be stored per `lang_code`.
 */

import {
  resolveDashboardLocale,
  type DashboardLocale,
} from "../i18n/resolve";

export type SignalType =
  | "risk"
  | "opportunity"
  | "turning_point"
  | "macro_pressure"
  | "valuation_watch"
  | "policy_watch";

export type ImpactLevel = "Low" | "Medium" | "High";

export type SignalRadarSignal = {
  id: string;
  signal_title: string;
  description: string;
  signal_type: SignalType;
  related_theme: string;
  impact_level: ImpactLevel;
  watch_points: string[];
};

const MOCK_SIGNAL_RADAR: Record<DashboardLocale, SignalRadarSignal[]> = {
  ko: [
    {
      id: "s1",
      signal_title: "AI 인프라 CAPEX 부담",
      description:
        "AI 데이터센터 투자가 계속 확대되면서 일부 기업의 현금흐름과 밸류에이션에 부담이 될 가능성이 있습니다. 시장은 아직 이를 성장 투자로 보고 있지만, 수익성 확인이 지연될 경우 비용 부담으로 재해석될 수 있습니다.",
      signal_type: "risk",
      related_theme: "AI 인프라",
      impact_level: "Medium",
      watch_points: ["CAPEX 가이던스", "전력 계약", "데이터센터 수익성"],
    },
    {
      id: "s2",
      signal_title: "유가 상승과 인플레이션 압력",
      description:
        "유가 상승이 지속될 경우 시장의 인플레이션 완화 기대가 다시 흔들릴 수 있습니다. 에너지 비용이 운송비와 생산비로 확산되면 금리 인하 기대에도 부담이 될 수 있습니다.",
      signal_type: "macro_pressure",
      related_theme: "에너지, 인플레이션",
      impact_level: "High",
      watch_points: [
        "WTI 가격",
        "중동 지정학 리스크",
        "인플레이션 지표",
        "장기금리",
      ],
    },
    {
      id: "s3",
      signal_title: "전력 인프라 기업으로 관심 이동",
      description:
        "AI 데이터센터 경쟁이 GPU 확보를 넘어 전력 확보 경쟁으로 이동하고 있습니다. 이 흐름이 이어질 경우 전력 장비, 냉각, 송배전 인프라 관련 기업들이 새로운 수혜군으로 부각될 수 있습니다.",
      signal_type: "opportunity",
      related_theme: "AI 인프라, 전력망",
      impact_level: "Medium",
      watch_points: [
        "전력 계약",
        "변압기 수요",
        "데이터센터 증설 계획",
        "전력 인프라 기업 실적",
      ],
    },
  ],
  en: [
    {
      id: "s1",
      signal_title: "AI infrastructure CAPEX strain",
      description:
        "Continued AI data-center spending may weigh on cash flow and valuations for some names. The market still treats it as growth investment, but delayed profitability could reframe it as cost pressure.",
      signal_type: "risk",
      related_theme: "AI Infrastructure",
      impact_level: "Medium",
      watch_points: ["CAPEX guidance", "Power contracts", "Data-center margins"],
    },
    {
      id: "s2",
      signal_title: "Oil rally and inflation pressure",
      description:
        "Sustained oil gains could shake disinflation expectations again. As energy costs feed into freight and production, they may also weigh on rate-cut hopes.",
      signal_type: "macro_pressure",
      related_theme: "Energy, Inflation",
      impact_level: "High",
      watch_points: [
        "WTI price",
        "Middle East geopolitics",
        "Inflation prints",
        "Long-term yields",
      ],
    },
    {
      id: "s3",
      signal_title: "Attention shifting to power infrastructure",
      description:
        "AI data-center competition is moving beyond GPU access toward securing power. If that persists, grid equipment, cooling, and transmission names may emerge as new beneficiaries.",
      signal_type: "opportunity",
      related_theme: "AI Infrastructure, Power Grid",
      impact_level: "Medium",
      watch_points: [
        "Power contracts",
        "Transformer demand",
        "Data-center build plans",
        "Power infrastructure earnings",
      ],
    },
  ],
  ja: [
    {
      id: "s1",
      signal_title: "AIインフラのCAPEX負担",
      description:
        "AIデータセンター投資の拡大が続くと、一部企業のキャッシュフローとバリュエーションに負担となる可能性があります。市場はまだ成長投資と見ていますが、収益性の確認が遅れるとコスト負担として再解釈される恐れがあります。",
      signal_type: "risk",
      related_theme: "AIインフラ",
      impact_level: "Medium",
      watch_points: [
        "CAPEXガイダンス",
        "電力契約",
        "データセンター収益性",
      ],
    },
    {
      id: "s2",
      signal_title: "原油高とインフレ圧力",
      description:
        "原油高が続けば、インフレ鎮静への期待が再び揺らぐ可能性があります。エネルギーコストが輸送費や生産費に波及すると、利下げ期待にも重しとなる恐れがあります。",
      signal_type: "macro_pressure",
      related_theme: "エネルギー、インフレ",
      impact_level: "High",
      watch_points: [
        "WTI価格",
        "中東地政学リスク",
        "インフレ指標",
        "長期金利",
      ],
    },
    {
      id: "s3",
      signal_title: "電力インフラ企業への関心シフト",
      description:
        "AIデータセンター競争はGPU確保から電力確保競争へ移行しています。この流れが続けば、電力機器・冷却・送配電インフラ関連企業が新たな受益者として浮上する可能性があります。",
      signal_type: "opportunity",
      related_theme: "AIインフラ、電力網",
      impact_level: "Medium",
      watch_points: [
        "電力契約",
        "変圧器需要",
        "データセンター増設計画",
        "電力インフラ企業の業績",
      ],
    },
  ],
};

export function pickSignalRadarMocks(
  locale?: string | null,
): SignalRadarSignal[] {
  return MOCK_SIGNAL_RADAR[resolveDashboardLocale(locale)];
}
