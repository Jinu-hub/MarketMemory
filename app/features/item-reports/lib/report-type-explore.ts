import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ClipboardList,
  Layers,
  LayoutGrid,
  Lightbulb,
  LineChart,
  Megaphone,
  Newspaper,
} from "lucide-react";

import type { ReportType } from "../constants";

/**
 * Explore «리포트 유형별» 카드에 쓰는 유형별 아이콘 (색만으로 구분하지 않도록 보조 신호).
 */
export const REPORT_TYPE_EXPLORE_ICON: Record<ReportType, LucideIcon> = {
  "digest-report": Newspaper,
  "full-report": BookOpen,
  "analysis-report": LineChart,
  "thesis-report": Lightbulb,
  "briefing-report": Megaphone,
  "baseline-report": Layers,
  review: ClipboardList,
  other: LayoutGrid,
};

export function getReportTypeExploreIcon(type: string): LucideIcon {
  const Icon = REPORT_TYPE_EXPLORE_ICON[type as ReportType];
  return Icon ?? LayoutGrid;
}
