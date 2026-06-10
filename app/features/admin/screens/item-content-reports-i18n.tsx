import type { Route } from "./+types/item-content-reports-i18n";

import { ArrowLeftIcon, ChevronDownIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, data, redirect, useActionData, useNavigation } from "react-router";
import { z } from "zod";

import { ItemContentI18nTable } from "../components/i18n/item-content-i18n-table";
import { AdminErrorAlert, AdminPageHeader, AdminSection } from "../components/admin-ui";
import { NexButton } from "~/core/components/nex";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/core/components/ui/collapsible";
import {
  invokeItemContentI18nWebhookJobs,
  isItemContentI18nWebhookConfigured,
  recordItemContentI18nWebhookRun,
} from "../mutations/item-content-i18n";
import {
  buildItemContentI18nRowModels,
  filterItemContentI18nRows,
  groupItemContentI18nByContentAndLang,
  mergeI18nFilterHref,
  parseI18nJobKey,
  parseI18nListFilters,
  type ItemContentI18nFilterHrefParts,
  type ItemContentI18nFilterState,
  type ReportTierFilter,
  type ReportTypeFilter,
} from "../lib/item-content-i18n-utils";
import {
  REPORT_TIERS,
  REPORT_TIER_LABELS_KO,
  REPORT_TYPES,
  REPORT_TYPE_LABELS_KO,
} from "~/features/item-reports/constants";
import { listItemContentI18nByContentIds, listItemContentsForI18n } from "../queries/item-content-i18n";
import { requireAdmin, requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";

export const meta: Route.MetaFunction = () => [
  { title: `item_content 리포트 다언어 | ${import.meta.env.VITE_APP_NAME}` },
];

const actionSchema = z.object({
  intent: z.literal("trigger_webhook"),
  jobs: z.union([z.string(), z.array(z.string())]).optional(),
  return_search: z.string().optional(),
});

function buildRedirectSuffix(returnSearchRaw: string | undefined): string {
  const t = (returnSearchRaw ?? "").trim();
  if (!t) {
    return "";
  }
  return t.startsWith("?") ? t : `?${t}`;
}

const ACTIVE_FILTER_LABELS = {
  all: "활성 전체",
  "1": "활성만",
  "0": "비활성만",
} as const;

const PUBLIC_FILTER_LABELS = {
  all: "공개 전체",
  "1": "공개만",
  "0": "비공개만",
} as const;

const I18N_FILTER_LABELS = {
  all: "다언어 전체",
  missing: "미생성 있음",
  complete: "전체 생성됨",
} as const;

function summarizeI18nFilters(parts: {
  activeFilter: "all" | "1" | "0";
  publicFilter: "all" | "1" | "0";
  i18nFilter: ItemContentI18nFilterState;
  reportTypeFilter: ReportTypeFilter;
  reportTierFilter: ReportTierFilter;
}): string {
  const chips: string[] = [
    ACTIVE_FILTER_LABELS[parts.activeFilter],
    PUBLIC_FILTER_LABELS[parts.publicFilter],
    I18N_FILTER_LABELS[parts.i18nFilter],
  ];

  if (parts.reportTypeFilter !== "all") {
    chips.push(`유형 ${REPORT_TYPE_LABELS_KO[parts.reportTypeFilter]}`);
  }
  if (parts.reportTierFilter !== "all") {
    chips.push(`등급 ${REPORT_TIER_LABELS_KO[parts.reportTierFilter]}`);
  }

  return chips.join(" · ");
}

function FilterLinks({
  activeFilter,
  publicFilter,
  i18nFilter,
  reportTypeFilter,
  reportTierFilter,
}: {
  activeFilter: "all" | "1" | "0";
  publicFilter: "all" | "1" | "0";
  i18nFilter: ItemContentI18nFilterState;
  reportTypeFilter: ReportTypeFilter;
  reportTierFilter: ReportTierFilter;
}) {
  const [open, setOpen] = useState(false);

  const btn =
    "inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors";

  const baseHref: ItemContentI18nFilterHrefParts = {
    active: activeFilter,
    pub: publicFilter,
    i18n: i18nFilter,
    reportType: reportTypeFilter,
    reportTier: reportTierFilter,
  };

  const summary = useMemo(
    () =>
      summarizeI18nFilters({
        activeFilter,
        publicFilter,
        i18nFilter,
        reportTypeFilter,
        reportTierFilter,
      }),
    [activeFilter, publicFilter, i18nFilter, reportTypeFilter, reportTierFilter],
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-border rounded-xl border">
      <div className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="text-foreground hover:bg-muted/50 flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left text-sm font-medium transition-colors sm:w-auto"
            aria-expanded={open}
          >
            <ChevronDownIcon
              className={cn(
                "text-muted-foreground size-4 shrink-0 transition-transform",
                open && "rotate-180",
              )}
              aria-hidden
            />
            필터
            <span className="text-muted-foreground font-normal">{open ? "접기" : "펼치기"}</span>
          </button>
        </CollapsibleTrigger>
        {!open ? (
          <p className="text-muted-foreground px-1 text-xs leading-relaxed sm:text-right">
            {summary}
          </p>
        ) : null}
      </div>
      <CollapsibleContent className="border-border border-t px-4 py-4">
        <div className="flex flex-col gap-3">
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
            to={mergeI18nFilterHref({ ...baseHref, active: key })}
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
            to={mergeI18nFilterHref({ ...baseHref, pub: key })}
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
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs font-medium">리포트 유형</span>
        <Link
          to={mergeI18nFilterHref({ ...baseHref, reportType: "all" })}
          className={cn(
            btn,
            reportTypeFilter === "all"
              ? "border-border bg-background text-foreground ring-1 ring-border/80"
              : "border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          전체
        </Link>
        {REPORT_TYPES.map((type) => (
          <Link
            key={type}
            to={mergeI18nFilterHref({ ...baseHref, reportType: type })}
            className={cn(
              btn,
              reportTypeFilter === type
                ? "border-border bg-background text-foreground ring-1 ring-border/80"
                : "border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            {REPORT_TYPE_LABELS_KO[type]}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs font-medium">리포트 등급</span>
        <Link
          to={mergeI18nFilterHref({ ...baseHref, reportTier: "all" })}
          className={cn(
            btn,
            reportTierFilter === "all"
              ? "border-border bg-background text-foreground ring-1 ring-border/80"
              : "border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
          )}
        >
          전체
        </Link>
        {REPORT_TIERS.map((tier) => (
          <Link
            key={tier}
            to={mergeI18nFilterHref({ ...baseHref, reportTier: tier })}
            className={cn(
              btn,
              reportTierFilter === tier
                ? "border-border bg-background text-foreground ring-1 ring-border/80"
                : "border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            {REPORT_TIER_LABELS_KO[tier]}
          </Link>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-muted-foreground text-xs font-medium">다언어</span>
        {(
          [
            { key: "all", label: "전체" },
            { key: "missing", label: "미생성 있음" },
            { key: "complete", label: "전체 생성됨" },
          ] as const
        ).map(({ key, label }) => (
          <Link
            key={key}
            to={mergeI18nFilterHref({ ...baseHref, i18n: key })}
            className={cn(
              btn,
              i18nFilter === key
                ? "border-border bg-background text-foreground ring-1 ring-border/80"
                : "border-border/60 text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            {label}
          </Link>
        ))}
      </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const url = new URL(request.url);
  const {
    isActive,
    isPublic,
    reportType,
    reportTier,
    activeFilter,
    publicFilter,
    i18nFilter,
    reportTypeFilter,
    reportTierFilter,
  } = parseI18nListFilters(url);

  const { data: contents, error: contentError } = await listItemContentsForI18n(client, {
    isActive,
    isPublic,
    reportType,
    reportTier,
  });
  if (contentError) {
    throw new Error(contentError.message);
  }

  const contentRows = contents ?? [];
  const contentIds = contentRows.map((row) => row.id);
  const { data: i18nRows, error: i18nError } = await listItemContentI18nByContentIds(
    client,
    contentIds,
  );
  if (i18nError) {
    throw new Error(i18nError.message);
  }

  const i18nMap = groupItemContentI18nByContentAndLang(i18nRows ?? []);
  const allRows = buildItemContentI18nRowModels(contentRows, i18nMap);
  const rows = filterItemContentI18nRows(allRows, i18nFilter);

  return {
    rows,
    returnSearch: url.search,
    activeFilter,
    publicFilter,
    i18nFilter,
    reportTypeFilter,
    reportTierFilter,
    webhookConfigured: isItemContentI18nWebhookConfigured(),
    totalCount: contentRows.length,
    filteredCount: rows.length,
  };
}

export async function action({ request }: Route.ActionArgs) {
  requireMethod("POST")(request);
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const formData = await request.formData();
  const parsed = actionSchema.safeParse({
    intent: formData.get("intent"),
    jobs: formData.getAll("jobs"),
    return_search: formData.get("return_search")?.toString(),
  });

  if (!parsed.success) {
    return data({ message: "유효하지 않은 입력입니다." }, { status: 400 });
  }

  const rawJobs = parsed.data.jobs;
  const jobKeys = (Array.isArray(rawJobs) ? rawJobs : rawJobs ? [rawJobs] : []).filter(
    (v): v is string => typeof v === "string" && v.trim() !== "",
  );

  if (jobKeys.length === 0) {
    return data({ message: "실행할 항목을 하나 이상 선택하세요." }, { status: 400 });
  }

  const suffix = buildRedirectSuffix(parsed.data.return_search);
  const sourceLangByContentId = new Map<string, string>();
  const webhookJobs = [];

  for (const key of jobKeys) {
    const job = parseI18nJobKey(key);
    if (!job) {
      return data({ message: `잘못된 선택 값입니다: ${key}` }, { status: 400 });
    }

    let sourceLang = sourceLangByContentId.get(job.itemContentId);
    if (!sourceLang) {
      const { data: content, error } = await client
        .from("item_contents")
        .select("lang_code")
        .eq("id", job.itemContentId)
        .maybeSingle();
      if (error) {
        return data({ message: error.message }, { status: 400 });
      }
      if (!content) {
        return data({ message: "item_contents를 찾을 수 없습니다." }, { status: 400 });
      }
      sourceLang = content.lang_code;
      sourceLangByContentId.set(job.itemContentId, sourceLang);
    }

    if (sourceLang === job.langCode) {
      return data(
        { message: "원문 언어에는 다언어 생성 Webhook을 실행할 수 없습니다." },
        { status: 400 },
      );
    }

    webhookJobs.push({
      itemContentId: job.itemContentId,
      langCode: job.langCode,
      sourceLangCode: sourceLang,
    });
  }

  const { results, error: webhookError } = await invokeItemContentI18nWebhookJobs(webhookJobs);
  if (webhookError) {
    return data({ message: webhookError }, { status: 400 });
  }

  const ranAt = new Date().toISOString();
  for (const result of results) {
    if (!result.webhook.ok) {
      continue;
    }
    const { error } = await recordItemContentI18nWebhookRun(
      client,
      result.job.itemContentId,
      result.job.langCode,
      ranAt,
    );
    if (error) {
      return data({ message: error.message }, { status: 400 });
    }
  }

  const sp = new URLSearchParams(suffix.startsWith("?") ? suffix.slice(1) : suffix);
  sp.set("webhook_ok", "1");
  sp.set("webhook_count", String(results.length));
  const next = sp.toString();
  return redirect(`/admin/item-content-reports-i18n${next ? `?${next}` : ""}`);
}

export default function ItemContentReportsI18nScreen({ loaderData }: Route.ComponentProps) {
  if (!loaderData) {
    return null;
  }

  const {
    rows,
    returnSearch,
    activeFilter,
    publicFilter,
    i18nFilter,
    reportTypeFilter,
    reportTierFilter,
    webhookConfigured,
    totalCount,
    filteredCount,
  } = loaderData;

  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  return (
    <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-10">
      <AdminPageHeader
        title="item_content 리포트"
        description="item_contents 원문과 item_content_i18n 번역 결과를 대조합니다. 원문 언어는 item_contents.lang_code이며, 나머지 지원 언어는 i18n 레코드 유무로 생성 여부를 판단합니다."
      />

      {actionData && "message" in actionData && actionData.message ? (
        <AdminErrorAlert message={actionData.message} context="다언어 생성 Webhook" />
      ) : null}

      <AdminSection
        title="리포트 목록"
        description={`총 ${totalCount}건 · 필터 적용 ${filteredCount}건 · 지원 언어 ko / en / ja`}
      >
        <div className="space-y-4">
          <FilterLinks
            activeFilter={activeFilter}
            publicFilter={publicFilter}
            i18nFilter={i18nFilter}
            reportTypeFilter={reportTypeFilter}
            reportTierFilter={reportTierFilter}
          />
          <ItemContentI18nTable
            rows={rows}
            returnSearch={returnSearch}
            webhookConfigured={webhookConfigured}
            busy={busy}
          />
        </div>
      </AdminSection>

      <div className="fixed right-6 bottom-6 z-50">
        <Link to="/admin/i18n-management">
          <NexButton
            type="button"
            variant="secondary"
            leftIcon={<ArrowLeftIcon className="size-4" aria-hidden />}
            aria-label="다언어 관리 목록으로 돌아가기"
            className="border-border bg-card text-card-foreground shadow-lg"
          >
            뒤로가기
          </NexButton>
        </Link>
      </div>
    </div>
  );
}
