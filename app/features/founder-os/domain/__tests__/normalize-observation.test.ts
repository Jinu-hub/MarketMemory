import type { ExternalObservation } from "../observation.types";

import { describe, expect, it } from "vitest";

import {
  dedupeByExternalId,
  filterByTimeRange,
  normalizeExternalObservation,
  normalizeKeywordGroup,
} from "../normalize-observation";

function makeExternal(
  overrides: Partial<ExternalObservation> = {},
): ExternalObservation {
  return {
    source: "hacker_news",
    externalId: "1",
    externalParentId: null,
    externalStoryId: null,
    contentType: "comment",
    title: null,
    body: "<p>I am struggling to find my <b>first users</b> after a difficult launch.</p>",
    author: "pg",
    community: "Hacker News",
    externalContentUrl: null,
    discussionUrl: "https://news.ycombinator.com/item?id=1",
    sourceUrl: "https://news.ycombinator.com/item?id=1",
    score: null,
    commentCount: null,
    hnType: "comment",
    publishedAt: new Date("2026-01-02T00:00:00.000Z"),
    rawPayload: { objectID: "1" },
    ...overrides,
  };
}

const FETCHED_AT = new Date("2026-02-01T00:00:00.000Z");

describe("dedupeByExternalId", () => {
  it("같은 externalId는 첫 항목만 남긴다", () => {
    const items = [
      makeExternal({ externalId: "1" }),
      makeExternal({ externalId: "1", author: "duplicate" }),
      makeExternal({ externalId: "2" }),
    ];
    const deduped = dedupeByExternalId(items);
    expect(deduped).toHaveLength(2);
    expect(deduped.map((item) => item.externalId)).toEqual(["1", "2"]);
    expect(deduped[0].author).toBe("pg");
  });
});

describe("normalizeExternalObservation", () => {
  it("HTML 본문을 평문으로 바꾸고 매칭 키워드·해시를 채운다", () => {
    const normalized = normalizeExternalObservation(
      makeExternal(),
      ["first users"],
      FETCHED_AT,
    );

    expect(normalized).not.toBeNull();
    expect(normalized?.body).toBe(
      "I am struggling to find my first users after a difficult launch.",
    );
    expect(normalized?.matchedKeywords).toEqual(["first users"]);
    expect(normalized?.fetchedAt).toBe(FETCHED_AT);
    expect(normalized?.contentHash).toMatch(/^[0-9a-f]{64}$/);
    expect(normalized?.rawPayload).toEqual({ objectID: "1" });
  });

  it("키워드가 매칭되지 않으면 null을 반환한다", () => {
    const normalized = normalizeExternalObservation(
      makeExternal({ body: "nothing relevant here" }),
      ["first users"],
      FETCHED_AT,
    );
    expect(normalized).toBeNull();
  });

  it("품질·우선순위 신호를 함께 계산한다", () => {
    const normalized = normalizeExternalObservation(
      makeExternal(),
      ["first users"],
      FETCHED_AT,
    );
    // 100자 미만이지만 댓글 + 문제 표현 → high 후보
    expect(normalized?.observationPriority).toBe("high");
    expect(normalized?.priorityReasons).toEqual(
      expect.arrayContaining(["comment", "problem_phrase"]),
    );
  });
});

describe("normalizeKeywordGroup", () => {
  it("매칭된 항목만 정규화해 반환한다", () => {
    const normalized = normalizeKeywordGroup(
      [
        makeExternal({ externalId: "1" }),
        makeExternal({ externalId: "2", body: "nope" }),
      ],
      ["first users"],
      FETCHED_AT,
    );
    expect(normalized).toHaveLength(1);
    expect(normalized[0].externalId).toBe("1");
  });
});

describe("filterByTimeRange", () => {
  const now = new Date("2026-07-26T00:00:00.000Z");

  it("all이면 모두 유지한다", () => {
    const { kept, excludedCount } = filterByTimeRange(
      [makeExternal({ publishedAt: new Date("2000-01-01T00:00:00.000Z") })],
      "all",
      now,
    );
    expect(kept).toHaveLength(1);
    expect(excludedCount).toBe(0);
  });

  it("기간 밖 데이터는 제외하고 개수를 센다", () => {
    const { kept, excludedCount } = filterByTimeRange(
      [
        makeExternal({
          externalId: "recent",
          publishedAt: new Date("2026-07-10T00:00:00.000Z"),
        }),
        makeExternal({
          externalId: "old",
          publishedAt: new Date("2020-01-01T00:00:00.000Z"),
        }),
      ],
      "30d",
      now,
    );
    expect(kept.map((item) => item.externalId)).toEqual(["recent"]);
    expect(excludedCount).toBe(1);
  });

  it("작성일이 없는 데이터는 유지한다", () => {
    const { kept, excludedCount } = filterByTimeRange(
      [makeExternal({ publishedAt: null })],
      "30d",
      now,
    );
    expect(kept).toHaveLength(1);
    expect(excludedCount).toBe(0);
  });
});
