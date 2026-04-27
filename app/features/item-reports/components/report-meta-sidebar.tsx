import {
  CalendarIcon,
  GlobeIcon,
  HashIcon,
  LanguagesIcon,
  LayersIcon,
  MapPinIcon,
  TagIcon,
} from "lucide-react";
import { Link } from "react-router";

import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import { getCategoryStyle } from "../lib/category-style";
import {
  formatDate,
  formatRegion,
  formatReportType,
} from "../lib/format";
import type { ReportDetail } from "../types";

type ReportMetaSidebarProps = {
  report: ReportDetail;
  className?: string;
};

/**
 * Right-rail metadata sidebar for the report detail view.
 * Uses the same category-accent system as the cards so the whole page reads
 * as a coherent editorial unit, not a collection of disparate panels.
 */
export function ReportMetaSidebar({
  report,
  className,
}: ReportMetaSidebarProps) {
  const style = getCategoryStyle(report.category);
  const CategoryIcon = style.icon;

  const rows: Array<{
    icon: React.ReactNode;
    label: string;
    content: React.ReactNode;
  }> = [];

  rows.push({
    icon: <CalendarIcon className="size-4" />,
    label: "발행",
    content: formatDate(report.input_date ?? report.created_at) || "—",
  });

  if (report.category) {
    rows.push({
      icon: <LayersIcon className="size-4" />,
      label: "카테고리",
      content: (
        <Link
          to={`/item_reports?category=${report.category}`}
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
      label: "유형",
      content: (
        <Link
          to={`/item_reports?report_type=${report.report_type}`}
          className="hover:text-primary underline-offset-4 hover:underline"
        >
          {formatReportType(report.report_type)}
        </Link>
      ),
    });
  }

  if ((report.regions?.length ?? 0) > 0) {
    rows.push({
      icon: <MapPinIcon className="size-4" />,
      label: "지역",
      content: (
        <div className="flex flex-wrap gap-1.5">
          {report.regions!.map((region) => (
            <Link
              key={region}
              to={`/item_reports?region=${region}`}
              className="hover:border-primary/40 bg-background border-border rounded-md border px-2 py-0.5 text-xs transition-colors"
            >
              {formatRegion(region)}
            </Link>
          ))}
        </div>
      ),
    });
  }

  if ((report.countries?.length ?? 0) > 0) {
    rows.push({
      icon: <GlobeIcon className="size-4" />,
      label: "국가",
      content: (
        <div className="flex flex-wrap gap-1.5">
          {report.countries!.map((country) => (
            <Link
              key={country}
              to={`/item_reports?country=${country}`}
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
      label: "언어",
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
        <h3 className="text-sm font-semibold tracking-tight">리포트 정보</h3>
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
            태그
          </div>
          <div className="flex flex-wrap gap-1.5">
            {report.tags!.map((tag) => (
              <Link
                key={tag}
                to={`/item_reports?tag=${encodeURIComponent(tag)}`}
                className="bg-muted/60 hover:bg-muted rounded-md px-2 py-0.5 text-xs transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
