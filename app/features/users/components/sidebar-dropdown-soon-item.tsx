import { DropdownMenuItem } from "~/core/components/ui/dropdown-menu";
import { cn } from "~/core/lib/utils";

import { SidebarSoonBadge } from "./sidebar-soon-badge";

export function SidebarDropdownSoonItem({
  children,
  leading,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuItem> & {
  leading?: React.ReactNode;
}) {
  return (
    <DropdownMenuItem
      className={cn(
        "cursor-default gap-2 p-2 opacity-100 focus:bg-transparent data-[highlighted]:bg-transparent",
        className,
      )}
      onSelect={(event) => event.preventDefault()}
      {...props}
    >
      {leading}
      <span className="text-muted-foreground min-w-0 flex-1 font-medium">
        {children}
      </span>
      <SidebarSoonBadge />
    </DropdownMenuItem>
  );
}
