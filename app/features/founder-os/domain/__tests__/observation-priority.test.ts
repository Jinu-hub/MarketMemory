import { describe, expect, it } from "vitest";

import { computeObservationPriority } from "../observation-priority";

describe("computeObservationPriority", () => {
  it("Ask HN + 의미 있는 본문이면 high", () => {
    const result = computeObservationPriority({
      contentType: "post",
      hnType: "ask_hn",
      body: "a".repeat(120),
      hasSubstantiveBody: true,
    });
    expect(result.priority).toBe("high");
    expect(result.reasons).toEqual(
      expect.arrayContaining(["ask_hn", "substantive_body"]),
    );
  });

  it("문제 표현이 있는 댓글은 high", () => {
    const result = computeObservationPriority({
      contentType: "comment",
      hnType: "comment",
      body: "I am struggling with this workaround.",
      hasSubstantiveBody: false,
    });
    expect(result.priority).toBe("high");
    expect(result.reasons).toEqual(
      expect.arrayContaining(["comment", "problem_phrase"]),
    );
  });

  it("반응이 많은 게시글은 high", () => {
    const result = computeObservationPriority({
      contentType: "post",
      hnType: "story",
      body: "plain announcement without signals",
      hasSubstantiveBody: false,
      score: 100,
      commentCount: 50,
    });
    expect(result.priority).toBe("high");
    expect(result.reasons).toEqual(
      expect.arrayContaining(["high_comment_count", "high_score"]),
    );
  });

  it("신호가 없는 제목뿐인 게시글은 low", () => {
    const result = computeObservationPriority({
      contentType: "post",
      hnType: "story",
      body: "short title",
      hasSubstantiveBody: false,
      score: 1,
      commentCount: 0,
    });
    expect(result.priority).toBe("low");
    expect(result.reasons).toHaveLength(0);
  });

  it("질문형 표현은 question 사유를 남긴다", () => {
    const result = computeObservationPriority({
      contentType: "post",
      hnType: "story",
      body: "how do you validate ideas",
      hasSubstantiveBody: false,
    });
    expect(result.reasons).toContain("question");
  });
});
