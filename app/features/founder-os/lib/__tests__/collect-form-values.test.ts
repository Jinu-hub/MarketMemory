import { describe, expect, it } from "vitest";

import {
  toCollectFormValues,
} from "../collect-form-values";

describe("toCollectFormValues", () => {
  it("실행 이력/프리셋 행을 폼 값으로 복원한다", () => {
    const values = toCollectFormValues({
      source: "hacker_news",
      keywords: ["takes too long", "work takes too long"],
      contentType: "all",
      sortMode: "recent",
      timeRange: "1y",
      limit: 20,
      observationStrategy: {
        domains: [{ id: "work", label: "업무" }],
        signals: [{ id: "time-waste", label: "시간이 오래 걸림" }],
      },
    });

    expect(values).toEqual({
      source: "hacker_news",
      keywords: ["takes too long", "work takes too long"],
      domainIds: ["work"],
      signalIds: ["time-waste"],
      contentType: "all",
      sortMode: "recent",
      timeRange: "1y",
      limit: 20,
    });
  });

  it("알 수 없는 값은 기본값으로 보정한다", () => {
    const values = toCollectFormValues({
      source: "unknown",
      keywords: null,
      contentType: "nope",
      sortMode: null,
      timeRange: null,
      limit: 9999,
      observationStrategy: null,
    });

    expect(values.source).toBe("hacker_news");
    expect(values.keywords).toEqual([]);
    expect(values.contentType).toBe("all");
    expect(values.sortMode).toBe("relevance");
    expect(values.timeRange).toBe("all");
    expect(values.limit).toBe(200);
    expect(values.domainIds).toEqual([]);
    expect(values.signalIds).toEqual([]);
  });
});
