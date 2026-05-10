import type { LucideIcon } from "lucide-react";
import { ArrowLeftIcon } from "lucide-react";
import { Link } from "react-router";

import { cn } from "~/core/lib/utils";

type ItemReportsNavLinkProps = {
  to: string;
  children: React.ReactNode;
  className?: string;
  icon?: LucideIcon;
};

/**
 * Shared “back to library / hub” affordance for item-reports routes.
 */
export function ItemReportsNavLink({
  to,
  children,
  className,
  icon: Icon = ArrowLeftIcon,
}: ItemReportsNavLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors",
        className,
      )}
    >
      <Icon className="size-4" />
      {children}
    </Link>
  );
}
