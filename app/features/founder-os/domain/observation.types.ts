/**
 * Founder OS — Observation 공통 도메인 타입.
 *
 * 외부 플랫폼(Hacker News / GitHub / Reddit)의 응답 구조가 애플리케이션 전체로
 * 퍼지지 않도록, 모든 소스는 Adapter 내부에서 이 공통 타입으로 변환한다.
 */

export const OBSERVATION_SOURCES = ["hacker_news", "github", "reddit"] as const;

export type ObservationSource = (typeof OBSERVATION_SOURCES)[number];

export const OBSERVATION_CONTENT_TYPES = ["post", "comment"] as const;

export type ObservationContentType = (typeof OBSERVATION_CONTENT_TYPES)[number];

/** 수집 조건에서 선택하는 콘텐츠 타입 필터 (`all` 포함) */
export const CONTENT_TYPE_FILTERS = ["all", "post", "comment"] as const;

export type ContentTypeFilter = (typeof CONTENT_TYPE_FILTERS)[number];

/** Hacker News 게시물/댓글 세부 유형 */
export const HACKER_NEWS_OBSERVATION_TYPES = [
  "ask_hn",
  "show_hn",
  "launch_hn",
  "story",
  "comment",
] as const;

export type HackerNewsObservationType =
  (typeof HACKER_NEWS_OBSERVATION_TYPES)[number];

/** 저품질(제목만 있는) 데이터를 식별하기 위한 본문 품질 단계 */
export const OBSERVATION_CONTENT_QUALITIES = [
  "full",
  "title_only",
  "short",
  "empty",
] as const;

export type ObservationContentQuality =
  (typeof OBSERVATION_CONTENT_QUALITIES)[number];

/** 규칙 기반 검토 우선순위 (Pain Level·Opportunity Score가 아님) */
export const OBSERVATION_PRIORITIES = ["high", "medium", "low"] as const;

export type ObservationPriority = (typeof OBSERVATION_PRIORITIES)[number];

export const SORT_MODES = ["relevance", "recent", "popular"] as const;

export type SortMode = (typeof SORT_MODES)[number];

export const TIME_RANGES = ["30d", "90d", "1y", "all"] as const;

export type TimeRange = (typeof TIME_RANGES)[number];

export const COLLECTION_RUN_STATUSES = [
  "pending",
  "running",
  "completed",
  "failed",
  "partial",
] as const;

export type CollectionRunStatus = (typeof COLLECTION_RUN_STATUSES)[number];

/** Adapter가 외부 API 응답을 1차 변환한 결과 */
export interface ExternalObservation {
  source: ObservationSource;
  externalId: string;
  externalParentId?: string | null;
  /** 댓글이 최종적으로 속한 최상위 story ID */
  externalStoryId?: string | null;
  contentType: ObservationContentType;
  title?: string | null;
  body: string;
  author?: string | null;
  community?: string | null;
  /** 게시글이 연결하는 외부 콘텐츠(블로그·제품·GitHub 등) URL */
  externalContentUrl?: string | null;
  /** Hacker News 토론 페이지 URL */
  discussionUrl: string;
  /** 하위 호환용 단일 URL (externalContentUrl ?? discussionUrl) */
  sourceUrl: string;
  score?: number | null;
  commentCount?: number | null;
  hnType?: HackerNewsObservationType | null;
  publishedAt?: Date | null;
  rawPayload: unknown;
}

/** 키워드 매칭·해시·품질·우선순위까지 끝나 DB에 저장할 수 있는 상태 */
export interface NormalizedObservation extends ExternalObservation {
  matchedKeywords: string[];
  fetchedAt: Date;
  contentHash: string;
  contentQuality: ObservationContentQuality;
  hasSubstantiveBody: boolean;
  observationPriority: ObservationPriority;
  priorityReasons: string[];
}

export interface CollectSourceParams {
  keywords: string[];
  contentType: ContentTypeFilter;
  limit: number;
  sortMode: SortMode;
  timeRange: TimeRange;
  /** 외부 API 요청 1건당 타임아웃 (ms) */
  timeoutMs?: number;
}

/** 키워드 단위 요청이 부분 실패했을 때 상위에서 partial 처리하기 위한 정보 */
export interface SourceFetchFailure {
  keyword: string;
  message: string;
}

/** 키워드별 fetch 그룹 — 이후 키워드 균형 배분에 사용한다. */
export interface SourceKeywordGroup {
  keyword: string;
  fetched: number;
  observations: ExternalObservation[];
}

export interface CollectSourceResult {
  /** 외부 API가 반환한 원본 건수 (externalId 중복 제거 이전) */
  fetchedCount: number;
  postFetchedCount: number;
  commentFetchedCount: number;
  groups: SourceKeywordGroup[];
  failures: SourceFetchFailure[];
}

export interface KeywordStat {
  fetched: number;
  matched: number;
  inserted: number;
}

export interface ContentTypeStat {
  post: number;
  comment: number;
}

export interface CollectionRunSummary {
  runId: string;
  status: CollectionRunStatus;
  fetchedCount: number;
  postFetchedCount: number;
  commentFetchedCount: number;
  matchedCount: number;
  filteredByDateCount: number;
  insertedCount: number;
  duplicateCount: number;
  failedCount: number;
  titleOnlyCount: number;
  substantiveBodyCount: number;
  highPriorityCount: number;
  keywordStats: Record<string, KeywordStat>;
  contentTypeStats: ContentTypeStat;
  sortMode: SortMode;
  timeRange: TimeRange;
  durationMs: number;
  errorMessage: string | null;
}
