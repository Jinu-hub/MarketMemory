import type { LucideIcon } from "lucide-react";
import { NavLink, useLocation } from "react-router";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/core/components/ui/sidebar";

import { isSidebarNavSubItemActive } from "../lib/sidebar-nav-active";

export default function SidebarSeries({
  series,
}: {
  series: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  const { pathname } = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Series</SidebarGroupLabel>
      <SidebarMenu>
        {series.map((item) => {
          const isActive = isSidebarNavSubItemActive(pathname, item.url);
          const Icon = item.icon;

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={isActive} tooltip={item.name}>
                <NavLink to={item.url}>
                  <Icon />
                  <span>{item.name}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
