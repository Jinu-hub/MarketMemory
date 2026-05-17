/**
 * Item Report — Detail Screen (/item_reports/:id)
 *
 * Reading-first layout built on showcase patterns:
 *  - `ReadingHeader`: category accent, read-time, editorial hero
 *  - `ReportSummaryMeta`: insight block (headline angle + hooks + pull quote)
 *  - `ReadingHighlightBox`: "요약" pulled out as a Key Metric-style callout
 *  - `ReportMarkdown`: long-form markdown body
 *  - `ShareSummaryBlock`: SNS summary rendered as related-insight callout
 *  - Right-rail `ReportMetaSidebar` + `RelatedReports` (responsive accordion)
 */
import { data } from "react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/core/components/ui/accordion";
import { requireAdmin, requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import {
  DEFAULT_SIMILARITY_METHOD_VERSION,
  regenerateItemSimilarityEdges,
} from "~/features/admin/mutations";

import type { Route } from "./+types/detail";
import { ItemReportsNavLink } from "../components/item-reports-nav-link";
import {
  ReadingHeader,
  ReadingHighlightBox,
} from "../components/reading-layout";
import { RelatedReports } from "../components/related-reports";
import { ReportDetailTabs } from "../components/report-detail-tabs";
import { ReportEntitiesFooter } from "../components/report-entities-footer";
import { ReportMetaSidebar } from "../components/report-meta-sidebar";
import { ReportSummaryMeta } from "../components/report-summary-meta";
import { resolveTakeaway } from "../lib/summary-meta";
import { isPremiumTier } from "../lib/tier-style";
import { getRelatedReports, getReport } from "../queries";
import { getUserProfile } from "~/features/users/queries";

export const meta: Route.MetaFunction = ({ data }) => {
  if (!data) {
    return [{ title: `Not Found | ${import.meta.env.VITE_APP_NAME}` }];
  }
  const title = data.report.title ?? "Item Report";
  const description =
    resolveTakeaway(data.report.summary, data.report.summary_meta) ||
    "Market Memory report";
  return [
    { title: `${title} | ${import.meta.env.VITE_APP_NAME}` },
    { name: "description", content: description },
  ];
};

export async function loader({ params, request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  // Fetch the report and the current auth user in parallel — both are
  // independent of each other, and 404-ing has higher priority than the
  // admin lookup, so we await the report result first.
  const [report, authResult] = await Promise.all([
    getReport(client, params.id),
    client.auth.getUser(),
  ]);
  if (!report) {
    throw data(null, { status: 404 });
  }

  const userId = authResult.data.user?.id ?? null;
  const [related, profile] = await Promise.all([
    getRelatedReports(client, {
      id: report.id,
      category: report.category,
      limit: 10,
    }),
    userId
      ? getUserProfile(client, { userId }).catch(() => null)
      : Promise.resolve(null),
  ]);

  const isAdmin = profile?.is_admin === true;
  return { report, related, isAdmin };
}

export async function action({ request, params }: Route.ActionArgs) {
  requireMethod("POST")(request);
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const formData = await request.formData();
  const intent = formData.get("intent");
  const sourceItemId = formData.get("source_item_id");

  if (intent !== "regenerate_related" || typeof sourceItemId !== "string" || !sourceItemId) {
    return data({ message: "유효하지 않은 요청입니다." }, { status: 400 });
  }
  if (sourceItemId !== params.id) {
    return data({ message: "요청한 리포트와 페이지가 일치하지 않습니다." }, { status: 400 });
  }

  const { inserted, error } = await regenerateItemSimilarityEdges(
    client,
    sourceItemId,
    DEFAULT_SIMILARITY_METHOD_VERSION,
  );

  if (error) {
    return data({ message: error.message }, { status: 400 });
  }

  const related = await getRelatedReports(client, {
    id: sourceItemId,
    limit: 10,
  });

  return data({ ok: true as const, inserted, related });
}

export default function ItemReportDetail({ loaderData }: Route.ComponentProps) {
  const { report, related, isAdmin } = loaderData;

  return (
    <div className="flex flex-1 flex-col px-4 pt-2 pb-16 md:px-8">
      <nav className="mb-6">
        <ItemReportsNavLink to="/item_reports">리포트 라이브러리</ItemReportsNavLink>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <article className="mx-auto w-full max-w-[72ch] min-w-0 space-y-8">
          <ReadingHeader report={report} />

          {/* summary_meta (헤드라인 앵글 + 훅 + 한 줄 요약)는 편집팀이
              가공한 부가가치 정보라 프리미엄 등급(premium / premium_plus)
              이상에서만 노출. free 등급은 본문 → 요약 → 본문 토글로
              충분하다고 판단. */}
          {isPremiumTier(report.report_tier) ? (
            <ReportSummaryMeta
              value={report.summary_meta}
              category={report.category}
            />
          ) : null}

          {report.summary ? (
            <ReadingHighlightBox
              title="요약"
              category={report.category}
              className="my-0"
            >
              <p className="text-base leading-8 md:text-lg whitespace-pre-line">{report.summary}</p>
            </ReadingHighlightBox>
          ) : null}

          <br />

          <ReportDetailTabs
            content={report.content}
            contentSns={report.content_sns}
            category={report.category}
            isAdmin={isAdmin}
          />

          <ReportEntitiesFooter metadata={report.metadata} />
        </article>

        {/*
          Aside is bounded to the viewport on lg so its sticky position
          actually stays inside the screen. The meta block keeps its
          natural size (`shrink-0`) while RelatedReports flex-fills the
          remaining space, scrolling inside its own card via Radix
          ScrollArea. On mobile the aside flows inline and RelatedReports
          falls back to the default 28rem cap.
        */}
        <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:self-start">
          <div className="hidden shrink-0 lg:block">
            <ReportMetaSidebar report={report} />
          </div>
          <div className="shrink-0 lg:hidden">
            <Accordion
              type="single"
              collapsible
              defaultValue="meta"
              className="border-border bg-card/60 rounded-xl border px-4"
            >
              <AccordionItem value="meta" className="border-0">
                <AccordionTrigger className="text-sm font-semibold">
                  리포트 정보
                </AccordionTrigger>
                <AccordionContent>
                  <ReportMetaSidebar
                    report={report}
                    className="border-0 bg-transparent p-0"
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <RelatedReports
            reports={related}
            isAdmin={isAdmin}
            sourceReportId={report.id}
            className="lg:flex-1"
            maxHeightClassName="max-h-[28rem] lg:max-h-none"
          />
        </aside>
      </div>
    </div>
  );
}
