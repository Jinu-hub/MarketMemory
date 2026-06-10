import { useTranslation } from "react-i18next";

import { cn } from "~/core/lib/utils";

export function SidebarSoonBadge({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <span
      className={cn(
        "bg-muted text-muted-foreground shrink-0 rounded-full px-1.5 py-px text-[10px] font-medium tracking-wide uppercase",
        className,
      )}
      aria-hidden
    >
      {t("dashboardSidebar.soonBadge")}
    </span>
  );
}
