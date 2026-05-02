import type { Database } from "database.types";

export type ReportCategory = Database["public"]["Enums"]["category"];
export type ReportType = Database["public"]["Enums"]["report_type"];
export type ReportRegion = Database["public"]["Enums"]["region"];
export type ReportTier = Database["public"]["Enums"]["report_tier"];

export const REPORT_CATEGORIES: ReportCategory[] = [
  "foundation",
  "issue",
  "research",
  "market",
  "trend",
  "deep_dive",
  "column",
  "narrative_analysis",
  "review",
  "watchlist",
];

export const REPORT_CATEGORY_LABELS: Record<ReportCategory, string> = {
  foundation: "Foundation",
  issue: "Issue",
  research: "Research",
  market: "Market",
  trend: "Trend",
  deep_dive: "Deep Dive",
  column: "Column",
  narrative_analysis: "Narrative",
  review: "Review",
  watchlist: "Watchlist",
};

export const REPORT_CATEGORY_LABELS_KO: Record<ReportCategory, string> = {
  foundation: "기초",
  issue: "이슈",
  research: "리서치",
  market: "시장",
  trend: "트렌드",
  deep_dive: "심층 분석",
  column: "칼럼",
  narrative_analysis: "내러티브",
  review: "리뷰",
  watchlist: "워치리스트",
};

export const REPORT_TYPES: ReportType[] = [
  "digest-report",
  "full-report",
  "analysis-report",
  "thesis-report",
  "briefing-report",
  "baseline-report",
  "review",
  "other",
];

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  "digest-report": "Digest",
  "full-report": "Full Report",
  "analysis-report": "Analysis",
  "thesis-report": "Thesis",
  "briefing-report": "Briefing",
  "baseline-report": "Baseline",
  review: "Review",
  other: "Other",
};

export const REPORT_TYPE_LABELS_KO: Record<ReportType, string> = {
  "digest-report": "다이제스트",
  "full-report": "풀 리포트",
  "analysis-report": "분석",
  "thesis-report": "테제",
  "briefing-report": "브리핑",
  "baseline-report": "베이스라인",
  review: "리뷰",
  other: "기타",
};

/** Explore hub — 카드 본문 한 줄 코멘트 (제목에 「○○ 리포트」가 붙으므로 유형명 반복은 최소화) */
export const REPORT_TYPE_EXPLORE_INTRO_KO: Record<ReportType, string> = {
  "digest-report":
    "핵심만 압축해 한눈에 흐름을 잡기 좋습니다. 바쁜 날 먼저 훑기에 적합합니다.",
  "full-report":
    "맥락과 근거가 길게 이어지며, 천천히 읽으며 이해를 쌓기 좋습니다.",
  "analysis-report":
    "수치·논리로 이슈를 풀어 줍니다. 판단 근거를 다지고 싶을 때입니다.",
  "thesis-report":
    "하나의 명확한 주장과 방향을 정리하는 데 초점을 둔 포맷입니다.",
  "briefing-report":
    "짧은 분량으로 이슈 스냅샷만 필요할 때 읽기 좋습니다.",
  "baseline-report":
    "비교·추적의 기준점으로 삼거나, 전후 맥락을 맞출 때 쓰기 좋습니다.",
  review:
    "지나간 사건·성과를 되짚으며 교훈과 시사점을 남깁니다.",
  other:
    "위 분류에 딱 맞지 않거나, 여러 포맷이 섞인 성격에 가깝습니다.",
};

export const REPORT_REGIONS: ReportRegion[] = [
  "GLOBAL",
  "AMERICAS",
  "NORTH_AMERICA",
  "LATAM",
  "CENTRAL_AMERICA",
  "CARIBBEAN",
  "EMEA",
  "EUROPE",
  "WESTERN_EUROPE",
  "EASTERN_EUROPE",
  "CEE",
  "DACH",
  "BENELUX",
  "NORDICS",
  "UK_AND_IRELAND",
  "MIDDLE_EAST",
  "MENA",
  "GCC",
  "NORTH_AFRICA",
  "AFRICA",
  "SUB_SAHARAN_AFRICA",
  "APAC",
  "ASIA",
  "EAST_ASIA",
  "SEA",
  "SOUTH_ASIA",
  "CENTRAL_ASIA",
  "ANZ",
  "OCEANIA",
  "UNKNOWN",
];

export const REPORT_REGION_LABELS_KO: Partial<Record<ReportRegion, string>> = {
  GLOBAL: "글로벌",
  AMERICAS: "미주",
  NORTH_AMERICA: "북미",
  LATAM: "중남미",
  EUROPE: "유럽",
  EMEA: "EMEA",
  WESTERN_EUROPE: "서유럽",
  EASTERN_EUROPE: "동유럽",
  CEE: "중동부 유럽",
  DACH: "DACH",
  BENELUX: "베네룩스",
  NORDICS: "북유럽",
  UK_AND_IRELAND: "영국·아일랜드",
  MIDDLE_EAST: "중동",
  MENA: "MENA",
  GCC: "걸프",
  NORTH_AFRICA: "북아프리카",
  AFRICA: "아프리카",
  SUB_SAHARAN_AFRICA: "사하라 이남",
  APAC: "APAC",
  ASIA: "아시아",
  EAST_ASIA: "동아시아",
  SEA: "동남아",
  SOUTH_ASIA: "남아시아",
  CENTRAL_ASIA: "중앙아시아",
  ANZ: "호주·뉴질랜드",
  OCEANIA: "오세아니아",
  UNKNOWN: "미상",
};

export const REPORT_TIERS: ReportTier[] = ["free", "premium", "premium_plus"];

export const REPORT_TIER_LABELS_KO: Record<ReportTier, string> = {
  free: "무료",
  premium: "프리미엄",
  premium_plus: "프리미엄+",
};

export const REPORT_TIER_LABELS: Record<ReportTier, string> = {
  free: "Free",
  premium: "Premium",
  premium_plus: "Premium+",
};

export const PAGE_SIZE = 12;

export const SORT_OPTIONS = ["newest", "oldest"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];
