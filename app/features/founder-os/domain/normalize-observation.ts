import type {
  ExternalObservation,
  NormalizedObservation,
  TimeRange,
} from "./observation.types";

import { classifyContentQuality, isSubstantiveBody } from "./content-quality";
import { createContentHash } from "./create-content-hash";
import { htmlToPlainText } from "./html-text";
import { matchKeywords } from "./match-keywords";
import { computeObservationPriority } from "./observation-priority";

/** 여러 키워드 검색 결과를 합칠 때 같은 콘텐츠가 반복되므로 externalId로 먼저 정리한다. */
export function dedupeByExternalId<T extends { externalId: string }>(
  items: T[],
): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (seen.has(item.externalId)) {
      continue;
    }
    seen.add(item.externalId);
    result.push(item);
  }
  return result;
}

const TIME_RANGE_DAYS: Record<Exclude<TimeRange, "all">, number> = {
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

export interface TimeRangeFilterResult<T> {
  kept: T[];
  excludedCount: number;
}

/**
 * publishedAt 기준으로 기간 필터를 적용한다.
 * 작성일을 알 수 없는 데이터(publishedAt 없음)는 제외하지 않고 유지한다.
 */
export function filterByTimeRange<T extends { publishedAt?: Date | null }>(
  items: T[],
  timeRange: TimeRange,
  now: Date = new Date(),
): TimeRangeFilterResult<T> {
  if (timeRange === "all") {
    return { kept: items, excludedCount: 0 };
  }
  const cutoff =
    now.getTime() - TIME_RANGE_DAYS[timeRange] * 24 * 60 * 60 * 1000;
  const kept: T[] = [];
  let excludedCount = 0;
  for (const item of items) {
    if (!item.publishedAt) {
      kept.push(item);
      continue;
    }
    if (item.publishedAt.getTime() >= cutoff) {
      kept.push(item);
    } else {
      excludedCount += 1;
    }
  }
  return { kept, excludedCount };
}

/**
 * 외부 관찰 데이터 한 건을 저장 가능한 형태로 정규화한다.
 *
 * - HTML 본문을 평문으로 정리 (raw_payload는 그대로 유지)
 * - title/body 기준 키워드 매칭 → 매칭 0건이면 null 반환(저장 대상 제외)
 * - 본문 품질·검토 우선순위·content hash 계산
 */
export function normalizeExternalObservation(
  item: ExternalObservation,
  keywords: string[],
  fetchedAt: Date,
): NormalizedObservation | null {
  const title = item.title ? htmlToPlainText(item.title) : null;
  const body = htmlToPlainText(item.body);
  const matchedKeywords = matchKeywords({ title, body }, keywords);
  if (matchedKeywords.length === 0) {
    return null;
  }

  const normalizedTitle = title && title.length > 0 ? title : null;
  const contentQuality = classifyContentQuality(normalizedTitle, body);
  const hasSubstantiveBody = isSubstantiveBody(contentQuality);
  const { priority, reasons } = computeObservationPriority({
    contentType: item.contentType,
    hnType: item.hnType,
    body,
    hasSubstantiveBody,
    score: item.score,
    commentCount: item.commentCount,
  });

  const contentHash = createContentHash({
    source: item.source,
    title: normalizedTitle,
    body,
    author: item.author,
    publishedAt: item.publishedAt ?? null,
  });

  return {
    ...item,
    title: normalizedTitle,
    body,
    matchedKeywords,
    contentHash,
    fetchedAt,
    contentQuality,
    hasSubstantiveBody,
    observationPriority: priority,
    priorityReasons: reasons,
  };
}

/** 그룹(키워드) 단위로 정규화하고 매칭되지 않은 항목은 제외한다. */
export function normalizeKeywordGroup(
  items: ExternalObservation[],
  keywords: string[],
  fetchedAt: Date,
): NormalizedObservation[] {
  const normalized: NormalizedObservation[] = [];
  for (const item of items) {
    const result = normalizeExternalObservation(item, keywords, fetchedAt);
    if (result) {
      normalized.push(result);
    }
  }
  return normalized;
}
