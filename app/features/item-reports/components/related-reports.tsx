import { useEffect, useState } from "react";
import { Link2Icon, PenLineIcon } from "lucide-react";
import { useFetcher } from "react-router";

import { cn } from "~/core/lib/utils";
import { NexBadge, NexButton } from "~/core/components/nex";

import type { RelatedReportItem } from "../types";
import { ReportListRow } from "./report-list-row";

type RelatedReportsProps = {
  reports: RelatedReportItem[];
  /** When true, show a link to admin similarity tooling for this source report. */
  isAdmin?: boolean;
  /** Source `item_contents.id` for the admin deep link (required when `isAdmin`). */
  sourceReportId?: string;
  className?: string;
  /**
   * Tailwind height utility applied to the outer `<section>`.
   *
   * Two recommended modes:
   *   - **Fixed cap** (default) — `max-h-[28rem]`. The card itself caps at
   *     ~448px and the list scrolls inside it.
   *   - **Flex-fill** — pass `lg:max-h-none` together with a flex parent
   *     that has `min-h-0` so the card grows to fill the remaining space
   *     and the list scrolls inside the leftover area. This is what the
   *     detail-page sidebar uses so the related-reports list stays visible
   *     alongside the report meta block at any viewport height.
   */
  maxHeightClassName?: string;
};

/**
 * Sidebar block listing related reports. Each row uses the category accent
 * so users recognise category shifts at a glance (e.g. switching from a
 * `market` story to a `watchlist` signal).
 *
 * Implementation notes:
 *   - Uses **plain `overflow-y-auto`** rather than Radix `ScrollArea`. Radix
 *     needs an unambiguous height chain; in our flex-fill sidebar that
 *     chain collapsed in some viewports and the list silently overflowed
 *     the card. A native scroll container is more robust.
 *   - The card owns the height cap (`max-h-*`) and `overflow-hidden`, so
 *     the cap is enforced visually no matter what the children contain.
 *   - **Single-flex layout**: the scrolling `<ul>` is itself the flex-1
 *     child of the section. This avoids an intermediate wrapper whose
 *     `flex-1 / min-h-0` size sometimes failed to propagate to a `h-full`
 *     descendant.
 *   - `overscroll-contain` keeps the page from chain-scrolling once the
 *     list reaches its end.
 *   - Soft top/bottom fades hint that more rows exist beyond the viewport
 *     (rule §15 — never rely on color alone to convey state).
 */

type RelatedRegenerateActionData =
  | { ok: true; inserted: number; related: RelatedReportItem[] }
  | { message: string };

function AdminRelatedRegenerateButton({
  sourceReportId,
  onRelatedUpdated,
}: {
  sourceReportId: string;
  onRelatedUpdated: (related: RelatedReportItem[]) => void;
}) {
  const fetcher = useFetcher<RelatedRegenerateActionData>();
  const busy = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state !== "idle") return;
    const d = fetcher.data;
    if (d && "ok" in d && d.ok) {
      onRelatedUpdated(d.related);
    }
  }, [fetcher.state, fetcher.data, onRelatedUpdated]);

  const errorMessage =
    fetcher.data && "message" in fetcher.data ? fetcher.data.message : null;
  const success =
    fetcher.state === "idle" && fetcher.data && "ok" in fetcher.data && fetcher.data.ok
      ? fetcher.data
      : null;

  return (
    <div className="flex w-full flex-col gap-2">
      <fetcher.Form method="post" className="w-full">
        <input type="hidden" name="intent" value="regenerate_related" />
        <input type="hidden" name="source_item_id" value={sourceReportId} />
        <NexButton
          type="submit"
          variant="secondary"
          size="sm"
          className="w-full"
          loading={busy}
          disabled={busy}
          leftIcon={<PenLineIcon className="size-4" aria-hidden />}
          aria-label="이 리포트의 관련 리포트 유사도를 계산해 반영합니다"
        >
          관련성 작성
        </NexButton>
      </fetcher.Form>
      {errorMessage ? (
        <p className="text-destructive px-0.5 text-xs leading-snug" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {success ? (
        <p className="text-muted-foreground px-0.5 text-xs tabular-nums">
          반영 완료 · 연결 {success.inserted}건
        </p>
      ) : null}
    </div>
  );
}

export function RelatedReports({
  reports,
  isAdmin = false,
  sourceReportId,
  className,
  maxHeightClassName = "max-h-[28rem]",
}: RelatedReportsProps) {
  const [displayReports, setDisplayReports] = useState(reports ?? []);

  useEffect(() => {
    setDisplayReports(reports ?? []);
  }, [reports]);

  const list = displayReports;
  const sortedReports = [...list].sort((a, b) => {
    const rankA = a.ranking ?? 9999;
    const rankB = b.ranking ?? 9999;
    if (rankA !== rankB) return rankA - rankB;
    return (b.final_score ?? -1) - (a.final_score ?? -1);
  });

  const showAdminLink = isAdmin === true && Boolean(sourceReportId);

  return (
    <section
      className={cn(
        "border-border bg-card flex min-h-0 flex-col overflow-hidden rounded-xl border",
        maxHeightClassName,
        className,
      )}
    >
      <div className="border-border/60 flex shrink-0 flex-col gap-3 border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <Link2Icon className="text-muted-foreground size-4 shrink-0" />
          <h3 className="text-sm font-semibold tracking-tight">관련 리포트</h3>
          <NexBadge
            variant="secondary"
            size="sm"
            className="ml-auto h-6 shrink-0 px-2.5 text-[11px] font-semibold tabular-nums"
          >
            {list.length}
          </NexBadge>
        </div>
        {showAdminLink && sourceReportId ? (
          <AdminRelatedRegenerateButton
            sourceReportId={sourceReportId}
            onRelatedUpdated={setDisplayReports}
          />
        ) : null}
      </div>

      {list.length === 0 ? (
        <div className="flex min-h-[8rem] flex-col items-center justify-center gap-2 px-5 py-8 text-center">
          <p className="text-muted-foreground max-w-[240px] text-sm leading-relaxed">
            아직 표시할 관련 리포트가 없습니다. 같은 주제나 유사한 후속 분석이 연결되면 여기에
            나타납니다.
          </p>
          {!showAdminLink ? (
            <p className="text-muted-foreground/80 text-xs">
              유사도 파이프라인이 아직 반영되지 않았을 수 있습니다.
            </p>
          ) : null}
        </div>
      ) : (
      <ul className="scrollbar-thin min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-3">
        {sortedReports.map((report) => (
          <li key={report.id}>
            <ReportListRow
              layout="related"
              report={report}
              similarityLevel={report.similarity_level}
            />
          </li>
        ))}
      </ul>
      )}
    </section>
  );
}
