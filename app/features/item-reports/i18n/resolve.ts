import i18nConfig, { supportedLngs } from "~/i18n";

/**
 * Locale codes aligned with `app/i18n.ts` (`ko` | `en` | `ja`).
 * Copy source: app/locales (itemReports key).
 */
export type ItemReportsLocale = (typeof supportedLngs)[number];

const SUPPORTED = supportedLngs as readonly string[];

export function resolveItemReportsLocale(
  locale?: string | null,
): ItemReportsLocale {
  if (locale && SUPPORTED.includes(locale)) {
    return locale as ItemReportsLocale;
  }
  return i18nConfig.fallbackLng as ItemReportsLocale;
}

export function pickLocalized<
  T extends Record<ItemReportsLocale, Record<string, string>>,
>(table: T, locale: string | null | undefined, key: string): string {
  const lang = resolveItemReportsLocale(locale);
  const bucket = table[lang];
  return bucket[key] ?? bucket.unknown ?? key;
}

export function dateLocaleTag(locale?: string | null): string {
  const lang = resolveItemReportsLocale(locale);
  if (lang === "ja") return "ja-JP";
  if (lang === "en") return "en-US";
  return "ko-KR";
}
