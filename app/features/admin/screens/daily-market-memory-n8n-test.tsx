import type { Route } from "./+types/daily-market-memory-n8n-test";

import { useMemo, useState } from "react";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  Loader2Icon,
  PlayIcon,
  XCircleIcon,
} from "lucide-react";
import { Link, data, useFetcher } from "react-router";
import { z } from "zod";

import { AdminPageHeader, AdminSection } from "../components/admin-ui";
import {
  buildDailyMarketMemoryN8nTestPayload,
  parseN8nTestPayloadJson,
} from "../lib/daily-market-memory-n8n-test.lib";
import { invokeN8nWebhooks } from "../lib/n8n-webhook-test.server";
import { NexBadge, NexButton, NexCard, NexInput, NexTextarea } from "~/core/components/nex";
import { DAILY_MARKET_MEMORY_N8N_WEBHOOKS } from "~/features/cron/lib/daily-market-memory-n8n.config";
import { requireAdmin, requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";

const actionSchema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal("config"),
    index: z.coerce.number().int().min(0),
    payloadJson: z.string().optional(),
  }),
  z.object({
    intent: z.literal("config-all"),
    payloadJson: z.string().optional(),
  }),
  z.object({
    intent: z.literal("custom"),
    url: z.string().url(),
    secret: z.string().optional(),
    payloadJson: z.string().optional(),
  }),
]);

export type ConfigWebhookMeta = {
  index: number;
  label: string;
  url: string;
  hasSecret: boolean;
};

type WebhookInvokeResultItem = {
  url: string;
  ok: boolean;
  status: number | null;
  responseBody: string;
  error: string | null;
};

type InvokeContext = {
  intent: "config" | "config-all" | "custom";
  index?: number;
};

type ActionData =
  | { ok: true; results: WebhookInvokeResultItem[]; context: InvokeContext }
  | {
      ok: false;
      error: string;
      results?: WebhookInvokeResultItem[];
      context: InvokeContext;
    };

export const meta: Route.MetaFunction = () => [
  { title: `n8n 웹훅 테스트 | ${import.meta.env.VITE_APP_NAME}` },
];

function resolveConfigWebhooks() {
  return DAILY_MARKET_MEMORY_N8N_WEBHOOKS.filter((entry) => entry.url.trim() !== "").map(
    (entry, index) => ({
      index,
      label: entry.label,
      url: entry.url.trim(),
      secret: entry.secret?.trim() ? entry.secret.trim() : null,
    }),
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const webhooks: ConfigWebhookMeta[] = resolveConfigWebhooks().map((entry) => ({
    index: entry.index,
    label: entry.label,
    url: entry.url,
    hasSecret: Boolean(entry.secret),
  }));

  return { webhooks };
}

function buildInvokeResponse(
  results: Awaited<ReturnType<typeof invokeN8nWebhooks>>,
  context: InvokeContext,
) {
  const allOk = results.every((result) => result.ok);
  if (allOk) {
    return data({ ok: true as const, results, context });
  }

  const failed = results.filter((result) => !result.ok).length;
  return data(
    {
      ok: false as const,
      error: `${failed}/${results.length} 웹훅 호출에 실패했습니다.`,
      results,
      context,
    },
    { status: 502 },
  );
}

export async function action({ request }: Route.ActionArgs) {
  requireMethod("POST")(request);
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const formData = await request.formData();
  const parsed = actionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return data({ ok: false as const, error: "유효하지 않은 요청입니다." }, { status: 400 });
  }

  const defaultPayload = buildDailyMarketMemoryN8nTestPayload();

  if (parsed.data.intent === "config") {
    const webhooks = resolveConfigWebhooks();
    const target = webhooks[parsed.data.index];
    if (!target) {
      return data(
        { ok: false as const, error: "알 수 없는 웹훅 인덱스입니다." },
        { status: 400 },
      );
    }

    const payloadResult = parseN8nTestPayloadJson(
      parsed.data.payloadJson,
      defaultPayload,
    );
    if (!payloadResult.ok) {
      return data({ ok: false as const, error: payloadResult.error }, { status: 400 });
    }

    return buildInvokeResponse(
      await invokeN8nWebhooks(
        [{ url: target.url, secret: target.secret }],
        payloadResult.payload,
        { stagger: false },
      ),
      { intent: "config", index: parsed.data.index },
    );
  }

  if (parsed.data.intent === "config-all") {
    const webhooks = resolveConfigWebhooks();
    if (webhooks.length === 0) {
      return data(
        { ok: false as const, error: "등록된 웹훅이 없습니다." },
        { status: 400 },
      );
    }

    const payloadResult = parseN8nTestPayloadJson(
      parsed.data.payloadJson,
      defaultPayload,
    );
    if (!payloadResult.ok) {
      return data({ ok: false as const, error: payloadResult.error }, { status: 400 });
    }

    return buildInvokeResponse(
      await invokeN8nWebhooks(
        webhooks.map((entry) => ({ url: entry.url, secret: entry.secret })),
        payloadResult.payload,
        { stagger: true },
      ),
      { intent: "config-all" },
    );
  }

  const payloadResult = parseN8nTestPayloadJson(parsed.data.payloadJson, {});
  if (!payloadResult.ok) {
    return data({ ok: false as const, error: payloadResult.error }, { status: 400 });
  }

  const secret = parsed.data.secret?.trim();
  return buildInvokeResponse(
    await invokeN8nWebhooks(
      [
        {
          url: parsed.data.url.trim(),
          secret: secret ? secret : null,
        },
      ],
      payloadResult.payload,
      { stagger: false },
    ),
    { intent: "custom" },
  );
}

function InvokeStatusBadge({ ok }: { ok: boolean }) {
  return (
    <NexBadge
      variant={ok ? "success" : "error"}
      size="sm"
      icon={
        ok ? (
          <CheckCircle2Icon className="size-3.5" aria-hidden />
        ) : (
          <XCircleIcon className="size-3.5" aria-hidden />
        )
      }
    >
      {ok ? "성공" : "실패"}
    </NexBadge>
  );
}

function InvokeOutcomeBanner({
  ok,
  error,
  successCount,
  totalCount,
}: {
  ok: boolean;
  error?: string;
  successCount: number;
  totalCount: number;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3",
        ok
          ? "border-[#10B981]/30 bg-[#10B981]/10 dark:border-[#10B981]/30 dark:bg-[#10B981]/15"
          : "border-destructive/30 bg-destructive/10",
      )}
    >
      {ok ? (
        <CheckCircle2Icon
          className="mt-0.5 size-5 shrink-0 text-[#10B981]"
          aria-hidden
        />
      ) : (
        <XCircleIcon
          className="text-destructive mt-0.5 size-5 shrink-0"
          aria-hidden
        />
      )}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={cn(
              "text-sm font-semibold",
              ok ? "text-[#10B981] dark:text-[#10B981]" : "text-destructive",
            )}
          >
            {ok ? "웹훅 호출 성공" : "웹훅 호출 실패"}
          </p>
          <InvokeStatusBadge ok={ok} />
        </div>
        <p className="text-muted-foreground text-sm">
          {ok
            ? `${totalCount}개 URL 모두 정상 응답했습니다.`
            : `${successCount}/${totalCount}개 성공 · ${error ?? "일부 호출이 실패했습니다."}`}
        </p>
      </div>
    </div>
  );
}

function WebhookResultCard({ result }: { result: WebhookInvokeResultItem }) {
  return (
    <NexCard
      variant="outlined"
      padding="md"
      className={cn(
        "border-l-[3px]",
        result.ok
          ? "border-border border-l-[#10B981] bg-[#10B981]/5"
          : "border-destructive/40 border-l-destructive bg-destructive/5",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <InvokeStatusBadge ok={result.ok} />
        {result.status != null ? (
          <span className="text-muted-foreground font-mono text-xs">
            HTTP {result.status}
          </span>
        ) : null}
      </div>
      {result.error ? (
        <p className="text-destructive mt-2 text-sm">{result.error}</p>
      ) : null}
      <p className="text-muted-foreground mt-2 font-mono text-xs break-all">
        {result.url}
      </p>
      {result.responseBody ? (
        <pre className="bg-muted/40 text-foreground mt-3 max-h-48 overflow-auto rounded-md p-3 text-xs whitespace-pre-wrap">
          {result.responseBody}
        </pre>
      ) : null}
    </NexCard>
  );
}

export default function DailyMarketMemoryN8nTestScreen({
  loaderData,
}: Route.ComponentProps) {
  const fetcher = useFetcher<ActionData>();
  const busy = fetcher.state !== "idle";

  const [customUrl, setCustomUrl] = useState("");
  const [customSecret, setCustomSecret] = useState("");
  const [sharedPayloadJson, setSharedPayloadJson] = useState("");
  const [customPayloadJson, setCustomPayloadJson] = useState("");

  const webhooks = loaderData?.webhooks ?? [];

  const hasResponse = !busy && fetcher.data != null;
  const overallOk = Boolean(
    hasResponse && fetcher.data && "ok" in fetcher.data && fetcher.data.ok,
  );

  const results =
    fetcher.data && "results" in fetcher.data && fetcher.data.results
      ? fetcher.data.results
      : null;

  const actionError =
    fetcher.data && "ok" in fetcher.data && !fetcher.data.ok
      ? fetcher.data.error
      : null;

  const resultsByUrl = useMemo(() => {
    const map = new Map<string, WebhookInvokeResultItem>();
    for (const result of results ?? []) {
      map.set(result.url, result);
    }
    return map;
  }, [results]);

  const successCount = results?.filter((result) => result.ok).length ?? 0;
  const totalCount = results?.length ?? 0;

  const submittingIntent = busy ? fetcher.formData?.get("intent") : null;
  const submittingIndex = busy
    ? Number(fetcher.formData?.get("index") ?? -1)
    : -1;

  function getCardInvokeStatus(webhook: ConfigWebhookMeta) {
    const result = resultsByUrl.get(webhook.url);
    if (!result) {
      return null;
    }
    return result.ok ? ("success" as const) : ("error" as const);
  }

  function isWebhookSubmitting(webhook: ConfigWebhookMeta) {
    return (
      busy &&
      submittingIntent === "config" &&
      submittingIndex === webhook.index
    );
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <AdminPageHeader
          title="n8n 웹훅 테스트"
          description="daily-market-memory-n8n.config.ts에 등록된 Webhook을 수동 POST합니다. 파이프라인 완료 시와 동일한 테스트 페이로드를 사용합니다."
        />

        {busy ? (
          <div
            role="status"
            aria-live="polite"
            className="border-border bg-muted/30 text-muted-foreground flex items-center gap-2 rounded-xl border px-4 py-3 text-sm"
          >
            <Loader2Icon className="size-4 animate-spin" aria-hidden />
            웹훅 호출 중…
          </div>
        ) : null}

        {hasResponse && results && results.length > 0 ? (
          <InvokeOutcomeBanner
            ok={overallOk}
            error={actionError ?? undefined}
            successCount={successCount}
            totalCount={totalCount}
          />
        ) : hasResponse && actionError && !results?.length ? (
          <InvokeOutcomeBanner
            ok={false}
            error={actionError}
            successCount={0}
            totalCount={0}
          />
        ) : null}

        <AdminSection
          title="등록된 웹훅"
          description="config SSOT 항목별 실행 또는 전체 순차 실행(2번째부터 5초 간격)입니다."
        >
          {webhooks.length === 0 ? (
            <p className="text-destructive text-sm">
              등록된 웹훅이 없습니다. daily-market-memory-n8n.config.ts를 확인하세요.
            </p>
          ) : (
            <ul className="space-y-4">
              {webhooks.map((webhook) => {
                const cardStatus = getCardInvokeStatus(webhook);
                const isSubmitting = isWebhookSubmitting(webhook);

                return (
                  <li key={webhook.index}>
                    <NexCard
                      variant="outlined"
                      padding="md"
                      className={cn(
                        "border-l-[3px] transition-colors",
                        cardStatus === "success" &&
                          "border-l-[#10B981] bg-[#10B981]/5",
                        cardStatus === "error" &&
                          "border-l-destructive bg-destructive/5",
                        cardStatus == null && "border-border bg-card/50",
                        isSubmitting && "ring-ring/40 ring-2",
                      )}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-foreground font-medium">
                              {webhook.label}
                            </p>
                            <NexBadge variant="secondary" size="sm">
                              {webhook.hasSecret ? "secret 설정됨" : "secret 없음"}
                            </NexBadge>
                            {isSubmitting ? (
                              <NexBadge
                                variant="info"
                                size="sm"
                                icon={
                                  <Loader2Icon
                                    className="size-3.5 animate-spin"
                                    aria-hidden
                                  />
                                }
                              >
                                호출 중
                              </NexBadge>
                            ) : cardStatus ? (
                              <InvokeStatusBadge ok={cardStatus === "success"} />
                            ) : null}
                          </div>
                          <p className="text-muted-foreground font-mono text-xs break-all">
                            {webhook.url}
                          </p>
                        </div>
                        <fetcher.Form method="post" className="shrink-0">
                          <input type="hidden" name="intent" value="config" />
                          <input
                            type="hidden"
                            name="index"
                            value={webhook.index}
                          />
                          {sharedPayloadJson.trim() ? (
                            <input
                              type="hidden"
                              name="payloadJson"
                              value={sharedPayloadJson}
                            />
                          ) : null}
                          <NexButton
                            type="submit"
                            variant="primary"
                            size="sm"
                            leftIcon={<PlayIcon className="size-4" />}
                            loading={isSubmitting}
                            disabled={busy}
                          >
                            실행
                          </NexButton>
                        </fetcher.Form>
                      </div>
                    </NexCard>
                  </li>
                );
              })}
            </ul>
          )}

          {webhooks.length > 1 ? (
            <fetcher.Form method="post" className="mt-4">
              <input type="hidden" name="intent" value="config-all" />
              {sharedPayloadJson.trim() ? (
                <input type="hidden" name="payloadJson" value={sharedPayloadJson} />
              ) : null}
              <NexButton
                type="submit"
                variant="secondary"
                leftIcon={<PlayIcon className="size-4" />}
                loading={busy}
                disabled={busy}
              >
                전체 순차 실행 ({webhooks.length}개)
              </NexButton>
            </fetcher.Form>
          ) : null}

          <NexTextarea
            label="공통 요청 JSON (선택)"
            className="mt-6"
            rows={5}
            placeholder="비우면 파이프라인 완료 이벤트 테스트 페이로드 사용"
            value={sharedPayloadJson}
            onChange={(event) => setSharedPayloadJson(event.target.value)}
            variant="outlined"
          />
        </AdminSection>

        <AdminSection
          title="직접 URL 실행"
          description="config에 없는 Production Webhook URL을 단건 호출합니다."
        >
          <fetcher.Form method="post" className="max-w-xl space-y-4">
            <input type="hidden" name="intent" value="custom" />
            <NexInput
              label="Webhook URL"
              name="url"
              placeholder="https://n8n.example/webhook/..."
              value={customUrl}
              onChange={(event) => setCustomUrl(event.target.value)}
              required
            />
            <NexInput
              label="Authorization (선택)"
              name="secret"
              placeholder="Header Auth 값"
              value={customSecret}
              onChange={(event) => setCustomSecret(event.target.value)}
              autoComplete="off"
            />
            <NexTextarea
              label="요청 JSON (선택, 비우면 {})"
              name="payloadJson"
              rows={4}
              placeholder='{"event":"test"}'
              value={customPayloadJson}
              onChange={(event) => setCustomPayloadJson(event.target.value)}
              variant="outlined"
            />
            <NexButton
              type="submit"
              variant="secondary"
              leftIcon={<PlayIcon className="size-4" />}
              loading={busy}
              disabled={busy || customUrl.trim() === ""}
            >
              URL 실행
            </NexButton>
          </fetcher.Form>
        </AdminSection>

        <AdminSection title="결과" description="최근 호출 응답 상세입니다.">
          {!hasResponse && !busy ? (
            <NexCard variant="default" padding="md" className="border-border">
              <p className="text-muted-foreground text-sm">
                아직 실행하지 않았습니다. 위에서 웹훅을 실행하면 성공/실패가
                표시됩니다.
              </p>
            </NexCard>
          ) : results && results.length > 0 ? (
            <ul className="space-y-3">
              {results.map((result) => (
                <li key={result.url}>
                  <WebhookResultCard result={result} />
                </li>
              ))}
            </ul>
          ) : hasResponse && actionError ? (
            <NexCard
              variant="outlined"
              padding="md"
              className="border-destructive/40 border-l-destructive bg-destructive/5 border-l-[3px]"
            >
              <InvokeStatusBadge ok={false} />
              <p className="text-destructive mt-2 text-sm">{actionError}</p>
            </NexCard>
          ) : null}
        </AdminSection>
      </div>

      <div className="fixed right-6 bottom-6 z-50">
        <Link to="/admin/api-tests">
          <NexButton
            type="button"
            variant="secondary"
            leftIcon={<ArrowLeftIcon className="size-4" aria-hidden />}
            aria-label="API 테스트 목록으로 돌아가기"
            className="border-border bg-card text-card-foreground shadow-lg"
          >
            뒤로가기
          </NexButton>
        </Link>
      </div>
    </>
  );
}
