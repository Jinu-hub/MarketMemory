import type { RecentCollectionRun } from "../server/queries.server";

import { NexBadge } from "~/core/components/nex";
import { Checkbox } from "~/core/components/ui/checkbox";
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
  sourceLabel,
} from "../lib/observation-display";

export function IntelligenceRunTable({
  runs,
  selectedRunId,
  checkedIds,
  onToggleCheck,
  onToggleAll,
  onSelectRun,
}: {
  runs: RecentCollectionRun[];
  selectedRunId: string | null;
  checkedIds: Set<string>;
  onToggleCheck: (runId: string, checked: boolean) => void;
  onToggleAll: (checked: boolean) => void;
  onSelectRun: (runId: string) => void;
}) {
  if (runs.length === 0) {
    return (
      <AdminTableShell>
        <AdminEmptyState
          title="아직 수집 실행 이력이 없습니다."
          hint="소스 수집에서 관찰 데이터를 먼저 모아 주세요."
        />
      </AdminTableShell>
    );
  }

  const allChecked = runs.every((run) => checkedIds.has(run.id));
  const someChecked = runs.some((run) => checkedIds.has(run.id));

  return (
    <AdminTableShell>
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className={cn(adminThClass, "w-10")}>
              <Checkbox
                checked={allChecked ? true : someChecked ? "indeterminate" : false}
                onCheckedChange={(value) => onToggleAll(value === true)}
                aria-label="전체 선택"
              />
            </TableHead>
            <TableHead className={adminThClass}>실행 일시</TableHead>
            <TableHead className={adminThClass}>Source</TableHead>
            <TableHead className={adminThClass}>Keywords</TableHead>
            <TableHead className={adminThClass}>상태</TableHead>
            <TableHead className={cn(adminThClass, "text-right")}>저장</TableHead>
            <TableHead className={cn(adminThClass, "text-right")}>
              Intelligence
            </TableHead>
            <TableHead className={cn(adminThClass, "text-right")}>
              실행 시간
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((run) => {
            const isSelected = run.id === selectedRunId;
            const isChecked = checkedIds.has(run.id);
            return (
              <TableRow
                key={run.id}
                className={cn(
                  "border-border/80 align-top cursor-pointer",
                  isSelected && "bg-muted/40",
                )}
                onClick={() => onSelectRun(run.id)}
                aria-selected={isSelected}
              >
                <TableCell
                  className={adminTdClass}
                  onClick={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={(value) =>
                      onToggleCheck(run.id, value === true)
                    }
                    aria-label={`${formatDateTime(run.started_at)} 실행 선택`}
                  />
                </TableCell>
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
                </TableCell>
                <TableCell className={cn(adminTdClass, "max-w-[16rem]")}>
                  <ul className="flex flex-wrap gap-1">
                    {run.keywords.slice(0, 4).map((keyword) => (
                      <li key={keyword}>
                        <NexBadge variant="outline" size="sm">
                          {keyword}
                        </NexBadge>
                      </li>
                    ))}
                    {run.keywords.length > 4 ? (
                      <li>
                        <NexBadge variant="secondary" size="sm">
                          +{run.keywords.length - 4}
                        </NexBadge>
                      </li>
                    ) : null}
                  </ul>
                </TableCell>
                <TableCell className={adminTdClass}>
                  <NexBadge variant={runStatusVariant(run.status)} size="sm">
                    {runStatusLabel(run.status)}
                  </NexBadge>
                </TableCell>
                <TableCell
                  className={cn(adminTdClass, "text-right tabular-nums")}
                >
                  {run.inserted_count}
                </TableCell>
                <TableCell
                  className={cn(adminTdClass, "text-right tabular-nums")}
                >
                  {run.intelligence_number ?? 0}
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
            );
          })}
        </TableBody>
      </Table>
    </AdminTableShell>
  );
}
