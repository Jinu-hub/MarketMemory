import { useEffect, useState } from "react";

import { NexButton, NexInput } from "~/core/components/nex";
import { Label } from "~/core/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/core/components/ui/select";

import {
  formatItemReportsCopy,
  useItemReportsUi,
} from "../i18n";
import { FILTER_SELECT_ALL_VALUE } from "../lib/filter-keys";
import { REPORT_DATE_PARAM_KEYS } from "../lib/report-date-params";
import { useItemReportsSearchParams } from "../lib/use-item-reports-search-params";

type ReportDateFilterProps = {
  availableYears: number[];
  /** Hide section title when embedded in filter panel tabs. */
  hideTitle?: boolean;
};

export function ReportDateFilter({
  availableYears,
  hideTitle = false,
}: ReportDateFilterProps) {
  const ui = useItemReportsUi();
  const dateCopy = ui.filter.date;
  const { searchParams, patchParams } = useItemReportsSearchParams();
  const [dateFrom, setDateFrom] = useState(
    searchParams.get(REPORT_DATE_PARAM_KEYS.dateFrom) ?? "",
  );
  const [dateTo, setDateTo] = useState(
    searchParams.get(REPORT_DATE_PARAM_KEYS.dateTo) ?? "",
  );

  useEffect(() => {
    setDateFrom(searchParams.get(REPORT_DATE_PARAM_KEYS.dateFrom) ?? "");
    setDateTo(searchParams.get(REPORT_DATE_PARAM_KEYS.dateTo) ?? "");
  }, [searchParams]);

  const selectedYear =
    searchParams.get(REPORT_DATE_PARAM_KEYS.year) ?? FILTER_SELECT_ALL_VALUE;
  const selectedMonth =
    searchParams.get(REPORT_DATE_PARAM_KEYS.month) ?? FILTER_SELECT_ALL_VALUE;
  const hasCustomRange =
    Boolean(searchParams.get(REPORT_DATE_PARAM_KEYS.dateFrom)) ||
    Boolean(searchParams.get(REPORT_DATE_PARAM_KEYS.dateTo));

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
      if (!value || value === FILTER_SELECT_ALL_VALUE) {
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
      if (!value || value === FILTER_SELECT_ALL_VALUE) {
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
  const monthDisabled = yearDisabled || selectedYear === FILTER_SELECT_ALL_VALUE;

  return (
    <div className="space-y-4">
      {!hideTitle ? (
        <span className="text-xs font-medium">{dateCopy.title}</span>
      ) : null}

      <div className="space-y-2">
        <Label className="text-xs font-medium">{dateCopy.yearLabel}</Label>
        <Select
          value={selectedYear}
          onValueChange={setYear}
          disabled={yearDisabled}
        >
          <SelectTrigger className="w-full" aria-label={dateCopy.yearSelectAria}>
            <SelectValue placeholder={dateCopy.yearPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FILTER_SELECT_ALL_VALUE}>
              {dateCopy.allYears}
            </SelectItem>
            {availableYears.map((year) => (
              <SelectItem key={year} value={String(year)}>
                {formatItemReportsCopy(dateCopy.yearOption, { year })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-medium">{dateCopy.monthLabel}</Label>
        <Select
          value={selectedMonth}
          onValueChange={setMonth}
          disabled={monthDisabled}
        >
          <SelectTrigger className="w-full" aria-label={dateCopy.monthSelectAria}>
            <SelectValue placeholder={dateCopy.monthPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={FILTER_SELECT_ALL_VALUE}>
              {dateCopy.allMonths}
            </SelectItem>
            {Array.from({ length: 12 }, (_, index) => {
              const month = index + 1;
              return (
                <SelectItem key={month} value={String(month)}>
                  {formatItemReportsCopy(dateCopy.monthOption, { month })}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {monthDisabled && selectedYear === FILTER_SELECT_ALL_VALUE ? (
          <p className="text-muted-foreground text-xs">{dateCopy.monthHint}</p>
        ) : null}
      </div>

      <div className="border-border relative flex items-center gap-3 py-1">
        <span className="bg-card/60 text-muted-foreground absolute left-1/2 -translate-x-1/2 px-2 text-[10px] tracking-wide uppercase">
          {ui.common.or}
        </span>
        <div className="border-border flex-1 border-t" />
      </div>

      <form onSubmit={applyCustomRange} className="space-y-3">
        <Label className="text-xs font-medium">{dateCopy.rangeLabel}</Label>
        <div className="grid grid-cols-1 gap-2">
          <NexInput
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            inputSize="sm"
            aria-label={dateCopy.startAria}
          />
          <NexInput
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            inputSize="sm"
            aria-label={dateCopy.endAria}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <NexButton type="submit" variant="secondary" size="sm">
            {dateCopy.apply}
          </NexButton>
          {hasCustomRange ? (
            <NexButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearCustomRangeOnly}
            >
              {dateCopy.clear}
            </NexButton>
          ) : null}
        </div>
      </form>
    </div>
  );
}
