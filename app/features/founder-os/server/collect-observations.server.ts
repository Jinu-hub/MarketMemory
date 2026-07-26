import type { KeywordGroup } from "../domain/collection-quota";
import type {
  CollectionRunStatus,
  CollectionRunSummary,
  ContentTypeStat,
  KeywordStat,
  NormalizedObservation,
} from "../domain/observation.types";
import type { CollectRequest } from "../lib/collect-request";
import type { ObservationSourceAdapter } from "../sources/source-adapter";
import type { CollectionRepository } from "./collection-repository";

import {
  allocateCollectionQuota,
  mergeBalancedResults,
  prepareGroups,
} from "../domain/collection-quota";
import { normalizeKeywords } from "../domain/match-keywords";
import {
  filterByTimeRange,
  normalizeKeywordGroup,
} from "../domain/normalize-observation";
import { buildObservationStrategySnapshot } from "../lib/observation-strategy";
import { SourceNotImplementedError } from "../sources/source-adapter";

const MAX_ERROR_MESSAGE_LENGTH = 500;

export interface CollectObservationsDeps {
  repository: CollectionRepository;
  adapter: ObservationSourceAdapter;
  now?: () => Date;
}

function buildErrorMessage(parts: string[]): string | null {
  if (parts.length === 0) {
    return null;
  }
  const joined = parts.join(" / ");
  return joined.length > MAX_ERROR_MESSAGE_LENGTH
    ? `${joined.slice(0, MAX_ERROR_MESSAGE_LENGTH)}…`
    : joined;
}

function emptyKeywordStats(keywords: string[]): Record<string, KeywordStat> {
  const stats: Record<string, KeywordStat> = {};
  for (const keyword of keywords) {
    stats[keyword] = { fetched: 0, matched: 0, inserted: 0 };
  }
  return stats;
}

function countContentTypes(items: NormalizedObservation[]): ContentTypeStat {
  let post = 0;
  let comment = 0;
  for (const item of items) {
    if (item.contentType === "post") {
      post += 1;
    } else {
      comment += 1;
    }
  }
  return { post, comment };
}

/**
 * Founder OS 관찰 데이터 수집 파이프라인.
 *
 * 외부 API 조회 → 기간 필터 → 키워드 매칭·정규화 → 키워드/타입 균형 배분 →
 * 중복 제거 → 저장 → 실행 이력·통계 기록까지 담당한다.
 * 분석/LLM 단계는 이번 범위에 포함하지 않으며, 저장 구조만 확장 가능하게 유지한다.
 */
export async function collectObservations(
  request: CollectRequest,
  deps: CollectObservationsDeps,
): Promise<CollectionRunSummary> {
  const { repository, adapter } = deps;
  const now = deps.now ?? (() => new Date());

  if (!adapter.implemented) {
    throw new SourceNotImplementedError(adapter.source);
  }

  const keywords = normalizeKeywords(request.keywords);
  if (keywords.length === 0) {
    throw new Error("검색 키워드를 한 개 이상 입력해 주세요.");
  }

  const startedAt = now();
  const runId = await repository.createRun({
    source: request.source,
    keywords,
    contentType: request.contentType,
    sortMode: request.sortMode,
    timeRange: request.timeRange,
    limit: request.limit,
    observationStrategy: buildObservationStrategySnapshot(
      request.domainIds ?? [],
      request.signalIds ?? [],
    ),
    startedAt,
  });

  const finish = async (
    status: CollectionRunStatus,
    counts: Omit<
      CollectionRunSummary,
      "runId" | "status" | "durationMs" | "sortMode" | "timeRange"
    >,
  ): Promise<CollectionRunSummary> => {
    const finishedAt = now();
    const durationMs = Math.max(0, finishedAt.getTime() - startedAt.getTime());
    await repository.finishRun(runId, {
      status,
      finishedAt,
      durationMs,
      sortMode: request.sortMode,
      timeRange: request.timeRange,
      ...counts,
    });
    return {
      runId,
      status,
      durationMs,
      sortMode: request.sortMode,
      timeRange: request.timeRange,
      ...counts,
    };
  };

  const baseCounts = {
    fetchedCount: 0,
    postFetchedCount: 0,
    commentFetchedCount: 0,
    matchedCount: 0,
    filteredByDateCount: 0,
    insertedCount: 0,
    duplicateCount: 0,
    failedCount: 0,
    titleOnlyCount: 0,
    substantiveBodyCount: 0,
    highPriorityCount: 0,
    keywordStats: emptyKeywordStats(keywords),
    contentTypeStats: { post: 0, comment: 0 } as ContentTypeStat,
    errorMessage: null as string | null,
  };

  let fetched;
  try {
    fetched = await adapter.collect({
      keywords,
      contentType: request.contentType,
      limit: request.limit,
      sortMode: request.sortMode,
      timeRange: request.timeRange,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "외부 API 호출에 실패했습니다.";
    console.error("[founder-os] source collect failed", {
      runId,
      source: request.source,
      error: message,
    });
    return finish("failed", { ...baseCounts, errorMessage: message });
  }

  const failureMessages = fetched.failures.map(
    (failure) => `${failure.keyword}: ${failure.message}`,
  );
  const allRequestsFailed =
    fetched.failures.length > 0 &&
    fetched.groups.every((group) => group.observations.length === 0);

  if (allRequestsFailed) {
    return finish("failed", {
      ...baseCounts,
      fetchedCount: fetched.fetchedCount,
      postFetchedCount: fetched.postFetchedCount,
      commentFetchedCount: fetched.commentFetchedCount,
      errorMessage: buildErrorMessage(failureMessages),
    });
  }

  const fetchedAt = now();
  let filteredByDateCount = 0;
  const keywordFetched: Record<string, number> = {};
  const matchedGroups: KeywordGroup[] = fetched.groups.map((group) => {
    keywordFetched[group.keyword] = group.fetched;
    const { kept, excludedCount } = filterByTimeRange(
      group.observations,
      request.timeRange,
      fetchedAt,
    );
    filteredByDateCount += excludedCount;
    return {
      keyword: group.keyword,
      items: normalizeKeywordGroup(kept, keywords, fetchedAt),
    };
  });

  const prepared = prepareGroups(matchedGroups);
  const matchedCount = prepared.itemsById.size;

  const quota = allocateCollectionQuota(
    request.limit,
    keywords.length,
    request.contentType,
  );
  const { selected, primaryById } = mergeBalancedResults(
    matchedGroups,
    request.limit,
    quota,
  );

  const keywordStats = emptyKeywordStats(keywords);
  for (const keyword of keywords) {
    keywordStats[keyword].fetched = keywordFetched[keyword] ?? 0;
  }
  for (const [id] of prepared.itemsById) {
    const keyword = prepared.primaryById.get(id);
    if (keyword && keywordStats[keyword]) {
      keywordStats[keyword].matched += 1;
    }
  }

  let duplicateCount = prepared.withinRunDuplicateCount;
  let insertedCount = 0;
  let failedCount = 0;
  const errorParts = [...failureMessages];
  let fresh: NormalizedObservation[] = [];

  if (selected.length > 0) {
    try {
      const existing = await repository.findExistingExternalIds(
        request.source,
        selected.map((item) => item.externalId),
      );
      fresh = selected.filter((item) => !existing.has(item.externalId));
      duplicateCount += selected.length - fresh.length;

      if (fresh.length > 0) {
        const result = await repository.insertObservations(runId, fresh);
        insertedCount = result.insertedCount;
        failedCount = result.failedCount;
        // 저장을 시도했지만 unique 제약으로 무시된 건 = 동시 실행 중복
        duplicateCount +=
          fresh.length - result.insertedCount - result.failedCount;
        if (result.errorMessage) {
          errorParts.push(result.errorMessage);
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "데이터 저장에 실패했습니다.";
      console.error("[founder-os] observation persistence failed", {
        runId,
        source: request.source,
        error: message,
      });
      return finish("failed", {
        ...baseCounts,
        fetchedCount: fetched.fetchedCount,
        postFetchedCount: fetched.postFetchedCount,
        commentFetchedCount: fetched.commentFetchedCount,
        matchedCount,
        filteredByDateCount,
        insertedCount,
        duplicateCount,
        failedCount: selected.length - insertedCount,
        keywordStats,
        contentTypeStats: countContentTypes(selected),
        errorMessage: buildErrorMessage([...errorParts, message]),
      });
    }
  }

  // 저장에 성공한 신규 데이터를 키워드별로 귀속 (근사치: 대부분 fresh = inserted)
  for (const item of fresh) {
    const keyword = primaryById.get(item.externalId);
    if (keyword && keywordStats[keyword]) {
      keywordStats[keyword].inserted += 1;
    }
  }

  const titleOnlyCount = selected.filter(
    (item) => item.contentQuality === "title_only",
  ).length;
  const substantiveBodyCount = selected.filter(
    (item) => item.hasSubstantiveBody,
  ).length;
  const highPriorityCount = selected.filter(
    (item) => item.observationPriority === "high",
  ).length;

  const status: CollectionRunStatus =
    fetched.failures.length > 0 || failedCount > 0 ? "partial" : "completed";

  return finish(status, {
    fetchedCount: fetched.fetchedCount,
    postFetchedCount: fetched.postFetchedCount,
    commentFetchedCount: fetched.commentFetchedCount,
    matchedCount,
    filteredByDateCount,
    insertedCount,
    duplicateCount,
    failedCount,
    titleOnlyCount,
    substantiveBodyCount,
    highPriorityCount,
    keywordStats,
    contentTypeStats: countContentTypes(selected),
    errorMessage: buildErrorMessage(errorParts),
  });
}
