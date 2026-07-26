const NAMED_ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&apos;": "'",
  "&nbsp;": " ",
};

function decodeEntities(value: string) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec: string) =>
      String.fromCodePoint(Number.parseInt(dec, 10)),
    )
    .replace(
      /&(amp|lt|gt|quot|apos|nbsp);/gi,
      (matched) => NAMED_ENTITIES[matched.toLowerCase()] ?? matched,
    );
}

/**
 * HTML 조각을 매칭·표시용 평문으로 변환한다.
 * 원본은 `raw_payload`에 그대로 보존하므로 여기서는 되돌릴 필요가 없다.
 */
export function htmlToPlainText(input: string | null | undefined): string {
  if (!input) {
    return "";
  }
  const withBreaks = input
    .replace(/<\s*(br|hr)\s*\/?\s*>/gi, "\n")
    .replace(/<\s*\/\s*(p|div|li|tr|h[1-6]|blockquote|pre)\s*>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "\n- ");

  const withoutTags = withBreaks
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, "");

  return decodeEntities(withoutTags)
    .replace(/[ \t\u00a0]+/g, " ")
    .replace(/\s*\n\s*/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** 목록/미리보기용으로 본문을 잘라낸다. */
export function truncateText(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength).trimEnd()}…`;
}
