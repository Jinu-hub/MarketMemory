import { describe, expect, it } from "vitest";

import { createContentHash } from "../create-content-hash";

const base = {
  source: "hacker_news",
  title: "Finding first users",
  body: "We could not find our first users.",
  author: "pg",
  publishedAt: new Date("2026-01-02T03:04:05.000Z"),
};

describe("createContentHash", () => {
  it("SHA-256 hex 문자열을 반환한다", () => {
    const hash = createContentHash(base);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("같은 입력은 항상 같은 해시를 만든다", () => {
    expect(createContentHash(base)).toBe(createContentHash({ ...base }));
  });

  it("대소문자·여분 공백은 무시한다", () => {
    expect(
      createContentHash({
        ...base,
        title: "  FINDING   First Users ",
        body: "We could not  find our first users.",
      }),
    ).toBe(createContentHash(base));
  });

  it("publishedAt은 문자열과 Date가 동일하게 처리된다", () => {
    expect(
      createContentHash({ ...base, publishedAt: "2026-01-02T03:04:05.000Z" }),
    ).toBe(createContentHash(base));
  });

  it("내용이 다르면 다른 해시를 만든다", () => {
    expect(createContentHash({ ...base, author: "dhh" })).not.toBe(
      createContentHash(base),
    );
  });
});
