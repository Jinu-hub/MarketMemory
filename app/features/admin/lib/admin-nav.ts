import type { LucideIcon } from "lucide-react";
import {
  ClipboardListIcon,
  GitBranchIcon,
  HomeIcon,
  PackageIcon,
  Share2Icon,
  SparklesIcon,
} from "lucide-react";

export type AdminNavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  /** React Router `NavLink` 용 — 대개 대시보드 루트만 true */
  end?: boolean;
  /** `/admin` 인덱스 카드에만 표시 (사이드바 전체 메뉴는 `ADMIN_NAV_ITEMS`) */
  dashboardDescription?: string;
  /** 카드 제목을 사이드바 라벨과 다르게 쓸 때 (미입력 시 `label`) */
  dashboardTitle?: string;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { to: "/admin", label: "개요", icon: HomeIcon, end: true },
  {
    to: "/admin/pipelines",
    label: "파이프라인",
    icon: GitBranchIcon,
    dashboardDescription: "정의와 실행 순서(단계)를 구성합니다.",
  },
  {
    to: "/admin/agents",
    label: "에이전트",
    icon: SparklesIcon,
    dashboardDescription: "에이전트 키와 표시 이름을 관리합니다.",
  },
  {
    to: "/admin/prompts",
    label: "프롬프트",
    icon: ClipboardListIcon,
    dashboardDescription: "템플릿 버전과 본문을 다룹니다.",
  },
  {
    to: "/admin/prompt-releases",
    label: "프롬프트 릴리스",
    icon: PackageIcon,
    dashboardDescription: "환경별 활성 프롬프트를 고정합니다.",
  },
  {
    to: "/admin/item-similarities",
    label: "유사도",
    icon: Share2Icon,
    dashboardTitle: "리포트 유사도",
    dashboardDescription: "item_contents 기준 유사도 엣지를 보고 재생성합니다.",
  },
];

export const ADMIN_DASHBOARD_CARDS = ADMIN_NAV_ITEMS.filter(
  (item): item is AdminNavItem & { dashboardDescription: string } =>
    Boolean(item.dashboardDescription),
);
