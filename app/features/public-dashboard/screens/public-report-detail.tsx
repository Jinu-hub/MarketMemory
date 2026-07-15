/**
 * Public Report Preview Detail (/public-dashboard/reports/:id)
 *
 * Anonymous reading surface for the newest allowlisted public reports.
 * Data is loaded via service-role helpers in `../queries.server` —
 * IDs outside the preview allowlist 404.
 *
 * Intentionally omits RelatedReports and admin actions; those stay behind
 * the authenticated `/item_reports/:id` experience.
 */
import { LockIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/core/components/ui/accordion";
import i18next from "~/core/lib/i18next.server";
import { socialShareMeta } from "~/core/lib/social-meta";
import { ItemReportsNavLink } from "~/features/item-reports/components/item-reports-nav-link";
import {
  ReadingHeader,
  ReadingHighlightBox,
} from "~/features/item-reports/components/reading-layout";
import { ReportDetailTabs } from "~/features/item-reports/components/report-detail-tabs";
import { ReportEntitiesFooter } from "~/features/item-reports/components/report-entities-footer";
import { ReportMetaSidebar } from "~/features/item-reports/components/report-meta-sidebar";
import { ReportSummaryMeta } from "~/features/item-reports/components/report-summary-meta";
import { ReportTranslationNotice } from "~/features/item-reports/components/report-translation-notice";
import { pickItemReportsUi } from "~/features/item-reports/i18n";
import { resolveDisplaySummary } from "~/features/item-reports/lib/summary";
import { resolveTakeaway } from "~/features/item-reports/lib/summary-meta";
import { isPremiumTier } from "~/features/item-reports/lib/tier-style";

import type { Route } from "./+types/public-report-detail";
import { FloatingJoinCta } from "../components/floating-join-cta";
import { publicDashboardHref } from "../lib/urls";
import {
  getPublicPreviewReport,
  type PublicPreviewReport,
} from "../queries.server";

type PublicReportDetailLoaderData = PublicPreviewReport & {
  locale: string;
};

export async function loader({
  params,
  request,
}: Route.LoaderArgs): Promise<PublicReportDetailLoaderData> {
  const locale = await i18next.getLocale(request);
  const id = params.id;

  if (!id) {
    throw new Response(null, { status: 404 });
  }

  const preview = await getPublicPreviewReport({ id, locale });
  if (!preview) {
    throw new Response(null, { status: 404 });
  }

  return {
    report: preview.report,
    localization: preview.localization,
    locale,
  };
}

export const meta: Route.MetaFunction = ({ data }) => {
  // Cast keeps meta usable when route-module circular inference collapses
  // `loaderData` to `undefined` in the language service (tsc still resolves it).
  const loaderData = data as PublicReportDetailLoaderData | undefined;
  if (!loaderData) {
    return [
      {
        title: `Not Found | ${import.meta.env.VITE_APP_NAME}`,
      },
    ];
  }
  const ui = pickItemReportsUi(loaderData.locale);
  const title = loaderData.report.title ?? ui.detail.metaFallbackTitle;
  const description =
    resolveTakeaway(
      loaderData.report.summary,
      loaderData.report.summary_meta,
    ) || ui.detail.metaFallbackDescription;
  return [
    { title: `${title} | ${import.meta.env.VITE_APP_NAME}` },
    { name: "description", content: description },
    ...socialShareMeta({
      title: `${title} | ${import.meta.env.VITE_APP_NAME}`,
      description,
      url: `/public-dashboard/reports/${loaderData.report.id}`,
    }),
  ];
};

export default function PublicReportDetail({
  loaderData,
}: {
  loaderData: PublicReportDetailLoaderData;
}) {
  const { t } = useTranslation();
  const { report, localization, locale } = loaderData;
  const ui = pickItemReportsUi(locale);
  const displaySummary = resolveDisplaySummary(report.summary);

  return (
    <div className="mx-auto -mt-10 flex w-full max-w-screen-2xl flex-1 flex-col px-4 pb-16 sm:px-6 md:-mt-24 md:px-8">
      <div
        role="status"
        className="border-primary/25 bg-primary/[0.06] mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border px-3.5 py-2 text-xs sm:mb-4 sm:text-sm"
      >
        <LockIcon className="text-primary size-3.5 shrink-0" aria-hidden />
        <span className="text-muted-foreground min-w-0 flex-1">
          {t("publicDashboard.previewNotice")}
        </span>
        {/* Nav already exposes Login/Join from md up; keep the inline CTA for mobile only. */}
        <Link
          to="/login"
          viewTransition
          className="text-primary hover:text-primary/80 inline-flex shrink-0 items-center font-medium transition-colors md:hidden"
        >
          {t("auth.signIn")}
        </Link>
      </div>

      <nav className="mb-4 sm:mb-5">
        <ItemReportsNavLink to={publicDashboardHref()}>
          {t("publicDashboard.backToDashboard")}
        </ItemReportsNavLink>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <article className="mx-auto w-full max-w-[72ch] min-w-0 space-y-8">
          <ReadingHeader report={report} />

          <ReportTranslationNotice
            localization={localization}
            locale={locale}
          />

          {isPremiumTier(report.report_tier) ? (
            <ReportSummaryMeta
              value={report.summary_meta}
              category={report.category}
            />
          ) : null}

          {displaySummary ? (
            <ReadingHighlightBox
              title={ui.detail.summaryTitle}
              category={report.category}
              className="my-0"
            >
              <p className="text-base leading-8 whitespace-pre-line md:text-lg">
                {displaySummary}
              </p>
            </ReadingHighlightBox>
          ) : null}

          <br />

          <ReportDetailTabs
            content={report.content}
            contentSns={report.content_sns}
            category={report.category}
            isAdmin={false}
          />

          <ReportEntitiesFooter
            metadata={report.metadata}
            className="hidden lg:block"
          />
        </article>

        <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:self-start">
          <div className="hidden shrink-0 lg:block">
            <ReportMetaSidebar report={report} />
          </div>
          <div className="shrink-0 lg:hidden">
            <Accordion
              type="single"
              collapsible
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
        </aside>
      </div>

      <FloatingJoinCta />
    </div>
  );
}
