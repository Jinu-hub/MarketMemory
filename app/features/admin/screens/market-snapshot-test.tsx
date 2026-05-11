import type { Route } from "./+types/market-snapshot-test";

import { useState } from "react";
import { ArrowLeftIcon, PlayIcon } from "lucide-react";
import { Link, data, useFetcher } from "react-router";

import { AdminPageHeader, AdminSection } from "../components/admin-ui";
import { NexButton, NexCard } from "~/core/components/nex";
import { requireAdmin, requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";

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
  return {};
}

export async function action({ request }: Route.ActionArgs) {
  requireMethod("POST")(request);
  const [client] = makeServerClient(request);
  await requireAdmin(client);

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

  return data<ActionPayload>({
    ok: true,
    status: response.status,
    snapshot: body as MarketSnapshotApiSuccess,
  });
}

export default function MarketSnapshotTestScreen() {
  const fetcher = useFetcher<typeof action>();
  const busy = fetcher.state !== "idle";
  const payload = fetcher.data;
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
          description="관리자 서버 액션이 /api/cron/market-snapshot를 호출합니다."
        >
          <fetcher.Form method="post" className="flex items-center gap-3">
            <NexButton
              type="submit"
              variant="primary"
              leftIcon={<PlayIcon className="size-4" aria-hidden />}
              loading={busy}
              disabled={busy}
            >
              API 실행
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
