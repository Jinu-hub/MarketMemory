import type { Route } from "./+types/item-similarities";

import { useMemo } from "react";
import { Link, data, redirect, useActionData, useLocation, useNavigation } from "react-router";
import { z } from "zod";

import { BulkRegenerateCard } from "../components/similarity/bulk-regenerate-card";
import type { SimilarityRowModel } from "../components/similarity/similarity-table";
import { SimilarityTable } from "../components/similarity/similarity-table";
import { AdminErrorAlert, AdminPageHeader, AdminSection } from "../components/admin-ui";
import { NexBadge } from "~/core/components/nex";
import { requireAdmin, requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";
import {
  DEFAULT_SIMILARITY_METHOD_VERSION,
  regenerateAllItemSimilarityEdges,
  regenerateItemSimilarityEdges,
} from "../mutations";
import {
  fetchEmbeddingSourceItemIds,
  listItemContentsForSimilarity,
  listSimilarityEdgesForSources,
  type SimilarityEdgeListRow,
} from "../queries";

export const meta: Route.MetaFunction = () => [
  { title: `유사도 엣지 | ${import.meta.env.VITE_APP_NAME}` },
];

const actionSchema = z.discriminatedUnion("intent", [
  z.object({
    intent: z.literal("regenerate_one"),
    source_item_id: z.string().uuid(),
    return_search: z.string().optional(),
  }),
  z.object({
    intent: z.literal("regenerate_all"),
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

function mergeFilterHref(parts: {
  active: "all" | "1" | "0";
  pub: "all" | "1" | "0";
}): string {
  const sp = new URLSearchParams();
  if (parts.active !== "all") {
    sp.set("active", parts.active);
  }
  if (parts.pub !== "all") {
    sp.set("public", parts.pub);
  }
  const q = sp.toString();
  return q ? `/admin/item-similarities?${q}` : "/admin/item-similarities";
}

function parseFilterParam(v: string | null): "all" | "1" | "0" {
  if (v === "1" || v === "0") {
    return v;
  }
  return "all";
}

function groupEdgesBySource(edges: SimilarityEdgeListRow[]): Map<string, SimilarityEdgeListRow[]> {
  const m = new Map<string, SimilarityEdgeListRow[]>();
  for (const e of edges) {
    const list = m.get(e.source_item_id) ?? [];
    list.push(e);
    m.set(e.source_item_id, list);
  }
  return m;
}

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const url = new URL(request.url);
  const activeFilter = parseFilterParam(url.searchParams.get("active"));
  const publicFilter = parseFilterParam(url.searchParams.get("public"));

  const filters = {
    isActive: activeFilter === "all" ? undefined : activeFilter === "1",
    isPublic: publicFilter === "all" ? undefined : publicFilter === "1",
  };

  const { data: contents, error: ce } = await listItemContentsForSimilarity(client, filters);
  if (ce) {
    throw new Error(ce.message);
  }

  const contentRows = contents ?? [];
  const contentIds = contentRows.map((r) => r.id);

  const [{ data: edgeRows, error: ee }, { ids: embeddingIds, error: embErr }] = await Promise.all([
    listSimilarityEdgesForSources(client, contentIds, DEFAULT_SIMILARITY_METHOD_VERSION),
    fetchEmbeddingSourceItemIds(client),
  ]);

  if (ee) {
    throw new Error(ee.message);
  }
  if (embErr) {
    throw new Error(embErr.message);
  }

  const edgeMap = groupEdgesBySource(edgeRows ?? []);
  const rows: SimilarityRowModel[] = contentRows.map((c) => ({
    content: c,
    edges: edgeMap.get(c.id) ?? [],
  }));

  return {
    rows,
    returnSearch: url.search,
    embeddingCandidateCount: embeddingIds.length,
    activeFilter,
    publicFilter,
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

  const suffix = buildRedirectSuffix(parsed.data.return_search);

  if (parsed.data.intent === "regenerate_one") {
    const { error } = await regenerateItemSimilarityEdges(
      client,
      parsed.data.source_item_id,
      DEFAULT_SIMILARITY_METHOD_VERSION,
    );
    if (error) {
      return data({ message: error.message }, { status: 400 });
    }
    return redirect(`/admin/item-similarities${suffix}`);
  }

  const summary = await regenerateAllItemSimilarityEdges(
    client,
    DEFAULT_SIMILARITY_METHOD_VERSION,
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
  return redirect(`/admin/item-similarities${next ? `?${next}` : ""}`);
}

function FilterLinks({
  activeFilter,
  publicFilter,
}: {
  activeFilter: "all" | "1" | "0";
  publicFilter: "all" | "1" | "0";
}) {
  const btn =
    "inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs font-medium">활성</span>
        {(
          [
            { key: "all", label: "전체" },
            { key: "1", label: "활성만" },
            { key: "0", label: "비활성만" },
          ] as const
        ).map(({ key, label }) => (
          <Link
            key={key}
            to={mergeFilterHref({ active: key, pub: publicFilter })}
            className={cn(
              btn,
              activeFilter === key
                ? "border-border bg-background text-foreground ring-1 ring-border/80"
                : "border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs font-medium">공개</span>
        {(
          [
            { key: "all", label: "전체" },
            { key: "1", label: "공개만" },
            { key: "0", label: "비공개만" },
          ] as const
        ).map(({ key, label }) => (
          <Link
            key={key}
            to={mergeFilterHref({ active: activeFilter, pub: key })}
            className={cn(
              btn,
              publicFilter === key
                ? "border-border bg-background text-foreground ring-1 ring-border/80"
                : "border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function AdminItemSimilarities({ loaderData }: Route.ComponentProps) {
  if (!loaderData) {
    return null;
  }

  const {
    rows,
    returnSearch,
    embeddingCandidateCount,
    activeFilter,
    publicFilter,
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

  const returnSearchForForms = returnSearch.startsWith("?")
    ? returnSearch.slice(1)
    : returnSearch.replace(/^\?/, "");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <AdminPageHeader
        title="리포트 유사도"
        description="item_contents를 기준으로 item_similarity_edges를 좌측 외부 조인해 표시합니다. 행마다 유사도를 재계산하거나, 상단에서 임베딩 후보 전체를 일괄 갱신할 수 있습니다."
      />

      {actionData && "message" in actionData && actionData.message ? (
        <AdminErrorAlert message={actionData.message} />
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

      <BulkRegenerateCard
        candidateCount={embeddingCandidateCount}
        returnSearch={returnSearchForForms}
        busy={busy}
      />

      <AdminSection
        title="리포트 목록"
        description="필터는 URL 쿼리로 유지됩니다. 유사도 열은 엣지 수·상위 대상 id를 압축 표시합니다."
      >
        <div className="space-y-4">
          <FilterLinks activeFilter={activeFilter} publicFilter={publicFilter} />
          <SimilarityTable rows={rows} returnSearch={returnSearchForForms} busy={busy} />
        </div>
      </AdminSection>

      <p className="text-muted-foreground text-center text-xs">
        RPC 버전:{" "}
        <code className="font-mono">{DEFAULT_SIMILARITY_METHOD_VERSION}</code>
      </p>
    </div>
  );
}
