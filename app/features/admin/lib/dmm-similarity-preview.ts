/** Production insert threshold (must match SQL regenerate / compute default). */
export const DMM_SIMILARITY_PRODUCTION_THRESHOLD = 0.6;

export const DMM_SIMILARITY_PREVIEW_LIMIT = 50;

/** Admin sheet: show up to this many below-threshold candidates for tuning. */
export const DMM_SIMILARITY_BELOW_THRESHOLD_TOP_N = 3;

export type DmmPreviewCandidateRow = {
  target_daily_market_memory_id: string;
  target_market_date: string | null;
  target_status: string | null;
  vector_score: number | string;
  tag_score: number | string;
  final_score: number | string;
  matched_tags: unknown;
  passes_production_threshold: boolean;
};

export type DmmPreviewSummary = {
  candidateCount: number;
  maxFinalScore: number | null;
  passThresholdCount: number;
  belowThresholdCount: number;
  belowThresholdTopCount: number;
  maxBelowThresholdScore: number | null;
  eligibleTargetCount: number;
  productionThreshold: number;
  previewLimit: number;
  belowThresholdTopN: number;
};

export type DmmPreviewPartition = {
  passedCandidates: DmmPreviewCandidateRow[];
  belowThresholdTop: DmmPreviewCandidateRow[];
};

function parseScore(value: number | string | null | undefined): number | null {
  if (value == null || value === "") {
    return null;
  }
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export function matchedTagCount(matchedTags: unknown): number {
  if (!matchedTags) {
    return 0;
  }
  if (Array.isArray(matchedTags)) {
    return matchedTags.length;
  }
  return 0;
}

function sortByFinalDesc(candidates: DmmPreviewCandidateRow[]): DmmPreviewCandidateRow[] {
  return [...candidates].sort((a, b) => {
    const diff = (parseScore(b.final_score) ?? 0) - (parseScore(a.final_score) ?? 0);
    if (diff !== 0) {
      return diff;
    }
    return a.target_daily_market_memory_id.localeCompare(b.target_daily_market_memory_id);
  });
}

export function partitionDmmPreviewCandidates(
  candidates: DmmPreviewCandidateRow[],
): DmmPreviewPartition {
  const sorted = sortByFinalDesc(candidates);
  const passedCandidates = sorted.filter((c) => c.passes_production_threshold);
  const below = sorted.filter((c) => !c.passes_production_threshold);
  const belowThresholdTop = below.slice(0, DMM_SIMILARITY_BELOW_THRESHOLD_TOP_N);

  return { passedCandidates, belowThresholdTop };
}

export function buildDmmPreviewSummary(
  candidates: DmmPreviewCandidateRow[],
  eligibleTargetCount: number,
  partition?: DmmPreviewPartition,
): DmmPreviewSummary {
  const { passedCandidates, belowThresholdTop } =
    partition ?? partitionDmmPreviewCandidates(candidates);

  const finals = candidates
    .map((c) => parseScore(c.final_score))
    .filter((n): n is number => n != null);

  const belowScores = belowThresholdTop
    .map((c) => parseScore(c.final_score))
    .filter((n): n is number => n != null);

  const maxFinalScore = finals.length > 0 ? Math.max(...finals) : null;
  const passThresholdCount = passedCandidates.length;
  const belowThresholdCount = candidates.filter((c) => !c.passes_production_threshold).length;

  return {
    candidateCount: candidates.length,
    maxFinalScore,
    passThresholdCount,
    belowThresholdCount,
    belowThresholdTopCount: belowThresholdTop.length,
    maxBelowThresholdScore: belowScores.length > 0 ? Math.max(...belowScores) : null,
    eligibleTargetCount,
    productionThreshold: DMM_SIMILARITY_PRODUCTION_THRESHOLD,
    previewLimit: DMM_SIMILARITY_PREVIEW_LIMIT,
    belowThresholdTopN: DMM_SIMILARITY_BELOW_THRESHOLD_TOP_N,
  };
}
