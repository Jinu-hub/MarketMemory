import type { CollectionRunSummary } from "../domain/observation.types";
import type { CollectFormValues } from "../lib/collect-form-values";
import type { CollectionPresetRow } from "../server/presets.server";
import type {
  RecentCollectionRun,
  RecentObservation,
} from "../server/queries.server";
import type { Route } from "./+types/observations";

import { ArrowLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, data, useFetcher, useRevalidator } from "react-router";

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
  DEFAULT_COLLECT_FORM_VALUES,
  toCollectFormValues,
} from "../lib/collect-form-values";
import {
  DEFAULT_COLLECT_LIMIT,
  SOURCE_NOT_IMPLEMENTED_MESSAGE,
  collectRequestSchema,
} from "../lib/collect-request";
import {
  createCollectionPreset,
  deleteCollectionPreset,
  listCollectionPresets,
  touchCollectionPreset,
} from "../server/presets.server";
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
  presets: CollectionPresetRow[];
  loadError: string | null;
};

type ActionPayload =
  | { ok: true; kind: "collect"; summary: CollectionRunSummary }
  | { ok: true; kind: "save_preset"; message: string }
  | { ok: true; kind: "delete_preset"; message: string }
  | {
      ok: true;
      kind: "load_preset";
      values: CollectFormValues;
      message: string;
    }
  | { ok: false; message: string };

function parseIdList(raw: string) {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function parseIntent(raw: string): { intent: string; presetId: string | null } {
  if (raw.startsWith("load_preset:")) {
    return { intent: "load_preset", presetId: raw.slice("load_preset:".length) };
  }
  if (raw.startsWith("delete_preset:")) {
    return {
      intent: "delete_preset",
      presetId: raw.slice("delete_preset:".length),
    };
  }
  return { intent: raw || "collect", presetId: null };
}

function formValuesFromFormData(formData: FormData): CollectFormValues {
  const limitRaw = String(formData.get("limit") ?? "").trim();
  return toCollectFormValues({
    source: String(formData.get("source") ?? ""),
    keywords: parseKeywordsInput(String(formData.get("keywords") ?? "")),
    contentType: String(formData.get("contentType") ?? "all"),
    sortMode: String(formData.get("sortMode") ?? "relevance"),
    timeRange: String(formData.get("timeRange") ?? "all"),
    limit: limitRaw === "" ? DEFAULT_COLLECT_LIMIT : Number(limitRaw),
    observationStrategy: {
      domains: parseIdList(String(formData.get("domainIds") ?? "")).map(
        (id) => ({ id, label: id }),
      ),
      signals: parseIdList(String(formData.get("signalIds") ?? "")).map(
        (id) => ({ id, label: id }),
      ),
    },
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const [runs, observations, presets] = await Promise.all([
    listRecentCollectionRuns(client),
    listRecentObservations(client),
    listCollectionPresets(client),
  ]);

  const loadError =
    runs.error?.message ??
    observations.error?.message ??
    presets.error?.message ??
    null;
  if (loadError) {
    console.error("[founder-os] failed to load collector screen", loadError);
  }

  const payload: LoaderData = {
    runs: (runs.data ?? []) as RecentCollectionRun[],
    observations: (observations.data ?? []) as RecentObservation[],
    presets: (presets.data ?? []) as CollectionPresetRow[],
    loadError,
  };
  return payload;
}

export async function action({ request }: Route.ActionArgs) {
  requireMethod("POST")(request);
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const formData = await request.formData();
  const { intent, presetId } = parseIntent(
    String(formData.get("_intent") ?? "collect"),
  );

  if (intent === "save_preset") {
    const values = formValuesFromFormData(formData);
    // domain/signal ids are authoritative from hidden fields
    values.domainIds = parseIdList(String(formData.get("domainIds") ?? ""));
    values.signalIds = parseIdList(String(formData.get("signalIds") ?? ""));

    const result = await createCollectionPreset(client, {
      name: String(formData.get("presetName") ?? ""),
      values,
    });
    if (result.error) {
      return data<ActionPayload>(
        { ok: false, message: result.error.message },
        { status: 400 },
      );
    }
    return data<ActionPayload>({
      ok: true,
      kind: "save_preset",
      message: "수집 조건을 저장했습니다.",
    });
  }

  if (intent === "delete_preset") {
    if (!presetId) {
      return data<ActionPayload>(
        { ok: false, message: "삭제할 프리셋을 찾을 수 없습니다." },
        { status: 400 },
      );
    }
    const result = await deleteCollectionPreset(client, presetId);
    if (result.error) {
      return data<ActionPayload>(
        { ok: false, message: result.error.message },
        { status: 400 },
      );
    }
    return data<ActionPayload>({
      ok: true,
      kind: "delete_preset",
      message: "저장된 조건을 삭제했습니다.",
    });
  }

  if (intent === "load_preset") {
    if (!presetId) {
      return data<ActionPayload>(
        { ok: false, message: "불러올 프리셋을 찾을 수 없습니다." },
        { status: 400 },
      );
    }
    const { data: preset, error } = await client
      .from("collection_presets")
      .select(
        "id, name, source, keywords, content_type, sort_mode, time_range, requested_limit, observation_strategy",
      )
      .eq("id", presetId)
      .single();
    if (error || !preset) {
      return data<ActionPayload>(
        { ok: false, message: error?.message ?? "프리셋을 찾을 수 없습니다." },
        { status: 404 },
      );
    }
    await touchCollectionPreset(client, presetId);
    const values = toCollectFormValues({
      source: preset.source,
      keywords: preset.keywords,
      contentType: preset.content_type,
      sortMode: preset.sort_mode,
      timeRange: preset.time_range,
      limit: preset.requested_limit,
      observationStrategy: preset.observation_strategy,
    });
    return data<ActionPayload>({
      ok: true,
      kind: "load_preset",
      values,
      message: `「${preset.name}」 조건을 불러왔습니다.`,
    });
  }

  const limitRaw = String(formData.get("limit") ?? "").trim();
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
    return data<ActionPayload>({ ok: true, kind: "collect", summary });
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
  const { runs, observations, presets, loadError } = loaderData as LoaderData;
  const fetcher = useFetcher<ActionPayload>();
  const revalidator = useRevalidator();
  const busy =
    fetcher.state !== "idle" &&
    (fetcher.formData?.get("_intent") === "collect" ||
      !fetcher.formData?.get("_intent"));
  const presetBusy =
    fetcher.state !== "idle" &&
    String(fetcher.formData?.get("_intent") ?? "").startsWith("save_preset");
  const payload = fetcher.data;

  const [formKey, setFormKey] = useState(0);
  const [initialValues, setInitialValues] = useState<CollectFormValues>(
    DEFAULT_COLLECT_FORM_VALUES,
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!payload || !payload.ok) {
      return;
    }
    if (payload.kind === "load_preset") {
      setInitialValues(payload.values);
      setFormKey((key) => key + 1);
      setStatusMessage(payload.message);
      revalidator.revalidate();
      return;
    }
    if (payload.kind === "save_preset" || payload.kind === "delete_preset") {
      setStatusMessage(payload.message);
      revalidator.revalidate();
    }
  }, [payload, revalidator]);

  function loadFromRun(run: RecentCollectionRun) {
    setInitialValues(
      toCollectFormValues({
        source: run.source,
        keywords: run.keywords,
        contentType: run.content_type,
        sortMode: run.sort_mode,
        timeRange: run.time_range,
        limit: run.requested_limit,
        observationStrategy: run.observation_strategy,
      }),
    );
    setFormKey((key) => key + 1);
    setStatusMessage("실행 이력을 폼에 불러왔습니다.");
  }

  const collectSummary =
    payload && payload.ok && payload.kind === "collect" ? payload.summary : null;
  const actionError = payload && !payload.ok ? payload.message : null;

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

        {statusMessage ? (
          <p className="border-border bg-muted/30 text-foreground rounded-lg border px-3 py-2 text-sm">
            {statusMessage}
          </p>
        ) : null}

        <AdminSection
          title="수집 조건"
          description="관찰 대상과 문제 신호를 고르면 검색 후보가 만들어집니다. 자주 쓰는 조건은 저장해 두고 다시 불러올 수 있습니다."
        >
          <AdminPanel padding="lg">
            <ObservationCollectorForm
              key={formKey}
              Form={fetcher.Form}
              busy={busy}
              presetBusy={presetBusy}
              presets={presets}
              initialValues={initialValues}
            />
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
          ) : actionError ? (
            <AdminErrorAlert message={actionError} context="수집 실행" />
          ) : collectSummary ? (
            <CollectionResultSummary summary={collectSummary} />
          ) : (
            <AdminPanel padding="lg">
              <p className="text-muted-foreground text-sm">
                아직 실행 결과가 없습니다. 위에서 조건을 입력하고 수집을 실행해
                주세요.
              </p>
            </AdminPanel>
          )}
        </AdminSection>

        <AdminSection
          title="최근 실행 이력"
          description="최근 수집 실행 기록입니다. 「불러오기」로 그때의 조건을 폼에 다시 채울 수 있습니다."
        >
          <CollectionRunTable runs={runs} onLoadRun={loadFromRun} />
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
