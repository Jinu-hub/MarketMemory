import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import {
  useItemReportsLocale,
  useItemReportsUi,
} from "../i18n";
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

function renderChipValue(
  key: ReportListChipParamKey,
  value: string,
  locale: string,
): string {
  switch (key) {
    case "category":
      return formatCategory(value, locale);
    case "report_type":
      return formatReportType(value, locale);
    case "report_tier":
      return formatReportTier(value, locale);
    case "region":
      return formatRegion(value, locale);
    case "lang":
      return value.toUpperCase();
    case "tag":
      return `#${value}`;
    default:
      return value;
  }
}

type Props = { className?: string };

export function ReportActiveFilters({ className }: Props) {
  const ui = useItemReportsUi();
  const locale = useItemReportsLocale();
  const { searchParams, removeFilterParam, clearDateFilterParams } =
    useItemReportsSearchParams();

  const chips = REPORT_LIST_CHIP_PARAM_KEYS.flatMap((key) => {
    const value = searchParams.get(key);
    return value ? [{ key, value }] : [];
  });

  const dateLabel = formatReportDateChipLabel(
    parseReportDateFilter(searchParams),
    locale,
  );

  if (chips.length === 0 && !dateLabel) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-muted-foreground text-xs">{ui.filter.activeFilters}</span>
      {dateLabel ? (
        <NexBadge
          variant="secondary"
          size="sm"
          removable
          onRemove={clearDateFilterParams}
        >
          <span className="text-muted-foreground mr-1">{ui.filter.periodChip}</span>
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
          <span className="text-muted-foreground mr-1">{ui.filter.chips[key]}</span>
          <span className="font-medium">{renderChipValue(key, value, locale)}</span>
        </NexBadge>
      ))}
    </div>
  );
}
