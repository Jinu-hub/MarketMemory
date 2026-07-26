import { afterEach, describe, expect, it, vi } from "vitest";

import { __testing, hackerNewsAdapter } from "../hacker-news-adapter";

function jsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

/** URL의 tags 파라미터에 따라 다른 hits를 돌려주는 fetch mock */
function fetchByTag(map: Record<string, unknown[]>) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    const tags = url.searchParams.get("tags") ?? "";
    return jsonResponse({ hits: map[tags] ?? [] });
  });
}

const storyHit = {
  objectID: "100",
  title: "Ask HN: how did you find your first users?",
  story_text: "<p>We are stuck at zero and looking for first users.</p>",
  author: "founder",
  url: "https://example.com/story",
  points: 42,
  num_comments: 15,
  created_at: "2026-01-02T00:00:00.000Z",
  _tags: ["story", "ask_hn"],
};

const commentHit = {
  objectID: "200",
  story_id: 100,
  parent_id: 100,
  story_title: "Ask HN: how did you find your first users?",
  comment_text: "Cold outreach worked for our <i>first users</i>.",
  author: "commenter",
  created_at: "2026-01-03T00:00:00.000Z",
  _tags: ["comment"],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("hackerNewsAdapter", () => {
  it("Algolia story/comment 응답을 공통 구조로 변환한다", async () => {
    vi.stubGlobal(
      "fetch",
      fetchByTag({ story: [storyHit], comment: [commentHit] }),
    );

    const result = await hackerNewsAdapter.collect({
      keywords: ["first users"],
      contentType: "all",
      limit: 50,
      sortMode: "relevance",
      timeRange: "all",
    });

    expect(result.fetchedCount).toBe(2);
    expect(result.postFetchedCount).toBe(1);
    expect(result.commentFetchedCount).toBe(1);
    expect(result.failures).toEqual([]);
    expect(result.groups).toHaveLength(1);

    const observations = result.groups[0].observations;
    const story = observations.find((item) => item.externalId === "100")!;
    const comment = observations.find((item) => item.externalId === "200")!;

    expect(story).toMatchObject({
      source: "hacker_news",
      contentType: "post",
      hnType: "ask_hn",
      externalContentUrl: "https://example.com/story",
      discussionUrl: "https://news.ycombinator.com/item?id=100",
      score: 42,
      commentCount: 15,
    });
    expect(comment).toMatchObject({
      externalId: "200",
      externalParentId: "100",
      externalStoryId: "100",
      contentType: "comment",
      hnType: "comment",
      discussionUrl: "https://news.ycombinator.com/item?id=200",
    });
    expect(comment.rawPayload).toEqual(commentHit);
  });

  it("comment 타입은 comment 태그만 조회한다", async () => {
    const fetchMock = fetchByTag({ story: [storyHit], comment: [commentHit] });
    vi.stubGlobal("fetch", fetchMock);

    const result = await hackerNewsAdapter.collect({
      keywords: ["first users"],
      contentType: "comment",
      limit: 50,
      sortMode: "relevance",
      timeRange: "all",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.postFetchedCount).toBe(0);
    expect(result.commentFetchedCount).toBe(1);
    expect(result.groups[0].observations).toHaveLength(1);
    expect(result.groups[0].observations[0].contentType).toBe("comment");
  });

  it("일부 키워드 요청이 실패해도 나머지 결과를 반환한다", async () => {
    let call = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        call += 1;
        if (call === 1) {
          return new Response("boom", { status: 500 });
        }
        return jsonResponse({ hits: [commentHit] });
      }),
    );

    const result = await hackerNewsAdapter.collect({
      keywords: ["broken", "first users"],
      contentType: "comment",
      limit: 50,
      sortMode: "relevance",
      timeRange: "all",
    });

    const total = result.groups.reduce(
      (sum, group) => sum + group.observations.length,
      0,
    );
    expect(total).toBe(1);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].keyword).toContain("broken");
    expect(result.failures[0].message).toContain("500");
  });

  it("예상하지 못한 응답 형식은 실패로 처리한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => jsonResponse({ unexpected: true })),
    );

    const result = await hackerNewsAdapter.collect({
      keywords: ["first users"],
      contentType: "comment",
      limit: 50,
      sortMode: "relevance",
      timeRange: "all",
    });

    expect(result.groups[0].observations).toHaveLength(0);
    expect(result.failures[0].message).toContain("형식");
  });

  it("외부 URL이 없는 Ask HN 게시글은 discussion_url만 갖는다", () => {
    const observation = __testing.toExternalObservation({
      objectID: "300",
      title: "Ask HN: best way to get feedback?",
      story_text: "We need customer feedback.",
      author: "asker",
      _tags: ["story", "ask_hn"],
      created_at: "2026-01-05T00:00:00.000Z",
    });

    expect(observation).not.toBeNull();
    expect(observation?.externalContentUrl).toBeNull();
    expect(observation?.discussionUrl).toBe(
      "https://news.ycombinator.com/item?id=300",
    );
    expect(observation?.sourceUrl).toBe(
      "https://news.ycombinator.com/item?id=300",
    );
    expect(observation?.hnType).toBe("ask_hn");
  });

  it("buildSearchUrl은 최신순에 search_by_date와 기간 필터를 적용한다", () => {
    const url = __testing.buildSearchUrl({
      keyword: "first users",
      tag: "comment",
      sortMode: "recent",
      timeRange: "30d",
      hitsPerPage: 20,
      now: new Date("2026-07-26T00:00:00.000Z"),
    });

    expect(url).toContain("search_by_date");
    expect(url).toContain("tags=comment");
    expect(url).toContain("numericFilters=created_at_i");
  });
});
