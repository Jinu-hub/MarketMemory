/**
 * Locale tables from `app/locales/*` — single source of truth for digest copy.
 */
import en from "~/locales/en";
import ja from "~/locales/ja";
import ko from "~/locales/ko";

import type { WeeklyDigestLocale } from "./resolve";

export const WEEKLY_DIGEST_BY_LOCALE = {
  ko: ko.weeklyAiIssueDigest,
  en: en.weeklyAiIssueDigest,
  ja: ja.weeklyAiIssueDigest,
} as const satisfies Record<
  WeeklyDigestLocale,
  (typeof ko)["weeklyAiIssueDigest"]
>;
