import { Link } from "react-router";

import {
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/core/components/ui/sidebar";

import type { SidebarNavSubItem } from "../lib/sidebar-nav";
import { SidebarSoonBadge } from "./sidebar-soon-badge";

export function SidebarMenuSubEntry({ title, url, soon }: SidebarNavSubItem) {
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
      <SidebarMenuSubButton asChild>
        <Link to={url}>
          <span>{title}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}
