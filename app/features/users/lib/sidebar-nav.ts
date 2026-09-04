import type { LucideIcon } from "lucide-react";

export type SidebarNavSubItem = {
  title: string;
  url: string;
  soon?: boolean;
  /** Hide from non-admin users while experimental */
  adminOnly?: boolean;
};

export type SidebarNavItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  soon?: boolean;
  adminOnly?: boolean;
  items?: SidebarNavSubItem[];
};
