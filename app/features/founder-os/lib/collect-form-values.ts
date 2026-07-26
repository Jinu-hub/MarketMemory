import type {
  ContentTypeFilter,
  ObservationSource,
  SortMode,
  TimeRange,
} from "../domain/observation.types";
import type { ObservationStrategySnapshot } from "./observation-strategy";

import {
  CONTENT_TYPE_FILTERS,
  OBSERVATION_SOURCES,
  SORT_MODES,
  TIME_RANGES,
} from "../domain/observation.types";
import { normalizeKeywords } from "../domain/match-keywords";
import {
  DEFAULT_COLLECT_LIMIT,
  MAX_COLLECT_LIMIT,
  MAX_KEYWORDS,
  MIN_COLLECT_LIMIT,
} from "./collect-request";
import { buildObservationStrategySnapshot } from "./observation-strategy";

/** 수집 폼에서 다루는 전체 조건 (저장·불러오기 공통) */
export type CollectFormValues = {
  source: ObservationSource;
  keywords: string[];
  domainIds: string[];
  signalIds: string[];
  contentType: ContentTypeFilter;
  sortMode: SortMode;
  timeRange: TimeRange;
  limit: number;
};

export const DEFAULT_COLLECT_FORM_VALUES: CollectFormValues = {
  source: "hacker_news",
  keywords: [],
  domainIds: [],
  signalIds: [],
  contentType: "all",
  sortMode: "relevance",
  timeRange: "all",
  limit: DEFAULT_COLLECT_LIMIT,
};

function asSource(value: string | null | undefined): ObservationSource {
  return OBSERVATION_SOURCES.includes(value as ObservationSource)
    ? (value as ObservationSource)
    : DEFAULT_COLLECT_FORM_VALUES.source;
}

function asContentType(value: string | null | undefined): ContentTypeFilter {
  return CONTENT_TYPE_FILTERS.includes(value as ContentTypeFilter)
    ? (value as ContentTypeFilter)
    : DEFAULT_COLLECT_FORM_VALUES.contentType;
}

function asSortMode(value: string | null | undefined): SortMode {
  return SORT_MODES.includes(value as SortMode)
    ? (value as SortMode)
    : DEFAULT_COLLECT_FORM_VALUES.sortMode;
}

function asTimeRange(value: string | null | undefined): TimeRange {
  return TIME_RANGES.includes(value as TimeRange)
    ? (value as TimeRange)
    : DEFAULT_COLLECT_FORM_VALUES.timeRange;
}

function asLimit(value: number | null | undefined): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_COLLECT_LIMIT;
  }
  return Math.min(MAX_COLLECT_LIMIT, Math.max(MIN_COLLECT_LIMIT, Math.trunc(value)));
}

export function readStrategyIds(
  value: unknown,
): { domainIds: string[]; signalIds: string[] } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { domainIds: [], signalIds: [] };
  }
  const raw = value as ObservationStrategySnapshot;
  const domainIds = Array.isArray(raw.domains)
    ? raw.domains
        .map((item) => item?.id)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    : [];
  const signalIds = Array.isArray(raw.signals)
    ? raw.signals
        .map((item) => item?.id)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    : [];
  return { domainIds, signalIds };
}

export function toCollectFormValues(input: {
  source?: string | null;
  keywords?: string[] | null;
  contentType?: string | null;
  sortMode?: string | null;
  timeRange?: string | null;
  limit?: number | null;
  observationStrategy?: unknown;
}): CollectFormValues {
  const { domainIds, signalIds } = readStrategyIds(input.observationStrategy);
  return {
    source: asSource(input.source),
    keywords: normalizeKeywords(input.keywords ?? []).slice(0, MAX_KEYWORDS),
    domainIds,
    signalIds,
    contentType: asContentType(input.contentType),
    sortMode: asSortMode(input.sortMode),
    timeRange: asTimeRange(input.timeRange),
    limit: asLimit(input.limit),
  };
}

export function strategyFromFormValues(
  values: CollectFormValues,
): ObservationStrategySnapshot | null {
  return buildObservationStrategySnapshot(values.domainIds, values.signalIds);
}
