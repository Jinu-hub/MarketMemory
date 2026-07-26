import type { CollectionRunSummary } from "../domain/observation.types";
import type { CollectRequest } from "../lib/collect-request";
import type { FounderOsDb } from "../lib/db";

import { getSourceAdapter } from "../sources";
import { collectObservations } from "./collect-observations.server";
import { createSupabaseCollectionRepository } from "./supabase-collection-repository.server";

/** 화면 action과 API 라우트가 공유하는 실행 진입점 */
export async function runCollection(
  client: FounderOsDb,
  request: CollectRequest,
): Promise<CollectionRunSummary> {
  return collectObservations(request, {
    repository: createSupabaseCollectionRepository(client),
    adapter: getSourceAdapter(request.source),
  });
}
