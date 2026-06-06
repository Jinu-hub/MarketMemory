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

const MARKET_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validate a `?date=` search param against the `YYYY-MM-DD` market-date shape.
 * Returns the normalized key on success, otherwise `null`.
 *
 * Uses local calendar parts (not `new Date(value)`) so the value never shifts
 * across timezones — `market_date` is a calendar date, not an instant.
 */
export function parseMarketDateParam(
  value: string | null | undefined,
): string | null {
  if (!value || !MARKET_DATE_PATTERN.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return value;
}

/**
 * Convert a `YYYY-MM-DD` market date into a local `Date` at midnight.
 * Parsing the parts manually avoids the UTC interpretation of
 * `new Date("YYYY-MM-DD")`, which would shift the day in negative-offset zones.
 */
export function marketDateToLocalDate(
  value: string | null | undefined,
): Date | null {
  const normalized = parseMarketDateParam(value);
  if (!normalized) return null;
  const [year, month, day] = normalized.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Format a local `Date` back into a `YYYY-MM-DD` market-date key. */
export function localDateToMarketKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
