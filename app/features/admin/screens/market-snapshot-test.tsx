import type { Route } from "./+types/market-snapshot-test";

import { useState } from "react";
import { ArrowLeftIcon, PlayIcon } from "lucide-react";
import { Link, data, useFetcher } from "react-router";
import { z } from "zod";

import { AdminPageHeader, AdminSection } from "../components/admin-ui";
import { NexButton, NexCard } from "~/core/components/nex";
import { persistMarketSnapshotStaging } from "~/features/cron/lib/market-snapshot-staging.server";
import type { MarketSnapshotPayload } from "~/features/cron/lib/market-snapshot.types";
import { requireAdmin, requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const formSchema = z.object({
  marketDate: z.string().optional(),
  marketScope: z.string().optional(),
});

type MarketSnapshotApiSuccess = {
  provider: string;
  fetchedAt: string;
  items: Array<{
    id: string;
    label: string;
    symbol: string;
    price: number | null;
    change: number | null;
    changePercent: number | null;
    currency: string | null;
    asOf: string | null;
    isStale?: boolean;
    staleMinutes?: number | null;
  }>;
  fearGreed: {
    source: string;
    value: number;
    classification: string;
    asOf: string | null;
  } | null;
  cryptoFearGreed: {
    source: string;
    value: number;
    classification: string;
    asOf: string | null;
  } | null;
  errors: string[];
};

type ActionPayload =
  | {
      ok: true;
      status: number;
      snapshot: MarketSnapshotApiSuccess;
      staging: {
        id: string;
        marketDate: string;
        marketScope: string;
        marketDateSource: "form" | "fetched_at";
        fetchedAtUtcDate: string;
      } | null;
      stagingError: string | null;
    }
  | {
      ok: false;
      status: number;
      message: string;
      raw?: unknown;
    };

export const meta: Route.MetaFunction = () => [
  { title: `마켓 스냅샷 테스트 | ${import.meta.env.VITE_APP_NAME}` },
];

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  await requireAdmin(client);
  return {
    defaultMarketScope:
      process.env.DAILY_MARKET_MEMORY_SCOPE?.trim() || "global",
  };
}

export async function action({ request }: Route.ActionArgs) {
  requireMethod("POST")(request);
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const formData = await request.formData();
  const parsedForm = formSchema.safeParse(Object.fromEntries(formData));
  if (!parsedForm.success) {
    return data<ActionPayload>(
      { ok: false, status: 400, message: "유효하지 않은 입력입니다." },
      { status: 400 },
    );
  }

  const marketDateRaw = parsedForm.data.marketDate?.trim() ?? "";
  if (marketDateRaw !== "" && !DATE_ONLY.test(marketDateRaw)) {
    return data<ActionPayload>(
      {
        ok: false,
        status: 400,
        message: "market_date는 YYYY-MM-DD 형식이어야 합니다.",
      },
      { status: 400 },
    );
  }
  const marketDateOverride =
    marketDateRaw !== "" ? marketDateRaw : undefined;
  const marketScopeOverride = parsedForm.data.marketScope?.trim() || undefined;

  const authorization = process.env.CRON_SECRET;
  if (!authorization) {
    return data<ActionPayload>(
      {
        ok: false,
        status: 500,
        message: "CRON_SECRET 이 설정되어 있지 않습니다.",
      },
      { status: 500 },
    );
  }

  const endpoint = new URL("/api/cron/market-snapshot", request.url);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: authorization,
    },
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    return data<ActionPayload>(
      {
        ok: false,
        status: response.status,
        message: "시장 스냅샷 API 호출에 실패했습니다.",
        raw: body,
      },
      { status: response.status },
    );
  }

  const snapshot = body as MarketSnapshotApiSuccess;

  let staging: {
    id: string;
    marketDate: string;
    marketScope: string;
    marketDateSource: "form" | "fetched_at";
    fetchedAtUtcDate: string;
  } | null = null;
  let stagingError: string | null = null;

  try {
    const saved = await persistMarketSnapshotStaging(client, {
      snapshot: snapshot as MarketSnapshotPayload,
      marketDate: marketDateOverride,
      marketScope: marketScopeOverride,
    });
    staging = {
      id: saved.id,
      marketDate: saved.marketDate,
      marketScope: saved.marketScope,
      marketDateSource: marketDateOverride ? "form" : "fetched_at",
      fetchedAtUtcDate: new Date(snapshot.fetchedAt).toISOString().slice(0, 10),
    };
  } catch (error) {
    stagingError =
      error instanceof Error ? error.message : "staging 저장에 실패했습니다.";
  }

  return data<ActionPayload>({
    ok: true,
    status: response.status,
    snapshot,
    staging,
    stagingError,
  });
}

export default function MarketSnapshotTestScreen({
  loaderData,
}: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>();
  const busy = fetcher.state !== "idle";
  const payload = fetcher.data;
  const defaultMarketScope = loaderData?.defaultMarketScope ?? "global";
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  const rawJsonText =
    payload && payload.ok ? JSON.stringify(payload.snapshot, null, 2) : "";

  async function handleCopyRawJson() {
    if (!rawJsonText) {
      return;
    }
    try {
      await navigator.clipboard.writeText(rawJsonText);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <AdminPageHeader
          title="마켓 스냅샷 테스트"
          description="외부 연동 API를 수동 검증하는 영역입니다. 현재는 마켓 스냅샷 API 테스트를 제공합니다."
        />

        <AdminSection
          title="실행"
          description="API 호출 후 staging에 저장합니다. market_date를 비우면 응답 fetched_at(UTC) 날짜를 사용합니다."
        >
          <fetcher.Form method="post" className="max-w-xl space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="stagingMarketDate"
                className="text-foreground text-sm font-medium"
              >
                market_date (선택, YYYY-MM-DD)
              </label>
              <input
                id="stagingMarketDate"
                name="marketDate"
                type="date"
                className="border-border bg-background text-foreground h-11 w-full rounded-lg border px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
              />
              <p className="text-muted-foreground text-xs leading-relaxed">
                비우면 <code className="text-foreground">fetched_at</code>의 UTC
                날짜가 들어갑니다. DMM 파이프라인과 맞추려면 거래일을 직접 지정하세요.
              </p>
            </div>
            <div className="space-y-1.5">
              <label
                htmlFor="stagingMarketScope"
                className="text-foreground text-sm font-medium"
              >
                market_scope (선택)
              </label>
              <input
                id="stagingMarketScope"
                name="marketScope"
                type="text"
                defaultValue={defaultMarketScope}
                placeholder="global"
                className="border-border bg-background text-foreground h-11 w-full rounded-lg border px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
              />
            </div>
            <NexButton
              type="submit"
              variant="primary"
              leftIcon={<PlayIcon className="size-4" aria-hidden />}
              loading={busy}
              disabled={busy}
            >
              API 실행 · staging 저장
            </NexButton>
          </fetcher.Form>
        </AdminSection>

        <AdminSection
          title="결과"
          description="성공 시 시장 스냅샷을 카드와 JSON 원문으로 함께 표시합니다."
        >
          {!payload ? (
            <NexCard variant="default" padding="md" className="border-border">
              <p className="text-muted-foreground text-sm">
                아직 실행 결과가 없습니다. 위의 버튼으로 API를 실행해 주세요.
              </p>
            </NexCard>
          ) : payload.ok ? (
            <div className="space-y-4">
              <NexCard variant="default" padding="md" className="border-border">
                <div className="space-y-2 text-sm">
                  <p className="text-foreground">
                    <span className="font-medium">HTTP:</span> {payload.status}
                  </p>
                  <p className="text-foreground">
                    <span className="font-medium">Fetched At:</span>{" "}
                    {payload.snapshot.fetchedAt}
                  </p>
                  {payload.staging ? (
                    <>
                      <p className="text-foreground">
                        <span className="font-medium">Staging 저장:</span> 성공
                      </p>
                      <p className="text-muted-foreground font-mono text-xs break-all">
                        id {payload.staging.id} · market_date {payload.staging.marketDate}{" "}
                        ({payload.staging.marketDateSource === "form"
                          ? "폼 지정"
                          : `fetched_at UTC ${payload.staging.fetchedAtUtcDate}`}
                        ) · {payload.staging.marketScope}
                      </p>
                    </>
                  ) : null}
                  {payload.stagingError ? (
                    <p className="text-destructive text-xs">{payload.stagingError}</p>
                  ) : null}
                </div>
              </NexCard>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {payload.snapshot.items.map((item) => (
                  <NexCard
                    key={item.id}
                    variant="default"
                    padding="md"
                    className="border-border"
                  >
                    <div className="space-y-1">
                      <p className="text-foreground text-sm font-semibold">
                        {item.label}
                      </p>
                      <p className="text-muted-foreground text-xs">{item.symbol}</p>
                      {item.isStale && (
                        <p className="text-amber-600 text-xs font-medium">
                          최근 종가 기준
                        </p>
                      )}
                      <p className="text-foreground text-lg font-semibold">
                        {item.price ?? "-"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {item.change ?? "-"} ({item.changePercent ?? "-"}%)
                      </p>
                    </div>
                  </NexCard>
                ))}
              </div>

              <NexCard variant="default" padding="md" className="border-border">
                <h3 className="text-foreground text-sm font-semibold">
                  Fear & Greed
                </h3>
                <div className="mt-2 space-y-2 text-sm">
                  <p className="text-foreground font-medium">Market (CNN)</p>
                  {payload.snapshot.fearGreed ? (
                    <p className="text-muted-foreground">
                      {payload.snapshot.fearGreed.value} (
                      {payload.snapshot.fearGreed.classification})
                    </p>
                  ) : (
                    <p className="text-muted-foreground">데이터 없음</p>
                  )}
                  <p className="text-foreground pt-2 font-medium">Crypto</p>
                  {payload.snapshot.cryptoFearGreed ? (
                    <p className="text-muted-foreground">
                      {payload.snapshot.cryptoFearGreed.value} (
                      {payload.snapshot.cryptoFearGreed.classification})
                    </p>
                  ) : (
                    <p className="text-muted-foreground">데이터 없음</p>
                  )}
                </div>
              </NexCard>

              <NexCard variant="default" padding="md" className="border-border">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-foreground text-sm font-semibold">Raw JSON</p>
                  <NexButton
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={handleCopyRawJson}
                    disabled={!rawJsonText}
                  >
                    클립보드 복사
                  </NexButton>
                </div>
                {copyStatus === "copied" && (
                  <p className="text-muted-foreground mb-2 text-xs">
                    JSON을 클립보드에 복사했습니다.
                  </p>
                )}
                {copyStatus === "failed" && (
                  <p className="text-destructive mb-2 text-xs">
                    클립보드 복사에 실패했습니다.
                  </p>
                )}
                <pre className="bg-muted/40 overflow-x-auto rounded-md p-3 text-xs">
                  {rawJsonText}
                </pre>
              </NexCard>
            </div>
          ) : (
            <NexCard variant="default" padding="md" className="border-border">
              <p className="text-destructive text-sm font-medium">
                실행 실패 (HTTP {payload.status})
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {payload.message}
              </p>
              {payload.raw ? (
                <pre className="bg-muted/40 mt-3 overflow-x-auto rounded-md p-3 text-xs">
                  {JSON.stringify(payload.raw, null, 2)}
                </pre>
              ) : null}
            </NexCard>
          )}
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
