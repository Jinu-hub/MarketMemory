import type {
  CollectionRunStatus,
  ContentTypeFilter,
  ContentTypeStat,
  KeywordStat,
  NormalizedObservation,
  ObservationSource,
  SortMode,
  TimeRange,
} from "../domain/observation.types";
import type { ObservationStrategySnapshot } from "../lib/observation-strategy";

export interface CreateCollectionRunInput {
  source: ObservationSource;
  keywords: string[];
  contentType: ContentTypeFilter;
  sortMode: SortMode;
  timeRange: TimeRange;
  limit: number;
  observationStrategy: ObservationStrategySnapshot | null;
  startedAt: Date;
}

export interface FinishCollectionRunInput {
  status: CollectionRunStatus;
  fetchedCount: number;
  postFetchedCount: number;
  commentFetchedCount: number;
  matchedCount: number;
  filteredByDateCount: number;
  insertedCount: number;
  duplicateCount: number;
  failedCount: number;
  titleOnlyCount: number;
  substantiveBodyCount: number;
  highPriorityCount: number;
  keywordStats: Record<string, KeywordStat>;
  contentTypeStats: ContentTypeStat;
  sortMode: SortMode;
  timeRange: TimeRange;
  errorMessage: string | null;
  finishedAt: Date;
  durationMs: number;
}

export interface InsertObservationsResult {
  insertedCount: number;
  failedCount: number;
  errorMessage: string | null;
}

/**
 * 수집 서비스가 의존하는 저장소 인터페이스.
 * 외부 API Adapter와 마찬가지로 분리해 두어 서비스 로직을 mock으로 테스트할 수 있게 한다.
 */
export interface CollectionRepository {
  createRun(input: CreateCollectionRunInput): Promise<string>;
  finishRun(runId: string, input: FinishCollectionRunInput): Promise<void>;
  /** 이미 저장된 external_id 집합 (source + external_id 유니크 제약과 같은 기준) */
  findExistingExternalIds(
    source: ObservationSource,
    externalIds: string[],
  ): Promise<Set<string>>;
  insertObservations(
    runId: string,
    observations: NormalizedObservation[],
  ): Promise<InsertObservationsResult>;
}
