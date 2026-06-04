import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

export type ItemReportsDb = SupabaseClient<Database>;

type SelectOptions = {
  count?: "exact" | "planned" | "estimated";
  head?: boolean;
};

/**
 * `item_contents` select with the reader-facing visibility gate applied.
 * All `/item_reports` list/detail queries should start here.
 */
export function publicItemContentsSelect<const C extends string>(
  client: ItemReportsDb,
  columns: C,
  options?: SelectOptions,
) {
  return client
    .from("item_contents")
    .select(columns, options)
    .eq("is_public", true)
    .eq("is_active", true);
}

type OrderableQuery<T> = {
  order: (
    column: string,
    options?: { ascending?: boolean; nullsFirst?: boolean },
  ) => T;
};

/** `market_date` then `created_at` — matches list / explore / timeline ordering. */
export function orderItemContentsByReportDate<T extends OrderableQuery<T>>(
  query: T,
  sort: "newest" | "oldest",
): T {
  const ascending = sort === "oldest";
  return query
    .order("market_date", { ascending, nullsFirst: ascending })
    .order("created_at", { ascending });
}

/** Newest-first variant used by highlights, recent lists, and category samples. */
export function orderItemContentsNewestFirst<T extends OrderableQuery<T>>(
  query: T,
): T {
  return query
    .order("market_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
}
