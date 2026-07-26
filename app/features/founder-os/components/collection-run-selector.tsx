import type { RecentCollectionRun } from "../server/queries.server";

import { RotateCcwIcon } from "lucide-react";

import { NexBadge, NexButton } from "~/core/components/nex";
import { AdminPanel } from "~/features/admin/components/admin-ui";

import {
  contentTypeFilterLabel,
  formatDateTime,
  formatDuration,
  runStatusLabel,
  runStatusVariant,
  sortModeLabel,
  sourceLabel,
  timeRangeLabel,
} from "../lib/observation-display";
import type { ObservationStrategySnapshot } from "../lib/observation-strategy";

function strategyLabels(value: RecentCollectionRun["observation_strategy"]) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }
  const strategy = value as Partial<ObservationStrategySnapshot>;
  return [
    ...(Array.isArray(strategy.domains) ? strategy.domains : []),
    ...(Array.isArray(strategy.signals) ? strategy.signals : []),
  ]
    .map((item) => item?.label)
    .filter((label): label is string => typeof label === "string");
}

const METRICS = [
  ["조회", "fetched_count"],
  ["매칭", "matched_count"],
  ["저장", "inserted_count"],
  ["중복", "duplicate_count"],
  ["본문 있음", "substantive_body_count"],
  ["High", "high_priority_count"],
] as const;

export function CollectionRunSelector({
  runs,
  selectedRun,
  onSelect,
  onLoadConditions,
}: {
  runs: RecentCollectionRun[];
  selectedRun: RecentCollectionRun | null;
  onSelect: (runId: string) => void;
  onLoadConditions: (run: RecentCollectionRun) => void;
}) {
  if (!selectedRun) {
    return (
      <AdminPanel padding="lg">
        <p className="text-muted-foreground text-sm">
          아직 수집 실행 이력이 없습니다.
        </p>
      </AdminPanel>
    );
  }

  const labels = strategyLabels(selectedRun.observation_strategy);

  return (
    <AdminPanel padding="lg" className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 flex-1 space-y-1.5">
          <label
            htmlFor="collection-run-selector"
            className="text-foreground text-sm font-medium"
          >
            실행 선택
          </label>
          <select
            id="collection-run-selector"
            value={selectedRun.id}
            onChange={(event) => onSelect(event.target.value)}
            className="border-border bg-background text-foreground focus:border-primary h-10 w-full rounded-lg border px-3 text-sm outline-none"
          >
            {runs.map((run, index) => (
              <option key={run.id} value={run.id}>
                {index === 0 ? "최신 · " : ""}
                {formatDateTime(run.started_at)} · {runStatusLabel(run.status)} ·{" "}
                {run.keywords.slice(0, 2).join(", ")}
              </option>
            ))}
          </select>
        </div>
        <NexButton
          type="button"
          variant="secondary"
          size="md"
          onClick={() => onLoadConditions(selectedRun)}
          leftIcon={<RotateCcwIcon className="size-4" aria-hidden />}
        >
          이 조건 불러오기
        </NexButton>
      </div>

      <div className="border-border flex flex-wrap items-center gap-2 border-t pt-4">
        <NexBadge variant={runStatusVariant(selectedRun.status)} size="sm">
          {runStatusLabel(selectedRun.status)}
        </NexBadge>
        <span className="text-foreground text-sm font-medium">
          {sourceLabel(selectedRun.source)}
        </span>
        <span className="text-muted-foreground text-xs">
          {contentTypeFilterLabel(selectedRun.content_type)} ·{" "}
          {sortModeLabel(selectedRun.sort_mode)} ·{" "}
          {timeRangeLabel(selectedRun.time_range)} · 최대{" "}
          {selectedRun.requested_limit} ·{" "}
          {formatDuration(selectedRun.duration_ms)}
        </span>
      </div>

      {labels.length > 0 ? (
        <p className="text-muted-foreground text-xs">{labels.join(" · ")}</p>
      ) : null}

      <ul className="flex flex-wrap gap-1.5">
        {selectedRun.keywords.map((keyword) => (
          <li key={keyword}>
            <NexBadge variant="outline" size="sm">
              {keyword}
            </NexBadge>
          </li>
        ))}
      </ul>

      <dl className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {METRICS.map(([label, key]) => (
          <div key={key}>
            <dt className="text-muted-foreground text-[11px]">{label}</dt>
            <dd className="text-foreground mt-0.5 text-xl font-semibold tabular-nums">
              {selectedRun[key]}
            </dd>
          </div>
        ))}
      </dl>

      {selectedRun.error_message ? (
        <p className="border-border bg-muted/30 text-foreground rounded-md border px-3 py-2 text-sm">
          {selectedRun.error_message}
        </p>
      ) : null}
    </AdminPanel>
  );
}
