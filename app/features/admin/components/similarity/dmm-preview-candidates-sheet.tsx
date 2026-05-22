import { EyeIcon } from "lucide-react";
import { useFetcher } from "react-router";

import { AdminErrorAlert } from "../admin-ui";
import { NexBadge, NexButton } from "~/core/components/nex";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/core/components/ui/sheet";
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
  DMM_SIMILARITY_PRODUCTION_THRESHOLD,
  matchedTagCount,
  type DmmPreviewCandidateRow,
  type DmmPreviewSummary,
} from "../../lib/dmm-similarity-preview";
import type { action } from "../../screens/dmm-similarities";

function parseScore(value: number | string | null | undefined): string {
  if (value == null || value === "") {
    return "—";
  }
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n.toFixed(3) : "—";
}

function PreviewSummaryGrid({ summary }: { summary: DmmPreviewSummary }) {
  const items = [
    { label: "비교 대상(final)", value: String(summary.eligibleTargetCount) },
    { label: "후보 수", value: String(summary.candidateCount) },
    {
      label: "max final",
      value:
        summary.maxFinalScore != null ? summary.maxFinalScore.toFixed(3) : "—",
    },
    {
      label: `≥ ${summary.productionThreshold} 통과`,
      value: String(summary.passThresholdCount),
    },
    {
      label: `미달 상위 (≤${summary.belowThresholdTopN})`,
      value:
        summary.maxBelowThresholdScore != null
          ? `max ${summary.maxBelowThresholdScore.toFixed(3)}`
          : "—",
    },
    { label: "미리보기 limit", value: String(summary.previewLimit) },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map(({ label, value }) => (
        <div
          key={label}
          className="border-border bg-muted/30 rounded-lg border px-3 py-2"
        >
          <p className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
            {label}
          </p>
          <p className="text-foreground mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
        </div>
      ))}
    </div>
  );
}

function CandidatesTable({
  rows,
  emptyMessage,
}: {
  rows: DmmPreviewCandidateRow[];
  emptyMessage: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground border-border rounded-lg border border-dashed px-4 py-6 text-center text-sm">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="border-border overflow-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-muted-foreground text-xs">market_date</TableHead>
            <TableHead className="text-muted-foreground text-xs">final</TableHead>
            <TableHead className="text-muted-foreground hidden text-xs sm:table-cell">
              vector
            </TableHead>
            <TableHead className="text-muted-foreground hidden text-xs sm:table-cell">
              tag
            </TableHead>
            <TableHead className="text-muted-foreground text-xs">통과</TableHead>
            <TableHead className="text-muted-foreground hidden text-xs md:table-cell">
              tags
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.target_daily_market_memory_id} className="border-border/60">
              <TableCell className="align-top text-xs whitespace-nowrap">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{row.target_market_date ?? "—"}</span>
                  <code className="text-muted-foreground font-mono text-[9px]">
                    {row.target_daily_market_memory_id.slice(0, 8)}…
                  </code>
                </div>
              </TableCell>
              <TableCell className="align-top text-xs tabular-nums font-medium">
                {parseScore(row.final_score)}
              </TableCell>
              <TableCell className="text-muted-foreground hidden align-top text-xs tabular-nums sm:table-cell">
                {parseScore(row.vector_score)}
              </TableCell>
              <TableCell className="text-muted-foreground hidden align-top text-xs tabular-nums sm:table-cell">
                {parseScore(row.tag_score)}
              </TableCell>
              <TableCell className="align-top">
                <NexBadge
                  variant={row.passes_production_threshold ? "success" : "warning"}
                  size="sm"
                >
                  {row.passes_production_threshold
                    ? `≥ ${DMM_SIMILARITY_PRODUCTION_THRESHOLD}`
                    : "미달"}
                </NexBadge>
              </TableCell>
              <TableCell className="text-muted-foreground hidden align-top text-xs md:table-cell">
                {matchedTagCount(row.matched_tags)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function PreviewSection({
  title,
  description,
  rows,
  emptyMessage,
}: {
  title: string;
  description?: string;
  rows: DmmPreviewCandidateRow[];
  emptyMessage: string;
}) {
  return (
    <section className="space-y-2">
      <div>
        <h3 className="text-foreground text-sm font-semibold">{title}</h3>
        {description ? (
          <p className="text-muted-foreground mt-0.5 text-xs leading-relaxed">{description}</p>
        ) : null}
      </div>
      <CandidatesTable rows={rows} emptyMessage={emptyMessage} />
    </section>
  );
}

export function DmmPreviewCandidatesSheet({
  open,
  onOpenChange,
  fetcher,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fetcher: ReturnType<typeof useFetcher<typeof action>>;
}) {
  const busy = fetcher.state !== "idle";
  const payload = fetcher.data;

  const preview =
    payload && "preview" in payload && payload.preview ? payload.preview : null;
  const errorMessage =
    payload && "message" in payload && payload.message ? payload.message : null;

  const title = preview
    ? `${preview.source.market_date} · ${preview.source.market_scope}`
    : "후보 미리보기";

  const threshold = preview?.summary.productionThreshold ?? DMM_SIMILARITY_PRODUCTION_THRESHOLD;
  const topN = preview?.summary.belowThresholdTopN ?? 3;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-xl">
        <SheetHeader className="border-border shrink-0 border-b pb-4">
          <SheetTitle className="text-base">{title}</SheetTitle>
          <SheetDescription>
            DB에 저장하지 않습니다. 동일 scope의 final 전체에 점수를 매기며, 프로덕션 삽입 기준은
            final ≥{threshold} 입니다. 통과 후보와 기준 미달 상위 {topN}건을 따로 표시합니다.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-4">
          {errorMessage ? (
            <AdminErrorAlert message={errorMessage} context="후보 미리보기 RPC" />
          ) : null}

          {busy && !preview ? (
            <p className="text-muted-foreground text-sm">후보를 계산하는 중…</p>
          ) : null}

          {preview ? (
            <>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <NexBadge variant="outline" size="sm">
                  source {preview.source.status}
                </NexBadge>
                {preview.source.similarity_status ? (
                  <NexBadge variant="outline" size="sm">
                    similarity {preview.source.similarity_status}
                  </NexBadge>
                ) : null}
              </div>

              <PreviewSummaryGrid summary={preview.summary} />

              {preview.summary.eligibleTargetCount === 0 ? (
                <p className="text-muted-foreground text-xs leading-relaxed">
                  동일 scope에 비교할 final 메모리가 없습니다. final 확정 후 다시 미리보기해 주세요.
                </p>
              ) : null}

              <PreviewSection
                title={`프로덕션 통과 (final ≥ ${threshold})`}
                description="유사도 생성 시 DB에 저장되는 후보입니다."
                rows={preview.partition.passedCandidates}
                emptyMessage={`기준(${threshold}) 이상 후보가 없습니다.`}
              />

              <PreviewSection
                title={`기준 미달 상위 ${topN}`}
                description={`final < ${threshold} 이지만 점수가 가장 높은 후보입니다. 임계값·가중치 튜닝 참고용입니다.`}
                rows={preview.partition.belowThresholdTop}
                emptyMessage={
                  preview.summary.eligibleTargetCount === 0
                    ? "비교 대상(final)이 없어 점수를 계산할 수 없습니다."
                    : preview.summary.belowThresholdCount === 0
                      ? "미달 후보가 없습니다(모두 통과했거나 후보 풀이 비어 있습니다)."
                      : `미달 후보가 있으나 상위 ${topN}건을 표시할 수 없습니다.`
                }
              />
            </>
          ) : !busy && !errorMessage && !preview ? (
            <p className="text-muted-foreground text-sm">행의 「후보 미리보기」로 조회합니다.</p>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function DmmPreviewCandidatesButton({
  sourceDailyMarketMemoryId,
  onPreview,
  busy,
  className,
}: {
  sourceDailyMarketMemoryId: string;
  onPreview: (sourceId: string) => void;
  busy: boolean;
  className?: string;
}) {
  return (
    <NexButton
      type="button"
      variant="secondary"
      size="sm"
      leftIcon={<EyeIcon className="size-4" aria-hidden />}
      loading={busy}
      disabled={busy}
      className={cn(className)}
      aria-label="유사도 후보 미리보기"
      onClick={() => onPreview(sourceDailyMarketMemoryId)}
    >
      후보 미리보기
    </NexButton>
  );
}
