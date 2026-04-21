import type { Database } from "database.types";

export type ReportCategory = Database["public"]["Enums"]["category"];
export type ReportType = Database["public"]["Enums"]["report_type"];
export type ReportRegion = Database["public"]["Enums"]["region"];

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

export const PAGE_SIZE = 12;

export const SORT_OPTIONS = ["newest", "oldest"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];
