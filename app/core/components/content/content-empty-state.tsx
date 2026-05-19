import { cn } from "~/core/lib/utils";

type ContentEmptyStateProps = {
  children: React.ReactNode;
  className?: string;
  /** `panel` — large dashed box; `inline` — compact dashed line for sub-sections */
  variant?: "panel" | "inline";
};

/**
 * Shared empty / placeholder surface for content-layer lists and blocks.
 */
export function ContentEmptyState({
  children,
  className,
  variant = "panel",
}: ContentEmptyStateProps) {
  return (
    <div
      className={cn(
        "border-border text-muted-foreground border border-dashed text-sm",
        variant === "panel"
          ? "rounded-xl p-8 text-center"
          : "rounded-lg px-3 py-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

