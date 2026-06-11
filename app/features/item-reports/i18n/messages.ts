/**
 * @deprecated Import from `~/locales/*` or use `pickItemReportsUi` / label helpers.
 * Re-exports locale-backed tables for legacy imports (`constants.ts`, etc.).
 */
import type { ItemReportsUiMessages } from "~/locales/item-reports/types";

import { ITEM_REPORTS_BY_LOCALE } from "./locales";
import type { ItemReportsLocale } from "./resolve";

export type { ItemReportsUiMessages };

function uiForLocale(lang: ItemReportsLocale): ItemReportsUiMessages {
  const { semantic: _, ...ui } = ITEM_REPORTS_BY_LOCALE[lang];
  return ui;
}

export const ITEM_REPORTS_MESSAGES = {
  semantic: {
    category: {
      ko: ITEM_REPORTS_BY_LOCALE.ko.semantic.category,
      en: ITEM_REPORTS_BY_LOCALE.en.semantic.category,
      ja: ITEM_REPORTS_BY_LOCALE.ja.semantic.category,
    },
    reportType: {
      ko: ITEM_REPORTS_BY_LOCALE.ko.semantic.reportType,
      en: ITEM_REPORTS_BY_LOCALE.en.semantic.reportType,
      ja: ITEM_REPORTS_BY_LOCALE.ja.semantic.reportType,
    },
    reportTier: {
      ko: ITEM_REPORTS_BY_LOCALE.ko.semantic.reportTier,
      en: ITEM_REPORTS_BY_LOCALE.en.semantic.reportTier,
      ja: ITEM_REPORTS_BY_LOCALE.ja.semantic.reportTier,
    },
    region: {
      ko: ITEM_REPORTS_BY_LOCALE.ko.semantic.region,
      en: ITEM_REPORTS_BY_LOCALE.en.semantic.region,
      ja: ITEM_REPORTS_BY_LOCALE.ja.semantic.region,
    },
    reportTypeExploreIntro: {
      ko: ITEM_REPORTS_BY_LOCALE.ko.semantic.reportTypeExploreIntro,
      en: ITEM_REPORTS_BY_LOCALE.en.semantic.reportTypeExploreIntro,
      ja: ITEM_REPORTS_BY_LOCALE.ja.semantic.reportTypeExploreIntro,
    },
    similarity: {
      ko: ITEM_REPORTS_BY_LOCALE.ko.semantic.similarity,
      en: ITEM_REPORTS_BY_LOCALE.en.semantic.similarity,
      ja: ITEM_REPORTS_BY_LOCALE.ja.semantic.similarity,
    },
    entityGroup: {
      ko: ITEM_REPORTS_BY_LOCALE.ko.semantic.entityGroup,
      en: ITEM_REPORTS_BY_LOCALE.en.semantic.entityGroup,
      ja: ITEM_REPORTS_BY_LOCALE.ja.semantic.entityGroup,
    },
  },
  ui: {
    ko: uiForLocale("ko"),
    en: uiForLocale("en"),
    ja: uiForLocale("ja"),
  },
} as const;
