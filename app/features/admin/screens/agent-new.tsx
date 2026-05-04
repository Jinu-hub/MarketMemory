import type { Route } from "./+types/agent-new";

import { Form, Link, data, redirect, useActionData, useNavigation } from "react-router";
import { z } from "zod";

import {
  AdminErrorAlert,
  AdminPageHeader,
  AdminPanel,
  AdminSection,
} from "../components/admin-ui";
import { NexButton, NexInput } from "~/core/components/nex";
import { requireAdmin, requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";

const createSchema = z.object({
  agent_key: z.string().min(1, "agent_key 필수"),
  display_name: z.string().optional(),
});

export const meta: Route.MetaFunction = () => [
  { title: `새 에이전트 | ${import.meta.env.VITE_APP_NAME}` },
];

export async function loader() {
  return {};
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
  const { error } = await client.from("agents").insert({
    agent_key: v.agent_key.trim(),
    display_name: v.display_name?.trim() || null,
  });
  if (error) {
    return data({ message: error.message }, { status: 400 });
  }
  return redirect("/admin/agents");
}

export default function AgentNew() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <div className="space-y-2">
        <Link
          to="/admin/agents"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <span aria-hidden>←</span> 에이전트 목록
        </Link>
        <AdminPageHeader
          title="새 에이전트"
          description="시스템 전역에서 유일한 agent_key를 지정합니다. 생성 후 키는 바꾸지 않는 것이 안전합니다."
        />
      </div>

      {actionData && "message" in actionData && actionData.message && (
        <AdminErrorAlert message={actionData.message} />
      )}

      <AdminSection title="기본 정보">
        <AdminPanel padding="lg" className="max-w-xl">
          <Form method="post" className="grid gap-5">
            <NexInput
              name="agent_key"
              label="agent_key"
              required
              placeholder="예: summarize_agent"
            />
            <NexInput name="display_name" label="표시 이름" placeholder="선택" />
            <div className="flex flex-wrap gap-2 pt-1">
              <NexButton type="submit" variant="primary" loading={busy} disabled={busy}>
                만들기
              </NexButton>
              <Link to="/admin/agents">
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
