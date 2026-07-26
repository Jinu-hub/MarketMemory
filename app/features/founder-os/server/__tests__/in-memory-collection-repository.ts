import type {
  NormalizedObservation,
  ObservationSource,
} from "../../domain/observation.types";
import type {
  CollectionRepository,
  CreateCollectionRunInput,
  FinishCollectionRunInput,
} from "../collection-repository";

export type StoredRun = CreateCollectionRunInput &
  Partial<FinishCollectionRunInput> & { id: string };

/** 테스트용 저장소 — `source + external_id` 유니크 제약을 메모리에서 흉내 낸다. */
export function createInMemoryCollectionRepository() {
  const runs = new Map<string, StoredRun>();
  const observations = new Map<string, NormalizedObservation>();
  let runSequence = 0;

  const key = (source: ObservationSource, externalId: string) =>
    `${source}:${externalId}`;

  const repository: CollectionRepository = {
    async createRun(input) {
      runSequence += 1;
      const id = `run-${runSequence}`;
      runs.set(id, { ...input, id });
      return id;
    },

    async finishRun(runId, input) {
      const run = runs.get(runId);
      if (!run) {
        throw new Error(`unknown run: ${runId}`);
      }
      runs.set(runId, { ...run, ...input });
    },

    async findExistingExternalIds(source, externalIds) {
      const existing = new Set<string>();
      for (const externalId of externalIds) {
        if (observations.has(key(source, externalId))) {
          existing.add(externalId);
        }
      }
      return existing;
    },

    async insertObservations(_runId, items) {
      let insertedCount = 0;
      for (const item of items) {
        const mapKey = key(item.source, item.externalId);
        if (observations.has(mapKey)) {
          continue;
        }
        observations.set(mapKey, item);
        insertedCount += 1;
      }
      return { insertedCount, failedCount: 0, errorMessage: null };
    },
  };

  return { repository, runs, observations };
}
