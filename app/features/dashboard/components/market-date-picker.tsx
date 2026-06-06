import { useState } from "react";

import { ChevronDownIcon, RotateCcwIcon } from "lucide-react";
import { enUS, ja, ko, type Locale } from "date-fns/locale";
import { useNavigate } from "react-router";

import { Calendar } from "~/core/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/core/components/ui/popover";
import { cn } from "~/core/lib/utils";

import {
  localDateToMarketKey,
  marketDateToLocalDate,
} from "../lib/dates";
import {
  DashboardMarketDate,
  type DashboardEditionLabels,
} from "./dashboard-market-date";

export type DashboardDatePickerLabels = {
  triggerLabel: string;
  title: string;
  hint: string;
  latest: string;
};

type MarketDatePickerProps = {
  marketDate: string;
  /** Distinct `YYYY-MM-DD` days that have a readable memory (newest first). */
  availableDates: string[];
  locale: string;
  labels: DashboardEditionLabels;
  pickerLabels: DashboardDatePickerLabels;
  publishedAt?: string | null;
  status?: string;
  className?: string;
};

const DATE_FNS_LOCALES: Record<string, Locale> = {
  ko,
  en: enUS,
  ja,
};

export function MarketDatePicker({
  marketDate,
  availableDates,
  locale,
  labels,
  pickerLabels,
  publishedAt,
  status,
  className,
}: MarketDatePickerProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const selectedDate = marketDateToLocalDate(marketDate) ?? undefined;
  const availableSet = new Set(availableDates);
  const dateFnsLocale = DATE_FNS_LOCALES[locale] ?? enUS;

  const latestDate = availableDates[0] ?? null;
  const isViewingLatest = !latestDate || latestDate === marketDate;

  function goToDate(key: string | null) {
    setOpen(false);
    navigate(key ? `/dashboard?date=${key}` : "/dashboard");
  }

  function handleSelect(date: Date | undefined) {
    if (!date) return;
    const key = localDateToMarketKey(date);
    if (key === marketDate) {
      setOpen(false);
      return;
    }
    goToDate(key);
  }

  return (
    <div className={cn("flex flex-col items-start gap-1.5 sm:items-end", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={pickerLabels.triggerLabel}
            className="group focus-visible:ring-ring/50 rounded-xl text-left transition-shadow focus-visible:ring-[3px] focus-visible:outline-none"
          >
            <DashboardMarketDate
              marketDate={marketDate}
              locale={locale}
              labels={labels}
              publishedAt={publishedAt}
              status={status}
              trailing={
                <ChevronDownIcon
                  className="text-muted-foreground/70 group-hover:text-primary size-4 shrink-0 transition-colors"
                  aria-hidden
                />
              }
              className="group-hover:border-primary/45 group-hover:bg-primary/[0.07] transition-colors"
            />
          </button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-auto p-0">
          <div className="border-border/60 flex items-center justify-between gap-3 border-b px-3 py-2">
            <span className="text-xs font-semibold">{pickerLabels.title}</span>
            {!isViewingLatest ? (
              <button
                type="button"
                onClick={() => goToDate(null)}
                className="text-primary hover:text-primary/80 inline-flex items-center gap-1 text-xs font-medium transition-colors"
              >
                <RotateCcwIcon className="size-3" aria-hidden />
                {pickerLabels.latest}
              </button>
            ) : null}
          </div>
          <Calendar
            mode="single"
            locale={dateFnsLocale}
            selected={selectedDate}
            defaultMonth={selectedDate}
            onSelect={handleSelect}
            disabled={(date) => !availableSet.has(localDateToMarketKey(date))}
            className="p-3"
          />
          <p className="text-muted-foreground border-border/60 border-t px-3 py-2 text-[11px] leading-snug">
            {pickerLabels.hint}
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
}
