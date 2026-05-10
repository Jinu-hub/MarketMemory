import { useCallback, useMemo, useState } from "react";

export type SortDir = "asc" | "desc";

export type TableSortOptions<K extends string> = {
  /**
   * 다른 컬럼을 처음 선택했을 때의 방향. 기본 `"asc"`.
   * 날짜 컬럼만 최신 우선(desc)으로 시작하고 싶을 때 함수로 분기할 수 있다.
   */
  sortDirWhenChangingColumn?: SortDir | ((key: K) => SortDir);
};

/**
 * 테이블 헤더 정렬 토글용 상태.
 *
 * @param initialKey 기본 정렬 컬럼 키
 * @param initialDir 기본 정렬 방향
 */
export function useTableSortState<K extends string>(
  initialKey: K,
  initialDir: SortDir = "desc",
  options?: TableSortOptions<K>,
) {
  const [sortKey, setSortKey] = useState<K>(initialKey);
  const [sortDir, setSortDir] = useState<SortDir>(initialDir);

  const toggleSort = useCallback(
    (key: K) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        const next =
          typeof options?.sortDirWhenChangingColumn === "function"
            ? options.sortDirWhenChangingColumn(key)
            : options?.sortDirWhenChangingColumn ?? "asc";
        setSortDir(next);
      }
    },
    [sortKey, options?.sortDirWhenChangingColumn],
  );

  return { sortKey, sortDir, toggleSort, setSortKey, setSortDir };
}

/**
 * 검색어로 1차 필터링한다. `matches`에서 소문자 비교를 가정한다.
 */
export function useFilteredList<T>(
  items: T[],
  searchText: string,
  matches: (item: T, queryLower: string) => boolean,
) {
  return useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (q.length === 0) {
      return items;
    }
    return items.filter((item) => matches(item, q));
  }, [items, searchText, matches]);
}
