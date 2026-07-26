import type { ObservationSourceAdapter } from "./source-adapter";

import { createPlaceholderAdapter } from "./source-adapter";

/**
 * GitHub Issues Adapter — 인터페이스만 준비된 placeholder.
 *
 * 실제 연결 시 Search Issues API(`/search/issues`)로 키워드별 조회 후
 * issue → post, issue comment → comment 로 매핑하면 된다.
 */
export const githubAdapter: ObservationSourceAdapter =
  createPlaceholderAdapter("github");
