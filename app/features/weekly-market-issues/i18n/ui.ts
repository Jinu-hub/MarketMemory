import { useTranslation } from "react-i18next";

import type { WeeklyMarketIssuesTranslation } from "~/locales/weekly-market-issues/types";

import { WEEKLY_MARKET_ISSUES_BY_LOCALE } from "./locales";
import {
  episodeCountLocaleTag,
  resolveWeeklyMarketIssuesLocale,
} from "./resolve";

export type WeeklyMarketIssuesUiMessages = WeeklyMarketIssuesTranslation;

export function pickWeeklyMarketIssuesUi(
  locale?: string | null,
): WeeklyMarketIssuesUiMessages {
  const lang = resolveWeeklyMarketIssuesLocale(locale);
  return WEEKLY_MARKET_ISSUES_BY_LOCALE[lang];
}

/** Resolved UI copy for the active i18next language. */
export function useWeeklyMarketIssuesUi(): WeeklyMarketIssuesUiMessages {
  const { i18n } = useTranslation();
  return pickWeeklyMarketIssuesUi(i18n.language);
}

/** Interpolate `{key}` placeholders in a UI string. */
export function formatWeeklyMarketIssuesCopy(
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
  const ui = pickWeeklyMarketIssuesUi(locale);
  const formatted = count.toLocaleString(episodeCountLocaleTag(locale));
  return formatWeeklyMarketIssuesCopy(ui.list.episodeCount, {
    count: formatted,
  });
}
