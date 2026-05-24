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
  soon?: boolean;
  items?: SidebarNavSubItem[];
};
