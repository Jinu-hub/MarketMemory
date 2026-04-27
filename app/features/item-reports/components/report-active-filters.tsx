import { useSearchParams } from "react-router";

import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import {
  formatCategory,
  formatRegion,
  formatReportTier,
  formatReportType,
} from "../lib/format";

const CHIP_KEYS = [
  "category",
  "report_type",
  "report_tier",
  "region",
  "country",
  "tag",
  "lang",
  "q",
] as const;

type ChipKey = (typeof CHIP_KEYS)[number];

const labels: Record<ChipKey, string> = {
  category: "카테고리",
  report_type: "유형",
  report_tier: "등급",
  region: "지역",
  country: "국가",
  tag: "태그",
  lang: "언어",
  q: "검색",
};

function renderValue(key: ChipKey, value: string): string {
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
  const [params, setParams] = useSearchParams();
  const chips = CHIP_KEYS.flatMap((key) => {
    const value = params.get(key);
    return value ? [{ key, value }] : [];
  });

  if (chips.length === 0) return null;

  const removeChip = (key: ChipKey) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(key);
        next.delete("page");
        return next;
      },
      { replace: true },
    );
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <span className="text-muted-foreground text-xs">적용된 필터</span>
      {chips.map(({ key, value }) => (
        <NexBadge
          key={key}
          variant="secondary"
          size="sm"
          removable
          onRemove={() => removeChip(key)}
        >
          <span className="text-muted-foreground mr-1">{labels[key]}</span>
          <span className="font-medium">{renderValue(key, value)}</span>
        </NexBadge>
      ))}
    </div>
  );
}
