import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/core/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/core/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  useSidebar,
} from "~/core/components/ui/sidebar";
import { cn } from "~/core/lib/utils";

import type { SidebarNavItem, SidebarNavSubItem } from "../lib/sidebar-nav";
import {
  isSidebarNavGroupActive,
  isSidebarNavSubItemActive,
} from "../lib/sidebar-nav-active";
import { SidebarDropdownSoonItem } from "./sidebar-dropdown-soon-item";
import { SidebarMenuSubEntry } from "./sidebar-menu-sub-entry";

function SidebarNavDropdownSubEntry({ title, url, soon }: SidebarNavSubItem) {
  const { pathname } = useLocation();
  const isActive = !soon && isSidebarNavSubItemActive(pathname, url);

  if (soon) {
    return <SidebarDropdownSoonItem>{title}</SidebarDropdownSoonItem>;
  }

  return (
    <DropdownMenuItem asChild className={cn(isActive && "bg-accent")}>
      <NavLink to={url}>{title}</NavLink>
    </DropdownMenuItem>
  );
}

function SidebarNavGroupCollapsed({ item }: { item: SidebarNavItem }) {
  const { pathname } = useLocation();
  const { isMobile } = useSidebar();
  const hasActiveChild = isSidebarNavGroupActive(pathname, item.items);
  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton isActive={hasActiveChild}>
            {Icon && <Icon />}
            <span>{item.title}</span>
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="min-w-48 rounded-lg"
          side={isMobile ? "bottom" : "right"}
          align="start"
          sideOffset={4}
        >
          <DropdownMenuLabel className="text-muted-foreground text-xs">
            {item.title}
          </DropdownMenuLabel>
          {item.items?.map((subItem) => (
            <SidebarNavDropdownSubEntry key={subItem.title} {...subItem} />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
}

function SidebarNavGroupExpanded({ item }: { item: SidebarNavItem }) {
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
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) =>
          isCollapsed ? (
            <SidebarNavGroupCollapsed key={item.title} item={item} />
          ) : (
            <SidebarNavGroupExpanded key={item.title} item={item} />
          ),
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}
