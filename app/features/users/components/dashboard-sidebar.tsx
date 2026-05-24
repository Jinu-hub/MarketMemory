import {
  BookOpenIcon,
  BriefcaseIcon,
  BuildingIcon,
  GalleryVerticalEndIcon,
  HeartHandshakeIcon,
  LayoutDashboardIcon,
  LineChartIcon,
  MegaphoneIcon,
  RocketIcon,
  Settings2Icon,
  ShieldIcon,
  Target,
  UsersIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/core/components/ui/sidebar";

import SidebarMain from "./sidebar-main";
import SidebarProjects from "./sidebar-projects";
import TeamSwitcher from "./sidebar-team-switcher";
import SidebarUser from "./sidebar-user";
import ThemeSwitcher from "~/core/components/theme-switcher";
import LangSwitcher from "~/core/components/lang-switcher";

const data = {
  teams: [
    {
      name: "Default",
      logo: GalleryVerticalEndIcon,
      plan: "Basic mode",
    },
    /*
    {
      name: "TechCo Solutions",
      logo: BriefcaseIcon,
      plan: "Startup",
    },
    {
      name: "GrowthMate",
      logo: RocketIcon,
      plan: "Free",
    },
    */
  ],
  navMain: [
    {
      title: "대시보드",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
      items: [
        {
          title: "최신 시장 브리핑",
          url: "/dashboard",
        },
        {
          title: "오늘의 시황",
          url: "/dashboard/today-snapshot",
          soon: true,
        },
      ],
    },
    {
      title: "리포트",
      url: "/item_reports",
      icon: BookOpenIcon,
      isActive: true,
      items: [
        {
          title: "전체 리포트",
          url: "/item_reports",
        },
        {
          title: "탐험",
          url: "/item_reports/explore",
        },
        {
          title: "연대기",
          url: "/item_reports/timeline",
        },
      ],
    },
    {
      title: "Customers",
      url: "#",
      icon: UsersIcon,
      items: [
        {
          title: "Contacts",
          url: "#",
        },
        {
          title: "Companies",
          url: "#",
        },
        {
          title: "Deals",
          url: "#",
        },
      ],
    },
    {
      title: "Sales",
      url: "#",
      icon: LineChartIcon,
      items: [
        {
          title: "Pipeline",
          url: "#",
        },
        {
          title: "Opportunities",
          url: "#",
        },
        {
          title: "Quotes",
          url: "#",
        },
        {
          title: "Invoices",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2Icon,
      items: [
        {
          title: "Workspace",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Integrations",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Sales Team",
      url: "#",
      icon: Target,
    },
    {
      name: "Customer Success",
      url: "#",
      icon: HeartHandshakeIcon,
    },
    {
      name: "Marketing",
      url: "#",
      icon: MegaphoneIcon,
    },
  ],
};

export default function DashboardSidebar({
  user,
  isAdmin = false,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string;
    email: string;
    avatarUrl: string;
  };
  isAdmin?: boolean;
}) {
  const navMain = isAdmin
    ? [
        {
          title: "Admin",
          url: "/admin",
          icon: ShieldIcon,
          items: [
            { title: "관리자 홈", url: "/admin" },
            { title: "파이프라인", url: "/admin/pipelines" },
            { title: "에이전트", url: "/admin/agents" },
            { title: "프롬프트", url: "/admin/prompts" },
          ],
        },
        ...data.navMain,
      ]
    : data.navMain;

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMain items={navMain} />
        <SidebarProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
      <div className="flex flex-col gap-3">
          <SidebarUser
            user={{
              name: user.name,
              email: user.email,
              avatarUrl: user.avatarUrl,
            }}
          />
          <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:hidden">
            <ThemeSwitcher />
            <LangSwitcher />
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
