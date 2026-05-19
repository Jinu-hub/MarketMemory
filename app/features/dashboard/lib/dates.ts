const LOCALE_MAP: Record<string, string> = {
  ko: "ko-KR",
  en: "en-US",
  ja: "ja-JP",
};

function resolveBcp47(locale: string | null | undefined): string {
  if (!locale) return "ko-KR";
  return LOCALE_MAP[locale] ?? locale;
}

/** Long-form market date with weekday — used in the hero block header. */
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
