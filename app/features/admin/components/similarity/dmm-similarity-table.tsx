import { useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";
import { useSearchParams } from "react-router";

import {
  AdminSortAffix,
  AdminTableShell,
  adminSortColumnButtonClass,
  adminTdClass,
} from "../admin-ui";
import { DmmRegenerateRowForm } from "./dmm-regenerate-row-form";
import { SimilaritySummaryCell } from "./similarity-summary-cell";
import { NexBadge, NexInput } from "~/core/components/nex";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/core/components/ui/table";
import { useFilteredList, useTableSortState } from "../../hooks/use-table-sort-filter";
import type {
  DailyMarketMemorySimilarityListRow,
  DmmSimilarityEdgeListRow,
} from "../../queries/dmm-similarity";
import { cn } from "~/core/lib/utils";

export type DmmSimilarityRowModel = {
  memory: DailyMarketMemorySimilarityListRow;
  edges: DmmSimilarityEdgeListRow[];
  similarityStatus: "ready" | "done" | "nothing" | "pending";
};

function parseFinalScore(s: number | string | null | undefined): number {
  if (s == null || s === "") {
    return Number.NEGATIVE_INFINITY;
  }
  const n = typeof s === "number" ? s : Number(s);
  return Number.isFinite(n) ? n : Number.NEGATIVE_INFINITY;
}

function topScore(edges: DmmSimilarityEdgeListRow[]): number {
  if (edges.length === 0) {
    return Number.NEGATIVE_INFINITY;
  }
  return Math.max(...edges.map((e) => parseFinalScore(e.final_score)));
}

type SortKey = "market_date" | "market_scope" | "status" | "edge_count" | "top_score";

export function DmmSimilarityTable({
  rows,
  returnSearch,
  busy,
}: {
  rows: DmmSimilarityRowModel[];
  returnSearch: string;
  busy: boolean;
}) {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q")?.trim() ?? "";
  const [query, setQuery] = useState(initialQuery);
  const { sortKey, sortDir, toggleSort } = useTableSortState<SortKey>("market_date", "desc");

  const filtered = useFilteredList(rows, query, (row, qLower) => {
    const m = row.memory;
    const blob = [
      m.market_date ?? "",
      m.market_scope ?? "",
      m.status ?? "",
      m.id,
      ...row.edges.map((e) => e.target_daily_market_memory_id),
    ]
      .join(" ")
      .toLowerCase();
    return blob.includes(qLower);
  });

  const sorted = useMemo(() => {
    const m = sortDir === "asc" ? 1 : -1;

    const pinEmptyLast = (a: DmmSimilarityRowModel, b: DmmSimilarityRowModel): number | null => {
      const aE = a.edges.length === 0;
      const bE = b.edges.length === 0;
      if (aE === bE) {
        return null;
      }
      return aE ? 1 : -1;
    };

    return [...filtered].sort((a, b) => {
      if (sortKey === "edge_count" || sortKey === "top_score") {
        const pin = pinEmptyLast(a, b);
        if (pin !== null) {
          return pin;
        }
      }

      switch (sortKey) {
        case "market_date":
          return (a.memory.market_date ?? "").localeCompare(b.memory.market_date ?? "") * m;
        case "market_scope":
          return (a.memory.market_scope ?? "").localeCompare(b.memory.market_scope ?? "") * m;
        case "status":
          return (a.memory.status ?? "").localeCompare(b.memory.status ?? "") * m;
        case "edge_count":
          return (a.edges.length - b.edges.length) * m;
        case "top_score":
          return (topScore(a.edges) - topScore(b.edges)) * m;
        default:
          return 0;
      }
    });
  }, [filtered, sortKey, sortDir]);

  return (
    <div className="space-y-4">
      <NexInput
        placeholder="market_date, scope, status, id, 유사 대상 id…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        leftIcon={<SearchIcon className="size-4 opacity-70" aria-hidden />}
        inputSize="md"
        aria-label="일별 마켓 메모리 유사도 리스트 검색"
        autoComplete="off"
      />

      <AdminTableShell>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                <button
                  type="button"
                  className={cn(adminSortColumnButtonClass, "justify-start pl-5 pr-4 py-3.5 text-left")}
                  onClick={() => toggleSort("market_date")}
                  aria-sort={
                    sortKey === "market_date"
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  market_date
                  <AdminSortAffix active={sortKey === "market_date"} dir={sortDir} />
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                <button
                  type="button"
                  className={cn(adminSortColumnButtonClass, "justify-start px-4 py-3.5 text-left")}
                  onClick={() => toggleSort("market_scope")}
                  aria-sort={
                    sortKey === "market_scope"
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  scope
                  <AdminSortAffix active={sortKey === "market_scope"} dir={sortDir} />
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                <button
                  type="button"
                  className={cn(adminSortColumnButtonClass, "justify-start px-4 py-3.5 text-left")}
                  onClick={() => toggleSort("status")}
                  aria-sort={
                    sortKey === "status"
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  status
                  <AdminSortAffix active={sortKey === "status"} dir={sortDir} />
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                <button
                  type="button"
                  className={cn(
                    adminSortColumnButtonClass,
                    "min-w-[140px] justify-start px-4 py-3.5 text-left",
                  )}
                  onClick={() => toggleSort("edge_count")}
                  aria-sort={
                    sortKey === "edge_count"
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  유사도
                  <AdminSortAffix active={sortKey === "edge_count"} dir={sortDir} />
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground hidden h-auto !p-0 align-middle lg:table-cell">
                <button
                  type="button"
                  className={cn(adminSortColumnButtonClass, "justify-start px-4 py-3.5 text-left")}
                  onClick={() => toggleSort("top_score")}
                  aria-sort={
                    sortKey === "top_score"
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  top 점수
                  <AdminSortAffix active={sortKey === "top_score"} dir={sortDir} />
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                <div
                  className="text-muted-foreground flex min-h-[3rem] items-center justify-end px-4 py-3.5 pr-5 text-xs font-semibold tracking-wider uppercase"
                  role="columnheader"
                >
                  작업
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className={cn(adminTdClass, "py-16")}>
                  <p className="text-muted-foreground text-center text-sm">
                    표시할 일별 마켓 메모리가 없습니다. 필터를 조정해 보세요.
                  </p>
                </TableCell>
              </TableRow>
            ) : sorted.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className={cn(adminTdClass, "py-14")}>
                  <p className="text-muted-foreground text-center text-sm">
                    검색 조건에 맞는 행이 없습니다.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((row) => {
                const m = row.memory;
                const hasEdges = row.edges.length > 0;
                return (
                  <TableRow
                    key={m.id}
                    className={cn(
                      "border-border/80",
                      !hasEdges && "border-l-border border-l-2 border-dashed",
                    )}
                  >
                    <TableCell className={cn(adminTdClass, "align-top whitespace-nowrap")}>
                      <div className="flex flex-col gap-1">
                        <span className="text-foreground text-sm font-medium">{m.market_date}</span>
                        <span className="text-muted-foreground font-mono text-[10px] break-all">
                          {m.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={cn(adminTdClass, "align-top text-sm")}>
                      {m.market_scope}
                    </TableCell>
                    <TableCell className={cn(adminTdClass, "align-top")}>
                      <NexBadge variant="outline" size="sm">
                        {m.status}
                      </NexBadge>
                    </TableCell>
                    <TableCell className={cn(adminTdClass, "align-top")}>
                      <SimilaritySummaryCell
                        edges={row.edges}
                        similarityStatus={row.similarityStatus}
                      />
                    </TableCell>
                    <TableCell
                      className={cn(
                        adminTdClass,
                        "text-muted-foreground hidden align-top tabular-nums lg:table-cell",
                      )}
                    >
                      {hasEdges ? topScore(row.edges).toFixed(3) : "—"}
                    </TableCell>
                    <TableCell className={cn(adminTdClass, "text-end align-top")}>
                      <DmmRegenerateRowForm
                        sourceDailyMarketMemoryId={m.id}
                        returnSearch={returnSearch}
                        busy={busy}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </AdminTableShell>
    </div>
  );
}
