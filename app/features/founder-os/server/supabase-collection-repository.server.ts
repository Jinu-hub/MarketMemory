import type { Json } from "database.types";

import type {
  NormalizedObservation,
  ObservationSource,
} from "../domain/observation.types";
import type { FounderOsDb, ObservationInsert } from "../lib/db";
import type {
  CollectionRepository,
  CreateCollectionRunInput,
  FinishCollectionRunInput,
  InsertObservationsResult,
} from "./collection-repository";

const EXISTING_LOOKUP_CHUNK = 200;
const INSERT_CHUNK = 100;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function toInsertRow(
  runId: string,
  observation: NormalizedObservation,
): ObservationInsert {
  return {
    source: observation.source,
    external_id: observation.externalId,
    external_parent_id: observation.externalParentId ?? null,
    external_story_id: observation.externalStoryId ?? null,
    content_type: observation.contentType,
    title: observation.title ?? null,
    body: observation.body,
    author: observation.author ?? null,
    community: observation.community ?? null,
    source_url: observation.sourceUrl,
    external_content_url: observation.externalContentUrl ?? null,
    discussion_url: observation.discussionUrl,
    score: observation.score ?? null,
    comment_count: observation.commentCount ?? null,
    hn_type: observation.hnType ?? null,
    content_quality: observation.contentQuality,
    has_substantive_body: observation.hasSubstantiveBody,
    observation_priority: observation.observationPriority,
    priority_reasons: observation.priorityReasons,
    matched_keywords: observation.matchedKeywords,
    published_at: observation.publishedAt
      ? observation.publishedAt.toISOString()
      : null,
    fetched_at: observation.fetchedAt.toISOString(),
    content_hash: observation.contentHash,
    raw_payload: (observation.rawPayload ?? null) as Json | null,
    collection_run_id: runId,
  };
}

export function createSupabaseCollectionRepository(
  client: FounderOsDb,
): CollectionRepository {
  return {
    async createRun(input: CreateCollectionRunInput) {
      const { data, error } = await client
        .from("collection_runs")
        .insert({
          source: input.source,
          keywords: input.keywords,
          content_type: input.contentType,
          sort_mode: input.sortMode,
          time_range: input.timeRange,
          requested_limit: input.limit,
          observation_strategy: (input.observationStrategy ??
            null) as Json | null,
          status: "running",
          started_at: input.startedAt.toISOString(),
        })
        .select("id")
        .single();

      if (error || !data) {
        throw new Error(
          `수집 실행 이력을 생성하지 못했습니다: ${error?.message ?? "unknown"}`,
        );
      }
      return data.id;
    },

    async finishRun(runId: string, input: FinishCollectionRunInput) {
      const { error } = await client
        .from("collection_runs")
        .update({
          status: input.status,
          fetched_count: input.fetchedCount,
          post_fetched_count: input.postFetchedCount,
          comment_fetched_count: input.commentFetchedCount,
          matched_count: input.matchedCount,
          filtered_by_date_count: input.filteredByDateCount,
          inserted_count: input.insertedCount,
          duplicate_count: input.duplicateCount,
          failed_count: input.failedCount,
          title_only_count: input.titleOnlyCount,
          substantive_body_count: input.substantiveBodyCount,
          high_priority_count: input.highPriorityCount,
          keyword_stats: input.keywordStats as unknown as Json,
          content_type_stats: input.contentTypeStats as unknown as Json,
          error_message: input.errorMessage,
          finished_at: input.finishedAt.toISOString(),
          duration_ms: input.durationMs,
        })
        .eq("id", runId);

      if (error) {
        throw new Error(
          `수집 실행 이력을 업데이트하지 못했습니다: ${error.message}`,
        );
      }
    },

    async findExistingExternalIds(
      source: ObservationSource,
      externalIds: string[],
    ) {
      const existing = new Set<string>();
      for (const ids of chunk(externalIds, EXISTING_LOOKUP_CHUNK)) {
        const { data, error } = await client
          .from("observations")
          .select("external_id")
          .eq("source", source)
          .in("external_id", ids);

        if (error) {
          throw new Error(`중복 확인에 실패했습니다: ${error.message}`);
        }
        for (const row of data ?? []) {
          existing.add(row.external_id);
        }
      }
      return existing;
    },

    async insertObservations(
      runId: string,
      observations: NormalizedObservation[],
    ): Promise<InsertObservationsResult> {
      let insertedCount = 0;
      let failedCount = 0;
      let errorMessage: string | null = null;

      for (const batch of chunk(observations, INSERT_CHUNK)) {
        // 동시에 같은 조건으로 실행되는 경우를 대비해 unique 제약 충돌은 조용히 건너뛴다.
        const { data, error } = await client
          .from("observations")
          .upsert(
            batch.map((item) => toInsertRow(runId, item)),
            {
              onConflict: "source,external_id",
              ignoreDuplicates: true,
            },
          )
          .select("external_id");

        if (error) {
          failedCount += batch.length;
          errorMessage = errorMessage ?? `저장 실패: ${error.message}`;
          console.error("[founder-os] observation insert failed", {
            runId,
            batchSize: batch.length,
            error: error.message,
          });
          continue;
        }
        insertedCount += data?.length ?? 0;
      }

      return { insertedCount, failedCount, errorMessage };
    },
  };
}
