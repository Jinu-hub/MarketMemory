import type { Route } from "./+types/prompt-detail";
import type { Database, Json } from "database.types";

type PromptDetailLoaderData = {
  template: Database["public"]["Tables"]["prompt_templates"]["Row"];
};

import { Trash2Icon } from "lucide-react";
import { Form, Link, data, redirect, useActionData, useNavigation } from "react-router";
import { z } from "zod";

import {
  AdminErrorAlert,
  AdminPanel,
  AdminSection,
  PromptStatusBadge,
  adminSelectClassName,
  adminTextareaClassName,
} from "../components/admin-ui";
import { NexBadge, NexButton, NexInput } from "~/core/components/nex";
import { requireAdmin, requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";

function jsonOrNull(raw: string | undefined): Json | null {
  if (raw === undefined) {
    return null;
  }
  const t = raw.trim();
  if (t.length === 0) {
    return null;
  }
  return JSON.parse(t) as Json;
}

const updateSchema = z.object({
  intent: z.literal("update"),
  id: z.string().uuid(),
  name: z.string().min(1),
  template: z.string().min(1),
  status: z.enum(["draft", "active", "deprecated", "archived"]),
  temperature: z.string().optional(),
  api_mode: z.enum(["responses", "streaming"]),
  changelog: z.string().optional(),
  default_provider: z.string().optional(),
  default_model: z.string().optional(),
  input_schema_json: z.string().optional(),
  output_schema_json: z.string().optional(),
  default_params_json: z.string().optional(),
  is_backward_compatible: z.enum(["true", "false"]),
});

const deleteSchema = z.object({
  intent: z.literal("delete"),
  id: z.string().uuid(),
});

const actionSchema = z.discriminatedUnion("intent", [updateSchema, deleteSchema]);

export const meta: Route.MetaFunction = () => [
  { title: `프롬프트 편집 | ${import.meta.env.VITE_APP_NAME}` },
];

export async function loader({ request, params }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  const id = params.id;
  const { data: row, error } = await client
    .from("prompt_templates")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !row) {
    throw data(null, { status: 404 });
  }
  const payload: PromptDetailLoaderData = { template: row };
  return payload;
}

export async function action({ request, params }: Route.ActionArgs) {
  requireMethod("POST")(request);
  const [client] = makeServerClient(request);
  await requireAdmin(client);
  const id = params.id;

  const formData = await request.formData();
  const raw = Object.fromEntries(formData);
  const parsed = actionSchema.safeParse(raw);
  if (!parsed.success) {
    return data({ message: "유효하지 않은 입력입니다." }, { status: 400 });
  }

  const v = parsed.data;
  if (v.intent === "delete") {
    if (v.id !== id) {
      return data({ message: "ID 불일치" }, { status: 400 });
    }
    const { error } = await client.from("prompt_templates").delete().eq("id", id);
    if (error) {
      return data({ message: error.message }, { status: 400 });
    }
    return redirect("/admin/prompts");
  }

  if (v.id !== id) {
    return data({ message: "ID 불일치" }, { status: 400 });
  }

  let input_schema: Json | null;
  let output_schema: Json | null;
  let default_params: Json | null;
  try {
    input_schema = jsonOrNull(v.input_schema_json);
    output_schema = jsonOrNull(v.output_schema_json);
    default_params = jsonOrNull(v.default_params_json);
  } catch {
    return data({ message: "input/output/default_params JSON 파싱 실패" }, { status: 400 });
  }

  const temp =
    v.temperature && v.temperature.trim() !== ""
      ? Number(v.temperature)
      : null;
  if (v.temperature && v.temperature.trim() !== "" && Number.isNaN(temp)) {
    return data({ message: "temperature는 숫자여야 합니다." }, { status: 400 });
  }

  const { error } = await client
    .from("prompt_templates")
    .update({
      name: v.name.trim(),
      template: v.template,
      status: v.status,
      temperature: temp,
      api_mode: v.api_mode,
      changelog: v.changelog?.trim() || null,
      default_provider: v.default_provider?.trim() || null,
      default_model: v.default_model?.trim() || null,
      input_schema,
      output_schema,
      default_params,
      is_backward_compatible: v.is_backward_compatible === "true",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return data({ message: error.message }, { status: 400 });
  }
  return redirect(`/admin/prompts/${id}`);
}

export default function PromptDetail({ loaderData }: Route.ComponentProps) {
  if (!loaderData) {
    return null;
  }
  const { template } = loaderData as PromptDetailLoaderData;
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
      <div className="border-border/80 space-y-4 border-b pb-8">
        <Link
          to="/admin/prompts"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <span aria-hidden>←</span> 프롬프트 목록
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-y-2">
          <div className="space-y-2">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight md:text-[1.75rem]">
              {template.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <PromptStatusBadge status={template.status} />
              <NexBadge variant="outline" size="sm" className="font-mono">
                v{template.version}
              </NexBadge>
            </div>
          </div>
          <p className="text-muted-foreground font-mono text-xs leading-relaxed break-all sm:max-w-[min(100%,280px)] sm:text-end">
            {template.agent_key}
            <span className="text-muted-foreground/70 block sm:inline sm:before:content-['_·_']">
              {template.id}
            </span>
          </p>
        </div>
      </div>

      {actionData && "message" in actionData && actionData.message && (
        <AdminErrorAlert message={actionData.message} />
      )}

      <AdminSection
        title="템플릿 편집"
        description="본문과 스키마 JSON은 저장 시 검증됩니다. 버전 번호는 이 화면에서 바꾸지 않습니다."
      >
        <AdminPanel padding="lg">
          <Form method="post" className="grid gap-6">
            <input type="hidden" name="intent" value="update" />
            <input type="hidden" name="id" value={template.id} />
            <NexInput name="name" label="이름" required defaultValue={template.name} />
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">템플릿</span>
              <textarea
                name="template"
                required
                rows={12}
                defaultValue={template.template}
                className={adminTextareaClassName}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">상태</span>
              <select
                name="status"
                className={adminSelectClassName}
                defaultValue={template.status}
                aria-label="템플릿 상태"
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="deprecated">deprecated</option>
                <option value="archived">archived</option>
              </select>
            </label>
            <NexInput
              name="temperature"
              label="temperature (선택)"
              defaultValue={template.temperature != null ? String(template.temperature) : ""}
            />
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">api_mode</span>
              <select
                name="api_mode"
                className={adminSelectClassName}
                defaultValue={template.api_mode ?? "responses"}
                aria-label="API 모드"
              >
                <option value="responses">responses</option>
                <option value="streaming">streaming</option>
              </select>
            </label>
            <NexInput name="changelog" label="changelog" defaultValue={template.changelog ?? ""} />
            <NexInput
              name="default_provider"
              label="default_provider"
              defaultValue={template.default_provider ?? ""}
            />
            <NexInput name="default_model" label="default_model" defaultValue={template.default_model ?? ""} />
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">input_schema (JSON)</span>
              <textarea
                name="input_schema_json"
                rows={4}
                defaultValue={
                  template.input_schema != null ? JSON.stringify(template.input_schema, null, 2) : ""
                }
                className={cn(adminTextareaClassName, "min-h-[100px] text-xs")}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">output_schema (JSON)</span>
              <textarea
                name="output_schema_json"
                rows={4}
                defaultValue={
                  template.output_schema != null ? JSON.stringify(template.output_schema, null, 2) : ""
                }
                className={cn(adminTextareaClassName, "min-h-[100px] text-xs")}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">default_params (JSON)</span>
              <textarea
                name="default_params_json"
                rows={4}
                defaultValue={
                  template.default_params != null ? JSON.stringify(template.default_params, null, 2) : ""
                }
                className={cn(adminTextareaClassName, "min-h-[100px] text-xs")}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="text-foreground font-medium">하위 호환</span>
              <select
                name="is_backward_compatible"
                className={adminSelectClassName}
                defaultValue={template.is_backward_compatible ? "true" : "false"}
                aria-label="하위 호환 여부"
              >
                <option value="true">예</option>
                <option value="false">아니오</option>
              </select>
            </label>
            <div className="border-border flex flex-wrap gap-3 border-t pt-6">
              <NexButton type="submit" variant="primary" loading={busy} disabled={busy}>
                저장
              </NexButton>
            </div>
          </Form>
        </AdminPanel>
      </AdminSection>

      <AdminPanel padding="lg" className="border-destructive/25 bg-destructive/5 border">
        <Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="delete" />
          <input type="hidden" name="id" value={template.id} />
          <p className="text-muted-foreground text-sm leading-relaxed">
            프롬프트 릴리스에서 이 버전을 참조 중이면 삭제가 거부될 수 있습니다.
          </p>
          <NexButton
            type="submit"
            variant="secondary"
            leftIcon={<Trash2Icon className="size-3.5" aria-hidden />}
            className="border-destructive/35 text-destructive hover:bg-destructive/10"
            loading={busy}
            disabled={busy}
          >
            이 템플릿 삭제
          </NexButton>
        </Form>
      </AdminPanel>
    </div>
  );
}
