import type { ObservationSource } from "../domain/observation.types";

import { z } from "zod";

import {
  CONTENT_TYPE_FILTERS,
  OBSERVATION_SOURCES,
  SORT_MODES,
  TIME_RANGES,
} from "../domain/observation.types";

export const DEFAULT_COLLECT_LIMIT = 50;
export const MIN_COLLECT_LIMIT = 1;
export const MAX_COLLECT_LIMIT = 200;
export const MAX_KEYWORDS = 10;

/** 화면·API 양쪽에서 같은 규칙으로 입력을 검증한다. */
export const collectRequestSchema = z.object({
  source: z.enum(OBSERVATION_SOURCES, {
    errorMap: () => ({ message: "지원하지 않는 소스입니다." }),
  }),
  keywords: z
    .array(z.string())
    .min(1, "검색 키워드를 한 개 이상 입력해 주세요.")
    .max(
      MAX_KEYWORDS,
      `키워드는 최대 ${MAX_KEYWORDS}개까지 입력할 수 있습니다.`,
    ),
  /** 관찰 대상 ID (UI 선택값, 선택 사항) */
  domainIds: z.array(z.string()).default([]),
  /** 문제 신호 ID (UI 선택값, 선택 사항) */
  signalIds: z.array(z.string()).default([]),
  contentType: z.enum(CONTENT_TYPE_FILTERS).default("all"),
  sortMode: z.enum(SORT_MODES).default("relevance"),
  timeRange: z.enum(TIME_RANGES).default("all"),
  limit: z
    .number()
    .int("최대 수집 개수는 정수여야 합니다.")
    .min(
      MIN_COLLECT_LIMIT,
      `최대 수집 개수는 ${MIN_COLLECT_LIMIT} 이상이어야 합니다.`,
    )
    .max(
      MAX_COLLECT_LIMIT,
      `최대 수집 개수는 ${MAX_COLLECT_LIMIT} 이하여야 합니다.`,
    )
    .default(DEFAULT_COLLECT_LIMIT),
});

export type CollectRequest = z.infer<typeof collectRequestSchema>;

export type SourceOption = {
  value: ObservationSource;
  label: string;
  description: string;
  implemented: boolean;
};

/** 화면에서 선택 가능한 소스 목록 (adapter 모듈을 클라이언트로 끌어오지 않기 위해 분리) */
export const SOURCE_OPTIONS: SourceOption[] = [
  {
    value: "hacker_news",
    label: "Hacker News",
    description: "Algolia 공개 검색 API로 story·comment를 수집합니다.",
    implemented: true,
  },
  {
    value: "github",
    label: "GitHub Issues",
    description: "인터페이스만 준비되어 있습니다.",
    implemented: false,
  },
  {
    value: "reddit",
    label: "Reddit",
    description: "인터페이스만 준비되어 있습니다.",
    implemented: false,
  },
];

export const SOURCE_NOT_IMPLEMENTED_MESSAGE =
  "이 소스는 아직 연결되지 않았습니다.";

export const CONTENT_TYPE_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "post", label: "게시물" },
  { value: "comment", label: "댓글" },
] as const;

export const SORT_MODE_OPTIONS = [
  { value: "relevance", label: "관련도순" },
  { value: "recent", label: "최신순" },
  { value: "popular", label: "반응순" },
] as const;

export const TIME_RANGE_OPTIONS = [
  { value: "30d", label: "최근 30일" },
  { value: "90d", label: "최근 90일" },
  { value: "1y", label: "최근 1년" },
  { value: "all", label: "전체" },
] as const;

export function findSourceOption(value: string): SourceOption | undefined {
  return SOURCE_OPTIONS.find((option) => option.value === value);
}
