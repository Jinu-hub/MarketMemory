import { HashIcon } from "lucide-react";

import { cn } from "~/core/lib/utils";

type ContentTagListProps = {
  tags: string[];
  max?: number;
  className?: string;
  /** `muted` — on cards; `plain` — on tinted risk card footers */
  variant?: "muted" | "plain";
};

/**
 * Compact hashtag chips used across dashboard and report surfaces.
 */
export function ContentTagList({
  tags,
  max = 6,
  className,
  variant = "muted",
}: ContentTagListProps) {
  const visible = tags.slice(0, max);
  if (visible.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {visible.map((tag) => (
        <span
          key={tag}
          className={cn(
            "text-muted-foreground inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-[11px]",
            variant === "muted" ? "bg-muted/60" : "bg-background",
          )}
        >
          <HashIcon className="size-2.5" aria-hidden />
          {tag}
        </span>
      ))}
    </div>
  );
}
