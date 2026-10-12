import type { Route } from "./+types/agents";
import type { Database } from "database.types";

import { useMemo, useState } from "react";
import { PlusCircleIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { Form, Link, data, useActionData, useNavigation } from "react-router";
import { z } from "zod";

import {
  AdminErrorAlert,
  AdminPageHeader,
  AdminSection,
  AdminServiceSelect,
  AdminSortAffix,
  AdminTableShell,
  adminSortColumnButtonClass,
  adminTdClass,
} from "../components/admin-ui";
import { useTableSortState } from "../hooks/use-table-sort-filter";
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
import { deleteAgentByKey, updateAgent } from "../mutations";
import { listAgents, listServices } from "../queries";

export const meta: Route.MetaFunction = () => [
  { title: `에이전트 | ${import.meta.env.VITE_APP_NAME}` },
];

const updateSchema = z.object({
  intent: z.literal("update"),
  agent_key: z.string().min(1),
  owner_service: z.string().min(1),
  display_name: z.string().optional(),
});

const deleteSchema = z.object({
  intent: z.literal("delete"),
  agent_key: z.string().min(1),
});

const actionSchema = z.discriminatedUnion("intent", [updateSchema, deleteSchema]);

type AdminAgentsLoaderData = {
  agents: Database["public"]["Tables"]["agents"]["Row"][];
  services: Pick<
    Database["public"]["Tables"]["services"]["Row"],
    "service_key" | "display_name"
  >[];
};

type SortKey = "agent_key" | "owner_service" | "display_name";

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  const [{ data: rows, error }, { data: services }] = await Promise.all([
    listAgents(client),
    listServices(client),
  ]);
  if (error) {
    throw new Error(error.message);
  }
  const payload: AdminAgentsLoaderData = {
    agents: rows ?? [],
    services: services ?? [],
  };
  return payload;
}

export async function action({ request }: Route.ActionArgs) {
  requireMethod("POST")(request);
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const formData = await request.formData();
  const parsed = actionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return data({ message: "유효하지 않은 입력입니다." }, { status: 400 });
  }

  const v = parsed.data;
  if (v.intent === "update") {
    const { error } = await updateAgent(client, {
      agent_key: v.agent_key,
      owner_service: v.owner_service,
      display_name: v.display_name?.trim() || null,
    });
    if (error) {
      return data({ message: error.message }, { status: 400 });
    }
    return data({ ok: true });
  }
  const { error } = await deleteAgentByKey(client, v.agent_key);
  if (error) {
    return data({ message: error.message }, { status: 400 });
  }
  return data({ ok: true });
}

export default function AdminAgents({ loaderData }: Route.ComponentProps) {
  if (!loaderData) {
    return null;
  }
  const { agents, services } = loaderData as AdminAgentsLoaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  const [query, setQuery] = useState("");
  const { sortKey, sortDir, toggleSort } = useTableSortState<SortKey>(
    "agent_key",
    "asc",
  );

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = agents;
    if (q.length > 0) {
      list = agents.filter((a) => {
        const blob = [a.agent_key, a.owner_service, a.display_name ?? ""]
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
        case "owner_service":
          return a.owner_service.localeCompare(b.owner_service) * m;
        case "display_name": {
          const an = a.display_name ?? "";
          const bn = b.display_name ?? "";
          return an.localeCompare(bn, "ko") * m;
        }
        default:
          return 0;
      }
    });
  }, [agents, query, sortKey, sortDir]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <AdminPageHeader
          title="에이전트"
          description="에이전트 키는 프롬프트와 파이프라인 단계에서 참조됩니다. 키는 생성 후 바꾸지 않는 것이 안전합니다."
        />
        <Link to="/admin/agents/new" className="shrink-0">
          <NexButton
            type="button"
            variant="primary"
            leftIcon={<PlusCircleIcon className="size-4" aria-hidden />}
          >
            새 에이전트
          </NexButton>
        </Link>
      </div>

      {actionData && "message" in actionData && actionData.message && (
        <AdminErrorAlert message={actionData.message} />
      )}

      <AdminSection
        title="등록된 에이전트"
        description="소유 서비스와 표시 이름은 인라인에서 저장할 수 있습니다. shared는 여러 서비스가 공용으로 쓰는 에이전트입니다. 프롬프트·릴리스가 연결된 키는 삭제가 거부될 수 있습니다."
      >
        <div className="space-y-4">
          <NexInput
            placeholder="agent_key, 소유 서비스, 표시 이름…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={<SearchIcon className="size-4 opacity-70" aria-hidden />}
            inputSize="md"
            aria-label="에이전트 목록 필터"
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
                      onClick={() => toggleSort("agent_key")}
                      aria-sort={
                        sortKey === "agent_key"
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      agent_key
                      <AdminSortAffix active={sortKey === "agent_key"} dir={sortDir} />
                    </button>
                  </TableHead>
                  <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                    <button
                      type="button"
                      className={cn(adminSortColumnButtonClass, "justify-start px-4 py-3.5 text-left")}
                      onClick={() => toggleSort("owner_service")}
                      aria-sort={
                        sortKey === "owner_service"
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      소유 서비스
                      <AdminSortAffix active={sortKey === "owner_service"} dir={sortDir} />
                    </button>
                  </TableHead>
                  <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                    <button
                      type="button"
                      className={cn(adminSortColumnButtonClass, "justify-start px-4 py-3.5 text-left")}
                      onClick={() => toggleSort("display_name")}
                      aria-sort={
                        sortKey === "display_name"
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      표시 이름
                      <AdminSortAffix active={sortKey === "display_name"} dir={sortDir} />
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
                {agents.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={4} className={cn(adminTdClass, "py-16")}>
                      <p className="text-muted-foreground text-center text-sm">
                        등록된 에이전트가 없습니다. 상단의 「새 에이전트」로 추가하세요.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : filteredSorted.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={4} className={cn(adminTdClass, "py-14")}>
                      <p className="text-muted-foreground text-center text-sm">
                        검색 조건에 맞는 에이전트가 없습니다.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSorted.map((a) => (
                    <TableRow key={a.agent_key} className="border-border/80">
                      <TableCell className={cn(adminTdClass, "align-top")}>
                        <span className="text-foreground font-mono text-[13px] leading-snug font-medium">
                          {a.agent_key}
                        </span>
                      </TableCell>
                      <TableCell className={cn(adminTdClass, "min-w-[180px] align-top")}>
                        <AdminServiceSelect
                          services={services}
                          defaultValue={a.owner_service}
                          form={`agent-update-${a.agent_key}`}
                          ariaLabel={`${a.agent_key} 소유 서비스`}
                        />
                      </TableCell>
                      <TableCell className={cn(adminTdClass, "align-top")}>
                        <Form
                          id={`agent-update-${a.agent_key}`}
                          method="post"
                          className="flex flex-col gap-3 sm:flex-row sm:items-center"
                        >
                          <input type="hidden" name="intent" value="update" />
                          <input type="hidden" name="agent_key" value={a.agent_key} />
                          <input
                            name="display_name"
                            defaultValue={a.display_name ?? ""}
                            placeholder="표시 이름"
                            aria-label={`${a.agent_key} 표시 이름`}
                            className={cn(
                              "border-border bg-background text-foreground placeholder:text-muted-foreground",
                              "focus-visible:ring-ring/40 min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm shadow-sm",
                              "outline-none focus-visible:ring-[3px]",
                            )}
                          />
                          <NexButton type="submit" variant="secondary" size="sm" loading={busy} disabled={busy}>
                            저장
                          </NexButton>
                        </Form>
                      </TableCell>
                      <TableCell className={cn(adminTdClass, "align-top text-end")}>
                        <Form method="post" className="inline-flex justify-end">
                          <input type="hidden" name="intent" value="delete" />
                          <input type="hidden" name="agent_key" value={a.agent_key} />
                          <NexButton
                            type="submit"
                            variant="secondary"
                            size="sm"
                            leftIcon={<Trash2Icon className="size-3.5" aria-hidden />}
                            className="border-destructive/30 text-destructive hover:bg-destructive/10"
                            loading={busy}
                            disabled={busy}
                            aria-label={`${a.agent_key} 삭제`}
                          >
                            삭제
                          </NexButton>
                        </Form>
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
