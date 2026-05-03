import type { Route } from "./+types/pipelines";

import { PencilLineIcon, Trash2Icon } from "lucide-react";
import { Form, Link, data, useActionData, useNavigation } from "react-router";
import { z } from "zod";

import {
  AdminErrorAlert,
  AdminPageHeader,
  AdminPanel,
  AdminSection,
  AdminTableShell,
  PipelineStatusBadge,
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
  { title: `파이프라인 | ${import.meta.env.VITE_APP_NAME}` },
];

const createSchema = z.object({
  intent: z.literal("create"),
  pipeline_key: z.string().min(1, "pipeline_key 필수"),
  name: z.string().min(1, "이름 필수"),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "deprecated"]),
});

const deleteSchema = z.object({
  intent: z.literal("delete"),
  id: z.string().uuid(),
});

const actionSchema = z.discriminatedUnion("intent", [createSchema, deleteSchema]);

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  const { data: rows, error } = await client
    .from("pipelines")
    .select("*")
    .order("name", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return { pipelines: rows ?? [] };
}

export async function action({ request }: Route.ActionArgs) {
  requireMethod("POST")(request);
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const formData = await request.formData();
  const parsed = actionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return data(
      { error: parsed.error.flatten().fieldErrors, message: "유효하지 않은 입력입니다." },
      { status: 400 },
    );
  }

  const payload = parsed.data;
  if (payload.intent === "create") {
    const { error } = await client.from("pipelines").insert({
      pipeline_key: payload.pipeline_key.trim(),
      name: payload.name.trim(),
      description: payload.description?.trim() || null,
      status: payload.status,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      return data({ message: error.message }, { status: 400 });
    }
    return data({ ok: true });
  }

  const { error } = await client.from("pipelines").delete().eq("id", payload.id);
  if (error) {
    return data({ message: error.message }, { status: 400 });
  }
  return data({ ok: true });
}

export default function AdminPipelines({ loaderData }: Route.ComponentProps) {
  const { pipelines } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <AdminPageHeader
        title="파이프라인"
        description="워크플로 정의와 식별자(pipeline_key)를 관리합니다. 키는 생성 후 변경하지 않는 것이 안전합니다."
      />

      {actionData && "message" in actionData && actionData.message && (
        <AdminErrorAlert message={actionData.message} />
      )}

      <AdminSection
        title="새 파이프라인"
        description="고유한 pipeline_key와 표시 이름을 지정한 뒤 저장하세요."
      >
        <AdminPanel padding="lg" className="max-w-xl">
          <Form method="post" className="grid gap-5">
            <input type="hidden" name="intent" value="create" />
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
            <div className="pt-1">
              <NexButton type="submit" variant="primary" loading={busy} disabled={busy}>
                추가
              </NexButton>
            </div>
          </Form>
        </AdminPanel>
      </AdminSection>

      <AdminSection title="등록된 파이프라인" description="행을 클릭하거나 편집으로 단계·메타데이터를 수정합니다.">
        <AdminTableShell>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className={adminThClass}>pipeline_key</TableHead>
                <TableHead className={adminThClass}>이름</TableHead>
                <TableHead className={adminThClass}>상태</TableHead>
                <TableHead className={cn(adminThClass, "text-end")}>작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pipelines.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={4} className={cn(adminTdClass, "py-16")}>
                    <p className="text-muted-foreground text-center text-sm">
                      아직 파이프라인이 없습니다. 위 양식에서 첫 항목을 추가하세요.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                pipelines.map((p) => (
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
      </AdminSection>
    </div>
  );
}
