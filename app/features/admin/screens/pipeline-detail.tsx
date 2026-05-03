import type { Route } from "./+types/pipeline-detail";

import { ArrowDownIcon, ArrowUpIcon, Trash2Icon } from "lucide-react";
import { Form, Link, data, redirect, useActionData, useNavigation } from "react-router";
import { z } from "zod";

import {
  AdminErrorAlert,
  AdminPanel,
  AdminSection,
  AdminTableShell,
  PipelineStatusBadge,
  TargetTypeBadge,
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
  { title: `파이프라인 상세 | ${import.meta.env.VITE_APP_NAME}` },
];

const updatePipelineSchema = z.object({
  intent: z.literal("update_pipeline"),
  pipeline_key: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["draft", "active", "deprecated"]),
});

const addStepSchema = z.object({
  intent: z.literal("add_step"),
  pipeline_key: z.string().min(1),
  target_type: z.enum(["agent", "pipeline", "prompt_template"]),
  target_key: z.string().min(1),
  is_required: z.enum(["true", "false"]),
});

const deleteStepSchema = z.object({
  intent: z.literal("delete_step"),
  step_id: z.string().uuid(),
  pipeline_key: z.string().min(1),
});

const moveStepSchema = z.object({
  intent: z.literal("move_step"),
  pipeline_key: z.string().min(1),
  step_id: z.string().uuid(),
  direction: z.enum(["up", "down"]),
});

const actionSchema = z.discriminatedUnion("intent", [
  updatePipelineSchema,
  addStepSchema,
  deleteStepSchema,
  moveStepSchema,
]);

export async function loader({ request, params }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  const pipelineKey = decodeURIComponent(params.pipelineKey ?? "");

  const [{ data: pipeline, error: pe }, agentsResult, pipelinesResult, templatesResult] =
    await Promise.all([
      client.from("pipelines").select("*").eq("pipeline_key", pipelineKey).maybeSingle(),
      client.from("agents").select("agent_key, display_name").order("agent_key"),
      client.from("pipelines").select("pipeline_key, name").order("name"),
      client.from("prompt_templates").select("id, name, version, agent_key").order("agent_key"),
    ]);

  if (pe || !pipeline) {
    throw data(null, { status: 404 });
  }

  const { data: steps, error: se } = await client
    .from("pipeline_steps")
    .select("*")
    .eq("pipeline_key", pipelineKey)
    .order("step", { ascending: true });

  if (se) {
    throw new Error(se.message);
  }

  return {
    pipeline,
    steps: steps ?? [],
    agents: agentsResult.data ?? [],
    pipelinesList: pipelinesResult.data ?? [],
    promptTemplates: templatesResult.data ?? [],
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  requireMethod("POST")(request);
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const pipelineKeyEnc = params.pipelineKey ?? "";
  const pipeline_key = decodeURIComponent(pipelineKeyEnc);

  const formData = await request.formData();
  const parsed = actionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return data(
      { message: "유효하지 않은 입력입니다.", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const v = parsed.data;

  if (v.intent === "update_pipeline") {
    if (v.pipeline_key !== pipeline_key) {
      return data({ message: "pipeline_key 불일치" }, { status: 400 });
    }
    const { error } = await client
      .from("pipelines")
      .update({
        name: v.name.trim(),
        description: v.description?.trim() || null,
        status: v.status,
        updated_at: new Date().toISOString(),
      })
      .eq("pipeline_key", pipeline_key);
    if (error) {
      return data({ message: error.message }, { status: 400 });
    }
    return redirect(`/admin/pipelines/${encodeURIComponent(pipeline_key)}`);
  }

  if (v.intent === "add_step") {
    if (v.pipeline_key !== pipeline_key) {
      return data({ message: "pipeline_key 불일치" }, { status: 400 });
    }
    const { data: existing } = await client
      .from("pipeline_steps")
      .select("step")
      .eq("pipeline_key", pipeline_key)
      .order("step", { ascending: false })
      .limit(1)
      .maybeSingle();
    const nextStep = (existing?.step ?? 0) + 1;
    const { error } = await client.from("pipeline_steps").insert({
      pipeline_key,
      step: nextStep,
      target_type: v.target_type,
      target_key: v.target_key.trim(),
      is_required: v.is_required === "true",
    });
    if (error) {
      return data({ message: error.message }, { status: 400 });
    }
    return redirect(`/admin/pipelines/${encodeURIComponent(pipeline_key)}`);
  }

  if (v.intent === "delete_step") {
    if (v.pipeline_key !== pipeline_key) {
      return data({ message: "pipeline_key 불일치" }, { status: 400 });
    }
    const { error } = await client.from("pipeline_steps").delete().eq("id", v.step_id);
    if (error) {
      return data({ message: error.message }, { status: 400 });
    }
    return redirect(`/admin/pipelines/${encodeURIComponent(pipeline_key)}`);
  }

  // move_step: reorder by delete-all + insert
  if (v.pipeline_key !== pipeline_key) {
    return data({ message: "pipeline_key 불일치" }, { status: 400 });
  }
  const { data: rows, error: le } = await client
    .from("pipeline_steps")
    .select("*")
    .eq("pipeline_key", pipeline_key)
    .order("step", { ascending: true });
  if (le || !rows) {
    return data({ message: le?.message ?? "단계 조회 실패" }, { status: 400 });
  }
  const idx = rows.findIndex((r) => r.id === v.step_id);
  if (idx < 0) {
    return data({ message: "단계를 찾을 수 없습니다." }, { status: 400 });
  }
  const swapWith = v.direction === "up" ? idx - 1 : idx + 1;
  if (swapWith < 0 || swapWith >= rows.length) {
    return redirect(`/admin/pipelines/${encodeURIComponent(pipeline_key)}`);
  }
  const next = [...rows];
  const t = next[idx]!;
  next[idx] = next[swapWith]!;
  next[swapWith] = t;

  const { error: delErr } = await client
    .from("pipeline_steps")
    .delete()
    .eq("pipeline_key", pipeline_key);
  if (delErr) {
    return data({ message: delErr.message }, { status: 400 });
  }

  const inserts = next.map((row, i) => ({
    pipeline_key,
    step: i + 1,
    target_type: row.target_type,
    target_key: row.target_key,
    is_required: row.is_required,
  }));
  const { error: insErr } = await client.from("pipeline_steps").insert(inserts);
  if (insErr) {
    return data({ message: insErr.message }, { status: 400 });
  }
  return redirect(`/admin/pipelines/${encodeURIComponent(pipeline_key)}`);
}

export default function PipelineDetail({ loaderData }: Route.ComponentProps) {
  const { pipeline, steps, agents, pipelinesList, promptTemplates } = loaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <div className="border-border/80 space-y-3 border-b pb-6">
        <Link
          to="/admin/pipelines"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <span aria-hidden>←</span> 파이프라인 목록
        </Link>
        <div className="flex flex-wrap items-baseline gap-3 gap-y-1">
          <h1 className="text-foreground font-mono text-2xl font-semibold tracking-tight md:text-[1.75rem]">
            {pipeline.pipeline_key}
          </h1>
          <PipelineStatusBadge status={pipeline.status} />
        </div>
      </div>

      {actionData && "message" in actionData && actionData.message && (
        <AdminErrorAlert message={actionData.message} />
      )}

      <AdminSection
        title="메타데이터"
        description="표시 이름과 설명, 상태만 수정합니다. pipeline_key는 변경하지 않습니다."
      >
        <AdminPanel padding="lg" className="max-w-xl">
          <Form method="post" className="grid gap-5">
            <input type="hidden" name="intent" value="update_pipeline" />
            <input type="hidden" name="pipeline_key" value={pipeline.pipeline_key} />
            <NexInput name="name" label="이름" required defaultValue={pipeline.name} />
            <NexInput name="description" label="설명" defaultValue={pipeline.description ?? ""} />
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">상태</span>
              <select
                name="status"
                required
                className={adminSelectClassName}
                defaultValue={pipeline.status}
                aria-label="파이프라인 상태"
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="deprecated">deprecated</option>
              </select>
            </label>
            <div className="pt-1">
              <NexButton type="submit" variant="primary" loading={busy} disabled={busy}>
                저장
              </NexButton>
            </div>
          </Form>
        </AdminPanel>
      </AdminSection>

      <AdminSection
        title="실행 순서"
        description="숫자 순으로 실행됩니다. 위·아래 버튼으로 순서를 바꾸거나 행을 삭제할 수 있습니다."
      >
        <AdminTableShell>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className={cn(adminThClass, "w-14 tabular-nums")}>#</TableHead>
                <TableHead className={adminThClass}>유형</TableHead>
                <TableHead className={adminThClass}>대상</TableHead>
                <TableHead className={cn(adminThClass, "w-24")}>필수</TableHead>
                <TableHead className={cn(adminThClass, "text-end min-w-[200px]")}>순서 · 삭제</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {steps.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={5} className={cn(adminTdClass, "py-14")}>
                    <p className="text-muted-foreground text-center text-sm">
                      등록된 단계가 없습니다. 아래 양식에서 첫 단계를 추가하세요.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                steps.map((s, index) => (
                  <TableRow key={s.id} className="border-border/80">
                    <TableCell className={cn(adminTdClass, "text-muted-foreground tabular-nums")}>
                      {s.step}
                    </TableCell>
                    <TableCell className={adminTdClass}>
                      <TargetTypeBadge type={s.target_type} />
                    </TableCell>
                    <TableCell className={cn(adminTdClass, "max-w-[min(320px,45vw)]")}>
                      <span
                        className="font-mono text-[12px] leading-snug break-all"
                        title={s.target_key}
                      >
                        {s.target_key}
                      </span>
                    </TableCell>
                    <TableCell className={cn(adminTdClass, "text-muted-foreground text-sm")}>
                      {s.is_required ? "예" : "아니오"}
                    </TableCell>
                    <TableCell className={cn(adminTdClass, "text-end")}>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        <Form method="post" className="inline">
                          <input type="hidden" name="intent" value="move_step" />
                          <input type="hidden" name="pipeline_key" value={pipeline.pipeline_key} />
                          <input type="hidden" name="step_id" value={s.id} />
                          <input type="hidden" name="direction" value="up" />
                          <NexButton
                            type="submit"
                            variant="secondary"
                            size="sm"
                            disabled={busy || index === 0}
                            aria-label="한 단계 위로"
                            leftIcon={<ArrowUpIcon className="size-3.5" aria-hidden />}
                          >
                            위
                          </NexButton>
                        </Form>
                        <Form method="post" className="inline">
                          <input type="hidden" name="intent" value="move_step" />
                          <input type="hidden" name="pipeline_key" value={pipeline.pipeline_key} />
                          <input type="hidden" name="step_id" value={s.id} />
                          <input type="hidden" name="direction" value="down" />
                          <NexButton
                            type="submit"
                            variant="secondary"
                            size="sm"
                            disabled={busy || index === steps.length - 1}
                            aria-label="한 단계 아래로"
                            leftIcon={<ArrowDownIcon className="size-3.5" aria-hidden />}
                          >
                            아래
                          </NexButton>
                        </Form>
                        <Form method="post" className="inline">
                          <input type="hidden" name="intent" value="delete_step" />
                          <input type="hidden" name="pipeline_key" value={pipeline.pipeline_key} />
                          <input type="hidden" name="step_id" value={s.id} />
                          <NexButton
                            type="submit"
                            variant="secondary"
                            size="sm"
                            leftIcon={<Trash2Icon className="size-3.5" aria-hidden />}
                            className="border-destructive/30 text-destructive hover:bg-destructive/10"
                            loading={busy}
                            disabled={busy}
                            aria-label="단계 삭제"
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

        <AdminPanel padding="lg" className="max-w-xl">
          <Form method="post" className="grid gap-5">
            <input type="hidden" name="intent" value="add_step" />
            <input type="hidden" name="pipeline_key" value={pipeline.pipeline_key} />
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">대상 유형</span>
              <select
                name="target_type"
                required
                className={adminSelectClassName}
                defaultValue="agent"
                aria-label="단계 대상 유형"
              >
                <option value="agent">agent</option>
                <option value="pipeline">pipeline</option>
                <option value="prompt_template">prompt_template</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">대상 선택</span>
              <select
                name="target_key"
                required
                className={adminSelectClassName}
                defaultValue=""
                aria-label="대상 키 또는 ID"
              >
                <option value="" disabled>
                  선택…
                </option>
                <optgroup label="agents">
                  {agents.map((a) => (
                    <option key={a.agent_key} value={a.agent_key}>
                      {a.agent_key}
                      {a.display_name ? ` — ${a.display_name}` : ""}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="pipelines">
                  {pipelinesList.map((p) => (
                    <option key={p.pipeline_key} value={p.pipeline_key}>
                      {p.pipeline_key} — {p.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="prompt_templates (id)">
                  {promptTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id.slice(0, 8)}… v{t.version} {t.name} ({t.agent_key})
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>
            <p className="text-muted-foreground text-xs leading-relaxed">
              선택한 유형과 일치하는 대상만 지정하세요. 다른 조합은 실행 시 오류가 날 수 있습니다.
            </p>
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">필수 여부</span>
              <select
                name="is_required"
                className={adminSelectClassName}
                defaultValue="true"
                aria-label="필수 단계 여부"
              >
                <option value="true">예</option>
                <option value="false">아니오</option>
              </select>
            </label>
            <div className="pt-1">
              <NexButton type="submit" variant="primary" loading={busy} disabled={busy}>
                단계 추가
              </NexButton>
            </div>
          </Form>
        </AdminPanel>
      </AdminSection>
    </div>
  );
}
