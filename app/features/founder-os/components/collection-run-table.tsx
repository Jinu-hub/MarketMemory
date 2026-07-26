import type { RecentCollectionRun } from "../server/queries.server";

import { NexBadge } from "~/core/components/nex";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/core/components/ui/table";
import { cn } from "~/core/lib/utils";
import {
  AdminEmptyState,
  AdminTableShell,
  adminTdClass,
  adminThClass,
} from "~/features/admin/components/admin-ui";

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

const NUMERIC_HEADERS = ["조회", "매칭", "저장", "중복", "High"] as const;

function readStrategy(
  value: RecentCollectionRun["observation_strategy"],
): ObservationStrategySnapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const raw = value as {
    domains?: Array<{ id?: string; label?: string }>;
    signals?: Array<{ id?: string; label?: string }>;
  };
  const domains = (raw.domains ?? [])
    .filter((item) => typeof item?.id === "string" && typeof item?.label === "string")
    .map((item) => ({ id: item.id as string, label: item.label as string }));
  const signals = (raw.signals ?? [])
    .filter((item) => typeof item?.id === "string" && typeof item?.label === "string")
    .map((item) => ({ id: item.id as string, label: item.label as string }));
  if (domains.length === 0 && signals.length === 0) {
    return null;
  }
  return { domains, signals };
}

export function CollectionRunTable({ runs }: { runs: RecentCollectionRun[] }) {
  if (runs.length === 0) {
    return (
      <AdminTableShell>
        <AdminEmptyState
          title="아직 수집 실행 이력이 없습니다."
          hint="위에서 키워드를 입력하고 「관찰 데이터 수집」을 실행해 보세요."
        />
      </AdminTableShell>
    );
  }

  return (
    <AdminTableShell>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className={adminThClass}>실행 일시</TableHead>
            <TableHead className={adminThClass}>Source</TableHead>
            <TableHead className={adminThClass}>Keywords</TableHead>
            <TableHead className={adminThClass}>상태</TableHead>
            {NUMERIC_HEADERS.map((header) => (
              <TableHead
                key={header}
                className={cn(adminThClass, "text-right")}
              >
                {header}
              </TableHead>
            ))}
            <TableHead className={cn(adminThClass, "text-right")}>
              실행 시간
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((run) => (
            <TableRow key={run.id} className="border-border/80 align-top">
              <TableCell className={cn(adminTdClass, "whitespace-nowrap")}>
                <span className="text-foreground">
                  {formatDateTime(run.started_at)}
                </span>
              </TableCell>
              <TableCell className={adminTdClass}>
                <span className="text-foreground">
                  {sourceLabel(run.source)}
                </span>
                <span className="text-muted-foreground block text-xs">
                  {contentTypeFilterLabel(run.content_type)} · 최대{" "}
                  {run.requested_limit}
                </span>
                <span className="text-muted-foreground block text-xs">
                  {sortModeLabel(run.sort_mode)} ·{" "}
                  {timeRangeLabel(run.time_range)}
                </span>
              </TableCell>
              <TableCell className={cn(adminTdClass, "max-w-[18rem]")}>
                {(() => {
                  const strategy = readStrategy(run.observation_strategy);
                  if (!strategy) {
                    return null;
                  }
                  const labels = [
                    ...strategy.domains.map((item) => item.label),
                    ...strategy.signals.map((item) => item.label),
                  ];
                  return (
                    <p className="text-muted-foreground mb-1.5 text-[11px] leading-snug">
                      {labels.join(" · ")}
                    </p>
                  );
                })()}
                <ul className="flex flex-wrap gap-1">
                  {run.keywords.map((keyword) => (
                    <li key={keyword}>
                      <NexBadge variant="outline" size="sm">
                        {keyword}
                      </NexBadge>
                    </li>
                  ))}
                </ul>
              </TableCell>
              <TableCell className={adminTdClass}>
                <NexBadge variant={runStatusVariant(run.status)} size="sm">
                  {runStatusLabel(run.status)}
                </NexBadge>
                {run.error_message ? (
                  <p className="text-muted-foreground mt-1 max-w-[16rem] text-xs leading-snug">
                    {run.error_message}
                  </p>
                ) : null}
              </TableCell>
              <TableCell
                className={cn(adminTdClass, "text-right tabular-nums")}
              >
                {run.fetched_count}
              </TableCell>
              <TableCell
                className={cn(adminTdClass, "text-right tabular-nums")}
              >
                {run.matched_count}
              </TableCell>
              <TableCell
                className={cn(adminTdClass, "text-right tabular-nums")}
              >
                {run.inserted_count}
              </TableCell>
              <TableCell
                className={cn(adminTdClass, "text-right tabular-nums")}
              >
                {run.duplicate_count}
              </TableCell>
              <TableCell
                className={cn(adminTdClass, "text-right tabular-nums")}
              >
                {run.high_priority_count}
              </TableCell>
              <TableCell
                className={cn(
                  adminTdClass,
                  "text-muted-foreground text-right whitespace-nowrap tabular-nums",
                )}
              >
                {formatDuration(run.duration_ms)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AdminTableShell>
  );
}
