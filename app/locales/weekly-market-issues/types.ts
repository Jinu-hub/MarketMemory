import type weeklyMarketIssuesKo from "./ko";

/** Recursively widen string literals so ko/en/ja share one structural type. */
type WidenStrings<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly WidenStrings<U>[]
    : T extends object
      ? { [K in keyof T]: WidenStrings<T[K]> }
      : T;

/** Weekly Market Issues copy tree (`Translation.weeklyMarketIssues`). */
export type WeeklyMarketIssuesTranslation = WidenStrings<
  typeof weeklyMarketIssuesKo
>;
