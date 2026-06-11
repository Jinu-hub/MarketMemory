import { SearchIcon, XIcon } from "lucide-react";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/core/components/ui/tabs";
import { cn } from "~/core/lib/utils";

import { ReportDateFilter } from "./report-date-filter";
import {
  useItemReportsLocale,
  useItemReportsUi,
  formatItemReportsCopy,
} from "../i18n";
import {
  countParamsInKeys,
  FILTER_SELECT_ALL_VALUE,
  REPORT_LIST_PANEL_ATTRIBUTE_KEYS,
  REPORT_LIST_PARAM,
} from "../lib/filter-keys";
import { hasActiveListFilterParams } from "../lib/list-filter-active";
import {
  countReportDateParams,
  hasReportDateParams,
} from "../lib/report-date-params";
import { useItemReportsSearchParams } from "../lib/use-item-reports-search-params";
import {
  getCategoryLabel,
  getRegionLabel,
  getReportTierLabel,
  getReportTypeLabel,
} from "../i18n/labels";
import {
  REPORT_CATEGORIES,
  REPORT_REGIONS,
  REPORT_TIERS,
  REPORT_TYPES,
} from "../constants";

type FilterPanelTab = "attributes" | "period";

function initialPanelTab(params: URLSearchParams): FilterPanelTab {
  return hasReportDateParams(params) ? "period" : "attributes";
}

type ReportFilterPanelProps = {
  className?: string;
  availableYears?: number[];
  facets?: {
    categories: Record<string, number>;
    reportTypes: Record<string, number>;
    reportTiers: Record<string, number>;
    regions: Record<string, number>;
    languages: Record<string, number>;
  };
};

export function ReportFilterPanel({
  className,
  facets,
  availableYears = [],
}: ReportFilterPanelProps) {
  const ui = useItemReportsUi();
  const locale = useItemReportsLocale();
  const { searchParams, setFilterParam, resetAllParams } =
    useItemReportsSearchParams();
  const [q, setQ] = useState(
    searchParams.get(REPORT_LIST_PARAM.q) ?? "",
  );
  const [panelTab, setPanelTab] = useState<FilterPanelTab>(() =>
    initialPanelTab(searchParams),
  );

  useEffect(() => {
    setQ(searchParams.get(REPORT_LIST_PARAM.q) ?? "");
  }, [searchParams]);

  useEffect(() => {
    if (hasReportDateParams(searchParams)) {
      setPanelTab("period");
    }
  }, [searchParams]);

  const attributeFilterCount = countParamsInKeys(
    searchParams,
    REPORT_LIST_PANEL_ATTRIBUTE_KEYS,
  );
  const dateFilterCount = countReportDateParams(searchParams);
  const hasActiveFilters = hasActiveListFilterParams(searchParams);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setFilterParam(REPORT_LIST_PARAM.q, q.trim(), "");
  };

  const reset = () => {
    resetAllParams();
    setQ("");
  };

  const selectedCategory =
    searchParams.get(REPORT_LIST_PARAM.category) ?? FILTER_SELECT_ALL_VALUE;
  const selectedType =
    searchParams.get(REPORT_LIST_PARAM.reportType) ?? FILTER_SELECT_ALL_VALUE;
  const selectedTier =
    searchParams.get(REPORT_LIST_PARAM.reportTier) ?? FILTER_SELECT_ALL_VALUE;
  const selectedRegion =
    searchParams.get(REPORT_LIST_PARAM.region) ?? FILTER_SELECT_ALL_VALUE;
  const selectedLang =
    searchParams.get(REPORT_LIST_PARAM.lang) ?? FILTER_SELECT_ALL_VALUE;

  const langOptions = Object.keys(facets?.languages ?? {}).sort();

  const facetSuffix = (count?: number) =>
    count ? ` (${count})` : "";

  return (
    <aside
      className={cn(
        "border-border bg-card/60 flex flex-col gap-5 rounded-xl border p-5",
        className,
      )}
      aria-label={ui.filter.panelAria}
    >
      <form onSubmit={submitSearch} className="space-y-2">
        <Label htmlFor="report-search" className="text-xs font-medium">
          {ui.filter.searchLabel}
        </Label>
        <NexInput
          id="report-search"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder={ui.filter.searchPlaceholder}
          leftIcon={<SearchIcon className="size-4 opacity-70" />}
          inputSize="sm"
        />
      </form>

      <Tabs
        value={panelTab}
        onValueChange={(value) => setPanelTab(value as FilterPanelTab)}
        className="gap-4"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="attributes" className="gap-1.5 text-xs">
            {ui.filter.attributesTab}
            {attributeFilterCount > 0 ? (
              <FilterTabBadge
                count={attributeFilterCount}
                ariaLabel={formatItemReportsCopy(ui.filter.appliedBadgeAria, {
                  count: attributeFilterCount,
                })}
              />
            ) : null}
          </TabsTrigger>
          <TabsTrigger
            value="period"
            className="gap-1.5 text-xs"
            disabled={availableYears.length === 0}
          >
            {ui.filter.periodTab}
            {dateFilterCount > 0 ? (
              <FilterTabBadge
                count={dateFilterCount}
                ariaLabel={formatItemReportsCopy(ui.filter.appliedBadgeAria, {
                  count: dateFilterCount,
                })}
              />
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attributes" className="mt-0 flex flex-col gap-5">
          <FilterSelect
            label={ui.filter.categoryLabel}
            value={selectedCategory}
            onChange={(value) =>
              setFilterParam(REPORT_LIST_PARAM.category, value)
            }
            options={[
              { value: FILTER_SELECT_ALL_VALUE, label: ui.filter.allCategories },
              ...REPORT_CATEGORIES.map((category) => ({
                value: category,
                label: `${getCategoryLabel(category, locale)}${facetSuffix(facets?.categories[category])}`,
              })),
            ]}
          />

          <FilterSelect
            label={ui.filter.typeLabel}
            value={selectedType}
            onChange={(value) =>
              setFilterParam(REPORT_LIST_PARAM.reportType, value)
            }
            options={[
              { value: FILTER_SELECT_ALL_VALUE, label: ui.filter.allTypes },
              ...REPORT_TYPES.map((type) => ({
                value: type,
                label: `${getReportTypeLabel(type, locale)}${facetSuffix(facets?.reportTypes[type])}`,
              })),
            ]}
          />

          <FilterSelect
            label={ui.filter.tierLabel}
            value={selectedTier}
            onChange={(value) =>
              setFilterParam(REPORT_LIST_PARAM.reportTier, value)
            }
            options={[
              { value: FILTER_SELECT_ALL_VALUE, label: ui.filter.allTiers },
              ...REPORT_TIERS.map((tier) => ({
                value: tier,
                label: `${getReportTierLabel(tier, locale)}${facetSuffix(facets?.reportTiers[tier])}`,
              })),
            ]}
          />

          <FilterSelect
            label={ui.filter.regionLabel}
            value={selectedRegion}
            onChange={(value) =>
              setFilterParam(REPORT_LIST_PARAM.region, value)
            }
            options={[
              { value: FILTER_SELECT_ALL_VALUE, label: ui.filter.allRegions },
              ...REPORT_REGIONS.filter(
                (region) => !facets || (facets.regions[region] ?? 0) > 0,
              ).map((region) => ({
                value: region,
                label: `${getRegionLabel(region, locale)}${facetSuffix(facets?.regions[region])}`,
              })),
            ]}
          />

          {langOptions.length > 1 ? (
            <FilterSelect
              label={ui.filter.languageLabel}
              value={selectedLang}
              onChange={(value) =>
                setFilterParam(REPORT_LIST_PARAM.lang, value)
              }
              options={[
                { value: FILTER_SELECT_ALL_VALUE, label: ui.filter.allLanguages },
                ...langOptions.map((lang) => ({
                  value: lang,
                  label: `${lang.toUpperCase()}${facetSuffix(facets?.languages[lang])}`,
                })),
              ]}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="period" className="mt-0">
          {availableYears.length > 0 ? (
            <ReportDateFilter availableYears={availableYears} hideTitle />
          ) : (
            <p className="text-muted-foreground text-xs">
              {ui.filter.noPeriodReports}
            </p>
          )}
        </TabsContent>
      </Tabs>

      {hasActiveFilters ? (
        <NexButton
          type="button"
          variant="ghost"
          size="sm"
          onClick={reset}
          leftIcon={<XIcon className="size-4" />}
          className="justify-start"
        >
          {ui.filter.resetFilters}
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

function FilterTabBadge({
  count,
  ariaLabel,
}: {
  count: number;
  ariaLabel: string;
}) {
  return (
    <span
      className="bg-primary text-primary-foreground inline-flex min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-4 font-medium tabular-nums"
      aria-label={ariaLabel}
    >
      {count}
    </span>
  );
}

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
