/**
 * Pick the best i18n row: preferred locale → core language → first available.
 */
export function pickBestI18nRow<T extends { lang_code: string }>(
  rows: T[],
  preferredLang: string,
  coreLang: string,
): T | null {
  if (rows.length === 0) return null;
  return (
    rows.find((r) => r.lang_code === preferredLang) ??
    rows.find((r) => r.lang_code === coreLang) ??
    rows[0] ??
    null
  );
}
