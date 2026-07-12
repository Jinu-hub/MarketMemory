import { useState } from "react";
import { ChevronRightIcon, FileTextIcon, LockIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { useIsMobile } from "~/core/hooks/use-mobile";
import { cn } from "~/core/lib/utils";
import { ContentEmptyState } from "~/core/components/content/content-empty-state";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/core/components/ui/sheet";
import { ReportListRow } from "~/features/item-reports/components/report-list-row";
import type { ReportListItem } from "~/features/item-reports/types";

import { pickDashboardUi } from "../i18n";

type SourceReportsSheetProps = {
  reports: ReportListItem[];
  count: number;
  locale: string;
  className?: string;
  /** Render source rows as links to their detail page. Defaults to true. */
  linkReports?: boolean;
};

export function SourceReportsSheet({
  reports,
  count,
  locale,
  className,
  linkReports = true,
}: SourceReportsSheetProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const { t: tr } = useTranslation();
  const t = pickDashboardUi(locale).todayMemory;
  const labels = t.sourceReports;

  if (count <= 0) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${count}${t.reportCount}, ${labels.openAction}`}
        aria-haspopup="dialog"
        className={cn(
          "border-primary/40 bg-primary/10 text-primary inline-flex items-center rounded-full border cursor-pointer",
          "gap-1 px-4 py-2 text-sm font-semibold shadow-sm transition-colors",
          "hover:bg-primary/15 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
          className,
        )}
      >
        <FileTextIcon className="size-4 shrink-0" aria-hidden />
        {count}
        {t.reportCount}
        <ChevronRightIcon className="size-4 shrink-0 opacity-70" aria-hidden />
      </button>

      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "flex w-full flex-col gap-0 p-0",
          isMobile ? "max-h-[85vh] rounded-t-2xl" : "sm:max-w-md",
        )}
      >
        <SheetHeader className="border-border shrink-0 border-b px-5 py-4 text-left">
          <SheetTitle>{labels.title}</SheetTitle>
          <SheetDescription>{labels.description}</SheetDescription>
          {!linkReports ? (
            <div className="border-primary/25 bg-primary/[0.06] mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border px-3 py-2 text-xs">
              <LockIcon className="text-primary size-3.5 shrink-0" aria-hidden />
              <span className="text-muted-foreground">
                {tr("publicDashboard.loginNotice")}
              </span>
              <Link
                to="/login"
                viewTransition
                onClick={() => setOpen(false)}
                className="text-primary hover:text-primary/80 ml-auto inline-flex shrink-0 items-center gap-1 font-medium transition-colors"
              >
                {tr("auth.signIn")}
              </Link>
            </div>
          ) : null}
        </SheetHeader>

        {reports.length === 0 ? (
          <ContentEmptyState className="px-5 py-8">
            {labels.empty}
          </ContentEmptyState>
        ) : (
          <ul
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2"
            aria-label={labels.title}
          >
            {reports.map((report) => (
              <li key={report.id}>
                <ReportListRow
                  layout="related"
                  report={report}
                  linkReports={linkReports}
                />
              </li>
            ))}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}
