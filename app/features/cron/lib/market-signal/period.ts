import {
  endOfISOWeek,
  endOfMonth,
  endOfYear,
  format,
  getISOWeek,
  getISOWeekYear,
  parseISO,
  startOfISOWeek,
  startOfMonth,
  startOfYear,
} from "date-fns";

import type {
  MarketSignalPeriodType,
  MarketSignalSnapshotStatus,
} from "~/features/cron/lib/market-signal/types";

export function parseMarketDate(value: string): Date {
  return parseISO(value);
}

export function formatMarketDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function resolveWeeklyPeriodKey(marketDate: string): string {
  const date = parseMarketDate(marketDate);
  const year = getISOWeekYear(date);
  const week = String(getISOWeek(date)).padStart(2, "0");
  return `${year}-W${week}`;
}

export function resolveMonthlyPeriodKey(marketDate: string): string {
  const date = parseMarketDate(marketDate);
  return format(date, "yyyy-MM");
}

export function resolveYearlyPeriodKey(marketDate: string): string {
  const date = parseMarketDate(marketDate);
  return format(date, "yyyy");
}

export function resolvePeriodKey(
  marketDate: string,
  periodType: MarketSignalPeriodType,
): string {
  if (periodType === "weekly") {
    return resolveWeeklyPeriodKey(marketDate);
  }
  if (periodType === "monthly") {
    return resolveMonthlyPeriodKey(marketDate);
  }
  if (periodType === "yearly") {
    return resolveYearlyPeriodKey(marketDate);
  }
  return marketDate;
}

export function resolvePeriodRange(
  periodKey: string,
  periodType: MarketSignalPeriodType,
): { periodStart: string; periodEnd: string } {
  if (periodType === "weekly") {
    const match = /^(\d{4})-W(\d{2})$/.exec(periodKey);
    if (!match) {
      throw new Error(`Invalid weekly period_key: ${periodKey}`);
    }
    const year = Number(match[1]);
    const week = Number(match[2]);
    const jan4 = parseISO(`${year}-01-04`);
    const weekOneMonday = startOfISOWeek(jan4);
    const start = new Date(weekOneMonday);
    start.setDate(start.getDate() + (week - 1) * 7);
    const end = endOfISOWeek(start);
    return {
      periodStart: formatMarketDate(start),
      periodEnd: formatMarketDate(end),
    };
  }

  if (periodType === "monthly") {
    const match = /^(\d{4})-(\d{2})$/.exec(periodKey);
    if (!match) {
      throw new Error(`Invalid monthly period_key: ${periodKey}`);
    }
    const start = startOfMonth(parseISO(`${periodKey}-01`));
    const end = endOfMonth(start);
    return {
      periodStart: formatMarketDate(start),
      periodEnd: formatMarketDate(end),
    };
  }

  if (periodType === "yearly") {
    const match = /^(\d{4})$/.exec(periodKey);
    if (!match) {
      throw new Error(`Invalid yearly period_key: ${periodKey}`);
    }
    const start = startOfYear(parseISO(`${periodKey}-01-01`));
    const end = endOfYear(start);
    return {
      periodStart: formatMarketDate(start),
      periodEnd: formatMarketDate(end),
    };
  }

  return { periodStart: periodKey, periodEnd: periodKey };
}

export function isDateInRange(
  marketDate: string,
  rangeStart: string,
  rangeEnd: string,
): boolean {
  return marketDate >= rangeStart && marketDate <= rangeEnd;
}

export function enumeratePeriodKeys(
  from: string,
  to: string,
  periodType: MarketSignalPeriodType,
): string[] {
  const start = parseMarketDate(from);
  const end = parseMarketDate(to);
  if (start > end) {
    return [];
  }

  const keys = new Set<string>();
  const cursor = new Date(start);
  while (cursor <= end) {
    const marketDate = formatMarketDate(cursor);
    keys.add(resolvePeriodKey(marketDate, periodType));
    cursor.setDate(cursor.getDate() + 1);
  }

  return [...keys].sort();
}

export function resolvePreviousPeriodKey(
  periodKey: string,
  periodType: MarketSignalPeriodType,
): string | null {
  const { periodStart } = resolvePeriodRange(periodKey, periodType);
  const previousDay = parseMarketDate(periodStart);
  previousDay.setDate(previousDay.getDate() - 1);
  return resolvePeriodKey(formatMarketDate(previousDay), periodType);
}

export function resolveSnapshotStatus(
  periodKey: string,
  periodType: MarketSignalPeriodType,
  referenceDate: string,
  forceFinal = false,
): MarketSignalSnapshotStatus {
  if (forceFinal) {
    return "final";
  }
  const { periodEnd } = resolvePeriodRange(periodKey, periodType);
  return referenceDate > periodEnd ? "final" : "draft";
}

export function isPeriodClosed(
  periodKey: string,
  periodType: MarketSignalPeriodType,
  referenceDate: string,
): boolean {
  return resolveSnapshotStatus(periodKey, periodType, referenceDate, false) === "final";
}

/** ISO week 가 calendar month range 와 겹치는지 */
export function periodOverlapsRange(
  periodStart: string,
  periodEnd: string,
  rangeStart: string,
  rangeEnd: string,
): boolean {
  return periodStart <= rangeEnd && periodEnd >= rangeStart;
}
