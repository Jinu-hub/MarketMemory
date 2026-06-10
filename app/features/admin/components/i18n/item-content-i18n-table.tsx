import { useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";
import { Form, useSearchParams } from "react-router";

import {
  AdminSortAffix,
  AdminTableShell,
  adminSortColumnButtonClass,
  adminTdClass,
} from "../admin-ui";
import {
  ITEM_CONTENT_I18N_LANG_LABELS,
  ITEM_CONTENT_I18N_SUPPORTED_LANGS,
  type ItemContentI18nLangCode,
} from "../../lib/item-content-i18n.config";
import {
  buildI18nJobKey,
  formatAdminDateTime,
  type ItemContentI18nRowModel,
} from "../../lib/item-content-i18n-utils";
import { NexBadge, NexButton, NexInput } from "~/core/components/nex";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/core/components/ui/table";
import { useFilteredList, useTableSortState } from "../../hooks/use-table-sort-filter";
import { cn } from "~/core/lib/utils";

type SortKey = "title" | "lang_code" | "category" | "market_date" | "created_at";

function LangStatusCell({
  cell,
  itemContentId,
  webhookConfigured,
  disabled,
}: {
  cell: ItemContentI18nRowModel["cells"][ItemContentI18nLangCode];
  itemContentId: string;
  webhookConfigured: boolean;
  disabled: boolean;
}) {
  if (cell.isSource) {
    return (
      <div className="space-y-2">
        <NexBadge variant="outline" size="sm">
          원문
        </NexBadge>
        <p className="text-muted-foreground text-[11px]">item_contents</p>
      </div>
    );
  }

  const generatedAt = cell.i18n?.updated_at ?? cell.i18n?.created_at ?? null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <NexBadge variant={cell.exists ? "success" : "warning"} size="sm">
          {cell.exists ? "생성됨" : "미생성"}
        </NexBadge>
        {cell.i18n?.status ? (
          <NexBadge variant="outline" size="sm">
            {cell.i18n.status}
          </NexBadge>
        ) : null}
      </div>
      <dl className="text-muted-foreground space-y-1 text-[11px] leading-snug">
        <div>
          <dt className="text-foreground/70 inline">번역 </dt>
          <dd className="inline tabular-nums">{formatAdminDateTime(generatedAt)}</dd>
        </div>
        <div>
          <dt className="text-foreground/70 inline">웹훅 </dt>
          <dd className="inline tabular-nums">{formatAdminDateTime(cell.lastWebhookAt)}</dd>
        </div>
      </dl>
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          name="jobs"
          value={buildI18nJobKey(itemContentId, cell.langCode)}
          disabled={disabled || !webhookConfigured}
          className="border-border size-4 rounded border"
        />
        <span className="text-muted-foreground">실행 선택</span>
      </label>
    </div>
  );
}

export function ItemContentI18nTable({
  rows,
  returnSearch,
  webhookConfigured,
  busy,
}: {
  rows: ItemContentI18nRowModel[];
  returnSearch: string;
  webhookConfigured: boolean;
  busy: boolean;
}) {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q")?.trim() ?? "";
  const [query, setQuery] = useState(initialQuery);
  const { sortKey, sortDir, toggleSort } = useTableSortState<SortKey>("created_at", "desc");

  const filtered = useFilteredList(rows, query, (row, qLower) => {
    const c = row.content;
    const blob = [c.title ?? "", c.lang_code ?? "", c.category ?? "", c.id].join(" ").toLowerCase();
    return blob.includes(qLower);
  });

  const sorted = useMemo(() => {
    const m = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = a.content[sortKey] ?? "";
      const bv = b.content[sortKey] ?? "";
      if (av === bv) {
        return 0;
      }
      if (av == null || av === "") {
        return 1;
      }
      if (bv == null || bv === "") {
        return -1;
      }
      return av < bv ? -m : m;
    });
  }, [filtered, sortDir, sortKey]);

  const returnSearchForForm = returnSearch.startsWith("?")
    ? returnSearch.slice(1)
    : returnSearch.replace(/^\?/, "");

  return (
    <Form method="post" className="space-y-4">
      <input type="hidden" name="intent" value="trigger_webhook" />
      <input type="hidden" name="return_search" value={returnSearchForForm} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <SearchIcon
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden
          />
          <NexInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제목·카테고리·id 검색…"
            className="pl-9"
            aria-label="리포트 검색"
          />
        </div>
        <NexButton
          type="submit"
          variant="primary"
          loading={busy}
          disabled={!webhookConfigured || busy}
        >
          선택 항목 다언어 생성
        </NexButton>
      </div>

      {!webhookConfigured ? (
        <p className="text-muted-foreground text-xs leading-relaxed">
          Webhook URL이 아직 설정되지 않았습니다.{" "}
          <code className="font-mono">item-content-i18n.config.ts</code>의{" "}
          <code className="font-mono">ITEM_CONTENT_I18N_WEBHOOK.url</code>을 채운 뒤 실행할 수
          있습니다.
        </p>
      ) : null}

      <AdminTableShell>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {(
                [
                  { key: "title", label: "제목" },
                  { key: "lang_code", label: "원문 언어" },
                  { key: "category", label: "카테고리" },
                  { key: "market_date", label: "시장일" },
                ] as const
              ).map(({ key, label }) => (
                <TableHead key={key} className="whitespace-nowrap">
                  <button
                    type="button"
                    className={adminSortColumnButtonClass}
                    onClick={() => toggleSort(key)}
                  >
                    {label}
                    <AdminSortAffix active={sortKey === key} dir={sortDir} />
                  </button>
                </TableHead>
              ))}
              <TableHead className="whitespace-nowrap">활성</TableHead>
              <TableHead className="whitespace-nowrap">공개</TableHead>
              {ITEM_CONTENT_I18N_SUPPORTED_LANGS.map((lang) => (
                <TableHead key={lang} className="min-w-[9.5rem] whitespace-nowrap">
                  {ITEM_CONTENT_I18N_LANG_LABELS[lang]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4 + 2 + ITEM_CONTENT_I18N_SUPPORTED_LANGS.length}
                  className={cn(adminTdClass, "text-muted-foreground py-10 text-center text-sm")}
                >
                  표시할 리포트가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((row) => {
                const c = row.content;
                return (
                  <TableRow key={c.id}>
                    <TableCell className={cn(adminTdClass, "max-w-[16rem]")}>
                      <div className="space-y-1">
                        <p className="text-foreground line-clamp-2 text-sm font-medium">
                          {c.title ?? "(제목 없음)"}
                        </p>
                        <p className="text-muted-foreground font-mono text-[10px]">{c.id}</p>
                      </div>
                    </TableCell>
                    <TableCell className={adminTdClass}>{c.lang_code}</TableCell>
                    <TableCell className={adminTdClass}>{c.category ?? "—"}</TableCell>
                    <TableCell className={cn(adminTdClass, "tabular-nums")}>
                      {c.market_date ?? "—"}
                    </TableCell>
                    <TableCell className={adminTdClass}>
                      <NexBadge variant={c.is_active ? "success" : "outline"} size="sm">
                        {c.is_active ? "Y" : "N"}
                      </NexBadge>
                    </TableCell>
                    <TableCell className={adminTdClass}>
                      <NexBadge variant={c.is_public ? "success" : "outline"} size="sm">
                        {c.is_public ? "Y" : "N"}
                      </NexBadge>
                    </TableCell>
                    {ITEM_CONTENT_I18N_SUPPORTED_LANGS.map((lang) => (
                      <TableCell key={lang} className={cn(adminTdClass, "align-top")}>
                        <LangStatusCell
                          cell={row.cells[lang]}
                          itemContentId={c.id}
                          webhookConfigured={webhookConfigured}
                          disabled={busy}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </AdminTableShell>
    </Form>
  );
}
