import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import {
  REPORT_LIST_CHIP_PARAM_KEYS,
  type ReportListChipParamKey,
} from "../lib/filter-keys";
import {
  formatCategory,
  formatRegion,
  formatReportTier,
  formatReportType,
} from "../lib/labels";
import { formatReportDateChipLabel } from "../lib/report-date-filter";
import { parseReportDateFilter } from "../lib/report-date-params";
import { useItemReportsSearchParams } from "../lib/use-item-reports-search-params";

const CHIP_LABELS: Record<ReportListChipParamKey, string> = {
  category: "카테고리",
  report_type: "유형",
  report_tier: "등급",
  region: "지역",
  country: "국가",
  tag: "태그",
  lang: "언어",
  q: "검색",
};

function renderChipValue(key: ReportListChipParamKey, value: string): string {
  switch (key) {
    case "category":
      return formatCategory(value);
    case "report_type":
      return formatReportType(value);
    case "report_tier":
      return formatReportTier(value);
    case "region":
      return formatRegion(value);
    case "lang":
      return value.toUpperCase();
    case "tag":
      return `#${value}`;
    default:
      return value;
  }
}

type Props = { className?: string };

/**
 * Renders the currently active filters as removable badges above the report
 * grid. Uses NexBadge removable semantics so the whole chip row reads as a
 * single filter state — not as generic UI decoration.
 */
export function ReportActiveFilters({ className }: Props) {
  const { searchParams, removeFilterParam, clearDateFilterParams } =
    useItemReportsSearchParams();

  const chips = REPORT_LIST_CHIP_PARAM_KEYS.flatMap((key) => {
    const value = searchParams.get(key);
    return value ? [{ key, value }] : [];
  });

  const dateLabel = formatReportDateChipLabel(
    parseReportDateFilter(searchParams),
  );

  if (chips.length === 0 && !dateLabel) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-muted-foreground text-xs">적용된 필터</span>
      {dateLabel ? (
        <NexBadge
          variant="secondary"
          size="sm"
          removable
          onRemove={clearDateFilterParams}
        >
          <span className="text-muted-foreground mr-1">기간</span>
          <span className="font-medium">{dateLabel}</span>
        </NexBadge>
      ) : null}
      {chips.map(({ key, value }) => (
        <NexBadge
          key={key}
          variant="secondary"
          size="sm"
          removable
          onRemove={() => removeFilterParam(key)}
        >
          <span className="text-muted-foreground mr-1">{CHIP_LABELS[key]}</span>
          <span className="font-medium">{renderChipValue(key, value)}</span>
        </NexBadge>
      ))}
    </div>
  );
}
