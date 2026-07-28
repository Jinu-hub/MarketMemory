import type {
  RecentCollectionRun,
  RecentObservation,
} from "../server/queries.server";
import type { Route } from "./+types/observation-intelligence";

import { ArrowLeftIcon, BrainCircuitIcon } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  data,
  useFetcher,
  useRevalidator,
  useSearchParams,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "react-router";

import { NexButton } from "~/core/components/nex";
import { requireAdmin, requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import {
  AdminErrorAlert,
  AdminPageHeader,
  AdminSection,
} from "~/features/admin/components/admin-ui";

import { IntelligenceRunTable } from "../components/intelligence-run-table";
import { ObservationTable } from "../components/observation-table";
import {
  INTELLIGENCE_RUNS_LIMIT,
  listObservationsByRun,
  listRecentCollectionRuns,
} from "../server/queries.server";
import { runObservationIntelligence } from "../server/run-intelligence.server";

export const meta: Route.MetaFunction = () => [
  { title: `Observation Intelligence | ${import.meta.env.VITE_APP_NAME}` },
];

type LoaderData = {
  runs: RecentCollectionRun[];
  observations: RecentObservation[];
  selectedRunId: string | null;
  loadError: string | null;
};

type ActionPayload =
  | {
      ok: true;
      message: string;
      updatedCount: number;
      webhookOk: boolean;
    }
  | { ok: false; message: string };

function parseRunIds(formData: FormData): string[] {
  return formData
    .getAll("runIds")
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);
}

export async function loader({
  request,
}: LoaderFunctionArgs): Promise<LoaderData> {
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const runs = await listRecentCollectionRuns(client, INTELLIGENCE_RUNS_LIMIT);
  const runRows = (runs.data ?? []) as RecentCollectionRun[];
  const requestedRunId = new URL(request.url).searchParams.get("runId");
  const selectedRun =
    runRows.find((run) => run.id === requestedRunId) ?? runRows[0] ?? null;
  const observations = selectedRun
    ? await listObservationsByRun(client, selectedRun.id)
    : { data: [] as RecentObservation[], error: null };

  const loadError =
    runs.error?.message ?? observations.error?.message ?? null;
  if (loadError) {
    console.error(
      "[founder-os] failed to load observation intelligence screen",
      loadError,
    );
  }

  return {
    runs: runRows,
    observations: (observations.data ?? []) as RecentObservation[],
    selectedRunId: selectedRun?.id ?? null,
    loadError,
  };
}

export async function action({ request }: ActionFunctionArgs) {
  requireMethod("POST")(request);
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const formData = await request.formData();
  const runIds = parseRunIds(formData);

  if (runIds.length === 0) {
    return data<ActionPayload>(
      {
        ok: false,
        message: "Intelligence를 실행할 수집 실행을 하나 이상 선택해 주세요.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await runObservationIntelligence(client, runIds);
    if (!result.webhookOk) {
      return data<ActionPayload>(
        {
          ok: false,
          message: `intelligence_number는 갱신되었지만 웹훅 호출에 실패했습니다: ${result.webhookError}`,
        },
        { status: 502 },
      );
    }
    return data<ActionPayload>({
      ok: true,
      updatedCount: result.updatedCount,
      webhookOk: true,
      message: `${result.updatedCount}건의 수집 실행에 Intelligence를 요청했습니다.`,
    });
  } catch (error) {
    console.error("[founder-os] observation intelligence failed", error);
    return data<ActionPayload>(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Intelligence 실행 중 오류가 발생했습니다.",
      },
      { status: 500 },
    );
  }
}

export default function ObservationIntelligenceScreen({
  loaderData,
}: {
  loaderData: LoaderData;
}) {
  const { runs, observations, selectedRunId, loadError } = loaderData;
  const fetcher = useFetcher<ActionPayload>();
  const revalidator = useRevalidator();
  const [, setSearchParams] = useSearchParams();
  const [checkedIds, setCheckedIds] = useState<Set<string>>(() => new Set());
  const [clientMessage, setClientMessage] = useState<string | null>(null);

  const busy = fetcher.state !== "idle";
  const payload = fetcher.data;
  const actionError = payload && !payload.ok ? payload.message : null;
  const actionSuccess =
    payload && payload.ok ? payload.message : null;

  useEffect(() => {
    if (!payload?.ok) {
      return;
    }
    setCheckedIds(new Set());
    setClientMessage(null);
    revalidator.revalidate();
  }, [payload, revalidator]);

  function selectRun(runId: string) {
    setSearchParams({ runId });
  }

  function toggleCheck(runId: string, checked: boolean) {
    setClientMessage(null);
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(runId);
      } else {
        next.delete(runId);
      }
      return next;
    });
  }

  function toggleAll(checked: boolean) {
    setClientMessage(null);
    if (!checked) {
      setCheckedIds(new Set());
      return;
    }
    setCheckedIds(new Set(runs.map((run: RecentCollectionRun) => run.id)));
  }

  function handleRunIntelligence() {
    if (checkedIds.size === 0) {
      setClientMessage(
        "Intelligence를 실행할 수집 실행을 하나 이상 선택해 주세요.",
      );
      return;
    }
    setClientMessage(null);
    const formData = new FormData();
    for (const runId of checkedIds) {
      formData.append("runIds", runId);
    }
    fetcher.submit(formData, { method: "post" });
  }

  const statusMessage = clientMessage ?? actionSuccess;

  return (
    <>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
        <AdminPageHeader
          title="Observation Intelligence"
          description="수집 실행을 선택해 Intelligence 파이프라인을 실행합니다. 체크한 실행의 intelligence_number가 증가하고 n8n 웹훅이 호출됩니다."
          eyebrow="Founder OS"
        />

        {loadError ? (
          <AdminErrorAlert message={loadError} context="목록 조회" />
        ) : null}

        {statusMessage ? (
          <p className="border-border bg-muted/30 text-foreground rounded-lg border px-3 py-2 text-sm">
            {statusMessage}
          </p>
        ) : null}

        {actionError ? (
          <AdminErrorAlert message={actionError} context="Intelligence 실행" />
        ) : null}

        <AdminSection
          title="수집 실행"
          description="왼쪽 체크박스로 Intelligence 대상을 고르고, 행을 클릭하면 해당 실행의 관찰 요약을 아래에 표시합니다."
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-muted-foreground text-sm">
              {checkedIds.size > 0
                ? `${checkedIds.size}건 선택됨`
                : "선택된 실행 없음"}
            </p>
            <NexButton
              type="button"
              variant="primary"
              loading={busy}
              disabled={busy}
              leftIcon={<BrainCircuitIcon className="size-4" aria-hidden />}
              onClick={handleRunIntelligence}
              aria-label="선택한 수집 실행에 Intelligence 실행"
            >
              Intelligence 실행
            </NexButton>
          </div>

          <IntelligenceRunTable
            runs={runs}
            selectedRunId={selectedRunId}
            checkedIds={checkedIds}
            onToggleCheck={toggleCheck}
            onToggleAll={toggleAll}
            onSelectRun={selectRun}
          />
        </AdminSection>

        <AdminSection
          title="관찰 요약"
          description="위에서 선택한 수집 실행에 연결된 observations 요약입니다."
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
