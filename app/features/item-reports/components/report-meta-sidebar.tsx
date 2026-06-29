import {
  CalendarIcon,
  GlobeIcon,
  HashIcon,
  LanguagesIcon,
  LayersIcon,
  MapPinIcon,
  ShieldCheckIcon,
  TagIcon,
} from "lucide-react";
import { Link } from "react-router";

import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import {
  formatItemReportsCopy,
  useItemReportsLocale,
  useItemReportsUi,
} from "../i18n";
import { getCategoryStyle } from "../lib/category-style";
import { resolveDisplayDate } from "../lib/dates";
import { formatRegion, formatReportType } from "../lib/labels";
import { itemReportsListHref } from "../lib/item-reports-urls";
import { getTierStyle } from "../lib/tier-style";
import type { ReportDetail } from "../types";
import { ReportEntitiesFooter } from "./report-entities-footer";
import { ReportTierBadge } from "./report-tier-badge";

type ReportMetaSidebarProps = {
  report: ReportDetail;
  className?: string;
};

export function ReportMetaSidebar({
  report,
  className,
}: ReportMetaSidebarProps) {
  const ui = useItemReportsUi();
  const locale = useItemReportsLocale();
  const style = getCategoryStyle(report.category, locale);
  const CategoryIcon = style.icon;

  const rows: Array<{
    icon: React.ReactNode;
    label: string;
    content: React.ReactNode;
  }> = [];

  rows.push({
    icon: <CalendarIcon className="size-4" />,
    label: ui.meta.published,
    content: resolveDisplayDate(report, locale) || "—",
  });

  if (report.category) {
    rows.push({
      icon: <LayersIcon className="size-4" />,
      label: ui.meta.category,
      content: (
        <Link
          to={itemReportsListHref({ category: report.category })}
          className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
        >
          <CategoryIcon className={cn("size-3.5", style.accentText)} />
          {style.label}
        </Link>
      ),
    });
  }

  if (report.report_type) {
    rows.push({
      icon: <HashIcon className="size-4" />,
      label: ui.meta.type,
      content: (
        <Link
          to={itemReportsListHref({ report_type: report.report_type })}
          className="hover:text-primary underline-offset-4 hover:underline"
        >
          {formatReportType(report.report_type, locale)}
        </Link>
      ),
    });
  }

  if (report.report_tier) {
    const tierStyle = getTierStyle(report.report_tier, locale);
    rows.push({
      icon: <ShieldCheckIcon className={cn("size-4", tierStyle.accentText)} />,
      label: ui.meta.tier,
      content: (
        <Link
          to={itemReportsListHref({ report_tier: report.report_tier })}
          className="inline-flex items-center underline-offset-4 hover:underline"
          aria-label={formatItemReportsCopy(ui.meta.tierFilterAria, {
            tier: tierStyle.label,
          })}
        >
          <ReportTierBadge tier={report.report_tier} showFree />
        </Link>
      ),
    });
  }

  if ((report.regions?.length ?? 0) > 0) {
    rows.push({
      icon: <MapPinIcon className="size-4" />,
      label: ui.meta.region,
      content: (
        <div className="flex flex-wrap gap-1.5">
          {report.regions!.map((region) => (
            <Link
              key={region}
              to={itemReportsListHref({ region })}
              className="hover:border-primary/40 bg-background border-border rounded-md border px-2 py-0.5 text-xs transition-colors"
            >
              {formatRegion(region, locale)}
            </Link>
          ))}
        </div>
      ),
    });
  }

  if ((report.countries?.length ?? 0) > 0) {
    rows.push({
      icon: <GlobeIcon className="size-4" />,
      label: ui.meta.country,
      content: (
        <div className="flex flex-wrap gap-1.5">
          {report.countries!.map((country) => (
            <Link
              key={country}
              to={itemReportsListHref({ country })}
              className="hover:border-primary/40 bg-background border-border rounded-md border px-2 py-0.5 text-xs transition-colors"
            >
              {country}
            </Link>
          ))}
        </div>
      ),
    });
  }

  if (report.lang_code) {
    rows.push({
      icon: <LanguagesIcon className="size-4" />,
      label: ui.meta.language,
      content: (
        <NexBadge variant="outline" size="sm">
          {report.lang_code.toUpperCase()}
        </NexBadge>
      ),
    });
  }

  return (
    <div
      className={cn(
        "border-border bg-card flex flex-col gap-4 rounded-xl border border-l-[3px] p-5",
        style.accentBorder,
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <CategoryIcon className={cn("size-4", style.accentText)} />
        <h3 className="text-sm font-semibold tracking-tight">{ui.meta.title}</h3>
      </div>
      <dl className="space-y-3 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start gap-3">
            <dt className="text-muted-foreground flex w-20 shrink-0 items-center gap-2">
              {row.icon}
              <span className="text-xs">{row.label}</span>
            </dt>
            <dd className="flex-1">{row.content}</dd>
          </div>
        ))}
      </dl>

      {(report.tags?.length ?? 0) > 0 ? (
        <div className="border-border/60 space-y-2 border-t pt-4">
          <div className="text-muted-foreground inline-flex items-center gap-1.5 text-xs tracking-wide uppercase">
            <TagIcon className="size-3" aria-hidden />
            {ui.meta.tags}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {report.tags!.map((tag) => (
              <Link
                key={tag}
                to={itemReportsListHref({ tag })}
                className="bg-muted/60 hover:bg-muted rounded-md px-2 py-0.5 text-xs transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <ReportEntitiesFooter
        metadata={report.metadata}
        className="border-border/60 border-t pt-4 lg:hidden"
      />
    </div>
  );
}
