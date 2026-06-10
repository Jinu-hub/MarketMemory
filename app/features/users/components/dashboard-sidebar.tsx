import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/core/components/ui/sidebar";
import LangSwitcher from "~/core/components/lang-switcher";
import ThemeSwitcher from "~/core/components/theme-switcher";

import { useDashboardSidebarData } from "../lib/use-dashboard-sidebar-data";
import SidebarMain from "./sidebar-main";
import SidebarSeries from "./sidebar-series";
import TeamSwitcher from "./sidebar-team-switcher";
import SidebarUser from "./sidebar-user";

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
  const { teams, navMain, adminNav, series } = useDashboardSidebarData();
  const items = isAdmin ? [adminNav, ...navMain] : navMain;

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMain items={items} />
        <SidebarSeries series={series} />
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
