import type { Route } from "./+types/pipeline-new";

import { Form, Link, data, redirect, useActionData, useNavigation } from "react-router";
import { z } from "zod";

import {
  AdminErrorAlert,
  AdminPageHeader,
  AdminPanel,
  AdminSection,
  adminSelectClassName,
} from "../components/admin-ui";
import { NexButton, NexInput } from "~/core/components/nex";
import { requireAdmin, requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";

const createSchema = z.object({
  pipeline_key: z.string().min(1, "pipeline_key 필수"),
  name: z.string().min(1, "이름 필수"),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "deprecated"]),
});

export const meta: Route.MetaFunction = () => [
  { title: `새 파이프라인 | ${import.meta.env.VITE_APP_NAME}` },
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
  const { error } = await client.from("pipelines").insert({
    pipeline_key: v.pipeline_key.trim(),
    name: v.name.trim(),
    description: v.description?.trim() || null,
    status: v.status,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    return data({ message: error.message }, { status: 400 });
  }
  return redirect(`/admin/pipelines/${encodeURIComponent(v.pipeline_key.trim())}`);
}

export default function PipelineNew() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <div className="space-y-2">
        <Link
          to="/admin/pipelines"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <span aria-hidden>←</span> 파이프라인 목록
        </Link>
        <AdminPageHeader
          title="새 파이프라인"
          description="고유한 pipeline_key와 표시 이름을 지정합니다. 저장 후 상세에서 실행 순서를 구성할 수 있습니다."
        />
      </div>

      {actionData && "message" in actionData && actionData.message && (
        <AdminErrorAlert message={actionData.message} />
      )}

      <AdminSection title="기본 정보">
        <AdminPanel padding="lg" className="max-w-xl">
          <Form method="post" className="grid gap-5">
            <NexInput name="pipeline_key" label="pipeline_key" required placeholder="예: ingest_v1" />
            <NexInput name="name" label="이름" required />
            <NexInput name="description" label="설명" placeholder="선택" />
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">상태</span>
              <select
                name="status"
                required
                className={adminSelectClassName}
                defaultValue="draft"
                aria-label="파이프라인 상태"
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="deprecated">deprecated</option>
              </select>
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              <NexButton type="submit" variant="primary" loading={busy} disabled={busy}>
                만들기
              </NexButton>
              <Link to="/admin/pipelines">
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
