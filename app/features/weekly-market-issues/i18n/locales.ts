/**
 * Locale tables from `app/locales/*` — single source of truth for series copy.
 */
import en from "~/locales/en";
import ja from "~/locales/ja";
import ko from "~/locales/ko";

import type { WeeklyMarketIssuesLocale } from "./resolve";

export const WEEKLY_MARKET_ISSUES_BY_LOCALE = {
  ko: ko.weeklyMarketIssues,
  en: en.weeklyMarketIssues,
  ja: ja.weeklyMarketIssues,
} as const satisfies Record<
  WeeklyMarketIssuesLocale,
  (typeof ko)["weeklyMarketIssues"]
>;
