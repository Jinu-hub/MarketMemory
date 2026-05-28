import {
  BookOpenIcon,
  BrainIcon,
  GalleryVerticalEndIcon,
  LayoutDashboardIcon,
  MegaphoneIcon,
  Newspaper,
  ShieldIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/core/components/ui/sidebar";

import SidebarMain from "./sidebar-main";
import TeamSwitcher from "./sidebar-team-switcher";
import SidebarUser from "./sidebar-user";
import ThemeSwitcher from "~/core/components/theme-switcher";
import LangSwitcher from "~/core/components/lang-switcher";
import SidebarSeries from "./sidebar-series";

const data = {
  teams: [
    {
      name: "Default",
      logo: GalleryVerticalEndIcon,
      plan: "Basic mode",
    },
  ],
  navMain: [
    {
      title: "대시보드",
      url: "/dashboard",
      icon: LayoutDashboardIcon,
      items: [
        {
          title: "마켓 브리핑",
          url: "/dashboard",
        },
        {
          title: "마켓 현황",
          url: "/dashboard/market-snapshot",
          soon: true,
        },
      ],
    },
    {
      title: "리포트",
      url: "/item_reports",
      icon: BookOpenIcon,
      items: [
        {
          title: "리포트 라이브러리",
          url: "/item_reports",
        },
        {
          title: "탐색",
          url: "/item_reports/explore",
        },
        {
          title: "타임라인",
          url: "/item_reports/timeline",
        },
      ],
    },
    {
      title: "인사이트",
      url: "/insights",
      icon: BrainIcon,
      items: [
        {
          title: "마켓 메모리",
          url: "/insights/market-memory",
          soon: true,
        },
        {
          title: "엔티티 탐색",
          url: "/insights/entity-explore",
          soon: true,
        },
      ],
    },
  ],
  
  series: [
    {
      name: "주간 AI 이슈 다이제스트",
      url: "/weekly-ai-issue-digest",
      icon: Newspaper,
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
            { title: "API 테스트", url: "/admin/api-tests" },
            { title: "유사도 측정", url: "/admin/similarity-measurements" },
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
        <SidebarSeries series={data.series} />
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
