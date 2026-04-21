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
import { ArrowLeftIcon, TagIcon } from "lucide-react";
import { Link, data } from "react-router";

import { NexBadge } from "~/core/components/nex";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/core/components/ui/accordion";
import makeServerClient from "~/core/lib/supa-client.server";

import type { Route } from "./+types/detail";
import {
  ReadingHeader,
  ReadingHighlightBox,
  ShareSummaryBlock,
} from "../components/reading-layout";
import { RelatedReports } from "../components/related-reports";
import { ReportMetaSidebar } from "../components/report-meta-sidebar";
import { ReportSummaryMeta } from "../components/report-summary-meta";
import { parseSummaryMeta } from "../lib/format";
import { ReportMarkdown } from "../lib/markdown";
import { getRelatedReports, getReport } from "../queries";

export const meta: Route.MetaFunction = ({ data }) => {
  if (!data) {
    return [{ title: `Not Found | ${import.meta.env.VITE_APP_NAME}` }];
  }
  const title = data.report.title ?? "Item Report";
  const meta = parseSummaryMeta(data.report.summary_meta);
  const description =
    meta?.one_line_takeaway ??
    data.report.summary?.split(/\n+/)[0] ??
    "Market Memory report";
  return [
    { title: `${title} | ${import.meta.env.VITE_APP_NAME}` },
    { name: "description", content: description },
  ];
};

export async function loader({ params, request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  const report = await getReport(client, params.id);
  if (!report) {
    throw data(null, { status: 404 });
  }
  const related = await getRelatedReports(client, {
    id: report.id,
    category: report.category,
    limit: 5,
  });
  return { report, related };
}

export default function ItemReportDetail({ loaderData }: Route.ComponentProps) {
  const { report, related } = loaderData;

  return (
    <div className="flex flex-1 flex-col px-4 pt-2 pb-16 md:px-8">
      <nav className="mb-6">
        <Link
          to="/item_reports"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          리포트 라이브러리
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <article className="mx-auto w-full max-w-[72ch] min-w-0 space-y-8">
          <ReadingHeader report={report} />

          <ReportSummaryMeta
            value={report.summary_meta}
            category={report.category}
          />

          {report.summary ? (
            <ReadingHighlightBox
              title="요약"
              category={report.category}
              className="my-0"
            >
              <p className="text-base leading-8 md:text-lg">{report.summary}</p>
            </ReadingHighlightBox>
          ) : null}

          {report.content ? (
            <section aria-label="본문" className="space-y-4">
              <div className="border-border/60 border-t pt-8">
                <ReportMarkdown>{report.content}</ReportMarkdown>
              </div>
            </section>
          ) : null}

          <ShareSummaryBlock category={report.category}>
            {report.content_sns}
          </ShareSummaryBlock>

          {(report.tags?.length ?? 0) > 0 ? (
            <footer className="border-border flex flex-wrap items-center gap-2 border-t pt-6">
              <span className="text-muted-foreground mr-1 inline-flex items-center gap-1 text-xs">
                <TagIcon className="size-3" />
                Topics
              </span>
              {report.tags!.map((tag) => (
                <Link
                  key={tag}
                  to={`/item_reports?tag=${encodeURIComponent(tag)}`}
                  viewTransition
                >
                  <NexBadge variant="outline" size="sm">
                    #{tag}
                  </NexBadge>
                </Link>
              ))}
            </footer>
          ) : null}
        </article>

        <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
          <div className="hidden lg:block">
            <ReportMetaSidebar report={report} />
          </div>
          <div className="lg:hidden">
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
          <RelatedReports reports={related} />
        </aside>
      </div>
    </div>
  );
}
