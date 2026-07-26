import type {
  CollectSourceParams,
  CollectSourceResult,
  ObservationSource,
} from "../domain/observation.types";

export interface ObservationSourceAdapter {
  source: ObservationSource;
  /** 화면·API에서 "아직 연결되지 않았습니다" 안내를 띄우기 위한 플래그 */
  implemented: boolean;
  collect(params: CollectSourceParams): Promise<CollectSourceResult>;
}

/** 아직 연결되지 않은 소스를 선택했을 때 사용 */
export class SourceNotImplementedError extends Error {
  readonly source: ObservationSource;

  constructor(source: ObservationSource) {
    super("이 소스는 아직 연결되지 않았습니다.");
    this.name = "SourceNotImplementedError";
    this.source = source;
  }
}

export const DEFAULT_SOURCE_TIMEOUT_MS = 10_000;

/**
 * timeout·HTTP 오류·JSON 파싱 실패를 사람이 읽을 수 있는 메시지로 정리한다.
 * (외부 응답 원문이나 내부 스택은 호출부에서 화면에 노출하지 않는다.)
 */
export async function fetchJsonWithTimeout(
  url: string,
  timeoutMs: number,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error(`외부 API 응답이 ${timeoutMs}ms 안에 오지 않았습니다.`);
    }
    throw new Error("외부 API 요청에 실패했습니다.");
  }

  if (!response.ok) {
    throw new Error(`외부 API가 HTTP ${response.status}를 반환했습니다.`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error("외부 API 응답을 JSON으로 해석하지 못했습니다.");
  }
}

/** 미구현 소스용 공통 Adapter */
export function createPlaceholderAdapter(
  source: ObservationSource,
): ObservationSourceAdapter {
  return {
    source,
    implemented: false,
    async collect() {
      throw new SourceNotImplementedError(source);
    },
  };
}
