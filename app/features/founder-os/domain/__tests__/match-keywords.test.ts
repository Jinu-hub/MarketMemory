import { describe, expect, it } from "vitest";

import {
  matchKeywords,
  normalizeKeywords,
  parseKeywordsInput,
} from "../match-keywords";

describe("parseKeywordsInput", () => {
  it("쉼표로 구분된 입력을 배열로 변환한다", () => {
    expect(
      parseKeywordsInput("first users, customer feedback, onboarding problem"),
    ).toEqual(["first users", "customer feedback", "onboarding problem"]);
  });

  it("앞뒤 공백과 빈 키워드를 제거한다", () => {
    expect(parseKeywordsInput("  churn ,, ,  retention  ")).toEqual([
      "churn",
      "retention",
    ]);
  });
});

describe("normalizeKeywords", () => {
  it("대소문자 기준으로 중복을 제거하고 첫 표기를 유지한다", () => {
    expect(
      normalizeKeywords(["First Users", "first users", "FIRST USERS"]),
    ).toEqual(["First Users"]);
  });

  it("내부 연속 공백을 하나로 정리한다", () => {
    expect(normalizeKeywords(["first    users"])).toEqual(["first users"]);
  });
});

describe("matchKeywords", () => {
  const keywords = ["first users", "onboarding"];

  it("본문에 포함된 여러 키워드를 동시에 반환한다", () => {
    const matched = matchKeywords(
      {
        title: null,
        body: "I am struggling to find my first users after finishing onboarding.",
      },
      keywords,
    );
    expect(matched).toEqual(["first users", "onboarding"]);
  });

  it("대소문자를 무시하고 매칭한다", () => {
    expect(
      matchKeywords({ title: "Finding First Users", body: "" }, keywords),
    ).toEqual(["first users"]);
  });

  it("title 또는 body 어느 쪽이든 포함되면 매칭한다", () => {
    expect(
      matchKeywords(
        { title: "Onboarding is hard", body: "no keyword here" },
        keywords,
      ),
    ).toEqual(["onboarding"]);
  });

  it("매칭되는 키워드가 없으면 빈 배열을 반환한다", () => {
    expect(
      matchKeywords(
        { title: "Series B raised", body: "nothing relevant" },
        keywords,
      ),
    ).toEqual([]);
  });
});
