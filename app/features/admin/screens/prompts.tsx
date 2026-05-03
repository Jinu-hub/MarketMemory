import type { Route } from "./+types/prompts";
import type { Database } from "database.types";

import { FilterIcon, PencilLineIcon } from "lucide-react";
import { Form, Link, data, useActionData, useNavigation } from "react-router";
import { z } from "zod";

import {
  AdminErrorAlert,
  AdminPageHeader,
  AdminPanel,
  AdminSection,
  AdminTableShell,
  PromptStatusBadge,
  adminSelectClassName,
  adminTdClass,
  adminTextareaClassName,
  adminThClass,
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
  { title: `프롬프트 | ${import.meta.env.VITE_APP_NAME}` },
];

const createSchema = z.object({
  intent: z.literal("create"),
  agent_key: z.string().min(1),
  name: z.string().min(1),
  template: z.string().min(1),
  status: z.enum(["draft", "active", "deprecated", "archived"]),
  changelog: z.string().optional(),
});

type AdminPromptsLoaderData = {
  agents: Pick<
    Database["public"]["Tables"]["agents"]["Row"],
    "agent_key" | "display_name"
  >[];
  templates: Database["public"]["Tables"]["prompt_templates"]["Row"][];
  filterAgentKey: string | null;
};

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);

  const url = new URL(request.url);
  const agentKey = url.searchParams.get("agent_key")?.trim() || null;

  const [{ data: agents, error: ae }, templatesQuery] = await Promise.all([
    client.from("agents").select("agent_key, display_name").order("agent_key"),
    agentKey
      ? client
          .from("prompt_templates")
          .select("*")
          .eq("agent_key", agentKey)
          .order("version", { ascending: false })
      : client.from("prompt_templates").select("*").order("updated_at", { ascending: false }),
  ]);

  if (ae) {
    throw new Error(ae.message);
  }
  const { data: templates, error: te } = templatesQuery;
  if (te) {
    throw new Error(te.message);
  }

  const payload: AdminPromptsLoaderData = {
    agents: agents ?? [],
    templates: templates ?? [],
    filterAgentKey: agentKey,
  };
  return payload;
}

export async function action({ request }: Route.ActionArgs) {
  requireMethod("POST")(request);
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const formData = await request.formData();
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return data({ message: "유효하지 않은 입력입니다." }, { status: 400 });
  }

  const v = parsed.data;
  const {
    data: maxRow,
  } = await client
    .from("prompt_templates")
    .select("version")
    .eq("agent_key", v.agent_key.trim())
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (maxRow?.version ?? 0) + 1;

  const {
    data: { user },
  } = await client.auth.getUser();

  const { error } = await client.from("prompt_templates").insert({
    agent_key: v.agent_key.trim(),
    name: v.name.trim(),
    template: v.template,
    version: nextVersion,
    status: v.status,
    changelog: v.changelog?.trim() || null,
    created_by: user?.id ?? null,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return data({ message: error.message }, { status: 400 });
  }
  return data({ ok: true });
}

export default function AdminPrompts({ loaderData }: Route.ComponentProps) {
  if (!loaderData) {
    return null;
  }
  const { agents, templates, filterAgentKey } =
    loaderData as AdminPromptsLoaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <AdminPageHeader
        title="프롬프트 템플릿"
        description="에이전트별로 템플릿 버전이 쌓입니다. 새 행을 만들면 해당 에이전트의 다음 버전 번호가 자동으로 부여됩니다."
      />

      {actionData && "message" in actionData && actionData.message && (
        <AdminErrorAlert message={actionData.message} />
      )}

      <AdminSection
        title="필터"
        description="에이전트를 고르면 해당 에이전트의 템플릿만 시간 역순으로 봅니다."
      >
        <AdminPanel padding="md" className="max-w-xl">
          <Form method="get" className="flex flex-wrap items-end gap-3">
            <label className="flex min-w-[220px] flex-1 flex-col gap-2 text-sm">
              <span className="text-foreground flex items-center gap-2 font-medium">
                <FilterIcon className="text-muted-foreground size-3.5" aria-hidden />
                에이전트
              </span>
              <select
                name="agent_key"
                defaultValue={filterAgentKey ?? ""}
                className={adminSelectClassName}
                aria-label="에이전트로 목록 필터"
              >
                <option value="">전체</option>
                {agents.map((a) => (
                  <option key={a.agent_key} value={a.agent_key}>
                    {a.agent_key}
                    {a.display_name ? ` — ${a.display_name}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <NexButton type="submit" variant="secondary" size="sm" className="mb-0.5">
              적용
            </NexButton>
          </Form>
        </AdminPanel>
      </AdminSection>

      <AdminSection
        title="새 템플릿 버전"
        description="이름·본문·상태를 입력해 새 버전을 만듭니다. 세부 하이퍼파라미터는 저장 후 편집 화면에서 조정할 수 있습니다."
      >
        <AdminPanel padding="lg" className="max-w-xl">
          <Form method="post" className="grid gap-5">
            <input type="hidden" name="intent" value="create" />
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">에이전트</span>
              <select
                name="agent_key"
                required
                className={adminSelectClassName}
                defaultValue=""
                aria-label="에이전트"
              >
                <option value="" disabled>
                  선택…
                </option>
                {agents.map((a) => (
                  <option key={a.agent_key} value={a.agent_key}>
                    {a.agent_key}
                  </option>
                ))}
              </select>
            </label>
            <NexInput name="name" label="이름" required />
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">템플릿 본문</span>
              <textarea
                name="template"
                required
                rows={8}
                className={adminTextareaClassName}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">상태</span>
              <select
                name="status"
                required
                className={adminSelectClassName}
                defaultValue="draft"
                aria-label="템플릿 상태"
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="deprecated">deprecated</option>
                <option value="archived">archived</option>
              </select>
            </label>
            <NexInput name="changelog" label="변경 요약 (선택)" />
            <div className="pt-1">
              <NexButton type="submit" variant="primary" loading={busy} disabled={busy}>
                새 버전 생성
              </NexButton>
            </div>
          </Form>
        </AdminPanel>
      </AdminSection>

      <AdminSection title="템플릿 목록">
        <AdminTableShell>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className={adminThClass}>에이전트</TableHead>
                <TableHead className={adminThClass}>이름</TableHead>
                <TableHead className={cn(adminThClass, "w-16")}>ver</TableHead>
                <TableHead className={adminThClass}>상태</TableHead>
                <TableHead className={cn(adminThClass, "text-end w-[100px]")}>편집</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className={cn(adminTdClass, "py-16")}>
                    <p className="text-muted-foreground text-center text-sm">
                      표시할 템플릿이 없습니다. 필터를 바꾸거나 새 버전을 추가하세요.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((t) => (
                  <TableRow key={t.id} className="border-border/80">
                    <TableCell className={cn(adminTdClass, "font-mono text-[13px]")}>
                      {t.agent_key}
                    </TableCell>
                    <TableCell className={cn(adminTdClass, "text-foreground max-w-[200px] truncate")}>
                      <span title={t.name}>{t.name}</span>
                    </TableCell>
                    <TableCell className={cn(adminTdClass, "text-muted-foreground tabular-nums")}>
                      {t.version}
                    </TableCell>
                    <TableCell className={adminTdClass}>
                      <PromptStatusBadge status={t.status} />
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
      </AdminSection>
    </div>
  );
}
