import type {
  CollectSourceResult,
  ExternalObservation,
  SourceKeywordGroup,
} from "../../domain/observation.types";
import type { CollectRequest } from "../../lib/collect-request";
import type { ObservationSourceAdapter } from "../../sources/source-adapter";

import { describe, expect, it } from "vitest";

import { SourceNotImplementedError } from "../../sources/source-adapter";
import { collectObservations } from "../collect-observations.server";
import { createInMemoryCollectionRepository } from "./in-memory-collection-repository";

function makeExternal(
  externalId: string,
  body: string,
  overrides: Partial<ExternalObservation> = {},
): ExternalObservation {
  const discussionUrl = `https://news.ycombinator.com/item?id=${externalId}`;
  return {
    source: "hacker_news",
    externalId,
    externalParentId: null,
    externalStoryId: null,
    contentType: "comment",
    title: null,
    body,
    author: `author-${externalId}`,
    community: "Hacker News",
    externalContentUrl: null,
    discussionUrl,
    sourceUrl: discussionUrl,
    score: null,
    commentCount: null,
    hnType: "comment",
    publishedAt: new Date("2026-01-02T00:00:00.000Z"),
    rawPayload: { objectID: externalId },
    ...overrides,
  };
}

function makeResult(
  groups: SourceKeywordGroup[],
  failures: CollectSourceResult["failures"] = [],
): CollectSourceResult {
  let post = 0;
  let comment = 0;
  for (const group of groups) {
    for (const observation of group.observations) {
      if (observation.contentType === "post") {
        post += 1;
      } else {
        comment += 1;
      }
    }
  }
  return {
    fetchedCount: post + comment,
    postFetchedCount: post,
    commentFetchedCount: comment,
    groups,
    failures,
  };
}

function makeAdapter(result: CollectSourceResult): ObservationSourceAdapter {
  return {
    source: "hacker_news",
    implemented: true,
    async collect() {
      return result;
    },
  };
}

const request: CollectRequest = {
  source: "hacker_news",
  keywords: ["first users"],
  domainIds: [],
  signalIds: [],
  contentType: "all",
  sortMode: "relevance",
  timeRange: "all",
  limit: 50,
};

describe("collectObservations", () => {
  it("키워드와 매칭된 데이터만 저장하고 결과를 집계한다", async () => {
    const { repository, observations } = createInMemoryCollectionRepository();
    const summary = await collectObservations(request, {
      repository,
      adapter: makeAdapter(
        makeResult([
          {
            keyword: "first users",
            fetched: 3,
            observations: [
              makeExternal("1", "We cannot find our first users."),
              makeExternal("2", "Totally unrelated content."),
            ],
          },
        ]),
      ),
    });

    expect(summary.status).toBe("completed");
    expect(summary.matchedCount).toBe(1);
    expect(summary.insertedCount).toBe(1);
    expect(summary.duplicateCount).toBe(0);
    expect(observations.size).toBe(1);
  });

  it("같은 조건으로 두 번 실행해도 중복 저장하지 않는다", async () => {
    const { repository, observations } = createInMemoryCollectionRepository();
    const adapter = makeAdapter(
      makeResult([
        {
          keyword: "first users",
          fetched: 2,
          observations: [
            makeExternal("1", "We cannot find our first users."),
            makeExternal("2", "How to reach first users faster?"),
          ],
        },
      ]),
    );

    const first = await collectObservations(request, { repository, adapter });
    const second = await collectObservations(request, { repository, adapter });

    expect(first.insertedCount).toBe(2);
    expect(second.insertedCount).toBe(0);
    expect(second.duplicateCount).toBe(2);
    expect(second.status).toBe("completed");
    expect(observations.size).toBe(2);
  });

  it("여러 키워드에 동일 데이터가 등장하면 한 번만 저장하고 matched_keywords를 합친다", async () => {
    const { repository, observations } = createInMemoryCollectionRepository();
    const shared = makeExternal(
      "1",
      "We cannot find our first users and want customer feedback.",
    );
    const summary = await collectObservations(
      { ...request, keywords: ["first users", "customer feedback"] },
      {
        repository,
        adapter: makeAdapter(
          makeResult([
            { keyword: "first users", fetched: 1, observations: [shared] },
            {
              keyword: "customer feedback",
              fetched: 1,
              observations: [{ ...shared }],
            },
          ]),
        ),
      },
    );

    expect(summary.matchedCount).toBe(1);
    expect(summary.insertedCount).toBe(1);
    expect(summary.duplicateCount).toBe(1);
    expect(observations.size).toBe(1);
    const stored = [...observations.values()][0];
    expect(stored.matchedKeywords).toEqual(
      expect.arrayContaining(["first users", "customer feedback"]),
    );
  });

  it("키워드별 quota로 한 키워드가 결과를 독점하지 않도록 배분한다", async () => {
    const { repository } = createInMemoryCollectionRepository();
    const firstUsers = Array.from({ length: 10 }, (_, index) =>
      makeExternal(`f${index}`, `struggling to get first users ${index}`),
    );
    const feedback = Array.from({ length: 10 }, (_, index) =>
      makeExternal(`c${index}`, `need customer feedback tooling ${index}`),
    );
    const summary = await collectObservations(
      {
        ...request,
        keywords: ["first users", "customer feedback"],
        contentType: "comment",
        limit: 10,
      },
      {
        repository,
        adapter: makeAdapter(
          makeResult([
            { keyword: "first users", fetched: 10, observations: firstUsers },
            {
              keyword: "customer feedback",
              fetched: 10,
              observations: feedback,
            },
          ]),
        ),
      },
    );

    expect(summary.insertedCount).toBe(10);
    expect(summary.keywordStats["first users"].inserted).toBe(5);
    expect(summary.keywordStats["customer feedback"].inserted).toBe(5);
  });

  it("한 키워드 결과가 부족하면 다른 키워드로 보충한다", async () => {
    const { repository } = createInMemoryCollectionRepository();
    const feedback = Array.from({ length: 10 }, (_, index) =>
      makeExternal(`c${index}`, `need customer feedback tooling ${index}`),
    );
    const summary = await collectObservations(
      {
        ...request,
        keywords: ["first users", "customer feedback"],
        contentType: "comment",
        limit: 10,
      },
      {
        repository,
        adapter: makeAdapter(
          makeResult([
            {
              keyword: "first users",
              fetched: 1,
              observations: [makeExternal("f0", "struggling first users")],
            },
            {
              keyword: "customer feedback",
              fetched: 10,
              observations: feedback,
            },
          ]),
        ),
      },
    );

    expect(summary.insertedCount).toBe(10);
    expect(summary.keywordStats["first users"].inserted).toBe(1);
    expect(summary.keywordStats["customer feedback"].inserted).toBe(9);
  });

  it("all 모드에서 게시글과 댓글을 목표 비율로 함께 저장한다", async () => {
    const { repository } = createInMemoryCollectionRepository();
    const posts = Array.from({ length: 10 }, (_, index) =>
      makeExternal(`p${index}`, `looking for first users problem ${index}`, {
        contentType: "post",
        hnType: "story",
        title: `first users ${index}`,
      }),
    );
    const comments = Array.from({ length: 10 }, (_, index) =>
      makeExternal(`m${index}`, `first users comment struggling ${index}`),
    );
    const summary = await collectObservations(
      { ...request, contentType: "all", limit: 10 },
      {
        repository,
        adapter: makeAdapter(
          makeResult([
            {
              keyword: "first users",
              fetched: 20,
              observations: [...posts, ...comments],
            },
          ]),
        ),
      },
    );

    expect(summary.insertedCount).toBe(10);
    expect(summary.contentTypeStats.post).toBe(4);
    expect(summary.contentTypeStats.comment).toBe(6);
  });

  it("댓글이 부족하면 게시글로 보충한다", async () => {
    const { repository } = createInMemoryCollectionRepository();
    const posts = Array.from({ length: 10 }, (_, index) =>
      makeExternal(`p${index}`, `looking for first users problem ${index}`, {
        contentType: "post",
        hnType: "story",
        title: `first users ${index}`,
      }),
    );
    const summary = await collectObservations(
      { ...request, contentType: "all", limit: 10 },
      {
        repository,
        adapter: makeAdapter(
          makeResult([
            {
              keyword: "first users",
              fetched: 12,
              observations: [
                ...posts,
                makeExternal("m0", "first users comment struggling"),
                makeExternal("m1", "first users second comment"),
              ],
            },
          ]),
        ),
      },
    );

    expect(summary.insertedCount).toBe(10);
    expect(summary.contentTypeStats.comment).toBe(2);
    expect(summary.contentTypeStats.post).toBe(8);
  });

  it("일부 키워드 요청만 실패하면 partial로 기록한다", async () => {
    const { repository, runs } = createInMemoryCollectionRepository();
    const summary = await collectObservations(
      { ...request, keywords: ["first users", "churn"] },
      {
        repository,
        adapter: makeAdapter(
          makeResult(
            [
              {
                keyword: "first users",
                fetched: 1,
                observations: [
                  makeExternal("1", "We cannot find our first users."),
                ],
              },
              { keyword: "churn", fetched: 0, observations: [] },
            ],
            [{ keyword: "churn", message: "외부 API 요청에 실패했습니다." }],
          ),
        ),
      },
    );

    expect(summary.status).toBe("partial");
    expect(summary.insertedCount).toBe(1);
    expect(summary.errorMessage).toContain("churn");
    expect(runs.get(summary.runId)?.status).toBe("partial");
  });

  it("모든 외부 요청이 실패하면 failed로 기록한다", async () => {
    const { repository, runs } = createInMemoryCollectionRepository();
    const summary = await collectObservations(request, {
      repository,
      adapter: makeAdapter(
        makeResult(
          [{ keyword: "first users", fetched: 0, observations: [] }],
          [
            {
              keyword: "first users",
              message: "외부 API 요청에 실패했습니다.",
            },
          ],
        ),
      ),
    });

    expect(summary.status).toBe("failed");
    expect(summary.insertedCount).toBe(0);
    expect(runs.get(summary.runId)?.errorMessage).toContain("first users");
  });

  it("기간 필터로 오래된 데이터를 제외하고 filteredByDateCount에 반영한다", async () => {
    const { repository } = createInMemoryCollectionRepository();
    const now = new Date("2026-07-26T00:00:00.000Z");
    const fresh = makeExternal("1", "recent first users struggle", {
      publishedAt: new Date("2026-07-01T00:00:00.000Z"),
    });
    const old = makeExternal("2", "old first users struggle", {
      publishedAt: new Date("2020-01-01T00:00:00.000Z"),
    });
    const summary = await collectObservations(
      { ...request, timeRange: "30d", contentType: "comment" },
      {
        repository,
        adapter: makeAdapter(
          makeResult([
            {
              keyword: "first users",
              fetched: 2,
              observations: [fresh, old],
            },
          ]),
        ),
        now: () => now,
      },
    );

    expect(summary.filteredByDateCount).toBe(1);
    expect(summary.insertedCount).toBe(1);
  });

  it("Adapter가 예외를 던지면 실행 이력에 실패 원인을 남긴다", async () => {
    const { repository, runs } = createInMemoryCollectionRepository();
    const summary = await collectObservations(request, {
      repository,
      adapter: {
        source: "hacker_news",
        implemented: true,
        async collect() {
          throw new Error("외부 API 응답이 10000ms 안에 오지 않았습니다.");
        },
      },
    });

    expect(summary.status).toBe("failed");
    expect(runs.get(summary.runId)?.errorMessage).toContain("10000ms");
  });

  it("연결되지 않은 소스는 실행 이력을 만들지 않고 거부한다", async () => {
    const { repository, runs } = createInMemoryCollectionRepository();
    await expect(
      collectObservations(
        { ...request, source: "reddit" },
        {
          repository,
          adapter: {
            source: "reddit",
            implemented: false,
            async collect() {
              throw new SourceNotImplementedError("reddit");
            },
          },
        },
      ),
    ).rejects.toBeInstanceOf(SourceNotImplementedError);
    expect(runs.size).toBe(0);
  });
});
