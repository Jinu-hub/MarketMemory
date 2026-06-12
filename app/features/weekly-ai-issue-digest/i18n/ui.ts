import { useTranslation } from "react-i18next";

import type { WeeklyAiIssueDigestTranslation } from "~/locales/weekly-ai-issue-digest/types";

import { WEEKLY_DIGEST_BY_LOCALE } from "./locales";
import { episodeCountLocaleTag, resolveWeeklyDigestLocale } from "./resolve";

export type WeeklyDigestUiMessages = WeeklyAiIssueDigestTranslation;

export function pickWeeklyDigestUi(
  locale?: string | null,
): WeeklyDigestUiMessages {
  const lang = resolveWeeklyDigestLocale(locale);
  return WEEKLY_DIGEST_BY_LOCALE[lang];
}

/** Resolved UI copy for the active i18next language. */
export function useWeeklyDigestUi(): WeeklyDigestUiMessages {
  const { i18n } = useTranslation();
  return pickWeeklyDigestUi(i18n.language);
}

/** Interpolate `{key}` placeholders in a UI string. */
export function formatWeeklyDigestCopy(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(values[key] ?? `{${key}}`),
  );
}

export function formatEpisodeCount(
  count: number,
  locale?: string | null,
): string {
  const ui = pickWeeklyDigestUi(locale);
  const formatted = count.toLocaleString(episodeCountLocaleTag(locale));
  return formatWeeklyDigestCopy(ui.list.episodeCount, { count: formatted });
}
