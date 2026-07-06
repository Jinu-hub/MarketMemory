import type { LucideIcon } from "lucide-react";
import {
  ActivityIcon,
  ClipboardListIcon,
  GitBranchIcon,
  HomeIcon,
  LanguagesIcon,
  PackageIcon,
  Share2Icon,
  SparklesIcon,
  UsersIcon,
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
    to: "/admin/api-tests",
    label: "API 테스트",
    icon: ActivityIcon,
    dashboardTitle: "API 테스트",
    dashboardDescription:
      "외부 연동 API를 수동 검증합니다. 현재는 마켓 스냅샷 테스트를 제공합니다.",
  },
  {
    to: "/admin/similarity-measurements",
    label: "유사도 측정",
    icon: Share2Icon,
    dashboardTitle: "유사도 측정",
    dashboardDescription:
      "콘텐츠·엔티티 간 유사도를 계산·검증합니다. 리포트·일별 마켓 메모리 유사도를 제공합니다.",
  },
  {
    to: "/admin/i18n-management",
    label: "다언어 관리",
    icon: LanguagesIcon,
    dashboardTitle: "다언어 관리",
    dashboardDescription:
      "콘텐츠·리포트의 다언어 번역 결과를 검토·관리합니다. item_content 리포트 번역을 제공합니다.",
  },
  {
    to: "/admin/user-management",
    label: "유저 관리",
    icon: UsersIcon,
    dashboardTitle: "유저 관리",
    dashboardDescription:
      "가입 유저의 프로필·권한·계정 정보를 검토·관리합니다. 유저 리스트 조회를 제공합니다.",
  },
];

export const ADMIN_DASHBOARD_CARDS = ADMIN_NAV_ITEMS.filter(
  (item): item is AdminNavItem & { dashboardDescription: string } =>
    Boolean(item.dashboardDescription),
);
