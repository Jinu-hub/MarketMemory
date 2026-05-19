import { cn } from "~/core/lib/utils";

import { ContentEmptyState } from "~/core/components/content/content-empty-state";

export function ReadingProse({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-foreground max-w-prose whitespace-pre-line",
        "text-sm leading-6 sm:text-[15px] sm:leading-7",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function ReadingEmpty({ children }: { children: React.ReactNode }) {
  return <ContentEmptyState variant="inline">{children}</ContentEmptyState>;
}
