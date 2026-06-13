import i18nConfig, { supportedLngs } from "~/i18n";

/**
 * Locale codes aligned with `app/i18n.ts` (`ko` | `en` | `ja`).
 * Copy source: app/locales (weeklyMarketIssues key).
 */
export type WeeklyMarketIssuesLocale = (typeof supportedLngs)[number];

const SUPPORTED = supportedLngs as readonly string[];

export function resolveWeeklyMarketIssuesLocale(
  locale?: string | null,
): WeeklyMarketIssuesLocale {
  if (locale && SUPPORTED.includes(locale)) {
    return locale as WeeklyMarketIssuesLocale;
  }
  return i18nConfig.fallbackLng as WeeklyMarketIssuesLocale;
}

export function episodeCountLocaleTag(locale?: string | null): string {
  const lang = resolveWeeklyMarketIssuesLocale(locale);
  if (lang === "ja") return "ja-JP";
  if (lang === "en") return "en-US";
  return "ko-KR";
}
