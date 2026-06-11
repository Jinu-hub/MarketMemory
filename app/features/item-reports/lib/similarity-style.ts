import type { Database } from "database.types";

import { getSimilarityLabel as getSimilarityLabelI18n } from "../i18n/labels";

export type SimilarityLevel =
  Database["public"]["Enums"]["similarity_level"];

export function getSimilarityLabel(
  level: SimilarityLevel | null | undefined,
  locale?: string | null,
): string | null {
  return getSimilarityLabelI18n(level, locale);
}

/** Tailwind classes for related-report similarity NexBadge (light / dark / warm). */
export function getSimilarityToneClass(
  level: SimilarityLevel | null | undefined,
): string {
  if (level === "strong") {
    return "border-violet-500/60 bg-violet-500/15 text-violet-700 dark:text-violet-300";
  }
  if (level === "high") {
    return "border-blue-500/60 bg-blue-500/15 text-blue-700 dark:text-blue-300";
  }
  if (level === "medium") {
    return "border-emerald-500/60 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  }
  return "border-muted-foreground/35 bg-muted/55 text-muted-foreground";
}
