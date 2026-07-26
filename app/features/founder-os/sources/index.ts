import type { ObservationSource } from "../domain/observation.types";
import type { ObservationSourceAdapter } from "./source-adapter";

import { githubAdapter } from "./github-adapter";
import { hackerNewsAdapter } from "./hacker-news-adapter";
import { redditAdapter } from "./reddit-adapter";

const ADAPTERS: Record<ObservationSource, ObservationSourceAdapter> = {
  hacker_news: hackerNewsAdapter,
  github: githubAdapter,
  reddit: redditAdapter,
};

export function getSourceAdapter(
  source: ObservationSource,
): ObservationSourceAdapter {
  return ADAPTERS[source];
}

export type { ObservationSourceAdapter } from "./source-adapter";
export { SourceNotImplementedError } from "./source-adapter";
