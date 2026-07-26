import type { CollectionRunRow, FounderOsDb, ObservationRow } from "../lib/db";

export const RECENT_RUNS_LIMIT = 10;
export const RUN_OBSERVATIONS_LIMIT = 200;

const RUN_COLUMNS =
  "id, source, keywords, content_type, sort_mode, time_range, requested_limit, status, fetched_count, post_fetched_count, comment_fetched_count, matched_count, filtered_by_date_count, inserted_count, duplicate_count, failed_count, title_only_count, substantive_body_count, high_priority_count, keyword_stats, content_type_stats, observation_strategy, error_message, started_at, finished_at, duration_ms, created_at";

const OBSERVATION_COLUMNS =
  "id, source, external_id, external_story_id, content_type, title, body, author, community, source_url, external_content_url, discussion_url, score, comment_count, hn_type, content_quality, has_substantive_body, observation_priority, priority_reasons, matched_keywords, published_at, created_at";

export type RecentCollectionRun = CollectionRunRow;

export type RecentObservation = Pick<
  ObservationRow,
  | "id"
  | "source"
  | "external_id"
  | "external_story_id"
  | "content_type"
  | "title"
  | "body"
  | "author"
  | "community"
  | "source_url"
  | "external_content_url"
  | "discussion_url"
  | "score"
  | "comment_count"
  | "hn_type"
  | "content_quality"
  | "has_substantive_body"
  | "observation_priority"
  | "priority_reasons"
  | "matched_keywords"
  | "published_at"
  | "created_at"
>;

export async function listRecentCollectionRuns(
  client: FounderOsDb,
  limit = RECENT_RUNS_LIMIT,
) {
  return client
    .from("collection_runs")
    .select(RUN_COLUMNS)
    .order("started_at", { ascending: false })
    .limit(limit);
}

export async function listObservationsByRun(
  client: FounderOsDb,
  runId: string,
  limit = RUN_OBSERVATIONS_LIMIT,
) {
  return client
    .from("observations")
    .select(OBSERVATION_COLUMNS)
    .eq("collection_run_id", runId)
    .order("created_at", { ascending: false })
    .limit(limit);
}
