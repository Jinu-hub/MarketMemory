import type { Route } from "./+types/dmm-similarities";

import { ArrowLeftIcon } from "lucide-react";
import { useMemo } from "react";
import { Link, data, redirect, useActionData, useLocation, useNavigation } from "react-router";
import { z } from "zod";

import { DmmBulkRegenerateCard } from "../components/similarity/dmm-bulk-regenerate-card";
import {
  DmmSimilarityTable,
  type DmmSimilarityRowModel,
} from "../components/similarity/dmm-similarity-table";
import { AdminErrorAlert, AdminPageHeader, AdminSection } from "../components/admin-ui";
import { NexBadge, NexButton } from "~/core/components/nex";
import { requireAdmin, requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";
import {
  groupDmmSimilarityEdgesBySource,
  parseTriStateStatusParam,
} from "../lib/dmm-similarity-utils";
import {
  DEFAULT_DMM_SIMILARITY_METHOD,
  previewDailyMarketMemorySimilarity,
  regenerateAllDailyMarketMemorySimilarity,
  regenerateDailyMarketMemorySimilarityWithSecondary,
  regenerateReadyDailyMarketMemorySimilarity,
} from "../mutations/dmm-similarity";
import {
  countDailyMarketMemoriesBySimilarityStatus,
  fetchEmbeddingDailyMarketMemoryIds,
  listDailyMarketMemoriesForSimilarity,
  listDmmSimilarityEdgesForSources,
} from "../queries/dmm-similarity";

export const meta: Route.MetaFunction = () => [
  { title: `일별 마켓 메모리 유사도 | ${import.meta.env.VITE_APP_NAME}` },
];

const actionSchema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal("preview_one"),
    source_daily_market_memory_id: z.string().uuid(),
  }),
  z.object({
    intent: z.literal("regenerate_one"),
    source_daily_market_memory_id: z.string().uuid(),
    return_search: z.string().optional(),
  }),
  z.object({
    intent: z.literal("regenerate_all"),
    return_search: z.string().optional(),
  }),
  z.object({
    intent: z.literal("regenerate_ready"),
    return_search: z.string().optional(),
  }),
]);

function buildRedirectSuffix(returnSearchRaw: string | undefined): string {
  const t = (returnSearchRaw ?? "").trim();
  if (!t) {
    return "";
  }
  return t.startsWith("?") ? t : `?${t}`;
}

function mergeFilterHref(status: "all" | "final" | "draft"): string {
  const sp = new URLSearchParams();
  if (status !== "all") {
    sp.set("status", status);
  }
  const q = sp.toString();
  return q ? `/admin/dmm-similarities?${q}` : "/admin/dmm-similarities";
}

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const url = new URL(request.url);
  const statusFilter = parseTriStateStatusParam(url.searchParams.get("status"));

  const filters = {
    status: statusFilter === "all" ? undefined : statusFilter,
  };

  const { data: memories, error: me } = await listDailyMarketMemoriesForSimilarity(
    client,
    filters,
  );
  if (me) {
    throw new Error(me.message);
  }

  const memoryRows = memories ?? [];
  const memoryIds = memoryRows.map((r) => r.id);

  const [
    { data: edgeRows, error: ee },
    { ids: embeddingIds, error: embErr },
    { count: readyCount, error: readyCntErr },
  ] = await Promise.all([
    listDmmSimilarityEdgesForSources(client, memoryIds, DEFAULT_DMM_SIMILARITY_METHOD),
    fetchEmbeddingDailyMarketMemoryIds(client),
    countDailyMarketMemoriesBySimilarityStatus(client, "ready"),
  ]);

  if (ee) {
    throw new Error(ee.message);
  }
  if (embErr) {
    throw new Error(embErr.message);
  }
  if (readyCntErr) {
    throw new Error(readyCntErr.message);
  }

  const edgeMap = groupDmmSimilarityEdgesBySource(edgeRows ?? []);
  const rows: DmmSimilarityRowModel[] = memoryRows.map((m) => ({
    memory: m,
    edges: edgeMap.get(m.id) ?? [],
    similarityStatus: m.similarity_status,
  }));

  return {
    rows,
    returnSearch: url.search,
    embeddingCandidateCount: embeddingIds.length,
    readySimilarityCount: readyCount ?? 0,
    statusFilter,
  };
}

export async function action({ request }: Route.ActionArgs) {
  requireMethod("POST")(request);
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const formData = await request.formData();
  const parsed = actionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return data({ message: "유효하지 않은 입력입니다." }, { status: 400 });
  }

  if (parsed.data.intent === "preview_one") {
    const result = await previewDailyMarketMemorySimilarity(
      client,
      parsed.data.source_daily_market_memory_id,
      DEFAULT_DMM_SIMILARITY_METHOD,
    );
    if (result.error) {
      return data({ message: result.error.message }, { status: 400 });
    }
    return data({
      preview: {
        source: result.source,
        candidates: result.candidates,
        partition: result.partition,
        summary: result.summary,
      },
    });
  }

  const suffix = buildRedirectSuffix(parsed.data.return_search);

  if (parsed.data.intent === "regenerate_one") {
    const { error } = await regenerateDailyMarketMemorySimilarityWithSecondary(
      client,
      parsed.data.source_daily_market_memory_id,
      DEFAULT_DMM_SIMILARITY_METHOD,
    );
    if (error) {
      return data({ message: error.message }, { status: 400 });
    }
    return redirect(`/admin/dmm-similarities${suffix}`);
  }

  if (parsed.data.intent === "regenerate_ready") {
    const summary = await regenerateReadyDailyMarketMemorySimilarity(
      client,
      DEFAULT_DMM_SIMILARITY_METHOD,
    );

    if (summary.processed === 0 && summary.errors.length > 0) {
      return data(
        { message: summary.errors[0]?.message ?? "대기 항목 유사도 작성에 실패했습니다." },
        { status: 400 },
      );
    }

    const sp = new URLSearchParams(suffix.startsWith("?") ? suffix.slice(1) : suffix);
    sp.set("ready_ok", "1");
    sp.set("ready_processed", String(summary.processed));
    sp.set("ready_inserted", String(summary.totalInserted));
    sp.set("ready_errors", String(summary.errors.length));
    const next = sp.toString();
    return redirect(`/admin/dmm-similarities${next ? `?${next}` : ""}`);
  }

  const summary = await regenerateAllDailyMarketMemorySimilarity(
    client,
    DEFAULT_DMM_SIMILARITY_METHOD,
  );

  if (summary.processed === 0 && summary.errors.length > 0) {
    return data(
      { message: summary.errors[0]?.message ?? "일괄 유사도 작성에 실패했습니다." },
      { status: 400 },
    );
  }

  const sp = new URLSearchParams(suffix.startsWith("?") ? suffix.slice(1) : suffix);
  sp.set("bulk_ok", "1");
  sp.set("bulk_processed", String(summary.processed));
  sp.set("bulk_inserted", String(summary.totalInserted));
  sp.set("bulk_errors", String(summary.errors.length));
  const next = sp.toString();
  return redirect(`/admin/dmm-similarities${next ? `?${next}` : ""}`);
}

function StatusFilterLinks({ statusFilter }: { statusFilter: "all" | "final" | "draft" }) {
  const btn =
    "inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-xs font-medium">status</span>
      {(
        [
          { key: "all", label: "전체" },
          { key: "final", label: "final" },
          { key: "draft", label: "draft" },
        ] as const
      ).map(({ key, label }) => (
        <Link
          key={key}
          to={mergeFilterHref(key)}
          className={cn(
            btn,
            statusFilter === key
              ? "border-border bg-background text-foreground ring-1 ring-border/80"
              : "border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}

export default function AdminDmmSimilarities({ loaderData }: Route.ComponentProps) {
  if (!loaderData) {
    return null;
  }

  const {
    rows,
    returnSearch,
    embeddingCandidateCount,
    readySimilarityCount,
    statusFilter,
  } = loaderData;

  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";
  const location = useLocation();

  const bulkBanner = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    if (sp.get("bulk_ok") !== "1") {
      return null;
    }
    const processed = sp.get("bulk_processed") ?? "0";
    const inserted = sp.get("bulk_inserted") ?? "0";
    const errN = sp.get("bulk_errors") ?? "0";
    return { processed, inserted, errN };
  }, [location.search]);

  const readyBanner = useMemo(() => {
    const sp = new URLSearchParams(location.search);
    if (sp.get("ready_ok") !== "1") {
      return null;
    }
    const processed = sp.get("ready_processed") ?? "0";
    const inserted = sp.get("ready_inserted") ?? "0";
    const errN = sp.get("ready_errors") ?? "0";
    return { processed, inserted, errN };
  }, [location.search]);

  const returnSearchForForms = returnSearch.startsWith("?")
    ? returnSearch.slice(1)
    : returnSearch.replace(/^\?/, "");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <AdminPageHeader
        title="일별 마켓 메모리 유사도"
        description="daily_market_memories·daily_market_memory_embeddings 기준으로 daily_market_memory_similarity_edges를 조회·재생성합니다. 동일 market_scope의 final 메모리끼리만 비교합니다."
      />

      {actionData && "message" in actionData && actionData.message ? (
        <AdminErrorAlert
          message={actionData.message}
          context="유사도 재생성 RPC"
        />
      ) : null}

      {bulkBanner ? (
        <div className="border-border bg-muted/30 flex flex-wrap items-center gap-2 rounded-lg border px-4 py-3 text-sm">
          <NexBadge variant="outline" size="sm">
            일괄 완료
          </NexBadge>
          <span className="text-muted-foreground">
            처리 {bulkBanner.processed}건 · 삽입 엣지 합계 {bulkBanner.inserted}
            {Number(bulkBanner.errN) > 0 ? (
              <span className="text-destructive"> · 오류 {bulkBanner.errN}건</span>
            ) : null}
          </span>
        </div>
      ) : null}

      {readyBanner ? (
        <div className="border-border bg-muted/30 flex flex-wrap items-center gap-2 rounded-lg border px-4 py-3 text-sm">
          <NexBadge variant="outline" size="sm">
            대기 항목 완료
          </NexBadge>
          <span className="text-muted-foreground">
            처리 {readyBanner.processed}건 · 삽입 엣지 합계 {readyBanner.inserted}
            {Number(readyBanner.errN) > 0 ? (
              <span className="text-destructive"> · 오류 {readyBanner.errN}건</span>
            ) : null}
          </span>
        </div>
      ) : null}

      <DmmBulkRegenerateCard
        candidateCount={embeddingCandidateCount}
        readyCount={readySimilarityCount}
        returnSearch={returnSearchForForms}
        busy={busy}
      />

      <AdminSection
        title="일별 마켓 메모리 목록"
        description="필터는 URL 쿼리로 유지됩니다. 벡터·top_tags 하이브리드(hybrid_v1)로 후보를 계산합니다."
      >
        <div className="space-y-4">
          <StatusFilterLinks statusFilter={statusFilter} />
          <DmmSimilarityTable rows={rows} returnSearch={returnSearchForForms} busy={busy} />
        </div>
      </AdminSection>

      <p className="text-muted-foreground text-center text-xs">
        RPC 버전:{" "}
        <code className="font-mono">{DEFAULT_DMM_SIMILARITY_METHOD}</code>
      </p>

      <div className="fixed right-6 bottom-6 z-50">
        <Link to="/admin/similarity-measurements">
          <NexButton
            type="button"
            variant="secondary"
            leftIcon={<ArrowLeftIcon className="size-4" aria-hidden />}
            aria-label="유사도 측정 목록으로 돌아가기"
            className="border-border bg-card text-card-foreground shadow-lg"
          >
            뒤로가기
          </NexButton>
        </Link>
      </div>
    </div>
  );
}
