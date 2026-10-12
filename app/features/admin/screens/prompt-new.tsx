import type { Route } from "./+types/prompt-new";
import type { Database } from "database.types";

import { useState } from "react";
import { Form, Link, data, redirect, useActionData, useNavigation } from "react-router";
import { z } from "zod";

import {
  AdminAgentSelectWithFilter,
  AdminErrorAlert,
  AdminPageHeader,
  AdminPanel,
  AdminSection,
  THINKING_LEVELS,
  ThinkingLevelOptions,
  adminSelectClassName,
  adminTextareaClassName,
} from "../components/admin-ui";
import { NexButton, NexInput } from "~/core/components/nex";
import { requireAdmin, requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";
import { createPromptTemplate } from "../mutations";
import { getLatestPromptTemplateByAgentKey, listAgentsWithDisplayName } from "../queries";

const createSchema = z.object({
  agent_key: z.string().min(1),
  name: z.string().min(1),
  template: z.string().min(1),
  status: z.enum(["draft", "active", "deprecated", "archived"]),
  thinking_level: z.union([z.literal("inherit"), z.literal(""), z.enum(THINKING_LEVELS)]),
  default_provider: z.string().optional(),
  default_model: z.string().optional(),
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
  const { data: agents, error } = await listAgentsWithDisplayName(client);
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
  const { data: prevTemplate } = await getLatestPromptTemplateByAgentKey(client, v.agent_key.trim());

  const nextVersion = (prevTemplate?.version ?? 0) + 1;

  const {
    data: { user },
  } = await client.auth.getUser();

  const { error } = await createPromptTemplate(client, {
    agent_key: v.agent_key.trim(),
    name: v.name.trim(),
    template: v.template,
    version: nextVersion,
    status: v.status,
    temperature: prevTemplate?.temperature ?? null,
    api_mode: prevTemplate?.api_mode ?? "responses",
    thinking_level:
      v.thinking_level === "inherit"
        ? (prevTemplate?.thinking_level ?? null)
        : v.thinking_level || null,
    input_schema: prevTemplate?.input_schema ?? null,
    output_schema: prevTemplate?.output_schema ?? null,
    default_provider: v.default_provider?.trim() || prevTemplate?.default_provider || null,
    default_model: v.default_model?.trim() || prevTemplate?.default_model || null,
    default_params: prevTemplate?.default_params ?? null,
    is_backward_compatible: prevTemplate?.is_backward_compatible ?? true,
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
  const [name, setName] = useState("");
  const [autoName, setAutoName] = useState("");

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
          description="에이전트를 고르고 이름·본문·상태를 입력합니다. 해당 에이전트의 다음 버전 번호가 자동으로 부여됩니다. thinking_level·프로바이더·모델은 여기서 지정하거나 이전 버전 값을 물려받고, 나머지 하이퍼파라미터는 저장 후 편집 화면에서 조정할 수 있습니다."
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
              <AdminAgentSelectWithFilter
                agents={agents}
                selectAriaLabel="에이전트"
                onAgentChange={(agent) => {
                  const next = agent ? (agent.display_name ?? agent.agent_key) : "";
                  // 사용자가 직접 고친 이름은 덮어쓰지 않음
                  if (name === autoName) {
                    setName(next);
                  }
                  setAutoName(next);
                }}
              />
            </div>
            <NexInput
              name="name"
              label="이름"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
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
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">thinking_level</span>
              <select
                name="thinking_level"
                className={adminSelectClassName}
                defaultValue="inherit"
                aria-label="추론 강도"
              >
                <option value="inherit">이전 버전 값 유지</option>
                <ThinkingLevelOptions />
              </select>
            </label>
            <NexInput
              name="default_provider"
              label="default_provider (선택)"
              placeholder="예: openai, gemini, anthropic — 비우면 이전 버전 값 유지"
            />
            <NexInput
              name="default_model"
              label="default_model (선택)"
              placeholder="예: gpt-5, gemini-2.5-pro — 비우면 이전 버전 값 유지"
            />
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
