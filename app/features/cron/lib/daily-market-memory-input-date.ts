const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type ReportMarketDateRow = {
  market_date: string | null;
  id: string;
  title: string | null;
};

export type ReportMarketDateMismatch = {
  itemContentId: string;
  marketDate: string | null;
  title: string | null;
};

export type ReportInputDateQueryMode = "single_day" | "coverage_range";

export type ResolvedReportInputDateQuery = {
  mode: ReportInputDateQueryMode;
  /** inclusive YYYY-MM-DD (`item_contents.market_date` filter) */
  marketDateStart: string;
  marketDateEnd: string;
  coverageStartAt: string | null;
  coverageEndAt: string | null;
  warnings: string[];
};

/** `item_contents.market_date` 또는 ISO 문자열을 YYYY-MM-DD로 정규화합니다. */
export function normalizeReportMarketDate(
  value: string | null | undefined,
): string | null {
  if (value == null) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (DATE_ONLY_PATTERN.test(trimmed)) {
    return trimmed;
  }
  const parsed = new Date(trimmed);
  if (!Number.isFinite(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString().slice(0, 10);
}

/** @deprecated use normalizeReportMarketDate */
export const normalizeReportInputDate = normalizeReportMarketDate;

/**
 * coverageStartAt·coverageEndAt가 모두 유효하면 `market_date` 구간 조회,
 * 그렇지 않으면 `market_date = dmm.marketDate` 단일일 조회.
 */
export function resolveReportInputDateQuery(
  marketDate: string,
  coverageStartAt?: string | null,
  coverageEndAt?: string | null,
): ResolvedReportInputDateQuery {
  const warnings: string[] = [];
  const singleDay: ResolvedReportInputDateQuery = {
    mode: "single_day",
    marketDateStart: marketDate,
    marketDateEnd: marketDate,
    coverageStartAt: null,
    coverageEndAt: null,
    warnings,
  };

  const startRaw = coverageStartAt?.trim() ?? "";
  const endRaw = coverageEndAt?.trim() ?? "";

  if (!startRaw && !endRaw) {
    return singleDay;
  }

  if (!startRaw || !endRaw) {
    warnings.push(
      "coverageStartAt·coverageEndAt 중 하나만 입력되었습니다. item_contents.market_date=marketDate만 사용합니다.",
    );
    return singleDay;
  }

  const start = normalizeReportMarketDate(startRaw);
  const end = normalizeReportMarketDate(endRaw);

  if (!start || !end) {
    warnings.push(
      "coverage 날짜 파싱에 실패했습니다. item_contents.market_date=marketDate만 사용합니다.",
    );
    return singleDay;
  }

  if (start > end) {
    warnings.push(
      `coverage 범위가 유효하지 않습니다(${start} > ${end}). item_contents.market_date=marketDate만 사용합니다.`,
    );
    return singleDay;
  }

  warnings.push(
    `리포트 조회: item_contents.market_date ${start}~${end} → daily_market_memories.market_date=${marketDate} 로 집계합니다.`,
  );

  return {
    mode: "coverage_range",
    marketDateStart: start,
    marketDateEnd: end,
    coverageStartAt: startRaw,
    coverageEndAt: endRaw,
    warnings,
  };
}

export function validateReportsMatchMarketDate(
  marketDate: string,
  reports: ReportMarketDateRow[],
): { ok: true } | { ok: false; mismatches: ReportMarketDateMismatch[] } {
  return validateReportsInMarketDateRange(marketDate, marketDate, reports);
}

export function validateReportsInMarketDateRange(
  marketDateStart: string,
  marketDateEnd: string,
  reports: ReportMarketDateRow[],
): { ok: true } | { ok: false; mismatches: ReportMarketDateMismatch[] } {
  const mismatches: ReportMarketDateMismatch[] = [];

  for (const report of reports) {
    const normalized = normalizeReportMarketDate(report.market_date);
    if (
      !normalized ||
      normalized < marketDateStart ||
      normalized > marketDateEnd
    ) {
      mismatches.push({
        itemContentId: report.id,
        marketDate: normalized ?? report.market_date,
        title: report.title,
      });
    }
  }

  if (mismatches.length > 0) {
    return { ok: false, mismatches };
  }

  return { ok: true };
}

export function formatReportInputDateMismatchError(
  query: ResolvedReportInputDateQuery,
  dmmMarketDate: string,
  mismatches: ReportMarketDateMismatch[],
): string {
  const sample = mismatches
    .slice(0, 3)
    .map((m) => `${m.itemContentId} (market_date=${m.marketDate ?? "null"})`)
    .join(", ");
  const more =
    mismatches.length > 3 ? ` 외 ${mismatches.length - 3}건` : "";

  const rangeLabel =
    query.mode === "coverage_range"
      ? `item_contents.market_date ${query.marketDateStart}~${query.marketDateEnd}`
      : `item_contents.market_date=${dmmMarketDate}`;

  return (
    `daily_market_memories.market_date=${dmmMarketDate} 집계에 허용되지 않는 리포트가 ${mismatches.length}건 있습니다 (${rangeLabel}): ${sample}${more}.`
  );
}

export function formatEmptyReportsError(
  query: ResolvedReportInputDateQuery,
  dmmMarketDate: string,
): string {
  if (query.mode === "coverage_range") {
    return `daily_market_memories.market_date=${dmmMarketDate} 집계용 리포트가 없습니다 (item_contents.market_date ${query.marketDateStart}~${query.marketDateEnd}, 0건).`;
  }
  return `daily_market_memories.market_date=${dmmMarketDate}에 item_contents.market_date가 일치하는 리포트가 없습니다.`;
}

export function validatePipelineReports(
  dmmMarketDate: string,
  query: ResolvedReportInputDateQuery,
  reports: ReportMarketDateRow[],
): { ok: true } | { ok: false; mismatches: ReportMarketDateMismatch[] } {
  return validateReportsInMarketDateRange(
    query.marketDateStart,
    query.marketDateEnd,
    reports,
  );
}

export class DailyMarketMemoryInputDateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DailyMarketMemoryInputDateError";
  }
}
