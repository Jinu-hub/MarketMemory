import i18nConfig, { supportedLngs } from "~/i18n";

/**
 * Locale codes aligned with `app/i18n.ts` (`ko` | `en` | `ja`).
 * Copy source: app/locales (weeklyAiIssueDigest key).
 */
export type WeeklyDigestLocale = (typeof supportedLngs)[number];

const SUPPORTED = supportedLngs as readonly string[];

export function resolveWeeklyDigestLocale(
  locale?: string | null,
): WeeklyDigestLocale {
  if (locale && SUPPORTED.includes(locale)) {
    return locale as WeeklyDigestLocale;
  }
  return i18nConfig.fallbackLng as WeeklyDigestLocale;
}

export function episodeCountLocaleTag(locale?: string | null): string {
  const lang = resolveWeeklyDigestLocale(locale);
  if (lang === "ja") return "ja-JP";
  if (lang === "en") return "en-US";
  return "ko-KR";
}
