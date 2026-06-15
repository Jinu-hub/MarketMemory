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
import { data, useLocation } from "react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/core/components/ui/accordion";
import { requireAdmin, requireMethod } from "~/core/lib/guards.server";
import i18next from "~/core/lib/i18next.server";
import makeServerClient from "~/core/lib/supa-client.server";
import {
  DEFAULT_SIMILARITY_METHOD_VERSION,
  regenerateItemSimilarityEdgesWithSecondary,
} from "~/features/admin/mutations/similarity";

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
import { ReportTranslationNotice } from "../components/report-translation-notice";
import {
  localizeItemContents,
  localizeItemContentWithMeta,
} from "../lib/item-content-localization";
import {
  readItemReportsListLinkState,
  resolveItemReportsListBackHref,
} from "../lib/list-navigation-state";
import { resolveTakeaway } from "../lib/summary-meta";
import { isPremiumTier } from "../lib/tier-style";
import { pickItemReportsUi } from "../i18n";
import { getRelatedReports, getReport } from "../queries";
import { getUserProfile } from "~/features/users/queries";

export const meta: Route.MetaFunction = ({ data }) => {
  if (!data) {
    return [
      {
        title: `Not Found | ${import.meta.env.VITE_APP_NAME}`,
      },
    ];
  }
  const ui = pickItemReportsUi(data.locale);
  const title = data.report.title ?? ui.detail.metaFallbackTitle;
  const description =
    resolveTakeaway(data.report.summary, data.report.summary_meta) ||
    ui.detail.metaFallbackDescription;
  return [
    { title: `${title} | ${import.meta.env.VITE_APP_NAME}` },
    { name: "description", content: description },
  ];
};

export async function loader({ params, request }: Route.LoaderArgs) {
  const locale = await i18next.getLocale(request);
  const [client] = makeServerClient(request);
  // Fetch the report and the current auth user in parallel — both are
  // independent of each other, and 404-ing has higher priority than the
  // admin lookup, so we await the report result first.
  const [reportRow, authResult] = await Promise.all([
    getReport(client, params.id),
    client.auth.getUser(),
  ]);
  if (!reportRow) {
    throw data(null, { status: 404 });
  }

  // Resolve the displayed language from item_content_i18n (falls back to the
  // original-language source row when no translation exists yet).
  const { row: report, localization } = await localizeItemContentWithMeta(
    client,
    reportRow,
    locale,
  );

  const userId = authResult.data.user?.id ?? null;
  const [relatedRows, profile] = await Promise.all([
    getRelatedReports(client, {
      id: report.id,
      category: report.category,
      limit: 10,
    }),
    userId
      ? getUserProfile(client, { userId }).catch(() => null)
      : Promise.resolve(null),
  ]);

  const related = await localizeItemContents(client, relatedRows, locale);
  const isAdmin = profile?.is_admin === true;
  return { report, related, isAdmin, locale, localization };
}

export async function action({ request, params }: Route.ActionArgs) {
  requireMethod("POST")(request);
  const locale = await i18next.getLocale(request);
  const ui = pickItemReportsUi(locale);
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const formData = await request.formData();
  const intent = formData.get("intent");
  const sourceItemId = formData.get("source_item_id");

  if (intent !== "regenerate_related" || typeof sourceItemId !== "string" || !sourceItemId) {
    return data({ message: ui.detail.actionInvalidRequest }, { status: 400 });
  }
  if (sourceItemId !== params.id) {
    return data({ message: ui.detail.actionReportMismatch }, { status: 400 });
  }

  const { inserted, error } = await regenerateItemSimilarityEdgesWithSecondary(
    client,
    sourceItemId,
    DEFAULT_SIMILARITY_METHOD_VERSION,
  );

  if (error) {
    return data({ message: error.message }, { status: 400 });
  }

  const relatedRows = await getRelatedReports(client, {
    id: sourceItemId,
    limit: 10,
  });
  const related = await localizeItemContents(client, relatedRows, locale);

  return data({ ok: true as const, inserted, related });
}

export default function ItemReportDetail({ loaderData }: Route.ComponentProps) {
  const { report, related, isAdmin, localization } = loaderData;
  const ui = pickItemReportsUi(loaderData.locale);
  const location = useLocation();
  const listLinkState = readItemReportsListLinkState(location.state);
  const listBackHref = resolveItemReportsListBackHref(location.state);

  return (
    <div className="flex flex-1 flex-col px-4 pt-2 pb-16 md:px-8">
      <nav className="mb-6">
        <ItemReportsNavLink to={listBackHref}>{ui.nav.library}</ItemReportsNavLink>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <article className="mx-auto w-full max-w-[72ch] min-w-0 space-y-8">
          <ReadingHeader report={report} />

          <ReportTranslationNotice
            localization={localization}
            locale={loaderData.locale}
          />

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
              title={ui.detail.summaryTitle}
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
                  {ui.meta.title}
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
            listLinkState={listLinkState}
            className="lg:flex-1"
            maxHeightClassName="max-h-[28rem] lg:max-h-none"
          />
        </aside>
      </div>
    </div>
  );
}
