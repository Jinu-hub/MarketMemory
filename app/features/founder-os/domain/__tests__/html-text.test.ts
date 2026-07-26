import { describe, expect, it } from "vitest";

import { htmlToPlainText, truncateText } from "../html-text";

describe("htmlToPlainText", () => {
  it("태그를 제거하고 평문만 남긴다", () => {
    expect(
      htmlToPlainText("<p>We could not find our <i>first users</i>.</p>"),
    ).toBe("We could not find our first users.");
  });

  it("HTML 엔티티를 디코딩한다", () => {
    expect(htmlToPlainText("A &amp; B &lt;tag&gt; &#x27;quote&#x27;")).toBe(
      "A & B <tag> 'quote'",
    );
  });

  it("블록 태그를 줄바꿈으로 바꾸고 공백을 정리한다", () => {
    expect(htmlToPlainText("<p>first</p><p>second</p>")).toBe("first\nsecond");
  });

  it("빈 값은 빈 문자열을 반환한다", () => {
    expect(htmlToPlainText(null)).toBe("");
    expect(htmlToPlainText(undefined)).toBe("");
  });
});

describe("truncateText", () => {
  it("길이를 초과하면 말줄임표를 붙인다", () => {
    expect(truncateText("abcdefghij", 5)).toBe("abcde…");
  });

  it("길이 이내면 그대로 반환한다", () => {
    expect(truncateText("abc", 5)).toBe("abc");
  });
});
