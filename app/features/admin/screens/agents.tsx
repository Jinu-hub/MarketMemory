import type { Route } from "./+types/agents";

import { Trash2Icon } from "lucide-react";
import { Form, data, useActionData, useNavigation } from "react-router";
import { z } from "zod";

import {
  AdminErrorAlert,
  AdminPageHeader,
  AdminPanel,
  AdminSection,
  AdminTableShell,
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
  { title: `에이전트 | ${import.meta.env.VITE_APP_NAME}` },
];

const createSchema = z.object({
  intent: z.literal("create"),
  agent_key: z.string().min(1),
  display_name: z.string().optional(),
});

const updateSchema = z.object({
  intent: z.literal("update"),
  agent_key: z.string().min(1),
  display_name: z.string().optional(),
});

const deleteSchema = z.object({
  intent: z.literal("delete"),
  agent_key: z.string().min(1),
});

const actionSchema = z.discriminatedUnion("intent", [
  createSchema,
  updateSchema,
  deleteSchema,
]);

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  const { data: rows, error } = await client
    .from("agents")
    .select("*")
    .order("agent_key", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return { agents: rows ?? [] };
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
  if (v.intent === "create") {
    const { error } = await client.from("agents").insert({
      agent_key: v.agent_key.trim(),
      display_name: v.display_name?.trim() || null,
    });
    if (error) {
      return data({ message: error.message }, { status: 400 });
    }
    return data({ ok: true });
  }
  if (v.intent === "update") {
    const { error } = await client
      .from("agents")
      .update({
        display_name: v.display_name?.trim() || null,
      })
      .eq("agent_key", v.agent_key);
    if (error) {
      return data({ message: error.message }, { status: 400 });
    }
    return data({ ok: true });
  }
  const { error } = await client.from("agents").delete().eq("agent_key", v.agent_key);
  if (error) {
    return data({ message: error.message }, { status: 400 });
  }
  return data({ ok: true });
}

export default function AdminAgents({ loaderData }: Route.ComponentProps) {
  const { agents } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <AdminPageHeader
        title="에이전트"
        description="에이전트 키는 프롬프트와 파이프라인 단계에서 참조됩니다. 키는 생성 후 바꾸지 않는 것이 안전합니다."
      />

      {actionData && "message" in actionData && actionData.message && (
        <AdminErrorAlert message={actionData.message} />
      )}

      <AdminSection
        title="새 에이전트"
        description="시스템 전역에서 유일한 agent_key를 지정하고, 사람이 읽기 쉬운 표시 이름을 붙일 수 있습니다."
      >
        <AdminPanel padding="lg" className="max-w-xl">
          <Form method="post" className="grid gap-5">
            <input type="hidden" name="intent" value="create" />
            <NexInput name="agent_key" label="agent_key" required placeholder="예: summarize_agent" />
            <NexInput name="display_name" label="표시 이름" placeholder="선택" />
            <div className="pt-1">
              <NexButton type="submit" variant="primary" loading={busy} disabled={busy}>
                추가
              </NexButton>
            </div>
          </Form>
        </AdminPanel>
      </AdminSection>

      <AdminSection
        title="등록된 에이전트"
        description="표시 이름만 인라인으로 수정할 수 있습니다. 프롬프트나 릴리스가 연결된 키는 삭제가 거부될 수 있습니다."
      >
        <AdminTableShell>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className={cn(adminThClass, "min-w-[200px]")}>agent_key</TableHead>
                <TableHead className={adminThClass}>표시 이름</TableHead>
                <TableHead className={cn(adminThClass, "w-[160px] text-end")}>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={3} className={cn(adminTdClass, "py-16")}>
                    <p className="text-muted-foreground text-center text-sm">
                      등록된 에이전트가 없습니다.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                agents.map((a) => (
                  <TableRow key={a.agent_key} className="border-border/80">
                    <TableCell className={cn(adminTdClass, "align-top")}>
                      <span className="text-foreground font-mono text-[13px] leading-snug font-medium">
                        {a.agent_key}
                      </span>
                    </TableCell>
                    <TableCell className={cn(adminTdClass, "align-top")}>
                      <Form method="post" className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
      </AdminSection>
    </div>
  );
}
