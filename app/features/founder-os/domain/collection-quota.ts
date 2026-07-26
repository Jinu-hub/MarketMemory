import type {
  ContentTypeFilter,
  NormalizedObservation,
} from "./observation.types";

/** contentType이 all일 때 게시글이 차지하는 기본 비율 (나머지는 댓글) */
export const DEFAULT_POST_RATIO = 0.4;

export interface CollectionQuota {
  /** 키워드 하나당 우선 확보할 목표 수량 */
  perKeywordLimit: number;
  /** all 모드에서 게시글 목표 수량 (단일 타입 모드면 null) */
  postTarget: number | null;
  /** all 모드에서 댓글 목표 수량 (단일 타입 모드면 null) */
  commentTarget: number | null;
}

/**
 * 전체 limit·키워드 수·콘텐츠 타입을 기준으로 수집 목표 수량을 배분한다.
 *
 * - perKeywordLimit = ceil(totalLimit / keywordCount)
 * - all 모드에서는 게시글:댓글 = 40:60 (postRatio) 목표를 함께 계산한다.
 */
export function allocateCollectionQuota(
  totalLimit: number,
  keywordCount: number,
  contentType: ContentTypeFilter,
  postRatio: number = DEFAULT_POST_RATIO,
): CollectionQuota {
  const safeKeywordCount = Math.max(keywordCount, 1);
  const perKeywordLimit = Math.max(1, Math.ceil(totalLimit / safeKeywordCount));

  if (contentType !== "all") {
    return { perKeywordLimit, postTarget: null, commentTarget: null };
  }

  const postTarget = Math.round(totalLimit * postRatio);
  const commentTarget = totalLimit - postTarget;
  return { perKeywordLimit, postTarget, commentTarget };
}

export interface KeywordGroup {
  keyword: string;
  items: NormalizedObservation[];
}

export interface PreparedGroups {
  /** externalId 기준으로 병합된 관찰 데이터 (matchedKeywords는 합집합) */
  itemsById: Map<string, NormalizedObservation>;
  /** 키워드별 고유 externalId 목록 (그룹 내부 등장 순서 유지) */
  groupIds: Array<{ keyword: string; ids: string[] }>;
  /** externalId → 최초로 등장한 키워드 (통계 귀속용) */
  primaryById: Map<string, string>;
  /** 여러 키워드 검색에 중복 등장해 제거된 건수 */
  withinRunDuplicateCount: number;
}

function mergeKeywords(target: string[], incoming: string[]) {
  for (const keyword of incoming) {
    if (!target.includes(keyword)) {
      target.push(keyword);
    }
  }
}

/**
 * 키워드별 그룹을 externalId 기준으로 병합한다.
 * 같은 데이터가 여러 키워드에 등장하면 한 번만 남기고 matchedKeywords를 합친다.
 */
export function prepareGroups(groups: KeywordGroup[]): PreparedGroups {
  const itemsById = new Map<string, NormalizedObservation>();
  const primaryById = new Map<string, string>();
  const groupIds: Array<{ keyword: string; ids: string[] }> = [];
  let withinRunDuplicateCount = 0;

  for (const group of groups) {
    const seenInGroup = new Set<string>();
    const ids: string[] = [];
    for (const item of group.items) {
      const id = item.externalId;
      const existing = itemsById.get(id);
      if (existing) {
        // 이미 다른(또는 같은) 키워드에서 본 데이터 → 매칭 키워드만 합친다.
        mergeKeywords(existing.matchedKeywords, item.matchedKeywords);
        withinRunDuplicateCount += 1;
      } else {
        itemsById.set(id, {
          ...item,
          matchedKeywords: [...item.matchedKeywords],
        });
        primaryById.set(id, group.keyword);
      }
      if (!seenInGroup.has(id)) {
        seenInGroup.add(id);
        ids.push(id);
      }
    }
    groupIds.push({ keyword: group.keyword, ids });
  }

  return { itemsById, groupIds, primaryById, withinRunDuplicateCount };
}

export interface MergeBalancedResult {
  selected: NormalizedObservation[];
  primaryById: Map<string, string>;
}

/**
 * 키워드 균형 → 콘텐츠 타입 균형 → 부족분 보충 순으로 최종 결과를 선택한다.
 *
 * 우선순위:
 *   1. 전체 limit 준수
 *   2. 키워드별 최소한의 균형 (perKeywordLimit)
 *   3. post/comment 비율 (postTarget/commentTarget)
 *   4. 부족한 결과는 다른 그룹으로 보충
 *   5. externalId 중복 제거 (prepareGroups에서 처리)
 */
export function mergeBalancedResults(
  groups: KeywordGroup[],
  totalLimit: number,
  quota: CollectionQuota,
): MergeBalancedResult {
  const prepared = prepareGroups(groups);
  const { itemsById, groupIds, primaryById } = prepared;

  const selectedIds: string[] = [];
  const seen = new Set<string>();
  const perGroupCount = new Map<string, number>();
  let posts = 0;
  let comments = 0;

  const typeAllowed = (id: string, enforceType: boolean): boolean => {
    if (
      !enforceType ||
      quota.postTarget === null ||
      quota.commentTarget === null
    ) {
      return true;
    }
    const item = itemsById.get(id)!;
    return item.contentType === "post"
      ? posts < quota.postTarget
      : comments < quota.commentTarget;
  };

  const tryTake = (
    id: string,
    keyword: string,
    enforceKeyword: boolean,
    enforceType: boolean,
  ): boolean => {
    if (selectedIds.length >= totalLimit || seen.has(id)) {
      return false;
    }
    if (
      enforceKeyword &&
      (perGroupCount.get(keyword) ?? 0) >= quota.perKeywordLimit
    ) {
      return false;
    }
    if (!typeAllowed(id, enforceType)) {
      return false;
    }
    seen.add(id);
    selectedIds.push(id);
    perGroupCount.set(keyword, (perGroupCount.get(keyword) ?? 0) + 1);
    if (itemsById.get(id)!.contentType === "post") {
      posts += 1;
    } else {
      comments += 1;
    }
    return true;
  };

  const runPass = (enforceKeyword: boolean, enforceType: boolean) => {
    for (const group of groupIds) {
      for (const id of group.ids) {
        if (selectedIds.length >= totalLimit) {
          return;
        }
        tryTake(id, group.keyword, enforceKeyword, enforceType);
      }
    }
  };

  // 1) 키워드 + 타입 균형 모두 적용
  runPass(true, true);
  // 2) 타입 균형 완화 (댓글 부족 → 게시글로, 게시글 부족 → 댓글로 보충)
  runPass(true, false);
  // 3) 키워드 균형까지 완화해 남은 후보로 전체 limit 채우기
  runPass(false, false);

  return {
    selected: selectedIds.map((id) => itemsById.get(id)!),
    primaryById,
  };
}
