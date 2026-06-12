/**
 * Weekly AI Issue Digest — Episode Reader (/weekly-ai-issue-digest/:id)
 *
 * Reuses the item-reports reading layer (ReadingHeader, ReportSummaryMeta,
 * ReportDetailTabs, ReportMetaSidebar) but stays inside the series space:
 *  - back link returns to the series home
 *  - the right rail lists "다른 회차" (other episodes) instead of
 *    similarity-based related reports, so navigation never leaves the series.
 */
import { data } from "react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/core/components/ui/accordion";
import i18next from "~/core/lib/i18next.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { ItemReportsNavLink } from "~/features/item-reports/components/item-reports-nav-link";
import { pickItemReportsUi } from "~/features/item-reports/i18n";
import {
  ReadingHeader,
  ReadingHighlightBox,
} from "~/features/item-reports/components/reading-layout";
import { ReportCard } from "~/features/item-reports/components/report-card";
import { ReportDetailTabs } from "~/features/item-reports/components/report-detail-tabs";
import { ReportEntitiesFooter } from "~/features/item-reports/components/report-entities-footer";
import { ReportMetaSidebar } from "~/features/item-reports/components/report-meta-sidebar";
import { ReportSummaryMeta } from "~/features/item-reports/components/report-summary-meta";
import { resolveTakeaway } from "~/features/item-reports/lib/summary-meta";
import { isPremiumTier } from "~/features/item-reports/lib/tier-style";
import { getUserProfile } from "~/features/users/queries";

import type { Route } from "./+types/detail";
import { WEEKLY_AI_ISSUES_SLUG } from "../constants";
import { pickWeeklyDigestUi } from "../i18n";
import {
  getOtherEpisodes,
  getSeriesBySlug,
  getSeriesReport,
} from "../queries";
import { WEEKLY_DIGEST_BASE_PATH, weeklyDigestDetailHref } from "../lib/urls";

export const meta: Route.MetaFunction = ({ data }) => {
  if (!data) {
    return [{ title: `Not Found | ${import.meta.env.VITE_APP_NAME}` }];
  }
  const ui = pickWeeklyDigestUi(data.locale);
  const reportsUi = pickItemReportsUi(data.locale);
  const seriesTitle = data.seriesTitle ?? ui.fallback.title;
  const title = data.report.title ?? seriesTitle;
  const description =
    resolveTakeaway(data.report.summary, data.report.summary_meta) ||
    reportsUi.detail.metaFallbackDescription;
  return [
    { title: `${title} | ${seriesTitle}` },
    { name: "description", content: description },
  ];
};

export async function loader({ params, request }: Route.LoaderArgs) {
  const locale = await i18next.getLocale(request);
  const series = await getSeriesBySlug(WEEKLY_AI_ISSUES_SLUG);
  if (!series) {
    throw data(null, { status: 404 });
  }

  const report = await getSeriesReport({ seriesId: series.id, id: params.id });
  if (!report) {
    throw data(null, { status: 404 });
  }

  const [client] = makeServerClient(request);
  const authResult = await client.auth.getUser();
  const userId = authResult.data.user?.id ?? null;

  const [otherEpisodes, profile] = await Promise.all([
    getOtherEpisodes({ seriesId: series.id, excludeId: report.id, limit: 8 }),
    userId
      ? getUserProfile(client, { userId }).catch(() => null)
      : Promise.resolve(null),
  ]);

  const isAdmin = profile?.is_admin === true;
  return { report, otherEpisodes, isAdmin, seriesTitle: series.title, locale };
}

export default function WeeklyDigestDetail({
  loaderData,
}: Route.ComponentProps) {
  const { report, otherEpisodes, isAdmin, seriesTitle, locale } = loaderData;
  const ui = pickWeeklyDigestUi(locale);
  const reportsUi = pickItemReportsUi(locale);
  const navTitle = seriesTitle ?? ui.fallback.title;

  return (
    <div className="flex flex-1 flex-col px-4 pt-2 pb-16 md:px-8">
      <nav className="mb-6">
        <ItemReportsNavLink to={WEEKLY_DIGEST_BASE_PATH}>
          {navTitle}
        </ItemReportsNavLink>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <article className="mx-auto w-full max-w-[72ch] min-w-0 space-y-8">
          <ReadingHeader report={report} />

          {isPremiumTier(report.report_tier) ? (
            <ReportSummaryMeta
              value={report.summary_meta}
              category={report.category}
            />
          ) : null}

          {report.summary ? (
            <ReadingHighlightBox
              title={reportsUi.detail.summaryTitle}
              category={report.category}
              className="my-0"
            >
              <p className="text-base leading-8 whitespace-pre-line md:text-lg">
                {report.summary}
              </p>
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

        <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:self-start lg:overflow-y-auto">
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
                  {reportsUi.detail.metaAccordionTitle}
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

          {otherEpisodes.length > 0 ? (
            <section
              aria-label={ui.detail.otherEpisodesAria}
              className="border-border bg-card flex flex-col gap-3 rounded-xl border p-4"
            >
              <h2 className="text-sm font-semibold tracking-tight">
                {ui.detail.otherEpisodesTitle}
              </h2>
              <ul className="flex flex-col gap-3">
                {otherEpisodes.map((episode) => (
                  <li key={episode.id}>
                    <ReportCard
                      report={episode}
                      density="dense"
                      detailHref={weeklyDigestDetailHref}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
