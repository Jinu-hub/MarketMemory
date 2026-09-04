import type marketSignalsKo from "./ko";

type WidenStrings<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly WidenStrings<U>[]
    : T extends object
      ? { [K in keyof T]: WidenStrings<T[K]> }
      : T;

export type MarketSignalsTranslation = WidenStrings<typeof marketSignalsKo>;
