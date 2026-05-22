import type { Route } from "./+types/daily-market-memory-test";

import { useState } from "react";
import { ArrowLeftIcon, PlayIcon } from "lucide-react";
import { Link, data, useFetcher } from "react-router";
import { z } from "zod";

import { AdminPageHeader, AdminSection } from "../components/admin-ui";
import { NexButton, NexCard } from "~/core/components/nex";
import {
  formatMarketDateInTimeZone,
  runDailyMarketMemoryPipeline,
  type DailyMarketMemoryVisibility,
} from "~/features/cron/lib/daily-market-memory-pipeline";
import { requireAdmin, requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";

const formSchema = z.object({
  marketDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  coverageStartAt: z.string().optional(),
  coverageEndAt: z.string().optional(),
  publicOnly: z.enum(["on"]).optional(),
  saveToDb: z.enum(["on"]).optional(),
});

export const meta: Route.MetaFunction = () => [
  { title: `데일리 마켓 메모리 파이프라인 | ${import.meta.env.VITE_APP_NAME}` },
];

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  await requireAdmin(client);
  const defaultMarketDate = formatMarketDateInTimeZone(
    new Date(),
    process.env.DAILY_MARKET_MEMORY_TZ?.trim() || "Asia/Tokyo",
  );
  return { defaultMarketDate };
}

export async function action({ request }: Route.ActionArgs) {
  requireMethod("POST")(request);
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const formData = await request.formData();
  const parsed = formSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return data({ error: "유효하지 않은 입력입니다." }, { status: 400 });
  }

  const visibility: DailyMarketMemoryVisibility = parsed.data.publicOnly
    ? "public_only"
    : "all_active";

  const coverageStartAt =
    parsed.data.coverageStartAt?.trim() !== ""
      ? parsed.data.coverageStartAt
      : null;
  const coverageEndAt =
    parsed.data.coverageEndAt?.trim() !== "" ? parsed.data.coverageEndAt : null;

  try {
    const result = await runDailyMarketMemoryPipeline({
      marketDate: parsed.data.marketDate,
      coverageStartAt,
      coverageEndAt,
      visibility,
      persistToDb: parsed.data.saveToDb === "on",
    });
    return data({ ok: true as const, result });
  } catch (e) {
    return data(
      {
        ok: false as const,
        error: e instanceof Error ? e.message : "파이프라인 실행 실패",
      },
      { status: 500 },
    );
  }
}

export default function DailyMarketMemoryTestScreen({
  loaderData,
}: Route.ComponentProps) {
  const fetcher = useFetcher<typeof action>();
  const busy = fetcher.state !== "idle";
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  const defaultMarketDate = loaderData?.defaultMarketDate ?? "";

  const rawJsonText =
    fetcher.data && "ok" in fetcher.data && fetcher.data.ok
      ? JSON.stringify(fetcher.data.result, null, 2)
      : "";

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
          title="데일리 마켓 메모리 파이프라인"
          description="Step 1: 해당 market_date의 daily_market_snapshot_staging이 있으면 최신 fetched_at 행을 쓰고, 없으면 시장 스냅샷 API를 호출합니다."
        />

        <AdminSection
          title="실행"
          description="market_date 기준 staging을 먼저 확인합니다. coverage를 둘 다 넣고 구간이 유효하면 item_contents.market_date 범위 리포트를, 아니면 market_date 단일일 리포트만 사용합니다."
        >
          <fetcher.Form method="post" className="max-w-xl space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="marketDate"
                className="text-foreground text-sm font-medium"
              >
                market_date (YYYY-MM-DD)
              </label>
              <input
                id="marketDate"
                name="marketDate"
                type="date"
                required
                defaultValue={defaultMarketDate}
                className="border-border bg-background text-foreground h-11 w-full rounded-lg border px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
              />
              <p className="text-muted-foreground text-xs">
                저장되는 daily_market_memories.market_date입니다. 리포트 범위는 아래 coverage 또는
                단일일 규칙을 따릅니다.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="coverageStartAt"
                  className="text-foreground text-sm font-medium"
                >
                  coverage_start_at (선택)
                </label>
                <input
                  id="coverageStartAt"
                  name="coverageStartAt"
                  type="text"
                  placeholder="2026-05-15 또는 ISO"
                  className="border-border bg-background text-foreground h-11 w-full rounded-lg border px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="coverageEndAt"
                  className="text-foreground text-sm font-medium"
                >
                  coverage_end_at (선택)
                </label>
                <input
                  id="coverageEndAt"
                  name="coverageEndAt"
                  type="text"
                  placeholder="2026-05-18 또는 ISO"
                  className="border-border bg-background text-foreground h-11 w-full rounded-lg border px-3 text-sm shadow-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
                />
              </div>
            </div>
            <p className="text-muted-foreground text-xs leading-relaxed">
              coverage는 시작·종료가 모두 있고 날짜 파싱·start≤end가 유효할 때만
              item_contents.market_date 구간 조회를 사용합니다. 한쪽만 비어 있거나 유효하지 않으면
              item_contents.market_date = market_date만 사용합니다.
            </p>
            <label className="text-muted-foreground flex items-center gap-2 text-sm">
              <input type="checkbox" name="publicOnly" className="size-4 rounded" />
              공개 리포트만 (is_public = true)
            </label>
            <label className="text-muted-foreground flex items-center gap-2 text-sm">
              <input type="checkbox" name="saveToDb" className="size-4 rounded" />
              결과를 DB에 저장 (daily_market_memories · sources)
            </label>
            <NexButton
              type="submit"
              variant="primary"
              leftIcon={<PlayIcon className="size-4" aria-hidden />}
              loading={busy}
              disabled={busy}
            >
              파이프라인 실행
            </NexButton>
          </fetcher.Form>
        </AdminSection>

        <AdminSection title="결과" description="전체 결과는 JSON으로 확인합니다.">
          {!fetcher.data ? (
            <NexCard variant="default" padding="md" className="border-border">
              <p className="text-muted-foreground text-sm">
                아직 실행하지 않았습니다. 위에서 파이프라인을 실행하세요.
              </p>
            </NexCard>
          ) : "error" in fetcher.data ? (
            <NexCard variant="default" padding="md" className="border-border">
              <p className="text-destructive text-sm font-medium">
                {String(fetcher.data.error)}
              </p>
            </NexCard>
          ) : "ok" in fetcher.data && fetcher.data.ok ? (
            <NexCard variant="default" padding="md" className="border-border">
              <div className="mb-3 space-y-1 text-sm">
                <p className="text-foreground">
                  <span className="font-medium">시장 스냅샷:</span>{" "}
                  {fetcher.data.result.marketSnapshotSource === "staging"
                    ? `staging 재사용${fetcher.data.result.stagingSnapshotId ? ` (${fetcher.data.result.stagingSnapshotId})` : ""}`
                    : "API fetch"}
                </p>
                <p className="text-foreground">
                  <span className="font-medium">DB 저장:</span>{" "}
                  {fetcher.data.result.savedToDb
                    ? `완료 (${fetcher.data.result.dailyMarketMemoryId})`
                    : "안 함"}
                </p>
                {fetcher.data.result.errors.length > 0 && (
                  <p className="text-amber-600 text-xs">
                    경고/오류 {fetcher.data.result.errors.length}건 — JSON 하단 참고
                  </p>
                )}
              </div>
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
              <pre className="bg-muted/40 max-h-[32rem] overflow-auto rounded-md p-3 text-xs">
                {rawJsonText}
              </pre>
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
