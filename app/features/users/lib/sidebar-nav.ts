import type { LucideIcon } from "lucide-react";

export type SidebarNavSubItem = {
  title: string;
  url: string;
  soon?: boolean;
};

export type SidebarNavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  soon?: boolean;
  items?: SidebarNavSubItem[];
};
