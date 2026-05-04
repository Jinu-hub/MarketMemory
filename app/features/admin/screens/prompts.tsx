import type { Route } from "./+types/prompts";
import type { Database } from "database.types";

import { useMemo, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  PencilLineIcon,
  PlusCircleIcon,
  SearchIcon,
} from "lucide-react";
import { Link } from "react-router";

import {
  AdminPageHeader,
  AdminSection,
  AdminTableShell,
  PromptStatusBadge,
  adminTdClass,
} from "../components/admin-ui";
import { NexButton, NexInput } from "~/core/components/nex";
import makeServerClient from "~/core/lib/supa-client.server";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/core/components/ui/table";
import { cn } from "~/core/lib/utils";

export const meta: Route.MetaFunction = () => [
  { title: `프롬프트 | ${import.meta.env.VITE_APP_NAME}` },
];

type AdminPromptsLoaderData = {
  templates: Database["public"]["Tables"]["prompt_templates"]["Row"][];
};

type SortKey = "agent_key" | "name" | "version" | "status" | "updated_at";

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  const { data: templates, error } = await client
    .from("prompt_templates")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) {
    throw new Error(error.message);
  }
  const payload: AdminPromptsLoaderData = { templates: templates ?? [] };
  return payload;
}

function SortAffix({
  active,
  dir,
}: {
  active: boolean;
  dir: "asc" | "desc";
}) {
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

function formatUpdatedAt(iso: string) {
  try {
    return new Date(iso).toLocaleString("ko-KR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function AdminPrompts({ loaderData }: Route.ComponentProps) {
  if (!loaderData) {
    return null;
  }
  const { templates } = loaderData as AdminPromptsLoaderData;

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("updated_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = templates;
    if (q.length > 0) {
      list = templates.filter((t) => {
        const blob = [
          t.agent_key,
          t.name,
          t.status,
          String(t.version),
          t.changelog ?? "",
          formatUpdatedAt(t.updated_at),
        ]
          .join(" ")
          .toLowerCase();
        return blob.includes(q);
      });
    }
    const m = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case "agent_key":
          return a.agent_key.localeCompare(b.agent_key) * m;
        case "name":
          return a.name.localeCompare(b.name, "ko") * m;
        case "version":
          return (a.version - b.version) * m;
        case "status":
          return a.status.localeCompare(b.status) * m;
        case "updated_at":
          return a.updated_at.localeCompare(b.updated_at) * m;
        default:
          return 0;
      }
    });
  }, [templates, query, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "updated_at" ? "desc" : "asc");
    }
  }

  const sortBtnBase =
    "hover:bg-muted/55 text-muted-foreground hover:text-foreground flex min-h-[3rem] w-full items-center gap-2 border-0 bg-transparent text-xs font-semibold tracking-wider uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <AdminPageHeader
          title="프롬프트 템플릿"
          description="에이전트별로 템플릿 버전이 쌓입니다. 새 행을 만들면 해당 에이전트의 다음 버전 번호가 자동으로 부여됩니다."
        />
        <Link to="/admin/prompts/new" className="shrink-0">
          <NexButton
            type="button"
            variant="primary"
            leftIcon={<PlusCircleIcon className="size-4" aria-hidden />}
          >
            새 템플릿
          </NexButton>
        </Link>
      </div>

      <AdminSection
        title="템플릿 목록"
        description="에이전트·이름·버전·상태·수정 시각으로 검색·정렬할 수 있습니다."
      >
        <div className="space-y-4">
          <NexInput
            placeholder="에이전트, 이름, 버전, 상태, 변경 요약…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={<SearchIcon className="size-4 opacity-70" aria-hidden />}
            inputSize="md"
            aria-label="템플릿 목록 필터"
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
                      onClick={() => toggleSort("agent_key")}
                      aria-sort={
                        sortKey === "agent_key"
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      에이전트
                      <SortAffix active={sortKey === "agent_key"} dir={sortDir} />
                    </button>
                  </TableHead>
                  <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                    <button
                      type="button"
                      className={cn(sortBtnBase, "justify-start px-4 py-3.5 text-left")}
                      onClick={() => toggleSort("name")}
                      aria-sort={
                        sortKey === "name"
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      이름
                      <SortAffix active={sortKey === "name"} dir={sortDir} />
                    </button>
                  </TableHead>
                  <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                    <button
                      type="button"
                      className={cn(sortBtnBase, "justify-start px-4 py-3.5 text-left")}
                      onClick={() => toggleSort("version")}
                      aria-sort={
                        sortKey === "version"
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      ver
                      <SortAffix active={sortKey === "version"} dir={sortDir} />
                    </button>
                  </TableHead>
                  <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                    <button
                      type="button"
                      className={cn(sortBtnBase, "justify-start px-4 py-3.5 text-left")}
                      onClick={() => toggleSort("status")}
                      aria-sort={
                        sortKey === "status"
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      상태
                      <SortAffix active={sortKey === "status"} dir={sortDir} />
                    </button>
                  </TableHead>
                  <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                    <button
                      type="button"
                      className={cn(sortBtnBase, "justify-start px-4 py-3.5 text-left")}
                      onClick={() => toggleSort("updated_at")}
                      aria-sort={
                        sortKey === "updated_at"
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      수정
                      <SortAffix active={sortKey === "updated_at"} dir={sortDir} />
                    </button>
                  </TableHead>
                  <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                    <div
                      className="text-muted-foreground flex min-h-[3rem] items-center justify-end px-4 py-3.5 pr-5 text-xs font-semibold tracking-wider uppercase"
                      role="columnheader"
                    >
                      편집
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className={cn(adminTdClass, "py-16")}>
                      <p className="text-muted-foreground text-center text-sm">
                        표시할 템플릿이 없습니다. 상단의 「새 템플릿」으로 추가하세요.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : filteredSorted.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={6} className={cn(adminTdClass, "py-14")}>
                      <p className="text-muted-foreground text-center text-sm">
                        검색 조건에 맞는 템플릿이 없습니다.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSorted.map((t) => (
                    <TableRow key={t.id} className="border-border/80">
                      <TableCell className={cn(adminTdClass, "font-mono text-[13px]")}>
                        {t.agent_key}
                      </TableCell>
                      <TableCell
                        className={cn(adminTdClass, "text-foreground max-w-[200px] truncate")}
                      >
                        <span title={t.name}>{t.name}</span>
                      </TableCell>
                      <TableCell className={cn(adminTdClass, "text-muted-foreground tabular-nums")}>
                        {t.version}
                      </TableCell>
                      <TableCell className={adminTdClass}>
                        <PromptStatusBadge status={t.status} />
                      </TableCell>
                      <TableCell
                        className={cn(
                          adminTdClass,
                          "text-muted-foreground whitespace-nowrap text-[13px]",
                        )}
                      >
                        {formatUpdatedAt(t.updated_at)}
                      </TableCell>
                      <TableCell className={cn(adminTdClass, "text-end")}>
                        <Link to={`/admin/prompts/${t.id}`}>
                          <NexButton
                            type="button"
                            variant="secondary"
                            size="sm"
                            leftIcon={<PencilLineIcon className="size-3.5" aria-hidden />}
                          >
                            편집
                          </NexButton>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </AdminTableShell>
        </div>
      </AdminSection>
    </div>
  );
}
