import { useCallback, useMemo, useState } from "react";

export type SortDir = "asc" | "desc";

/**
 * 테이블 헤더 정렬 토글용 상태.
 *
 * @param initialKey 기본 정렬 컬럼 키
 * @param initialDir 기본 정렬 방향
 */
export function useTableSortState<K extends string>(
  initialKey: K,
  initialDir: SortDir = "desc",
) {
  const [sortKey, setSortKey] = useState<K>(initialKey);
  const [sortDir, setSortDir] = useState<SortDir>(initialDir);

  const toggleSort = useCallback(
    (key: K) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey],
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
