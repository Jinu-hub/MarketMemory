import { describe, expect, it } from "vitest";

import {
  buildObservationStrategySnapshot,
  buildSearchCandidates,
  findObservationDomain,
} from "../observation-strategy";

describe("buildSearchCandidates", () => {
  it("문제 신호가 없으면 후보를 만들지 않는다", () => {
    expect(buildSearchCandidates(["work"], [])).toEqual([]);
  });

  it("문제 신호만 선택하면 표현 패턴을 단독 후보로 반환한다", () => {
    const candidates = buildSearchCandidates([], ["time-waste"]);
    expect(candidates).toEqual(
      expect.arrayContaining([
        "takes too long",
        "takes forever",
        "spend hours",
      ]),
    );
    expect(candidates.some((item) => item.startsWith("work "))).toBe(false);
  });

  it("관찰 대상과 문제 신호를 조합한 후보를 만든다", () => {
    const candidates = buildSearchCandidates(["work"], ["time-waste"]);
    expect(candidates).toEqual(
      expect.arrayContaining([
        "takes too long",
        "work takes too long",
        "at work spend hours",
      ]),
    );
  });

  it("개인 재무 × 정보 분산 조합을 만든다", () => {
    const candidates = buildSearchCandidates(
      ["personal-finance"],
      ["scattered-info"],
    );
    expect(candidates).toEqual(
      expect.arrayContaining([
        "switching between apps",
        "expenses switching between apps",
        "budget information is scattered",
      ]),
    );
  });

  it("중복 후보를 제거하고 최대 개수를 지킨다", () => {
    const candidates = buildSearchCandidates(
      ["work", "everyday-life"],
      ["time-waste", "repetitive", "complexity"],
      8,
    );
    expect(candidates).toHaveLength(8);
    expect(new Set(candidates.map((item) => item.toLowerCase())).size).toBe(8);
  });
});

describe("founder-dev domain", () => {
  it("기존 주제 키워드를 topicGroups로 제공한다", () => {
    const domain = findObservationDomain("founder-dev");
    expect(domain?.kind).toBe("founder_dev");
    expect(domain?.label).toBe("개발자·시스템관리");
    const keywords =
      domain?.topicGroups?.flatMap((group) => group.keywords) ?? [];
    expect(keywords).toEqual(
      expect.arrayContaining([
        "first users",
        "customer feedback",
        "user onboarding",
        "looking for a tool",
      ]),
    );
  });
});

describe("buildObservationStrategySnapshot", () => {
  it("선택된 도메인·신호의 id와 label을 스냅샷으로 만든다", () => {
    const snapshot = buildObservationStrategySnapshot(
      ["work", "unknown-domain"],
      ["time-waste"],
    );
    expect(snapshot).toEqual({
      domains: [{ id: "work", label: "업무" }],
      signals: [{ id: "time-waste", label: "시간이 오래 걸림" }],
    });
  });

  it("선택이 없으면 null을 반환한다", () => {
    expect(buildObservationStrategySnapshot([], [])).toBeNull();
  });
});
