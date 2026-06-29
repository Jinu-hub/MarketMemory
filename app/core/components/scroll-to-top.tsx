/**
 * ScrollToTop — a reusable, app-wide "back to top" affordance.
 *
 * Appears as a floating, fixed-position button once the user has scrolled
 * past a threshold, and smoothly returns the window to the top on click.
 * It is mounted once globally (see `app/root.tsx`), so every screen gets
 * the behaviour for free — particularly valuable on mobile where long
 * reading surfaces (reports, timelines, dashboard) make manual scroll-back
 * tedious.
 *
 * Design notes:
 *  - Uses semantic theme tokens (`bg-card`, `text-foreground`, `border-border`)
 *    so it reads well in light, dark, and warm themes.
 *  - Generous tap target (44px+) for mobile ergonomics.
 *  - Respects `prefers-reduced-motion` by skipping smooth scroll animation.
 *  - Fully keyboard accessible with an i18n `aria-label`.
 */
import { ArrowUpIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "~/core/lib/utils";

export type ScrollToTopProps = {
  /**
   * Scroll distance (in px) the user must pass before the button appears.
   * Defaults to 400px — roughly one viewport on most phones.
   */
  threshold?: number;
  /**
   * Optional scroll target. Defaults to `window`. Pass a ref to a scrollable
   * element when a screen uses an internal overflow container instead of the
   * document scroll.
   */
  scrollContainer?: React.RefObject<HTMLElement | null>;
  className?: string;
};

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

export function ScrollToTop({
  threshold = 400,
  scrollContainer,
  className,
}: ScrollToTopProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  const getScrollTop = useCallback(() => {
    const el = scrollContainer?.current;
    if (el) return el.scrollTop;
    return window.scrollY || document.documentElement.scrollTop;
  }, [scrollContainer]);

  useEffect(() => {
    const target: HTMLElement | Window = scrollContainer?.current ?? window;

    const onScroll = () => setVisible(getScrollTop() > threshold);

    // Sync initial state (e.g. when navigating to an already-scrolled page).
    onScroll();

    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [getScrollTop, scrollContainer, threshold]);

  const scrollToTop = useCallback(() => {
    const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";
    const el = scrollContainer?.current;
    if (el) {
      el.scrollTo({ top: 0, behavior });
    } else {
      window.scrollTo({ top: 0, behavior });
    }
  }, [scrollContainer]);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={t("common.actions.scrollToTop")}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6",
        "flex size-11 items-center justify-center rounded-full sm:size-12",
        "bg-card/90 text-foreground border-border border shadow-lg backdrop-blur",
        "transition-all duration-300 ease-out",
        "hover:bg-card hover:-translate-y-0.5 hover:shadow-xl",
        "focus-visible:ring-primary focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        "motion-safe:transition-all",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
        className,
      )}
    >
      <ArrowUpIcon className="size-5" />
    </button>
  );
}

export default ScrollToTop;
