import type { Route } from "./+types/pipelines";
import type { Database } from "database.types";

import { useMemo, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  PencilLineIcon,
  PlusCircleIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { Form, Link, data, useActionData, useNavigation } from "react-router";
import { z } from "zod";

import {
  AdminErrorAlert,
  AdminPageHeader,
  AdminPanel,
  AdminSection,
  AdminTableShell,
  PipelineStatusBadge,
  adminTdClass,
} from "../components/admin-ui";
import { NexButton, NexInput } from "~/core/components/nex";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/core/components/ui/table";
import { requireAdmin, requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";

export const meta: Route.MetaFunction = () => [
  { title: `파이프라인 | ${import.meta.env.VITE_APP_NAME}` },
];

const deleteSchema = z.object({
  intent: z.literal("delete"),
  id: z.string().uuid(),
});

type AdminPipelinesLoaderData = {
  pipelines: Database["public"]["Tables"]["pipelines"]["Row"][];
};

type SortKey = "pipeline_key" | "name" | "status";

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  const { data: rows, error } = await client
    .from("pipelines")
    .select("*")
    .order("name", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  const payload: AdminPipelinesLoaderData = { pipelines: rows ?? [] };
  return payload;
}

export async function action({ request }: Route.ActionArgs) {
  requireMethod("POST")(request);
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const formData = await request.formData();
  const parsed = deleteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return data({ message: "유효하지 않은 입력입니다." }, { status: 400 });
  }

  const { error } = await client.from("pipelines").delete().eq("id", parsed.data.id);
  if (error) {
    return data({ message: error.message }, { status: 400 });
  }
  return data({ ok: true });
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

export default function AdminPipelines({ loaderData }: Route.ComponentProps) {
  if (!loaderData) {
    return null;
  }
  const { pipelines } = loaderData as AdminPipelinesLoaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = pipelines;
    if (q.length > 0) {
      list = pipelines.filter((p) => {
        const blob = [
          p.pipeline_key,
          p.name,
          p.description ?? "",
          p.status,
        ]
          .join(" ")
          .toLowerCase();
        return blob.includes(q);
      });
    }
    const m = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case "pipeline_key":
          return a.pipeline_key.localeCompare(b.pipeline_key) * m;
        case "name":
          return a.name.localeCompare(b.name, "ko") * m;
        case "status":
          return a.status.localeCompare(b.status) * m;
        default:
          return 0;
      }
    });
  }, [pipelines, query, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  /** Matches body `adminTdClass`: first col pl-5, last col pr-5 */
  const sortBtnBase =
    "hover:bg-muted/55 text-muted-foreground hover:text-foreground flex min-h-[3rem] w-full items-center gap-2 border-0 bg-transparent text-xs font-semibold tracking-wider uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <AdminPageHeader
          title="파이프라인"
          description="워크플로 정의와 식별자(pipeline_key)를 관리합니다. 키는 생성 후 변경하지 않는 것이 안전합니다."
        />
        <Link to="/admin/pipelines/new" className="shrink-0">
          <NexButton
            type="button"
            variant="primary"
            leftIcon={<PlusCircleIcon className="size-4" aria-hidden />}
          >
            새 파이프라인
          </NexButton>
        </Link>
      </div>

      {actionData && "message" in actionData && actionData.message && (
        <AdminErrorAlert message={actionData.message} />
      )}

      <AdminSection title="등록된 파이프라인" description="편집으로 단계·메타데이터를 수정합니다.">
        <div className="space-y-4">
            <NexInput
              placeholder="pipeline_key, 이름, 설명, 상태…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              leftIcon={<SearchIcon className="size-4 opacity-70" aria-hidden />}
              inputSize="md"
              aria-label="파이프라인 목록 필터"
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
                    onClick={() => toggleSort("pipeline_key")}
                    aria-sort={
                      sortKey === "pipeline_key"
                        ? sortDir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    pipeline_key
                    <SortAffix active={sortKey === "pipeline_key"} dir={sortDir} />
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
              {pipelines.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className={cn(adminTdClass, "py-16")}>
                    <p className="text-muted-foreground text-center text-sm">
                      아직 파이프라인이 없습니다. 상단의 「새 파이프라인」으로 추가하세요.
                    </p>
                  </TableCell>
                </TableRow>
              ) : filteredSorted.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className={cn(adminTdClass, "py-14")}>
                    <p className="text-muted-foreground text-center text-sm">
                      검색 조건에 맞는 파이프라인이 없습니다.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSorted.map((p) => (
                  <TableRow key={p.id} className="border-border/80">
                    <TableCell className={cn(adminTdClass, "align-middle")}>
                      <Link
                        to={`/admin/pipelines/${encodeURIComponent(p.pipeline_key)}`}
                        className="text-primary font-mono text-[13px] font-medium hover:underline"
                      >
                        {p.pipeline_key}
                      </Link>
                    </TableCell>
                    <TableCell className={cn(adminTdClass, "text-foreground align-middle")}>
                      {p.name}
                    </TableCell>
                    <TableCell className={cn(adminTdClass, "align-middle")}>
                      <PipelineStatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className={cn(adminTdClass, "text-end align-middle")}>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link to={`/admin/pipelines/${encodeURIComponent(p.pipeline_key)}`}>
                          <NexButton
                            type="button"
                            variant="secondary"
                            size="sm"
                            leftIcon={<PencilLineIcon className="size-3.5" aria-hidden />}
                          >
                            편집
                          </NexButton>
                        </Link>
                        <Form method="post" className="inline">
                          <input type="hidden" name="intent" value="delete" />
                          <input type="hidden" name="id" value={p.id} />
                          <NexButton
                            type="submit"
                            variant="secondary"
                            size="sm"
                            leftIcon={<Trash2Icon className="size-3.5" aria-hidden />}
                            className="border-destructive/30 text-destructive hover:bg-destructive/10"
                            loading={busy}
                            disabled={busy}
                            aria-label={`${p.pipeline_key} 삭제`}
                          >
                            삭제
                          </NexButton>
                        </Form>
                      </div>
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
