import type { ObservationSourceAdapter } from "./source-adapter";

import { createPlaceholderAdapter } from "./source-adapter";

/**
 * Reddit Adapter — 인터페이스만 준비된 placeholder.
 *
 * 실제 연결 시 OAuth 앱 등록 후 `/search.json`을 사용하고,
 * submission → post, comment → comment, subreddit → community 로 매핑하면 된다.
 */
export const redditAdapter: ObservationSourceAdapter =
  createPlaceholderAdapter("reddit");
