import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Compass,
  Globe,
  HelpCircle,
  MapPinned,
} from "lucide-react";

/**
 * Explore «지역별» 카드 아이콘. 권역 코드 → 직관 아이콘 (색 외 보조 신호).
 * 매핑 없으면 MapPinned.
 */
const REGION_EXPLORE_ICON: Partial<Record<string, LucideIcon>> = {
  GLOBAL: Globe,
  UNKNOWN: HelpCircle,
  EMEA: Building2,
  EUROPE: Building2,
  WESTERN_EUROPE: Building2,
  EASTERN_EUROPE: Building2,
  UK_AND_IRELAND: Building2,
  NORDICS: Building2,
  DACH: Building2,
  BENELUX: Building2,
  CEE: Building2,
  APAC: Compass,
  ASIA: Compass,
  EAST_ASIA: Compass,
  SEA: Compass,
  SOUTH_ASIA: Compass,
  CENTRAL_ASIA: Compass,
  ANZ: Compass,
  OCEANIA: Compass,
  AMERICAS: MapPinned,
  NORTH_AMERICA: MapPinned,
  LATAM: MapPinned,
  CENTRAL_AMERICA: MapPinned,
  CARIBBEAN: MapPinned,
  MIDDLE_EAST: MapPinned,
  MENA: MapPinned,
  GCC: MapPinned,
  AFRICA: MapPinned,
  NORTH_AFRICA: MapPinned,
  SUB_SAHARAN_AFRICA: MapPinned,
};

export function getRegionExploreIcon(region: string): LucideIcon {
  return REGION_EXPLORE_ICON[region] ?? MapPinned;
}

/** 카드 제목 (한글 라벨과 enum 조합) */
export function getRegionCardTitle(
  region: string,
  labelKo: string,
): string {
  if (region === "GLOBAL") return "글로벌 전체";
  if (region === "UNKNOWN") return "미상 · 미분류";
  return `${labelKo} 권역`;
}

/** 짧은 한 줄 소개 (지도 없이 맥락만 잡는 용도) */
export function getRegionExploreIntro(region: string): string {
  if (region === "GLOBAL") {
    return "권역을 가로지르는 이슈·흐름을 한곳에 모아 봅니다.";
  }
  if (region === "UNKNOWN") {
    return "권역이 아직 좁혀지지 않은 리포트를 모아 봅니다.";
  }
  return "이 권역에 태그된 시장·이슈 리포트만 골라 봅니다.";
}
