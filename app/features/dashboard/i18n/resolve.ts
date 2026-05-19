import i18nConfig, { supportedLngs } from "~/i18n";

/**
 * Locale codes aligned with `app/i18n.ts` (`ko` | `en` | `ja`).
 * Dashboard copy lives here until migrated to `app/locales/*`.
 */
export type DashboardLocale = (typeof supportedLngs)[number];

const SUPPORTED = supportedLngs as readonly string[];

export function resolveDashboardLocale(
  locale?: string | null,
): DashboardLocale {
  if (locale && SUPPORTED.includes(locale)) {
    return locale as DashboardLocale;
  }
  return i18nConfig.fallbackLng as DashboardLocale;
}

/**
 * Look up a string from a per-locale table produced by the pipeline / semantic keys.
 * Falls back to `unknown` within the locale bucket, then to empty string.
 */
export function pickLocalized<
  T extends Record<DashboardLocale, Record<string, string>>,
>(table: T, locale: string | null | undefined, key: string): string {
  const lang = resolveDashboardLocale(locale);
  const bucket = table[lang];
  return bucket[key] ?? bucket.unknown ?? "";
}
