const LOCALE_MAP: Record<string, string> = {
  ko: "ko-KR",
  en: "en-US",
  ja: "ja-JP",
};

function resolveBcp47(locale: string | null | undefined): string {
  if (!locale) return "ko-KR";
  return LOCALE_MAP[locale] ?? locale;
}

/** Long-form market date with weekday — used in the dashboard header. */
export function formatMarketDate(
  value: string | null | undefined,
  locale?: string | null,
): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(resolveBcp47(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });
}

const DEFAULT_PUBLISH_TIMEZONE = "Asia/Tokyo";

/** Pipeline publish / update time (morning JST/KST cron window). */
export function formatMemoryPublishedAt(
  value: string | null | undefined,
  locale?: string | null,
  timeZone: string = DEFAULT_PUBLISH_TIMEZONE,
): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString(resolveBcp47(locale), {
    timeZone,
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
