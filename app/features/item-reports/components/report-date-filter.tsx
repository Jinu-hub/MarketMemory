import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

import { NexButton, NexInput } from "~/core/components/nex";
import { Label } from "~/core/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/core/components/ui/select";

import { REPORT_DATE_PARAM_KEYS } from "../lib/report-date-params";

const ALL_VALUE = "__all__";

const MONTH_LABELS = Array.from({ length: 12 }, (_, index) => {
  const month = index + 1;
  return { value: String(month), label: `${month}월` };
});

type ReportDateFilterProps = {
  availableYears: number[];
  /** Hide section title when embedded in filter panel tabs. */
  hideTitle?: boolean;
};

/**
 * Year → month cascade selects plus optional From~To range.
 * URL: `year`, `month`, `date_from`, `date_to` (range clears year/month).
 */
export function ReportDateFilter({
  availableYears,
  hideTitle = false,
}: ReportDateFilterProps) {
  const [params, setParams] = useSearchParams();
  const [dateFrom, setDateFrom] = useState(
    params.get(REPORT_DATE_PARAM_KEYS.dateFrom) ?? "",
  );
  const [dateTo, setDateTo] = useState(
    params.get(REPORT_DATE_PARAM_KEYS.dateTo) ?? "",
  );

  useEffect(() => {
    setDateFrom(params.get(REPORT_DATE_PARAM_KEYS.dateFrom) ?? "");
    setDateTo(params.get(REPORT_DATE_PARAM_KEYS.dateTo) ?? "");
  }, [params]);

  const selectedYear = params.get(REPORT_DATE_PARAM_KEYS.year) ?? ALL_VALUE;
  const selectedMonth = params.get(REPORT_DATE_PARAM_KEYS.month) ?? ALL_VALUE;
  const hasCustomRange =
    Boolean(params.get(REPORT_DATE_PARAM_KEYS.dateFrom)) ||
    Boolean(params.get(REPORT_DATE_PARAM_KEYS.dateTo));

  const patchParams = (mutate: (next: URLSearchParams) => void) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        mutate(next);
        next.delete("page");
        return next;
      },
      { replace: true },
    );
  };

  const clearCustomRange = (next: URLSearchParams) => {
    next.delete(REPORT_DATE_PARAM_KEYS.dateFrom);
    next.delete(REPORT_DATE_PARAM_KEYS.dateTo);
    setDateFrom("");
    setDateTo("");
  };

  const clearYearMonth = (next: URLSearchParams) => {
    next.delete(REPORT_DATE_PARAM_KEYS.year);
    next.delete(REPORT_DATE_PARAM_KEYS.month);
  };

  const setYear = (value: string) => {
    patchParams((next) => {
      clearCustomRange(next);
      if (!value || value === ALL_VALUE) {
        next.delete(REPORT_DATE_PARAM_KEYS.year);
        next.delete(REPORT_DATE_PARAM_KEYS.month);
      } else {
        next.set(REPORT_DATE_PARAM_KEYS.year, value);
        next.delete(REPORT_DATE_PARAM_KEYS.month);
      }
    });
  };

  const setMonth = (value: string) => {
    patchParams((next) => {
      clearCustomRange(next);
      if (!value || value === ALL_VALUE) {
        next.delete(REPORT_DATE_PARAM_KEYS.month);
      } else {
        next.set(REPORT_DATE_PARAM_KEYS.month, value);
      }
    });
  };

  const applyCustomRange = (event: React.FormEvent) => {
    event.preventDefault();
    patchParams((next) => {
      clearYearMonth(next);
      const from = dateFrom.trim();
      const to = dateTo.trim();
      if (from) {
        next.set(REPORT_DATE_PARAM_KEYS.dateFrom, from);
      } else {
        next.delete(REPORT_DATE_PARAM_KEYS.dateFrom);
      }
      if (to) {
        next.set(REPORT_DATE_PARAM_KEYS.dateTo, to);
      } else {
        next.delete(REPORT_DATE_PARAM_KEYS.dateTo);
      }
    });
  };

  const clearCustomRangeOnly = () => {
    patchParams((next) => {
      clearCustomRange(next);
    });
  };

  const yearDisabled = hasCustomRange;
  const monthDisabled = yearDisabled || selectedYear === ALL_VALUE;

  return (
    <div className="space-y-4">
      {!hideTitle ? (
        <span className="text-xs font-medium">기간</span>
      ) : null}

      <div className="space-y-2">
        <Label className="text-xs font-medium">년도</Label>
        <Select
          value={selectedYear}
          onValueChange={setYear}
          disabled={yearDisabled}
        >
          <SelectTrigger className="w-full" aria-label="년도 선택">
            <SelectValue placeholder="전체 년도" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>전체 년도</SelectItem>
            {availableYears.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {year}년
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">월</Label>
        <Select
          value={selectedMonth}
          onValueChange={setMonth}
          disabled={monthDisabled}
        >
          <SelectTrigger className="w-full" aria-label="월 선택">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_VALUE}>전체</SelectItem>
            {MONTH_LABELS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {monthDisabled && selectedYear === ALL_VALUE ? (
          <p className="text-muted-foreground text-xs">
            년도를 선택하면 월별로 좁힐 수 있어요.
          </p>
        ) : null}
      </div>

      <div className="border-border relative flex items-center gap-3 py-1">
        <span className="bg-card/60 text-muted-foreground absolute left-1/2 -translate-x-1/2 px-2 text-[10px] tracking-wide uppercase">
          또는
        </span>
        <div className="border-border flex-1 border-t" />
      </div>

      <form onSubmit={applyCustomRange} className="space-y-3">
        <Label className="text-xs font-medium">From ~ To</Label>
        <div className="grid grid-cols-1 gap-2">
          <NexInput
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            inputSize="sm"
            aria-label="시작일"
          />
          <NexInput
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            inputSize="sm"
            aria-label="종료일"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <NexButton type="submit" variant="secondary" size="sm">
            기간 적용
          </NexButton>
          {hasCustomRange ? (
            <NexButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearCustomRangeOnly}
            >
              기간 해제
            </NexButton>
          ) : null}
        </div>
      </form>
    </div>
  );
}
