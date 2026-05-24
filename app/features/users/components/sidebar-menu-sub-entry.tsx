import { NavLink, useLocation } from "react-router";

import {
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/core/components/ui/sidebar";

import type { SidebarNavSubItem } from "../lib/sidebar-nav";
import { isSidebarNavSubItemActive } from "../lib/sidebar-nav-active";
import { SidebarSoonBadge } from "./sidebar-soon-badge";

export function SidebarMenuSubEntry({ title, url, soon }: SidebarNavSubItem) {
  const { pathname } = useLocation();
  const isActive = !soon && isSidebarNavSubItemActive(pathname, url);

  if (soon) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton
          className="pointer-events-none cursor-default justify-between"
          aria-disabled="true"
        >
          <span className="text-muted-foreground">{title}</span>
          <SidebarSoonBadge />
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={isActive}>
        <NavLink to={url}>
          <span>{title}</span>
        </NavLink>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}
