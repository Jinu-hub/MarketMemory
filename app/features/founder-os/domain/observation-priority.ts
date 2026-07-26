import type {
  HackerNewsObservationType,
  ObservationContentType,
  ObservationPriority,
} from "./observation.types";

/**
 * 규칙 기반 검토 우선순위 신호.
 *
 * 이것은 실제 Pain Level·Opportunity Score가 아니라, 사람이 먼저 살펴볼
 * Observation을 정렬하기 위한 보조 신호일 뿐이다. LLM·NLP 모델은 사용하지 않고
 * 단순 문자열 포함 검사만 사용한다.
 */

/** score(points)가 이 값 이상이면 반응이 높은 것으로 본다. */
export const HIGH_SCORE_THRESHOLD = 20;
/** comment_count가 이 값 이상이면 토론이 활발한 것으로 본다. */
export const HIGH_COMMENT_COUNT_THRESHOLD = 10;

/** 어려움·불편함을 나타내는 표현 (소문자, 단순 포함 검사) */
export const PROBLEM_PHRASES = [
  "struggling",
  "difficult",
  "hard to",
  "problem",
  "issue",
  "pain",
  "frustrating",
  "cannot",
  "can't",
  "don't know",
  "looking for",
  "need a tool",
  "workaround",
  "currently using",
  "anyone know",
  "how do you",
  "what is the best way",
];

/** 질문형 표현 (물음표는 별도 처리) */
export const QUESTION_PHRASES = [
  "how do you",
  "how do i",
  "anyone know",
  "what is the best",
  "what's the best",
  "any recommendations",
  "how can i",
  "is there a",
];

export interface PriorityInput {
  contentType: ObservationContentType;
  hnType?: HackerNewsObservationType | null;
  body: string;
  hasSubstantiveBody: boolean;
  score?: number | null;
  commentCount?: number | null;
}

export interface PriorityResult {
  priority: ObservationPriority;
  reasons: string[];
}

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((needle) => haystack.includes(needle));
}

/**
 * 단순 규칙으로 검토 우선순위를 계산한다.
 * 신호 2개 이상 → high, 1개 → medium, 0개 → low.
 */
export function computeObservationPriority(
  input: PriorityInput,
): PriorityResult {
  const body = input.body.toLowerCase();
  const reasons: string[] = [];

  if (input.hnType === "ask_hn") {
    reasons.push("ask_hn");
  }
  if (input.contentType === "comment") {
    reasons.push("comment");
  }
  if (input.hasSubstantiveBody) {
    reasons.push("substantive_body");
  }
  if (body.includes("?") || includesAny(body, QUESTION_PHRASES)) {
    reasons.push("question");
  }
  if (includesAny(body, PROBLEM_PHRASES)) {
    reasons.push("problem_phrase");
  }
  if ((input.commentCount ?? 0) >= HIGH_COMMENT_COUNT_THRESHOLD) {
    reasons.push("high_comment_count");
  }
  if ((input.score ?? 0) >= HIGH_SCORE_THRESHOLD) {
    reasons.push("high_score");
  }

  const priority: ObservationPriority =
    reasons.length >= 2 ? "high" : reasons.length === 1 ? "medium" : "low";

  return { priority, reasons };
}
