import { useTranslation } from "react-i18next";

import { ITEM_REPORTS_MESSAGES, type ItemReportsUiMessages } from "./messages";
import { resolveItemReportsLocale } from "./resolve";

export function pickItemReportsUi(
  locale?: string | null,
): ItemReportsUiMessages {
  const lang = resolveItemReportsLocale(locale);
  return ITEM_REPORTS_MESSAGES.ui[lang];
}

/** Resolved UI copy for the active i18next language. */
export function useItemReportsUi(): ItemReportsUiMessages {
  const { i18n } = useTranslation();
  return pickItemReportsUi(i18n.language);
}

/** Active locale code (`ko` | `en` | `ja`) for semantic label helpers. */
export function useItemReportsLocale() {
  const { i18n } = useTranslation();
  return resolveItemReportsLocale(i18n.language);
}

/** Interpolate `{key}` placeholders in a UI string. */
export function formatItemReportsCopy(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(values[key] ?? `{${key}}`),
  );
}

export function formatCount(
  count: number,
  locale?: string | null,
): string {
  const ui = pickItemReportsUi(locale);
  const formatted = count.toLocaleString(
    locale === "en" ? "en-US" : locale === "ja" ? "ja-JP" : "ko-KR",
  );
  const suffix = ui.common.countSuffix;
  return suffix ? `${formatted}${suffix}` : formatted;
}
