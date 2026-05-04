import type { Route } from "./+types/prompt-releases";
import type { Database } from "database.types";

import { useMemo, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  SearchIcon,
  Trash2Icon,
} from "lucide-react";
import { Form, data, useActionData, useNavigate, useNavigation } from "react-router";
import { z } from "zod";

import {
  AdminAgentSelectWithFilter,
  AdminErrorAlert,
  AdminPageHeader,
  AdminPanel,
  AdminPromptTemplateSelectWithFilter,
  AdminSection,
  AdminTableShell,
  EnvironmentBadge,
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
  { title: `프롬프트 릴리스 | ${import.meta.env.VITE_APP_NAME}` },
];

const upsertSchema = z.object({
  intent: z.literal("upsert"),
  agent_key: z.string().min(1),
  environment: z.string().min(1),
  active_prompt_id: z.string().uuid(),
  release_note: z.string().optional(),
});

const deleteSchema = z.object({
  intent: z.literal("delete"),
  id: z.string().uuid(),
});

const actionSchema = z.discriminatedUnion("intent", [upsertSchema, deleteSchema]);

type PromptReleasesLoaderData = {
  releases: Database["public"]["Tables"]["prompt_releases"]["Row"][];
  agents: Pick<
    Database["public"]["Tables"]["agents"]["Row"],
    "agent_key" | "display_name"
  >[];
  templates: Pick<
    Database["public"]["Tables"]["prompt_templates"]["Row"],
    "id" | "name" | "version" | "agent_key"
  >[];
  templateLabel: Record<string, string>;
};

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);

  const [{ data: releases, error: re }, { data: agents }, { data: templates }] =
    await Promise.all([
      client
        .from("prompt_releases")
        .select("*")
        .order("agent_key", { ascending: true })
        .order("environment", { ascending: true }),
      client.from("agents").select("agent_key, display_name").order("agent_key"),
      client.from("prompt_templates").select("id, name, version, agent_key").order("agent_key"),
    ]);

  if (re) {
    throw new Error(re.message);
  }

  const templateLabel = Object.fromEntries(
    (templates ?? []).map((t) => [
      t.id,
      `${t.name} v${t.version} (${t.agent_key})`,
    ]),
  ) as Record<string, string>;

  const payload: PromptReleasesLoaderData = {
    releases: releases ?? [],
    agents: agents ?? [],
    templates: templates ?? [],
    templateLabel,
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
  if (v.intent === "delete") {
    const { error } = await client.from("prompt_releases").delete().eq("id", v.id);
    if (error) {
      return data({ message: error.message }, { status: 400 });
    }
    return data({ ok: true });
  }

  const {
    data: { user },
  } = await client.auth.getUser();

  const row = {
    agent_key: v.agent_key.trim(),
    environment: v.environment.trim(),
    active_prompt_id: v.active_prompt_id,
    release_note: v.release_note?.trim() || null,
    released_by: user?.id ?? null,
    updated_at: new Date().toISOString(),
  };

  const { error } = await client.from("prompt_releases").upsert(row, {
    onConflict: "agent_key,environment",
  });

  if (error) {
    return data({ message: error.message }, { status: 400 });
  }
  return data({ ok: true });
}

type ReleaseSortKey = "agent_key" | "environment" | "template";

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

export default function PromptReleases({ loaderData }: Route.ComponentProps) {
  if (!loaderData) {
    return null;
  }
  const { releases, agents, templates, templateLabel } =
    loaderData as PromptReleasesLoaderData;
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  const [tableQuery, setTableQuery] = useState("");
  const [sortKey, setSortKey] = useState<ReleaseSortKey>("agent_key");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filteredSortedReleases = useMemo(() => {
    const q = tableQuery.trim().toLowerCase();
    let list = releases;
    if (q.length > 0) {
      list = releases.filter((r) => {
        const templateLabelText =
          templateLabel[r.active_prompt_id] ?? r.active_prompt_id;
        const blob = [
          r.agent_key,
          r.environment,
          templateLabelText,
          r.active_prompt_id,
          r.release_note ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return blob.includes(q);
      });
    }
    const m = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const labelA = templateLabel[a.active_prompt_id] ?? a.active_prompt_id;
      const labelB = templateLabel[b.active_prompt_id] ?? b.active_prompt_id;
      let cmp = 0;
      switch (sortKey) {
        case "agent_key":
          cmp = a.agent_key.localeCompare(b.agent_key);
          break;
        case "environment":
          cmp = a.environment.localeCompare(b.environment, "ko");
          break;
        case "template":
          cmp = labelA.localeCompare(labelB, "ko");
          break;
        default:
          break;
      }
      if (cmp !== 0) {
        return cmp * m;
      }
      const byAgent = a.agent_key.localeCompare(b.agent_key) * m;
      if (byAgent !== 0) {
        return byAgent;
      }
      return a.environment.localeCompare(b.environment, "ko") * m;
    });
  }, [releases, tableQuery, sortKey, sortDir, templateLabel]);

  function toggleSort(key: ReleaseSortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sortBtnBase =
    "hover:bg-muted/55 text-muted-foreground hover:text-foreground flex min-h-[3rem] w-full items-center gap-2 border-0 bg-transparent text-xs font-semibold tracking-wider uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none";

  return (
    <div className="mx-auto flex w-full max-w-none min-w-0 flex-col gap-10">
      <AdminPageHeader
        title="프롬프트 릴리스"
        description="에이전트와 배포 환경별로 활성 프롬프트 템플릿을 고정합니다. 같은 에이전트·환경 조합은 새로 저장할 때 덮어씁니다."
      />

      {actionData && "message" in actionData && actionData.message && (
        <AdminErrorAlert message={actionData.message} />
      )}

      <AdminSection
        title="릴리스 등록"
        description="드롭다운에서 에이전트와 템플릿을 선택한 뒤 환경 이름을 입력하세요."
      >
        <AdminPanel padding="lg" className="w-full min-w-0">
          <Form method="post" className="grid w-full min-w-0 gap-5">
            <input type="hidden" name="intent" value="upsert" />
            <div className="flex flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">에이전트</span>
              <AdminAgentSelectWithFilter agents={agents} selectAriaLabel="에이전트 선택" />
            </div>
            <NexInput
              name="environment"
              label="환경"
              required
              placeholder="예: production, staging, dev"
            />
            <div className="flex flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">활성 프롬프트 템플릿</span>
              <AdminPromptTemplateSelectWithFilter
                templates={templates}
                selectAriaLabel="활성 프롬프트 템플릿"
              />
            </div>
            <NexInput name="release_note" label="릴리스 노트 (선택)" />
            <div className="pt-1">
              <NexButton type="submit" variant="primary" loading={busy} disabled={busy}>
                저장
              </NexButton>
            </div>
          </Form>
        </AdminPanel>
      </AdminSection>

      <AdminSection
        title="현재 고정"
        description="각 행은 한 에이전트가 특정 환경에서 사용 중인 프롬프트 버전을 나타냅니다."
      >
        <div className="space-y-4">
          <NexInput
            placeholder="에이전트, 환경, 활성 템플릿, 릴리스 노트…"
            value={tableQuery}
            onChange={(e) => setTableQuery(e.target.value)}
            leftIcon={<SearchIcon className="size-4 opacity-70" aria-hidden />}
            inputSize="md"
            aria-label="릴리스 목록 필터"
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
                      onClick={() => toggleSort("environment")}
                      aria-sort={
                        sortKey === "environment"
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      환경
                      <SortAffix active={sortKey === "environment"} dir={sortDir} />
                    </button>
                  </TableHead>
                  <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                    <button
                      type="button"
                      className={cn(
                        sortBtnBase,
                        "min-w-[200px] justify-start px-4 py-3.5 text-left",
                      )}
                      onClick={() => toggleSort("template")}
                      aria-sort={
                        sortKey === "template"
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      활성 템플릿
                      <SortAffix active={sortKey === "template"} dir={sortDir} />
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
                {releases.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={4} className={cn(adminTdClass, "py-16")}>
                      <p className="text-muted-foreground text-center text-sm">
                        아직 등록된 릴리스가 없습니다. 위 양식으로 첫 고정을 추가하세요.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : filteredSortedReleases.length === 0 ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={4} className={cn(adminTdClass, "py-14")}>
                      <p className="text-muted-foreground text-center text-sm">
                        검색 조건에 맞는 릴리스가 없습니다.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSortedReleases.map((r) => {
                    const label =
                      templateLabel[r.active_prompt_id] ?? r.active_prompt_id;
                    return (
                      <TableRow
                        key={r.id}
                        className="border-border/80 hover:bg-muted/35 cursor-pointer"
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest("button, a, input, select, textarea, form")) {
                            return;
                          }
                          navigate(`/admin/prompts/${r.active_prompt_id}`);
                        }}
                        onKeyDown={(e) => {
                          if (e.key !== "Enter" && e.key !== " ") {
                            return;
                          }
                          if ((e.target as HTMLElement).closest("button, a, input, select, textarea, form")) {
                            return;
                          }
                          e.preventDefault();
                          navigate(`/admin/prompts/${r.active_prompt_id}`);
                        }}
                        tabIndex={0}
                        role="link"
                        aria-label={`${r.agent_key} ${r.environment} 프롬프트 상세로 이동`}
                      >
                        <TableCell className={cn(adminTdClass, "align-top")}>
                          <span className="text-foreground font-mono text-[13px] leading-snug font-medium">
                            {r.agent_key}
                          </span>
                        </TableCell>
                        <TableCell className={cn(adminTdClass, "align-top")}>
                          <EnvironmentBadge env={r.environment} />
                        </TableCell>
                        <TableCell
                          className={cn(adminTdClass, "max-w-[min(420px,55vw)] align-top")}
                        >
                          <span
                            className="text-foreground line-clamp-2 text-[13px] leading-snug"
                            title={label}
                          >
                            {label}
                          </span>
                        </TableCell>
                        <TableCell className={cn(adminTdClass, "align-top text-end")}>
                          <Form method="post" className="inline-flex justify-end">
                            <input type="hidden" name="intent" value="delete" />
                            <input type="hidden" name="id" value={r.id} />
                            <NexButton
                              type="submit"
                              variant="secondary"
                              size="sm"
                              leftIcon={<Trash2Icon className="size-3.5" aria-hidden />}
                              className="border-destructive/30 text-destructive hover:bg-destructive/10"
                              loading={busy}
                              disabled={busy}
                              aria-label={`${r.agent_key} ${r.environment} 릴리스 삭제`}
                            >
                              삭제
                            </NexButton>
                          </Form>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </AdminTableShell>
        </div>
      </AdminSection>
    </div>
  );
}
