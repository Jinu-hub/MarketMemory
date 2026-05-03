import type { Route } from "./+types/prompt-releases";
import type { Database } from "database.types";

import { Trash2Icon } from "lucide-react";
import { Form, data, useActionData, useNavigation } from "react-router";
import { z } from "zod";

import {
  AdminErrorAlert,
  AdminPageHeader,
  AdminPanel,
  AdminSection,
  AdminTableShell,
  EnvironmentBadge,
  adminSelectClassName,
  adminTdClass,
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

export default function PromptReleases({ loaderData }: Route.ComponentProps) {
  if (!loaderData) {
    return null;
  }
  const { releases, agents, templates, templateLabel } =
    loaderData as PromptReleasesLoaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
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
        <AdminPanel padding="lg" className="max-w-xl">
          <Form method="post" className="grid gap-5">
            <input type="hidden" name="intent" value="upsert" />
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">에이전트</span>
              <select
                name="agent_key"
                required
                className={adminSelectClassName}
                defaultValue=""
                aria-label="에이전트 선택"
              >
                <option value="" disabled>
                  선택…
                </option>
                {agents.map((a) => (
                  <option key={a.agent_key} value={a.agent_key}>
                    {a.agent_key}
                    {a.display_name ? ` — ${a.display_name}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <NexInput
              name="environment"
              label="환경"
              required
              placeholder="예: production, staging, dev"
            />
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">활성 프롬프트 템플릿</span>
              <select
                name="active_prompt_id"
                required
                className={adminSelectClassName}
                defaultValue=""
                aria-label="활성 프롬프트 템플릿"
              >
                <option value="" disabled>
                  선택…
                </option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {templateLabel[t.id] ?? t.id}
                  </option>
                ))}
              </select>
            </label>
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
        <AdminTableShell>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className={adminThClass}>에이전트</TableHead>
                <TableHead className={adminThClass}>환경</TableHead>
                <TableHead className={cn(adminThClass, "min-w-[200px]")}>활성 템플릿</TableHead>
                <TableHead className={cn(adminThClass, "w-[120px] text-end")}>작업</TableHead>
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
              ) : (
                releases.map((r) => {
                  const label =
                    templateLabel[r.active_prompt_id] ?? r.active_prompt_id;
                  return (
                    <TableRow key={r.id} className="border-border/80">
                      <TableCell className={cn(adminTdClass, "align-top")}>
                        <span className="text-foreground font-mono text-[13px] leading-snug font-medium">
                          {r.agent_key}
                        </span>
                      </TableCell>
                      <TableCell className={cn(adminTdClass, "align-top")}>
                        <EnvironmentBadge env={r.environment} />
                      </TableCell>
                      <TableCell className={cn(adminTdClass, "max-w-[min(420px,55vw)] align-top")}>
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
      </AdminSection>
    </div>
  );
}
