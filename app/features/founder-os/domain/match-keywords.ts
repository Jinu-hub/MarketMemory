/**
 * 프로토타입 단계의 키워드 매칭 — 단순하고 예측 가능한 규칙만 사용한다.
 * (형태소 분석·임베딩·LLM 판정은 이번 범위가 아니다.)
 */

/** 쉼표로 구분된 입력 문자열을 키워드 배열로 변환한다. */
export function parseKeywordsInput(input: string): string[] {
  return normalizeKeywords(input.split(","));
}

/** 공백 제거 → 빈 값 제외 → 대소문자 무시 기준 중복 제거 (입력 표기는 유지) */
export function normalizeKeywords(keywords: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of keywords) {
    const keyword = raw.trim().replace(/\s+/g, " ");
    if (keyword.length === 0) {
      continue;
    }
    const key = keyword.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(keyword);
  }
  return result;
}

/**
 * title 또는 body에 포함된 키워드를 모두 반환한다 (대소문자 무시).
 * 하나도 매칭되지 않으면 빈 배열을 반환하고, 호출부에서 저장 대상에서 제외한다.
 */
export function matchKeywords(
  content: { title?: string | null; body?: string | null },
  keywords: string[],
): string[] {
  const haystack = [content.title ?? "", content.body ?? ""]
    .join("\n")
    .toLowerCase();
  if (haystack.trim().length === 0) {
    return [];
  }
  return normalizeKeywords(keywords).filter((keyword) =>
    haystack.includes(keyword.toLowerCase()),
  );
}
