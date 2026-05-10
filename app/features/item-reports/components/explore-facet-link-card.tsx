import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router";

import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

type ExploreFacetLinkCardProps = {
  to: string;
  ariaLabel: string;
  icon: React.ReactNode;
  title: React.ReactNode;
  count: number;
  description: string;
  /** Tag cards use a slightly different title row (break-all, line-clamp). */
  variant?: "default" | "tag";
};

const cardClassName = cn(
  "group bg-card border-border hover:border-primary/40 flex h-full min-h-[9rem] flex-col gap-3 rounded-xl border p-4 shadow-xs transition-all",
  "hover:-translate-y-0.5 hover:shadow-md",
);

/**
 * Explore hub — large navigational card linking to a filtered list view.
 */
export function ExploreFacetLinkCard({
  to,
  ariaLabel,
  icon,
  title,
  count,
  description,
  variant = "default",
}: ExploreFacetLinkCardProps) {
  const isTag = variant === "tag";

  return (
    <Link
      to={to}
      viewTransition
      aria-label={ariaLabel}
      className={cardClassName}
    >
      <div className="flex items-start justify-between gap-2">
        <div
          className={cn(
            "flex min-w-0 gap-2.5",
            isTag ? "flex-1 items-start" : "items-center",
          )}
        >
          <span className="bg-muted text-muted-foreground group-hover:text-primary/90 flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors">
            {icon}
          </span>
          <span
            className={cn(
              "text-foreground min-w-0 text-base font-semibold leading-snug tracking-tight",
              isTag && "line-clamp-2 break-all",
            )}
          >
            {title}
          </span>
        </div>
        <NexBadge variant="outline" size="sm" className="shrink-0">
          {count}건
        </NexBadge>
      </div>
      <p className="text-muted-foreground flex-1 text-xs leading-relaxed">
        {description}
      </p>
      <span className="text-primary inline-flex items-center gap-1 text-xs font-medium">
        목록 열기
        <ArrowRightIcon
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}
