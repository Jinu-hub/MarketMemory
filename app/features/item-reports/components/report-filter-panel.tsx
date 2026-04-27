import { SearchIcon, XIcon } from "lucide-react";
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
import { cn } from "~/core/lib/utils";

import {
  REPORT_CATEGORIES,
  REPORT_CATEGORY_LABELS_KO,
  REPORT_REGIONS,
  REPORT_REGION_LABELS_KO,
  REPORT_TIERS,
  REPORT_TIER_LABELS_KO,
  REPORT_TYPES,
  REPORT_TYPE_LABELS_KO,
} from "../constants";

const ALL_VALUE = "__all__";

type ReportFilterPanelProps = {
  className?: string;
  facets?: {
    categories: Record<string, number>;
    reportTypes: Record<string, number>;
    reportTiers: Record<string, number>;
    regions: Record<string, number>;
    languages: Record<string, number>;
  };
};

/**
 * Left-rail filter panel for the list screen.
 *
 * Mixes Nex primitives (`NexInput`, `NexButton`) with shadcn's `Select` and
 * `Label` — these have no Nex equivalent today, so we keep them but style
 * the panel container with semantic tokens so it adapts to warm/dark themes.
 */
export function ReportFilterPanel({
  className,
  facets,
}: ReportFilterPanelProps) {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);

  const updateParam = (key: string, value: string) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (!value || value === ALL_VALUE) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        next.delete("page");
        return next;
      },
      { replace: true },
    );
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    updateParam("q", q.trim());
  };

  const reset = () => {
    setParams(new URLSearchParams(), { replace: true });
    setQ("");
  };

  const hasActiveFilters =
    Array.from(params.keys()).filter((key) => key !== "sort" && key !== "page")
      .length > 0;

  const selectedCategory = params.get("category") ?? ALL_VALUE;
  const selectedType = params.get("report_type") ?? ALL_VALUE;
  const selectedTier = params.get("report_tier") ?? ALL_VALUE;
  const selectedRegion = params.get("region") ?? ALL_VALUE;
  const selectedLang = params.get("lang") ?? ALL_VALUE;

  const langOptions = Object.keys(facets?.languages ?? {}).sort();

  return (
    <aside
      className={cn(
        "border-border bg-card/60 flex flex-col gap-5 rounded-xl border p-5",
        className,
      )}
      aria-label="리포트 필터"
    >
      <form onSubmit={submitSearch} className="space-y-2">
        <Label htmlFor="report-search" className="text-xs font-medium">
          검색
        </Label>
        <NexInput
          id="report-search"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="제목 또는 요약 검색"
          leftIcon={<SearchIcon className="size-4 opacity-70" />}
          inputSize="sm"
        />
      </form>

      <FilterSelect
        label="카테고리"
        value={selectedCategory}
        onChange={(value) => updateParam("category", value)}
        options={[
          { value: ALL_VALUE, label: "전체 카테고리" },
          ...REPORT_CATEGORIES.map((category) => ({
            value: category,
            label: `${REPORT_CATEGORY_LABELS_KO[category]}${facets?.categories[category] ? ` (${facets.categories[category]})` : ""}`,
          })),
        ]}
      />

      <FilterSelect
        label="리포트 유형"
        value={selectedType}
        onChange={(value) => updateParam("report_type", value)}
        options={[
          { value: ALL_VALUE, label: "전체 유형" },
          ...REPORT_TYPES.map((type) => ({
            value: type,
            label: `${REPORT_TYPE_LABELS_KO[type]}${facets?.reportTypes[type] ? ` (${facets.reportTypes[type]})` : ""}`,
          })),
        ]}
      />

      <FilterSelect
        label="등급"
        value={selectedTier}
        onChange={(value) => updateParam("report_tier", value)}
        options={[
          { value: ALL_VALUE, label: "전체 등급" },
          ...REPORT_TIERS.map((tier) => ({
            value: tier,
            label: `${REPORT_TIER_LABELS_KO[tier]}${facets?.reportTiers[tier] ? ` (${facets.reportTiers[tier]})` : ""}`,
          })),
        ]}
      />

      <FilterSelect
        label="지역"
        value={selectedRegion}
        onChange={(value) => updateParam("region", value)}
        options={[
          { value: ALL_VALUE, label: "전체 지역" },
          ...REPORT_REGIONS.filter(
            (region) => !facets || (facets.regions[region] ?? 0) > 0,
          ).map((region) => ({
            value: region,
            label: `${REPORT_REGION_LABELS_KO[region] ?? region}${facets?.regions[region] ? ` (${facets.regions[region]})` : ""}`,
          })),
        ]}
      />

      {langOptions.length > 1 ? (
        <FilterSelect
          label="언어"
          value={selectedLang}
          onChange={(value) => updateParam("lang", value)}
          options={[
            { value: ALL_VALUE, label: "전체 언어" },
            ...langOptions.map((lang) => ({
              value: lang,
              label: `${lang.toUpperCase()}${facets?.languages[lang] ? ` (${facets.languages[lang]})` : ""}`,
            })),
          ]}
        />
      ) : null}

      {hasActiveFilters ? (
        <NexButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={reset}
          leftIcon={<XIcon className="size-4" />}
          className="justify-start"
        >
          필터 초기화
        </NexButton>
      ) : null}
    </aside>
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
};

function FilterSelect({ label, value, onChange, options }: FilterSelectProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
