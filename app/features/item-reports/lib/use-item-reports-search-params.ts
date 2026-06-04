import { useCallback } from "react";
import { useSearchParams, type SetURLSearchParams } from "react-router";

import {
  FILTER_SELECT_ALL_VALUE,
  REPORT_LIST_PARAM,
} from "./filter-keys";
import { clearReportDateParams } from "./report-date-params";

type PatchSearchParamsOptions = {
  /** Reset `page` when filters change. Default `true`. */
  resetPage?: boolean;
};

export type ItemReportsSearchParamsApi = {
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
  patchParams: (
    mutate: (next: URLSearchParams) => void,
    options?: PatchSearchParamsOptions,
  ) => void;
  setFilterParam: (key: string, value: string, allValue?: string) => void;
  removeFilterParam: (key: string) => void;
  clearDateFilterParams: () => void;
  resetAllParams: () => void;
  setSortParam: (sort: "newest" | "oldest") => void;
};

/**
 * Shared URL state helpers for `/item_reports` list filters.
 * Always clears `page` when filter criteria change unless opted out.
 */
export function useItemReportsSearchParams(): ItemReportsSearchParamsApi {
  const [searchParams, setSearchParams] = useSearchParams();

  const patchParams = useCallback(
    (
      mutate: (next: URLSearchParams) => void,
      options?: PatchSearchParamsOptions,
    ) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          mutate(next);
          if (options?.resetPage !== false) {
            next.delete(REPORT_LIST_PARAM.page);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const setFilterParam = useCallback(
    (
      key: string,
      value: string,
      allValue: string = FILTER_SELECT_ALL_VALUE,
    ) => {
      patchParams((next) => {
        if (!value || value === allValue) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
    },
    [patchParams],
  );

  const removeFilterParam = useCallback(
    (key: string) => {
      patchParams((next) => {
        next.delete(key);
      });
    },
    [patchParams],
  );

  const clearDateFilterParams = useCallback(() => {
    patchParams((next) => {
      clearReportDateParams(next);
    });
  }, [patchParams]);

  const resetAllParams = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const setSortParam = useCallback(
    (sort: "newest" | "oldest") => {
      patchParams((next) => {
        if (sort === "newest") {
          next.delete(REPORT_LIST_PARAM.sort);
        } else {
          next.set(REPORT_LIST_PARAM.sort, sort);
        }
      });
    },
    [patchParams],
  );

  return {
    searchParams,
    setSearchParams,
    patchParams,
    setFilterParam,
    removeFilterParam,
    clearDateFilterParams,
    resetAllParams,
    setSortParam,
  };
}
