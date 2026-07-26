import type {
  NormalizedObservation,
  ObservationContentType,
} from "../observation.types";

import { describe, expect, it } from "vitest";

import {
  allocateCollectionQuota,
  mergeBalancedResults,
  prepareGroups,
} from "../collection-quota";

function makeItem(
  externalId: string,
  matchedKeywords: string[],
  contentType: ObservationContentType = "comment",
): NormalizedObservation {
  const discussionUrl = `https://news.ycombinator.com/item?id=${externalId}`;
  return {
    source: "hacker_news",
    externalId,
    externalParentId: null,
    externalStoryId: null,
    contentType,
    title: null,
    body: `body ${externalId}`,
    author: null,
    community: "Hacker News",
    externalContentUrl: null,
    discussionUrl,
    sourceUrl: discussionUrl,
    score: null,
    commentCount: null,
    hnType: contentType === "post" ? "story" : "comment",
    publishedAt: null,
    rawPayload: null,
    matchedKeywords,
    fetchedAt: new Date(),
    contentHash: `hash-${externalId}`,
    contentQuality: "short",
    hasSubstantiveBody: false,
    observationPriority: "low",
    priorityReasons: [],
  };
}

describe("allocateCollectionQuota", () => {
  it("키워드 수로 perKeywordLimit을 계산한다", () => {
    expect(allocateCollectionQuota(20, 2, "comment").perKeywordLimit).toBe(10);
    expect(allocateCollectionQuota(20, 3, "comment").perKeywordLimit).toBe(7);
  });

  it("all 모드는 게시글:댓글 = 40:60 목표를 계산한다", () => {
    const quota = allocateCollectionQuota(20, 2, "all");
    expect(quota.postTarget).toBe(8);
    expect(quota.commentTarget).toBe(12);
  });

  it("단일 타입 모드는 타입 목표가 없다", () => {
    const quota = allocateCollectionQuota(20, 2, "post");
    expect(quota.postTarget).toBeNull();
    expect(quota.commentTarget).toBeNull();
  });
});

describe("prepareGroups", () => {
  it("externalId 중복을 제거하고 matchedKeywords를 합친다", () => {
    const prepared = prepareGroups([
      { keyword: "a", items: [makeItem("1", ["a"])] },
      { keyword: "b", items: [makeItem("1", ["b"]), makeItem("2", ["b"])] },
    ]);

    expect(prepared.itemsById.size).toBe(2);
    expect(prepared.withinRunDuplicateCount).toBe(1);
    expect(prepared.itemsById.get("1")?.matchedKeywords).toEqual(["a", "b"]);
    expect(prepared.primaryById.get("1")).toBe("a");
  });
});

describe("mergeBalancedResults", () => {
  it("키워드 2개, limit 20이면 각 10건씩 배분한다", () => {
    const groupA = Array.from({ length: 15 }, (_, i) =>
      makeItem(`a${i}`, ["a"]),
    );
    const groupB = Array.from({ length: 15 }, (_, i) =>
      makeItem(`b${i}`, ["b"]),
    );
    const { selected } = mergeBalancedResults(
      [
        { keyword: "a", items: groupA },
        { keyword: "b", items: groupB },
      ],
      20,
      allocateCollectionQuota(20, 2, "comment"),
    );

    expect(selected).toHaveLength(20);
    const fromA = selected.filter((item) => item.externalId.startsWith("a"));
    expect(fromA).toHaveLength(10);
  });

  it("한 키워드가 부족하면 다른 키워드로 보충한다", () => {
    const groupA = [makeItem("a0", ["a"])];
    const groupB = Array.from({ length: 20 }, (_, i) =>
      makeItem(`b${i}`, ["b"]),
    );
    const { selected } = mergeBalancedResults(
      [
        { keyword: "a", items: groupA },
        { keyword: "b", items: groupB },
      ],
      10,
      allocateCollectionQuota(10, 2, "comment"),
    );

    expect(selected).toHaveLength(10);
    expect(selected.filter((i) => i.externalId.startsWith("a"))).toHaveLength(
      1,
    );
    expect(selected.filter((i) => i.externalId.startsWith("b"))).toHaveLength(
      9,
    );
  });

  it("all 모드에서 게시글/댓글 목표 비율을 맞춘다", () => {
    const posts = Array.from({ length: 10 }, (_, i) =>
      makeItem(`p${i}`, ["a"], "post"),
    );
    const comments = Array.from({ length: 10 }, (_, i) =>
      makeItem(`c${i}`, ["a"], "comment"),
    );
    const { selected } = mergeBalancedResults(
      [{ keyword: "a", items: [...posts, ...comments] }],
      10,
      allocateCollectionQuota(10, 1, "all"),
    );

    expect(selected).toHaveLength(10);
    expect(selected.filter((i) => i.contentType === "post")).toHaveLength(4);
    expect(selected.filter((i) => i.contentType === "comment")).toHaveLength(6);
  });

  it("댓글이 부족하면 게시글로 보충한다", () => {
    const posts = Array.from({ length: 10 }, (_, i) =>
      makeItem(`p${i}`, ["a"], "post"),
    );
    const comments = [makeItem("c0", ["a"], "comment")];
    const { selected } = mergeBalancedResults(
      [{ keyword: "a", items: [...posts, ...comments] }],
      10,
      allocateCollectionQuota(10, 1, "all"),
    );

    expect(selected).toHaveLength(10);
    expect(selected.filter((i) => i.contentType === "comment")).toHaveLength(1);
    expect(selected.filter((i) => i.contentType === "post")).toHaveLength(9);
  });

  it("중복 externalId는 한 번만 선택한다", () => {
    const shared = makeItem("1", ["a"]);
    const { selected } = mergeBalancedResults(
      [
        { keyword: "a", items: [shared] },
        { keyword: "b", items: [{ ...shared, matchedKeywords: ["b"] }] },
      ],
      10,
      allocateCollectionQuota(10, 2, "comment"),
    );

    expect(selected).toHaveLength(1);
    expect(selected[0].matchedKeywords).toEqual(["a", "b"]);
  });
});
