/**
 * Item Content Localization (item_contents × item_content_i18n)
 *
 * Single source of truth for resolving the *displayed* language of report
 * content across every reader-facing surface (item-reports list/detail/explore/
 * timeline, dashboard source reports, weekly series, etc.).
 *
 * Data model
 * ----------
 *  - `item_contents`        → the report's **primary/original** language (the
 *                             source row, always complete). Carries `lang_code`.
 *  - `item_content_i18n`    → per-language **translations** of a source row,
 *                             keyed by `(item_content_id, lang_code)`.
 *
 * Resolution rule
 * ---------------
 *  1. If the requested `locale` equals the source row's `lang_code`, the source
 *     row is already in the right language → no lookup, returned as-is.
 *  2. Otherwise we look up the matching `item_content_i18n` row for that locale
 *     and overlay its **non-null translatable fields** onto the source row.
 *  3. If no translation exists (or it is gated out by visibility), we fall back
 *     to the source row — the original language is always a safe, complete
 *     fallback.
 *
 * Only textual/editorial fields are translated. Language-neutral fields
 * (`category`, `tags`, `regions`, `countries`, `market_date`, tiers, …) always
 * come from the source row and are never overwritten. When a translation is
 * applied, `lang_code` is updated to the i18n row's language so UI surfaces
 * (e.g. Report Info) reflect the language currently on screen.
 *
 * Performance
 * -----------
 *  - List localization is a single batched `.in("item_content_id", ids)` query
 *    (chunked) — never N+1.
 *  - Rows already in the requested locale are skipped entirely.
 *  - The i18n select only fetches the columns present on the base row shape, so
 *    list rows never pull heavy `content` / `html_body` columns.
 */
import type { Database } from "database.types";

import type { ItemReportsDb } from "./public-item-contents-query";

type ItemContentI18nRow =
  Database["public"]["Tables"]["item_content_i18n"]["Row"];

/**
 * Editorial fields that a translation row may override on a source
 * `item_contents` row. Keep this list in sync with the columns shared between
 * `item_contents` and `item_content_i18n`.
 */
export const LOCALIZABLE_ITEM_CONTENT_FIELDS = [
  "title",
  "summary",
  "summary_meta",
  "content",
  "content_sns",
  "html_body",
] as const;

export type LocalizableItemContentField =
  (typeof LOCALIZABLE_ITEM_CONTENT_FIELDS)[number];

/** Minimal shape any row must have to be localizable. */
export type LocalizableRow = {
  id: string;
  lang_code: string | null;
};

/**
 * Outcome of resolving a single row's display language. Screens use this to
 * decide whether to show a "translation not available yet" notice.
 */
export type ItemContentLocalization = {
  /** Locale the reader asked for (UI language). */
  requestedLocale: string;
  /** Primary/original language of the source `item_contents` row. */
  sourceLang: string | null;
  /** Language actually shown — `requestedLocale` when translated, else source. */
  resolvedLang: string | null;
  /** A row in the requested locale is available (source already matches or a translation was applied). */
  isTranslated: boolean;
  /** No translation exists yet, so the original-language content is shown instead. */
  isFallback: boolean;
};

export type LocalizeItemContentOptions = {
  /**
   * Include translations whose `is_public = false`. Reader surfaces must keep
   * this `false` (the default) so unpublished translations never leak; admin /
   * preview contexts can opt in.
   */
  includeNonPublic?: boolean;
  /**
   * Restrict which translatable fields are overlaid. Defaults to every
   * localizable field that exists on the base row shape (so list rows only
   * overlay list fields, detail rows overlay everything).
   */
  fields?: readonly LocalizableItemContentField[];
};

/** Largest `IN (...)` batch per round-trip (mirrors the admin i18n queries). */
const CONTENT_ID_IN_CHUNK = 120;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

/**
 * Infer which localizable fields are present on a base row so we only ever
 * fetch + overlay columns the caller actually selected.
 */
function inferFields(
  sample: Record<string, unknown>,
): LocalizableItemContentField[] {
  return LOCALIZABLE_ITEM_CONTENT_FIELDS.filter((field) => field in sample);
}

/** Overlay non-null translated values onto a copy of the base row. */
function overlayRow<T extends LocalizableRow>(
  base: T,
  i18n: Partial<ItemContentI18nRow>,
  fields: readonly LocalizableItemContentField[],
): T {
  const out: Record<string, unknown> = { ...base };
  for (const field of fields) {
    const value = (i18n as Record<string, unknown>)[field];
    if (value !== undefined && value !== null) {
      out[field] = value;
    }
  }
  // Displayed content is in the translation's language, not the source's.
  if (i18n.lang_code) {
    out.lang_code = i18n.lang_code;
  }
  return out as T;
}

/**
 * Fetch translations for `contentIds` in a single locale and index them by
 * `item_content_id`. Batched + chunked so large lists stay one logical query.
 */
async function fetchI18nOverlayMap(
  client: ItemReportsDb,
  contentIds: string[],
  locale: string,
  fields: readonly LocalizableItemContentField[],
  includeNonPublic: boolean,
): Promise<Map<string, Partial<ItemContentI18nRow>>> {
  const map = new Map<string, Partial<ItemContentI18nRow>>();
  if (contentIds.length === 0) {
    return map;
  }

  const columns = ["item_content_id", "lang_code", "is_public", ...fields].join(
    ",",
  );

  for (const ids of chunk(contentIds, CONTENT_ID_IN_CHUNK)) {
    let query = client
      .from("item_content_i18n")
      .select(columns)
      .eq("lang_code", locale)
      .in("item_content_id", ids);

    if (!includeNonPublic) {
      query = query.eq("is_public", true);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    for (const row of (data ?? []) as unknown as Array<
      Partial<ItemContentI18nRow> & { item_content_id: string }
    >) {
      // `(item_content_id, lang_code)` is unique, so first-write-wins is safe.
      if (!map.has(row.item_content_id)) {
        map.set(row.item_content_id, row);
      }
    }
  }

  return map;
}

/**
 * Localize a batch of `item_contents` rows into `locale`, overlaying the best
 * matching `item_content_i18n` translation onto each. Rows already in `locale`
 * (or without a translation) are returned untouched.
 *
 * Use this for every list/grid/timeline surface — it performs a single batched
 * translation lookup regardless of how many rows are passed in.
 */
export async function localizeItemContents<T extends LocalizableRow>(
  client: ItemReportsDb,
  rows: T[],
  locale: string,
  options: LocalizeItemContentOptions = {},
): Promise<T[]> {
  if (rows.length === 0) {
    return rows;
  }

  const fields =
    options.fields ?? inferFields(rows[0] as unknown as Record<string, unknown>);
  if (fields.length === 0) {
    return rows;
  }

  // Only rows whose source language differs from the request need a lookup.
  const targetIds = rows
    .filter((row) => (row.lang_code ?? "") !== locale)
    .map((row) => row.id);
  if (targetIds.length === 0) {
    return rows;
  }

  const overlayMap = await fetchI18nOverlayMap(
    client,
    targetIds,
    locale,
    fields,
    options.includeNonPublic ?? false,
  );
  if (overlayMap.size === 0) {
    return rows;
  }

  return rows.map((row) => {
    if ((row.lang_code ?? "") === locale) {
      return row;
    }
    const overlay = overlayMap.get(row.id);
    return overlay ? overlayRow(row, overlay, fields) : row;
  });
}

/**
 * Localize a single `item_contents` row into `locale` and report the outcome.
 *
 * Use this on detail screens: the returned `localization` tells the screen
 * whether the requested-language content was available, so it can surface a
 * "not translated yet" notice while still rendering the original-language body.
 */
export async function localizeItemContentWithMeta<T extends LocalizableRow>(
  client: ItemReportsDb,
  row: T,
  locale: string,
  options: LocalizeItemContentOptions = {},
): Promise<{ row: T; localization: ItemContentLocalization }> {
  const sourceLang = row.lang_code ?? null;

  // Source row is already in the requested language → nothing to overlay.
  if ((sourceLang ?? "") === locale) {
    return {
      row,
      localization: {
        requestedLocale: locale,
        sourceLang,
        resolvedLang: sourceLang,
        isTranslated: true,
        isFallback: false,
      },
    };
  }

  const fields =
    options.fields ?? inferFields(row as unknown as Record<string, unknown>);

  const overlayMap = fields.length
    ? await fetchI18nOverlayMap(
        client,
        [row.id],
        locale,
        fields,
        options.includeNonPublic ?? false,
      )
    : new Map<string, Partial<ItemContentI18nRow>>();

  const overlay = overlayMap.get(row.id);
  if (overlay) {
    return {
      row: overlayRow(row, overlay, fields),
      localization: {
        requestedLocale: locale,
        sourceLang,
        resolvedLang: overlay.lang_code ?? locale,
        isTranslated: true,
        isFallback: false,
      },
    };
  }

  // No translation yet — fall back to the original language and flag it.
  return {
    row,
    localization: {
      requestedLocale: locale,
      sourceLang,
      resolvedLang: sourceLang,
      isTranslated: false,
      isFallback: true,
    },
  };
}

/**
 * Localize a single `item_contents` row into `locale`. Convenience wrapper over
 * {@link localizeItemContentWithMeta} for callers that don't need the
 * resolution metadata. Returns the source row unchanged when no translation
 * applies.
 */
export async function localizeItemContent<T extends LocalizableRow>(
  client: ItemReportsDb,
  row: T,
  locale: string,
  options: LocalizeItemContentOptions = {},
): Promise<T> {
  const { row: localized } = await localizeItemContentWithMeta(
    client,
    row,
    locale,
    options,
  );
  return localized;
}
