import type { Route } from "./+types/prompt-new";
import type { Database } from "database.types";

import { Form, Link, data, redirect, useActionData, useNavigation } from "react-router";
import { z } from "zod";

import {
  AdminAgentSelectWithFilter,
  AdminErrorAlert,
  AdminPageHeader,
  AdminPanel,
  AdminSection,
  adminSelectClassName,
  adminTextareaClassName,
} from "../components/admin-ui";
import { NexButton, NexInput } from "~/core/components/nex";
import { requireAdmin, requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";

const createSchema = z.object({
  agent_key: z.string().min(1),
  name: z.string().min(1),
  template: z.string().min(1),
  status: z.enum(["draft", "active", "deprecated", "archived"]),
  changelog: z.string().optional(),
});

type PromptNewLoaderData = {
  agents: Pick<
    Database["public"]["Tables"]["agents"]["Row"],
    "agent_key" | "display_name"
  >[];
};

export const meta: Route.MetaFunction = () => [
  { title: `새 프롬프트 템플릿 | ${import.meta.env.VITE_APP_NAME}` },
];

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  const { data: agents, error } = await client
    .from("agents")
    .select("agent_key, display_name")
    .order("agent_key");
  if (error) {
    throw new Error(error.message);
  }
  const payload: PromptNewLoaderData = { agents: agents ?? [] };
  return payload;
}

export async function action({ request }: Route.ActionArgs) {
  requireMethod("POST")(request);
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const formData = await request.formData();
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return data(
      { message: "유효하지 않은 입력입니다.", fieldErrors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const v = parsed.data;
  const { data: maxRow } = await client
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
  return redirect("/admin/prompts");
}

export default function PromptNew({ loaderData }: Route.ComponentProps) {
  if (!loaderData) {
    return null;
  }
  const { agents } = loaderData as PromptNewLoaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  return (
    <div className="mx-auto flex w-full max-w-none min-w-0 flex-col gap-10">
      <div className="space-y-2">
        <Link
          to="/admin/prompts"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <span aria-hidden>←</span> 프롬프트 목록
        </Link>
        <AdminPageHeader
          title="새 템플릿 버전"
          description="에이전트를 고르고 이름·본문·상태를 입력합니다. 해당 에이전트의 다음 버전 번호가 자동으로 부여됩니다. 하이퍼파라미터는 저장 후 편집 화면에서 조정할 수 있습니다."
        />
      </div>

      {actionData && "message" in actionData && actionData.message && (
        <AdminErrorAlert message={actionData.message} />
      )}

      <AdminSection title="템플릿 내용">
        <AdminPanel padding="lg" className="w-full min-w-0">
          <Form method="post" className="grid w-full min-w-0 gap-5">
            <div className="flex flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">에이전트</span>
              <AdminAgentSelectWithFilter agents={agents} selectAriaLabel="에이전트" />
            </div>
            <NexInput name="name" label="이름" required />
            <label className="flex min-w-0 w-full flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">템플릿 본문</span>
              <textarea
                name="template"
                required
                rows={14}
                className={cn(adminTextareaClassName, "block min-h-[min(48vh,28rem)] resize-y")}
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
            <div className="flex flex-wrap gap-2 pt-1">
              <NexButton type="submit" variant="primary" loading={busy} disabled={busy}>
                새 버전 생성
              </NexButton>
              <Link to="/admin/prompts">
                <NexButton type="button" variant="secondary" disabled={busy}>
                  취소
                </NexButton>
              </Link>
            </div>
          </Form>
        </AdminPanel>
      </AdminSection>
    </div>
  );
}
