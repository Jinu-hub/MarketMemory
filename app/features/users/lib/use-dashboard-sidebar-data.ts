import {
  BookOpenIcon,
  BrainIcon,
  GalleryVerticalEndIcon,
  GlobeIcon,
  LayoutDashboardIcon,
  Newspaper,
  ShieldIcon,
} from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { SidebarNavItem } from "./sidebar-nav";

export function useDashboardSidebarData() {
  const { t } = useTranslation();

  return useMemo(() => {
    const teams = [
      {
        name: t("dashboardSidebar.teamSwitcher.defaultTeamName"),
        logo: GalleryVerticalEndIcon,
        plan: t("dashboardSidebar.teamSwitcher.basicPlan"),
      },
    ];

    const navMain: SidebarNavItem[] = [
      {
        title: t("dashboardSidebar.nav.dashboard.title"),
        url: "/dashboard",
        icon: LayoutDashboardIcon,
        items: [
          {
            title: t("dashboardSidebar.nav.dashboard.marketBriefing"),
            url: "/dashboard",
          },
          {
            title: t("dashboardSidebar.nav.dashboard.weeklyReport"),
            url: "/dashboard/weekly-report",
            soon: true,
          },
          {
            title: t("dashboardSidebar.nav.dashboard.monthlyReport"),
            url: "/dashboard/monthly-report",
            soon: true,
          },
        ],
      },
      {
        title: t("dashboardSidebar.nav.reports.title"),
        url: "/item_reports",
        icon: BookOpenIcon,
        items: [
          {
            title: t("dashboardSidebar.nav.reports.library"),
            url: "/item_reports",
          },
          {
            title: t("dashboardSidebar.nav.reports.explore"),
            url: "/item_reports/explore",
          },
          {
            title: t("dashboardSidebar.nav.reports.timeline"),
            url: "/item_reports/timeline",
          },
        ],
      },
      {
        title: t("dashboardSidebar.nav.insights.title"),
        url: "/insights",
        icon: BrainIcon,
        items: [
          {
            title: t("dashboardSidebar.nav.insights.marketMemory"),
            url: "/insights/market-memory",
            soon: true,
          },
          {
            title: t("dashboardSidebar.nav.insights.entityExplore"),
            url: "/insights/entity-explore",
            soon: true,
          },
        ],
      },
    ];

    const adminNav: SidebarNavItem = {
      title: t("dashboardSidebar.nav.admin.title"),
      url: "/admin",
      icon: ShieldIcon,
      items: [
        { title: t("dashboardSidebar.nav.admin.home"), url: "/admin" },
        {
          title: t("dashboardSidebar.nav.admin.pipelines"),
          url: "/admin/pipelines",
        },
        { title: t("dashboardSidebar.nav.admin.agents"), url: "/admin/agents" },
        {
          title: t("dashboardSidebar.nav.admin.prompts"),
          url: "/admin/prompts",
        },
        {
          title: t("dashboardSidebar.nav.admin.apiTests"),
          url: "/admin/api-tests",
        },
        {
          title: t("dashboardSidebar.nav.admin.similarityMeasurements"),
          url: "/admin/similarity-measurements",
        },
        {
          title: t("dashboardSidebar.nav.admin.i18nManagement"),
          url: "/admin/i18n-management",
        },
        {
          title: t("dashboardSidebar.nav.admin.userManagement"),
          url: "/admin/user-management",
        },
      ],
    };

    const series = [
      {
        name: t("dashboardSidebar.series.weeklyAiIssueDigest"),
        url: "/weekly-ai-issue-digest",
        icon: Newspaper,
      },
      {
        name: t("dashboardSidebar.series.weeklyMarketIssues"),
        url: "/weekly-market-issues",
        icon: GlobeIcon,
      },
    ];

    return { teams, navMain, adminNav, series };
  }, [t]);
}
