import type { LucideIcon } from "lucide-react";

/**
 * Shared types for semantic accent styling (category, mood, trend, risk, tier).
 * Feature modules keep domain keys and label maps; visuals reuse these shapes.
 */
export type NexBadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "secondary"
  | "outline";

export type SemanticAccentVisual = {
  accentBorder: string;
  accentBg: string;
  accentText: string;
  badgeVariant: NexBadgeVariant;
  icon: LucideIcon;
};

export type SemanticAccentStyle = SemanticAccentVisual & {
  label: string;
};

/** Reusable Tailwind accent presets for directional semantics. */
export const SEMANTIC_ACCENTS = {
  positive: {
    accentBorder: "border-l-emerald-500 dark:border-l-emerald-400",
    accentBg: "bg-emerald-500/5 dark:bg-emerald-400/5",
    accentText: "text-emerald-600 dark:text-emerald-400",
    badgeVariant: "success" as const,
  },
  negative: {
    accentBorder: "border-l-rose-500 dark:border-l-rose-400",
    accentBg: "bg-rose-500/5 dark:bg-rose-400/5",
    accentText: "text-rose-600 dark:text-rose-400",
    badgeVariant: "error" as const,
  },
  caution: {
    accentBorder: "border-l-amber-500 dark:border-l-amber-400",
    accentBg: "bg-amber-500/5 dark:bg-amber-400/5",
    accentText: "text-amber-600 dark:text-amber-400",
    badgeVariant: "warning" as const,
  },
  info: {
    accentBorder: "border-l-sky-500 dark:border-l-sky-400",
    accentBg: "bg-sky-500/5 dark:bg-sky-400/5",
    accentText: "text-sky-600 dark:text-sky-400",
    badgeVariant: "info" as const,
  },
  recall: {
    accentBorder: "border-l-violet-500 dark:border-l-violet-400",
    accentBg: "bg-violet-500/5 dark:bg-violet-400/5",
    accentText: "text-violet-600 dark:text-violet-400",
    badgeVariant: "secondary" as const,
  },
  muted: {
    accentBorder: "border-l-border",
    accentBg: "bg-muted/40",
    accentText: "text-muted-foreground",
    badgeVariant: "outline" as const,
  },
} satisfies Record<string, Omit<SemanticAccentVisual, "icon">>;
