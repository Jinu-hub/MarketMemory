import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Compass,
  Globe,
  HelpCircle,
  MapPinned,
} from "lucide-react";

import {
  getRegionCardTitle as getRegionCardTitleI18n,
  getRegionExploreIntro as getRegionExploreIntroI18n,
} from "../i18n/labels";

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

export function getRegionCardTitle(
  region: string,
  label: string,
  locale?: string | null,
): string {
  return getRegionCardTitleI18n(region, label, locale);
}

export function getRegionExploreIntro(
  region: string,
  locale?: string | null,
): string {
  return getRegionExploreIntroI18n(region, locale);
}
