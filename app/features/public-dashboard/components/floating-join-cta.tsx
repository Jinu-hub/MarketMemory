/**
 * FloatingJoinCta — fixed bottom-right signup affordance for the public dashboard.
 *
 * Always visible. Shares the bottom-right corner with ScrollToTop: this CTA
 * sits at the edge (best thumb reach), and mounts a CSS custom property that
 * lifts ScrollToTop above it so the two stack vertically without overlapping.
 */
import { UserPlusIcon } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { cn } from "~/core/lib/utils";

/** Clears space above this CTA for the global ScrollToTop control. */
const SCROLL_TO_TOP_OFFSET = "5.5rem";

export type FloatingJoinCtaProps = {
  className?: string;
};

export function FloatingJoinCta({ className }: FloatingJoinCtaProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--mm-scroll-to-top-offset", SCROLL_TO_TOP_OFFSET);
    return () => {
      root.style.removeProperty("--mm-scroll-to-top-offset");
    };
  }, []);

  return (
    <Link
      to="/join"
      viewTransition
      aria-label={t("publicDashboard.floatingJoinCta")}
      className={cn(
        "fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6",
        "inline-flex h-11 items-center gap-2 rounded-full px-4 sm:h-12 sm:px-5",
        "bg-primary text-primary-foreground shadow-lg",
        "text-sm font-medium",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-xl",
        "focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      <UserPlusIcon className="size-4 shrink-0" aria-hidden />
      <span>{t("publicDashboard.floatingJoinCta")}</span>
    </Link>
  );
}
