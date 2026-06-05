import { itemReportsListPath } from "./item-reports-urls";

/** React Router `location.state` for preserving `/item_reports` list context. */
export type ItemReportsListLocationState = {
  listSearch: string;
};

export function buildItemReportsListLinkState(
  searchParams: URLSearchParams,
): ItemReportsListLocationState | undefined {
  const listSearch = searchParams.toString();
  return listSearch ? { listSearch } : undefined;
}

export function readListSearchFromState(
  state: unknown,
): string | undefined {
  if (!state || typeof state !== "object") return undefined;
  const listSearch = (state as ItemReportsListLocationState).listSearch;
  if (typeof listSearch !== "string" || listSearch.length === 0) {
    return undefined;
  }
  if (listSearch.includes("://") || listSearch.startsWith("/")) {
    return undefined;
  }
  return listSearch;
}

export function readItemReportsListLinkState(
  state: unknown,
): ItemReportsListLocationState | undefined {
  const listSearch = readListSearchFromState(state);
  return listSearch ? { listSearch } : undefined;
}

/** Back link target for detail → list (restores search, filters, page). */
export function resolveItemReportsListBackHref(state: unknown): string {
  const listSearch = readListSearchFromState(state);
  return itemReportsListPath(listSearch ?? "");
}
