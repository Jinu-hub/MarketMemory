import { describe, expect, it } from "vitest";

import { classifyContentQuality, isSubstantiveBody } from "../content-quality";

describe("classifyContentQuality", () => {
  it("본문이 비어 있으면 empty", () => {
    expect(classifyContentQuality("title", "")).toBe("empty");
    expect(classifyContentQuality("title", "   ")).toBe("empty");
  });

  it("본문이 제목과 같으면 title_only", () => {
    expect(classifyContentQuality("First users", "First users")).toBe(
      "title_only",
    );
    expect(classifyContentQuality("First  Users", "first users")).toBe(
      "title_only",
    );
  });

  it("본문이 짧으면 short", () => {
    expect(classifyContentQuality("title", "too short body")).toBe("short");
  });

  it("의미 있는 본문이면 full", () => {
    const body = "a".repeat(120);
    expect(classifyContentQuality("title", body)).toBe("full");
  });

  it("full만 실질 본문으로 인정한다", () => {
    expect(isSubstantiveBody("full")).toBe(true);
    expect(isSubstantiveBody("short")).toBe(false);
    expect(isSubstantiveBody("title_only")).toBe(false);
    expect(isSubstantiveBody("empty")).toBe(false);
  });
});
