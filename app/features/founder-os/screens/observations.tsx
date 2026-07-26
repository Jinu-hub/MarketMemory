import type { CollectionRunSummary } from "../domain/observation.types";
import type {
  RecentCollectionRun,
  RecentObservation,
} from "../server/queries.server";
import type { Route } from "./+types/observations";

import { ArrowLeftIcon } from "lucide-react";
import { Link, data, useFetcher } from "react-router";

import { NexButton } from "~/core/components/nex";
import { requireAdmin, requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import {
  AdminErrorAlert,
  AdminPageHeader,
  AdminPanel,
  AdminSection,
} from "~/features/admin/components/admin-ui";

import { CollectionResultSummary } from "../components/collection-result-summary";
import { CollectionRunTable } from "../components/collection-run-table";
import { ObservationCollectorForm } from "../components/observation-collector-form";
import { ObservationTable } from "../components/observation-table";
import { parseKeywordsInput } from "../domain/match-keywords";
import {
  DEFAULT_COLLECT_LIMIT,
  SOURCE_NOT_IMPLEMENTED_MESSAGE,
  collectRequestSchema,
} from "../lib/collect-request";
import {
  listRecentCollectionRuns,
  listRecentObservations,
} from "../server/queries.server";
import { runCollection } from "../server/run-collection.server";
import { SourceNotImplementedError } from "../sources/source-adapter";

export const meta: Route.MetaFunction = () => [
  { title: `소스 수집 | ${import.meta.env.VITE_APP_NAME}` },
];

type LoaderData = {
  runs: RecentCollectionRun[];
  observations: RecentObservation[];
  loadError: string | null;
};

type ActionPayload =
  | { ok: true; summary: CollectionRunSummary }
  | { ok: false; message: string };

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const [runs, observations] = await Promise.all([
    listRecentCollectionRuns(client),
    listRecentObservations(client),
  ]);

  const loadError = runs.error?.message ?? observations.error?.message ?? null;
  if (loadError) {
    console.error("[founder-os] failed to load collector screen", loadError);
  }

  const payload: LoaderData = {
    runs: (runs.data ?? []) as RecentCollectionRun[],
    observations: (observations.data ?? []) as RecentObservation[],
    loadError,
  };
  return payload;
}

export async function action({ request }: Route.ActionArgs) {
  requireMethod("POST")(request);
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const formData = await request.formData();
  const limitRaw = String(formData.get("limit") ?? "").trim();
  const parseIdList = (raw: string) =>
    raw
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  const parsed = collectRequestSchema.safeParse({
    source: String(formData.get("source") ?? ""),
    keywords: parseKeywordsInput(String(formData.get("keywords") ?? "")),
    domainIds: parseIdList(String(formData.get("domainIds") ?? "")),
    signalIds: parseIdList(String(formData.get("signalIds") ?? "")),
    contentType: String(formData.get("contentType") ?? "all"),
    sortMode: String(formData.get("sortMode") ?? "relevance"),
    timeRange: String(formData.get("timeRange") ?? "all"),
    limit: limitRaw === "" ? DEFAULT_COLLECT_LIMIT : Number(limitRaw),
  });

  if (!parsed.success) {
    return data<ActionPayload>(
      {
        ok: false,
        message: parsed.error.issues[0]?.message ?? "유효하지 않은 입력입니다.",
      },
      { status: 400 },
    );
  }

  try {
    const summary = await runCollection(client, parsed.data);
    return data<ActionPayload>({ ok: true, summary });
  } catch (error) {
    if (error instanceof SourceNotImplementedError) {
      return data<ActionPayload>(
        { ok: false, message: SOURCE_NOT_IMPLEMENTED_MESSAGE },
        { status: 400 },
      );
    }
    console.error("[founder-os] collection failed", error);
    return data<ActionPayload>(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "수집 실행 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}

export default function FounderOsObservationsScreen({
  loaderData,
}: Route.ComponentProps) {
  const { runs, observations, loadError } = loaderData as LoaderData;
  const fetcher = useFetcher<ActionPayload>();
  const busy = fetcher.state !== "idle";
  const payload = fetcher.data;

  return (
    <>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <AdminPageHeader
          title="소스 수집"
          description="문제 표현 패턴으로 사람들의 불편함을 관찰합니다. 분석·LLM 호출은 포함되지 않습니다."
          eyebrow="Founder OS"
        />

        {loadError ? (
          <AdminErrorAlert message={loadError} context="목록 조회" />
        ) : null}

        <AdminSection
          title="수집 조건"
          description="관찰 대상과 문제 신호를 고르면 검색 후보가 만들어집니다."
        >
          <AdminPanel padding="lg">
            <ObservationCollectorForm Form={fetcher.Form} busy={busy} />
          </AdminPanel>
        </AdminSection>

        <AdminSection
          title="실행 결과"
          description="가장 최근 실행의 처리 결과입니다."
        >
          {busy ? (
            <AdminPanel padding="lg">
              <p className="text-muted-foreground text-sm">
                외부 소스를 조회하고 있습니다. 키워드 수에 따라 몇 초가 걸릴 수
                있습니다.
              </p>
            </AdminPanel>
          ) : !payload ? (
            <AdminPanel padding="lg">
              <p className="text-muted-foreground text-sm">
                아직 실행 결과가 없습니다. 위에서 조건을 입력하고 수집을 실행해
                주세요.
              </p>
            </AdminPanel>
          ) : payload.ok ? (
            <CollectionResultSummary summary={payload.summary} />
          ) : (
            <AdminErrorAlert message={payload.message} context="수집 실행" />
          )}
        </AdminSection>

        <AdminSection
          title="최근 실행 이력"
          description="최근 수집 실행 기록입니다. 실패한 실행은 원인 메시지를 함께 남깁니다."
        >
          <CollectionRunTable runs={runs} />
        </AdminSection>

        <AdminSection
          title="최근 수집 데이터"
          description="가장 최근에 저장된 관찰 데이터입니다. 원문 링크로 출처를 바로 확인할 수 있습니다."
        >
          <ObservationTable observations={observations} />
        </AdminSection>
      </div>

      <div className="fixed right-6 bottom-6 z-50">
        <Link to="/admin/founder-os">
          <NexButton
            type="button"
            variant="secondary"
            leftIcon={<ArrowLeftIcon className="size-4" aria-hidden />}
            aria-label="Founder OS 화면으로 돌아가기"
            className="border-border bg-card text-card-foreground shadow-lg"
          >
            뒤로가기
          </NexButton>
        </Link>
      </div>
    </>
  );
}
