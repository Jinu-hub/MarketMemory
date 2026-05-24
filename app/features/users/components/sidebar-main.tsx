import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/core/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "~/core/components/ui/sidebar";

import type { SidebarNavItem } from "../lib/sidebar-nav";
import { isSidebarNavGroupActive } from "../lib/sidebar-nav-active";
import { SidebarMenuSubEntry } from "./sidebar-menu-sub-entry";

function SidebarNavGroup({ item }: { item: SidebarNavItem }) {
  const { pathname } = useLocation();
  const hasActiveChild = isSidebarNavGroupActive(pathname, item.items);
  const [open, setOpen] = useState(hasActiveChild);

  useEffect(() => {
    if (hasActiveChild) {
      setOpen(true);
    }
  }, [hasActiveChild]);

  return (
    <Collapsible
      asChild
      open={open}
      onOpenChange={setOpen}
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => (
              <SidebarMenuSubEntry key={subItem.title} {...subItem} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export default function SidebarMain({ items }: { items: SidebarNavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarNavGroup key={item.title} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
