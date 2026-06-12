import type weeklyAiIssueDigestKo from "./ko";

/** Recursively widen string literals so ko/en/ja share one structural type. */
type WidenStrings<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly WidenStrings<U>[]
    : T extends object
      ? { [K in keyof T]: WidenStrings<T[K]> }
      : T;

/** Weekly AI Issue Digest copy tree (`Translation.weeklyAiIssueDigest`). */
export type WeeklyAiIssueDigestTranslation = WidenStrings<
  typeof weeklyAiIssueDigestKo
>;
