import type { DailyMemoryTheme, RiskSignal } from "../types";

/** Pipeline may emit `theme_title` or `title` on theme objects. */
export function resolveThemeTitle(
  theme: DailyMemoryTheme,
  index: number,
): string {
  return theme.theme_title ?? theme.title ?? `Theme ${index + 1}`;
}

export function resolveThemeKey(theme: DailyMemoryTheme, index: number): string {
  return theme.theme_title ?? theme.title ?? `theme-${index}`;
}

export function resolveRelatedCount(
  related: DailyMemoryTheme["related_reports"],
): number | null {
  if (typeof related === "number" && Number.isFinite(related)) {
    return related;
  }
  if (Array.isArray(related)) return related.length;
  return null;
}

/** Pipeline may emit `title` or `label` on risk signal objects. */
export function resolveRiskSignalTitle(signal: RiskSignal): string | null {
  const title = signal.title ?? signal.label ?? null;
  if (!title || typeof title !== "string") return null;
  return title;
}
