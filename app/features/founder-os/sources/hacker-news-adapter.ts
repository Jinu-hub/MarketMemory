import type {
  CollectSourceParams,
  CollectSourceResult,
  ExternalObservation,
  HackerNewsObservationType,
  ObservationContentType,
  SortMode,
  SourceFetchFailure,
  SourceKeywordGroup,
  TimeRange,
} from "../domain/observation.types";
import type { ObservationSourceAdapter } from "./source-adapter";

import { allocateCollectionQuota } from "../domain/collection-quota";
import {
  DEFAULT_SOURCE_TIMEOUT_MS,
  fetchJsonWithTimeout,
} from "./source-adapter";

const ALGOLIA_SEARCH_URL = "https://hn.algolia.com/api/v1/search";
const ALGOLIA_SEARCH_BY_DATE_URL =
  "https://hn.algolia.com/api/v1/search_by_date";
const HN_ITEM_URL = "https://news.ycombinator.com/item?id=";
const MAX_HITS_PER_PAGE = 100;
/** 균형 배분 이후에도 후보가 충분하도록 목표보다 넉넉히 가져온다. */
const FETCH_BUFFER_MULTIPLIER = 2;
const MIN_FETCH_PER_QUERY = 20;

const TIME_RANGE_DAYS: Record<Exclude<TimeRange, "all">, number> = {
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

type AlgoliaHit = {
  objectID?: unknown;
  story_id?: unknown;
  parent_id?: unknown;
  title?: unknown;
  story_title?: unknown;
  comment_text?: unknown;
  story_text?: unknown;
  author?: unknown;
  url?: unknown;
  story_url?: unknown;
  points?: unknown;
  num_comments?: unknown;
  created_at?: unknown;
  _tags?: unknown;
};

function asString(value: unknown): string | null {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (
    typeof value === "string" &&
    value.trim() !== "" &&
    !Number.isNaN(Number(value))
  ) {
    return Number(value);
  }
  return null;
}

function asDate(value: unknown): Date | null {
  const raw = asString(value);
  if (!raw) {
    return null;
  }
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function readTags(hit: AlgoliaHit): string[] {
  return Array.isArray(hit._tags)
    ? hit._tags.filter((tag): tag is string => typeof tag === "string")
    : [];
}

function resolveContentType(hit: AlgoliaHit): ObservationContentType {
  const tags = readTags(hit);
  if (tags.includes("comment") || asString(hit.comment_text)) {
    return "comment";
  }
  return "post";
}

/**
 * _tags 또는 제목을 이용해 HN 게시물/댓글 세부 유형을 판별한다.
 */
export function resolveHnType(
  hit: AlgoliaHit,
  contentType: ObservationContentType,
): HackerNewsObservationType {
  if (contentType === "comment") {
    return "comment";
  }
  const tags = readTags(hit);
  const title = (
    asString(hit.title) ??
    asString(hit.story_title) ??
    ""
  ).toLowerCase();
  if (tags.includes("ask_hn") || title.startsWith("ask hn")) {
    return "ask_hn";
  }
  if (tags.includes("show_hn") || title.startsWith("show hn")) {
    return "show_hn";
  }
  if (tags.includes("launch_hn") || title.startsWith("launch hn")) {
    return "launch_hn";
  }
  return "story";
}

function toExternalObservation(hit: AlgoliaHit): ExternalObservation | null {
  const externalId = asString(hit.objectID);
  if (!externalId) {
    return null;
  }

  const contentType = resolveContentType(hit);
  const hnType = resolveHnType(hit, contentType);
  const title = asString(hit.title) ?? asString(hit.story_title);
  const body =
    asString(hit.comment_text) ?? asString(hit.story_text) ?? title ?? "";
  if (body.trim().length === 0) {
    return null;
  }

  const externalStoryId =
    contentType === "comment"
      ? (asString(hit.story_id) ?? asString(hit.parent_id))
      : null;
  const externalParentId = asString(hit.parent_id) ?? asString(hit.story_id);

  const externalContentUrl = asString(hit.url) ?? asString(hit.story_url);
  // 댓글은 자신의 item URL, 게시글은 자신의 item URL을 토론 URL로 사용한다.
  const discussionUrl = `${HN_ITEM_URL}${externalId}`;

  return {
    source: "hacker_news",
    externalId,
    externalParentId,
    externalStoryId,
    contentType,
    title,
    body,
    author: asString(hit.author),
    community: "Hacker News",
    externalContentUrl: externalContentUrl ?? null,
    discussionUrl,
    sourceUrl: externalContentUrl ?? discussionUrl,
    score: asNumber(hit.points),
    commentCount: asNumber(hit.num_comments),
    hnType,
    publishedAt: asDate(hit.created_at),
    rawPayload: hit,
  };
}

function timeRangeCutoffSeconds(
  timeRange: TimeRange,
  now: Date,
): number | null {
  if (timeRange === "all") {
    return null;
  }
  const ms = now.getTime() - TIME_RANGE_DAYS[timeRange] * 24 * 60 * 60 * 1000;
  return Math.floor(ms / 1000);
}

export interface HnSearchOptions {
  keyword: string;
  tag: "story" | "comment";
  sortMode: SortMode;
  timeRange: TimeRange;
  hitsPerPage: number;
  now?: Date;
}

export function buildSearchUrl(options: HnSearchOptions): string {
  const now = options.now ?? new Date();
  // 최신순은 search_by_date, 그 외(관련도·반응순)는 relevance 기반 search를 사용한다.
  const base =
    options.sortMode === "recent"
      ? ALGOLIA_SEARCH_BY_DATE_URL
      : ALGOLIA_SEARCH_URL;
  const url = new URL(base);
  url.searchParams.set("query", options.keyword);
  url.searchParams.set("tags", options.tag);
  url.searchParams.set(
    "hitsPerPage",
    String(Math.min(Math.max(options.hitsPerPage, 1), MAX_HITS_PER_PAGE)),
  );
  const cutoff = timeRangeCutoffSeconds(options.timeRange, now);
  if (cutoff !== null) {
    url.searchParams.set("numericFilters", `created_at_i>=${cutoff}`);
  }
  return url.toString();
}

/** 반응순 정렬을 위한 단순 점수 (points + comment_count) */
export function popularityScore(observation: ExternalObservation): number {
  return (observation.score ?? 0) + (observation.commentCount ?? 0);
}

function sortObservations(
  observations: ExternalObservation[],
  sortMode: SortMode,
): ExternalObservation[] {
  if (sortMode === "relevance") {
    return observations;
  }
  const sorted = [...observations];
  if (sortMode === "recent") {
    sorted.sort(
      (a, b) =>
        (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0),
    );
  } else {
    sorted.sort((a, b) => popularityScore(b) - popularityScore(a));
  }
  return sorted;
}

function tagsForContentType(
  contentType: CollectSourceParams["contentType"],
): Array<"story" | "comment"> {
  if (contentType === "post") {
    return ["story"];
  }
  if (contentType === "comment") {
    return ["comment"];
  }
  return ["story", "comment"];
}

/**
 * Hacker News Algolia API Adapter.
 *
 * 키워드 × 콘텐츠 타입 단위로 요청을 보낸다. 댓글은 comment_text에 키워드가 포함된
 * 데이터를 직접 검색한다(방식 A). 일부 요청이 실패하더라도 나머지 결과는 그대로 반환하고,
 * 호출부에서 `failures`가 남아 있으면 Collection Run을 partial로 기록한다.
 */
export const hackerNewsAdapter: ObservationSourceAdapter = {
  source: "hacker_news",
  implemented: true,

  async collect(params: CollectSourceParams): Promise<CollectSourceResult> {
    const timeoutMs = params.timeoutMs ?? DEFAULT_SOURCE_TIMEOUT_MS;
    const failures: SourceFetchFailure[] = [];
    const groups: SourceKeywordGroup[] = [];
    const tags = tagsForContentType(params.contentType);

    const quota = allocateCollectionQuota(
      params.limit,
      params.keywords.length,
      params.contentType,
    );
    const hitsPerPage = Math.min(
      MAX_HITS_PER_PAGE,
      Math.max(
        MIN_FETCH_PER_QUERY,
        quota.perKeywordLimit * FETCH_BUFFER_MULTIPLIER,
      ),
    );

    let postFetchedCount = 0;
    let commentFetchedCount = 0;

    for (const keyword of params.keywords) {
      const collected: ExternalObservation[] = [];
      let keywordFetched = 0;

      for (const tag of tags) {
        try {
          const payload = await fetchJsonWithTimeout(
            buildSearchUrl({
              keyword,
              tag,
              sortMode: params.sortMode,
              timeRange: params.timeRange,
              hitsPerPage,
            }),
            timeoutMs,
          );
          const hits =
            payload && typeof payload === "object" && "hits" in payload
              ? (payload as { hits: unknown }).hits
              : null;
          if (!Array.isArray(hits)) {
            throw new Error("외부 API 응답 형식이 예상과 다릅니다.");
          }

          keywordFetched += hits.length;
          if (tag === "story") {
            postFetchedCount += hits.length;
          } else {
            commentFetchedCount += hits.length;
          }

          for (const hit of hits) {
            if (!hit || typeof hit !== "object") {
              continue;
            }
            const observation = toExternalObservation(hit as AlgoliaHit);
            if (observation) {
              collected.push(observation);
            }
          }
        } catch (error) {
          failures.push({
            keyword: `${keyword} (${tag})`,
            message:
              error instanceof Error
                ? error.message
                : "알 수 없는 오류가 발생했습니다.",
          });
        }
      }

      groups.push({
        keyword,
        fetched: keywordFetched,
        observations: sortObservations(collected, params.sortMode),
      });
    }

    return {
      fetchedCount: postFetchedCount + commentFetchedCount,
      postFetchedCount,
      commentFetchedCount,
      groups,
      failures,
    };
  },
};

export const __testing = {
  toExternalObservation,
  buildSearchUrl,
  resolveHnType,
};
