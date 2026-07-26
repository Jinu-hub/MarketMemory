import type { ObservationContentQuality } from "./observation.types";

/**
 * 의미 있는 본문으로 인정하는 최소 글자 수.
 * 향후 조정하기 쉽도록 상수로 분리한다.
 */
export const MIN_SUBSTANTIVE_BODY_LENGTH = 100;

function normalizeForCompare(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * 정규화된 title/body를 기준으로 본문 품질을 판정한다.
 *
 * - empty: 본문이 비어 있음
 * - title_only: 본문이 제목과 사실상 동일함
 * - short: 본문이 있으나 최소 길이 미만
 * - full: 제목과 다른 의미 있는 본문이 충분히 있음
 */
export function classifyContentQuality(
  title: string | null | undefined,
  body: string | null | undefined,
): ObservationContentQuality {
  const trimmedBody = (body ?? "").trim();
  if (trimmedBody.length === 0) {
    return "empty";
  }

  const normalizedTitle = title ? normalizeForCompare(title) : "";
  if (
    normalizedTitle.length > 0 &&
    normalizeForCompare(trimmedBody) === normalizedTitle
  ) {
    return "title_only";
  }

  if (trimmedBody.length < MIN_SUBSTANTIVE_BODY_LENGTH) {
    return "short";
  }

  return "full";
}

/** 향후 분석 대상으로 삼을 만한 실질 본문 여부 */
export function isSubstantiveBody(quality: ObservationContentQuality): boolean {
  return quality === "full";
}
