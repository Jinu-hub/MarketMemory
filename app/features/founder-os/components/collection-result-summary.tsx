import type { CollectionRunSummary } from "../domain/observation.types";

import { NexBadge } from "~/core/components/nex";
import { AdminPanel } from "~/features/admin/components/admin-ui";

import {
  formatDuration,
  runStatusLabel,
  runStatusVariant,
  sortModeLabel,
  timeRangeLabel,
} from "../lib/observation-display";

type NumericMetricKey =
  | "fetchedCount"
  | "postFetchedCount"
  | "commentFetchedCount"
  | "matchedCount"
  | "filteredByDateCount"
  | "insertedCount"
  | "duplicateCount"
  | "titleOnlyCount"
  | "substantiveBodyCount"
  | "highPriorityCount"
  | "failedCount";

const METRICS: Array<{ key: NumericMetricKey; label: string; hint: string }> = [
  { key: "fetchedCount", label: "조회", hint: "외부 API 응답 건수" },
  { key: "postFetchedCount", label: "게시글 조회", hint: "story 응답 건수" },
  { key: "commentFetchedCount", label: "댓글 조회", hint: "comment 응답 건수" },
  { key: "matchedCount", label: "키워드 매칭", hint: "키워드 포함(고유) 건수" },
  { key: "filteredByDateCount", label: "기간 제외", hint: "기간 필터로 제외" },
  { key: "insertedCount", label: "신규 저장", hint: "새로 저장한 건수" },
  { key: "duplicateCount", label: "중복 제외", hint: "이미 저장·중복 건수" },
  { key: "titleOnlyCount", label: "제목만", hint: "본문이 제목과 동일" },
  { key: "substantiveBodyCount", label: "본문 있음", hint: "실질 본문 보유" },
  { key: "highPriorityCount", label: "High", hint: "우선 검토 후보" },
  { key: "failedCount", label: "실패", hint: "저장에 실패한 건수" },
];

export function CollectionResultSummary({
  summary,
}: {
  summary: CollectionRunSummary;
}) {
  const keywordEntries = Object.entries(summary.keywordStats ?? {});

  return (
    <AdminPanel padding="lg" className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <NexBadge variant={runStatusVariant(summary.status)} size="md">
          {runStatusLabel(summary.status)}
        </NexBadge>
        <span className="text-muted-foreground text-sm">
          실행 시간 {formatDuration(summary.durationMs)}
        </span>
        <NexBadge variant="secondary" size="sm">
          {sortModeLabel(summary.sortMode)}
        </NexBadge>
        <NexBadge variant="secondary" size="sm">
          {timeRangeLabel(summary.timeRange)}
        </NexBadge>
        <span className="text-muted-foreground font-mono text-xs break-all">
          run {summary.runId}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {METRICS.map((metric) => (
          <div key={metric.key} className="space-y-1">
            <dt className="text-muted-foreground text-xs font-medium">
              {metric.label}
            </dt>
            <dd className="text-foreground text-2xl font-semibold tabular-nums">
              {summary[metric.key]}
            </dd>
            <p className="text-muted-foreground text-[11px] leading-tight">
              {metric.hint}
            </p>
          </div>
        ))}
      </dl>

      <div className="grid gap-4 md:grid-cols-2">
        {keywordEntries.length > 0 ? (
          <div className="border-border bg-muted/20 space-y-2 rounded-lg border p-4">
            <h4 className="text-foreground text-sm font-semibold">
              키워드별 통계
            </h4>
            <ul className="space-y-1.5">
              {keywordEntries.map(([keyword, stat]) => (
                <li
                  key={keyword}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-foreground truncate">{keyword}</span>
                  <span className="text-muted-foreground shrink-0 font-mono text-xs tabular-nums">
                    조회 {stat.fetched} · 매칭 {stat.matched} · 저장{" "}
                    {stat.inserted}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="border-border bg-muted/20 space-y-2 rounded-lg border p-4">
          <h4 className="text-foreground text-sm font-semibold">
            콘텐츠 타입별 저장
          </h4>
          <div className="flex gap-6">
            <div className="space-y-0.5">
              <p className="text-muted-foreground text-xs">게시글</p>
              <p className="text-foreground text-xl font-semibold tabular-nums">
                {summary.contentTypeStats?.post ?? 0}
              </p>
            </div>
            <div className="space-y-0.5">
              <p className="text-muted-foreground text-xs">댓글</p>
              <p className="text-foreground text-xl font-semibold tabular-nums">
                {summary.contentTypeStats?.comment ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {summary.errorMessage ? (
        <p className="border-border bg-muted/40 text-foreground rounded-lg border px-3 py-2.5 text-sm leading-relaxed">
          <span className="text-muted-foreground mr-2 text-xs font-semibold uppercase">
            오류
          </span>
          {summary.errorMessage}
        </p>
      ) : null}
    </AdminPanel>
  );
}
