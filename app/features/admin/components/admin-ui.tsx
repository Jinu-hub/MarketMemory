import type { ComponentProps } from "react";

import { BotIcon, LayoutGridIcon } from "lucide-react";

import { NexBadge, NexCard } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

export function AdminPageHeader({
  title,
  description,
  eyebrow = "Admin",
}: {
  title: string;
  description?: string;
  eyebrow?: string;
}) {
  return (
    <header className="border-border/80 space-y-2 border-b pb-8">
      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
        {eyebrow}
      </p>
      <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-[2rem]">
        {title}
      </h1>
      {description ? (
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed md:text-[15px]">
          {description}
        </p>
      ) : null}
    </header>
  );
}

export function AdminSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="space-y-1.5">
        <h2 className="text-foreground text-lg font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function AdminPanel({
  children,
  className,
  padding = "md",
}: {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}) {
  return (
    <NexCard
      variant="elevated"
      padding={padding}
      className={cn(
        "border-border bg-card text-card-foreground border shadow-md",
        className,
      )}
    >
      {children}
    </NexCard>
  );
}

/** Table + horizontal scroll; semantic surface for data-heavy blocks */
export function AdminTableShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <NexCard
      variant="default"
      padding="none"
      hoverable={false}
      className={cn(
        "border-border bg-card text-card-foreground overflow-hidden border shadow-sm",
        className,
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </NexCard>
  );
}

export const adminSelectClassName = cn(
  "border-border bg-background text-foreground h-11 w-full rounded-lg border px-3 text-sm",
  "shadow-sm outline-none transition-[border-color,box-shadow]",
  "focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px]",
);

export const adminTextareaClassName = cn(
  "border-border bg-background text-foreground min-h-[120px] w-full rounded-lg border px-3 py-2.5 font-mono text-sm leading-relaxed",
  "shadow-sm outline-none transition-[border-color,box-shadow]",
  "focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px]",
);

export function AdminErrorAlert({ message }: { message: string }) {
  return (
    <div
      className="border-destructive/35 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm leading-snug"
      role="alert"
    >
      {message}
    </div>
  );
}

export function EnvironmentBadge({ env }: { env: string }) {
  const e = env.toLowerCase();
  let variant: ComponentProps<typeof NexBadge>["variant"] = "outline";
  if (e === "production" || e === "prod") {
    variant = "success";
  } else if (e === "staging" || e === "stage" || e === "stg") {
    variant = "warning";
  } else if (
    e === "dev" ||
    e === "development" ||
    e === "local" ||
    e === "preview"
  ) {
    variant = "info";
  }
  return (
    <NexBadge variant={variant} size="sm" className="font-mono">
      {env}
    </NexBadge>
  );
}

const pipelineStatusVariant: Record<
  string,
  ComponentProps<typeof NexBadge>["variant"]
> = {
  draft: "secondary",
  active: "success",
  deprecated: "warning",
};

export function PipelineStatusBadge({ status }: { status: string }) {
  return (
    <NexBadge variant={pipelineStatusVariant[status] ?? "default"} size="sm">
      {status}
    </NexBadge>
  );
}

const promptStatusVariant: Record<
  string,
  ComponentProps<typeof NexBadge>["variant"]
> = {
  draft: "secondary",
  active: "success",
  deprecated: "warning",
  archived: "outline",
};

export function PromptStatusBadge({ status }: { status: string }) {
  return (
    <NexBadge variant={promptStatusVariant[status] ?? "default"} size="sm">
      {status}
    </NexBadge>
  );
}

export function TargetTypeBadge({ type }: { type: string }) {
  const variant: ComponentProps<typeof NexBadge>["variant"] =
    type === "agent" ? "info" : type === "pipeline" ? "secondary" : "outline";
  return (
    <NexBadge variant={variant} size="sm" className="font-mono">
      {type}
    </NexBadge>
  );
}

export function AdminEmptyState({
  title,
  hint,
  icon = "grid",
}: {
  title: string;
  hint?: string;
  icon?: "grid" | "bot";
}) {
  const Icon = icon === "bot" ? BotIcon : LayoutGridIcon;
  return (
    <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-14 text-center">
      <Icon className="size-9 opacity-40" aria-hidden />
      <p className="text-foreground text-sm font-medium">{title}</p>
      {hint ? <p className="text-muted-foreground max-w-sm text-xs">{hint}</p> : null}
    </div>
  );
}

/** Apply to `TableHead` for admin data tables */
export const adminThClass = cn(
  "text-muted-foreground h-12 px-4 text-left text-xs font-semibold tracking-wider uppercase",
  "first:pl-5 last:pr-5",
);

/** Apply to `TableCell` for admin data tables */
export const adminTdClass = "px-4 py-3.5 text-sm first:pl-5 last:pr-5";
