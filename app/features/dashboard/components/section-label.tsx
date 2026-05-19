import { cn } from "~/core/lib/utils";

type SectionLabelProps = {
  id?: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint?: string;
  trailing?: React.ReactNode;
  className?: string;
};

export function SectionLabel({
  id,
  icon: Icon,
  label,
  hint,
  trailing,
  className,
}: SectionLabelProps) {
  return (
    <div className={cn("space-y-0.5", className)}>
      <div className="flex items-center justify-between gap-3">
        <h3
          id={id}
          className="text-foreground inline-flex min-w-0 items-center gap-1.5 text-sm font-semibold tracking-tight"
        >
          <Icon className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
          {label}
        </h3>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
      {hint ? (
        <p className="text-muted-foreground text-xs">{hint}</p>
      ) : null}
    </div>
  );
}
