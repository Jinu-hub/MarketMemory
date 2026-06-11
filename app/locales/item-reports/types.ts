import type itemReportsKo from "./ko";

/** Recursively widen string literals so ko/en/ja share one structural type. */
type WidenStrings<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly WidenStrings<U>[]
    : T extends object
      ? { [K in keyof T]: WidenStrings<T[K]> }
      : T;

/** Item reports copy tree (`Translation.itemReports`). */
export type ItemReportsTranslation = WidenStrings<typeof itemReportsKo>;

/** UI chrome without DB-key semantic buckets. */
export type ItemReportsUiMessages = Omit<ItemReportsTranslation, "semantic">;
