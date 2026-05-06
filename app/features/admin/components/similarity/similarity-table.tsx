import { useMemo, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  SearchIcon,
} from "lucide-react";
import { Link } from "react-router";

import {
  AdminTableShell,
  adminTdClass,
} from "../admin-ui";
import { RegenerateRowForm } from "./regenerate-row-form";
import { SimilaritySummaryCell } from "./similarity-summary-cell";
import { NexInput } from "~/core/components/nex";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/core/components/ui/table";
import { useFilteredList, useTableSortState } from "../../hooks/use-table-sort-filter";
import type { ItemContentSimilarityListRow, SimilarityEdgeListRow } from "../../queries";
import { cn } from "~/core/lib/utils";

export type SimilarityRowModel = {
  content: ItemContentSimilarityListRow;
  edges: SimilarityEdgeListRow[];
};

function parseFinalScore(s: number | string | null | undefined): number {
  if (s == null || s === "") {
    return Number.NEGATIVE_INFINITY;
  }
  const n = typeof s === "number" ? s : Number(s);
  return Number.isFinite(n) ? n : Number.NEGATIVE_INFINITY;
}

function topScore(edges: SimilarityEdgeListRow[]): number {
  if (edges.length === 0) {
    return Number.NEGATIVE_INFINITY;
  }
  return Math.max(...edges.map((e) => parseFinalScore(e.final_score)));
}

type SortKey =
  | "title"
  | "lang_code"
  | "category"
  | "input_date"
  | "edge_count"
  | "top_score";

function SortAffix({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  if (!active) {
    return (
      <ArrowUpDownIcon
        className="text-muted-foreground size-4 shrink-0 opacity-45"
        aria-hidden
      />
    );
  }
  return dir === "asc" ? (
    <ArrowUpIcon className="text-foreground size-4 shrink-0" aria-hidden />
  ) : (
    <ArrowDownIcon className="text-foreground size-4 shrink-0" aria-hidden />
  );
}

/**
 * `item_contents` + 유사도 엣지 요약 테이블. 검색·정렬은 클라이언트에서 처리한다.
 */
export function SimilarityTable({
  rows,
  returnSearch,
  busy,
}: {
  rows: SimilarityRowModel[];
  returnSearch: string;
  busy: boolean;
}) {
  const [query, setQuery] = useState("");
  const { sortKey, sortDir, toggleSort } = useTableSortState<SortKey>("input_date", "desc");

  const filtered = useFilteredList(rows, query, (row, qLower) => {
    const c = row.content;
    const blob = [
      c.title ?? "",
      c.lang_code ?? "",
      c.category ?? "",
      c.id,
      ...row.edges.map((e) => e.target_item_id),
    ]
      .join(" ")
      .toLowerCase();
    return blob.includes(qLower);
  });

  const sorted = useMemo(() => {
    const m = sortDir === "asc" ? 1 : -1;

    const pinEmptyLast = (a: SimilarityRowModel, b: SimilarityRowModel): number | null => {
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
        case "title": {
          const at = a.content.title ?? "";
          const bt = b.content.title ?? "";
          return at.localeCompare(bt, "ko") * m;
        }
        case "lang_code":
          return (a.content.lang_code ?? "").localeCompare(b.content.lang_code ?? "") * m;
        case "category":
          return (a.content.category ?? "").localeCompare(b.content.category ?? "", "ko") * m;
        case "input_date": {
          const ad = a.content.input_date ?? "";
          const bd = b.content.input_date ?? "";
          if (ad === bd) {
            return 0;
          }
          if (!ad) {
            return 1;
          }
          if (!bd) {
            return -1;
          }
          return ad.localeCompare(bd) * m;
        }
        case "edge_count":
          return (a.edges.length - b.edges.length) * m;
        case "top_score":
          return (topScore(a.edges) - topScore(b.edges)) * m;
        default:
          return 0;
      }
    });
  }, [filtered, sortKey, sortDir]);

  const sortBtnBase =
    "hover:bg-muted/55 text-muted-foreground hover:text-foreground flex min-h-[3rem] w-full items-center gap-2 border-0 bg-transparent text-xs font-semibold tracking-wider uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none";

  return (
    <div className="space-y-4">
      <NexInput
        placeholder="제목, 언어, 카테고리, id, 유사 대상 id…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        leftIcon={<SearchIcon className="size-4 opacity-70" aria-hidden />}
        inputSize="md"
        aria-label="유사도 리스트 검색"
        autoComplete="off"
      />

      <AdminTableShell>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                <button
                  type="button"
                  className={cn(sortBtnBase, "justify-start pl-5 pr-4 py-3.5 text-left")}
                  onClick={() => toggleSort("title")}
                  aria-sort={
                    sortKey === "title"
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  제목
                  <SortAffix active={sortKey === "title"} dir={sortDir} />
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground hidden h-auto !p-0 align-middle sm:table-cell">
                <button
                  type="button"
                  className={cn(sortBtnBase, "justify-start px-4 py-3.5 text-left")}
                  onClick={() => toggleSort("lang_code")}
                  aria-sort={
                    sortKey === "lang_code"
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  언어
                  <SortAffix active={sortKey === "lang_code"} dir={sortDir} />
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground hidden h-auto !p-0 align-middle md:table-cell">
                <button
                  type="button"
                  className={cn(sortBtnBase, "justify-start px-4 py-3.5 text-left")}
                  onClick={() => toggleSort("category")}
                  aria-sort={
                    sortKey === "category"
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  카테고리
                  <SortAffix active={sortKey === "category"} dir={sortDir} />
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                <button
                  type="button"
                  className={cn(sortBtnBase, "justify-start px-4 py-3.5 text-left")}
                  onClick={() => toggleSort("input_date")}
                  aria-sort={
                    sortKey === "input_date"
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                >
                  input_date
                  <SortAffix active={sortKey === "input_date"} dir={sortDir} />
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                <button
                  type="button"
                  className={cn(sortBtnBase, "min-w-[140px] justify-start px-4 py-3.5 text-left")}
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
                  <SortAffix active={sortKey === "edge_count"} dir={sortDir} />
                </button>
              </TableHead>
              <TableHead className="text-muted-foreground hidden h-auto !p-0 align-middle lg:table-cell">
                <button
                  type="button"
                  className={cn(sortBtnBase, "justify-start px-4 py-3.5 text-left")}
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
                  <SortAffix active={sortKey === "top_score"} dir={sortDir} />
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
                <TableCell colSpan={7} className={cn(adminTdClass, "py-16")}>
                  <p className="text-muted-foreground text-center text-sm">
                    표시할 리포트가 없습니다. 필터를 조정해 보세요.
                  </p>
                </TableCell>
              </TableRow>
            ) : sorted.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className={cn(adminTdClass, "py-14")}>
                  <p className="text-muted-foreground text-center text-sm">
                    검색 조건에 맞는 행이 없습니다.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((row) => {
                const c = row.content;
                const hasEdges = row.edges.length > 0;
                return (
                  <TableRow
                    key={c.id}
                    className={cn(
                      "border-border/80",
                      !hasEdges && "border-l-border border-l-2 border-dashed",
                    )}
                  >
                    <TableCell className={cn(adminTdClass, "max-w-[min(280px,45vw)] align-top")}>
                      <div className="flex flex-col gap-1">
                        <Link
                          to={`/item_reports/${c.id}`}
                          className="text-primary line-clamp-2 text-sm font-medium hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {c.title ?? "(제목 없음)"}
                        </Link>
                        <span className="text-muted-foreground font-mono text-[10px] break-all">
                          {c.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn(adminTdClass, "text-muted-foreground hidden align-top sm:table-cell")}
                    >
                      {c.lang_code}
                    </TableCell>
                    <TableCell
                      className={cn(adminTdClass, "hidden align-top text-sm md:table-cell")}
                    >
                      {c.category ?? "—"}
                    </TableCell>
                    <TableCell
                      className={cn(adminTdClass, "text-muted-foreground whitespace-nowrap align-top text-xs")}
                    >
                      {c.input_date ?? "—"}
                    </TableCell>
                    <TableCell className={cn(adminTdClass, "align-top")}>
                      <SimilaritySummaryCell edges={row.edges} />
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
                      <RegenerateRowForm
                        sourceItemId={c.id}
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
