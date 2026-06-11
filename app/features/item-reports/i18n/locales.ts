/**
 * Locale tables from `app/locales/*` — single source of truth for item-reports copy.
 */
import en from "~/locales/en";
import ja from "~/locales/ja";
import ko from "~/locales/ko";

import type { ItemReportsLocale } from "./resolve";

export const ITEM_REPORTS_BY_LOCALE = {
  ko: ko.itemReports,
  en: en.itemReports,
  ja: ja.itemReports,
} as const satisfies Record<ItemReportsLocale, (typeof ko)["itemReports"]>;
