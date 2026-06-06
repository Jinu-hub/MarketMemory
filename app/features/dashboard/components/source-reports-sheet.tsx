import { useState } from "react";
import { ChevronRightIcon, FileTextIcon } from "lucide-react";

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
};

export function SourceReportsSheet({
  reports,
  count,
  locale,
  className,
}: SourceReportsSheetProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
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
          "border-primary/35 bg-primary/8 text-primary inline-flex items-center rounded-full border",
          "px-2.5 py-1 text-xs font-semibold transition-colors",
          "hover:bg-primary/12 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none",
          className,
        )}
      >
        <FileTextIcon className="mr-1 size-3" aria-hidden />
        {count}
        {t.reportCount}
        <ChevronRightIcon className="ml-0.5 size-3 opacity-70" aria-hidden />
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
                <ReportListRow layout="related" report={report} />
              </li>
            ))}
          </ul>
        )}
      </SheetContent>
    </Sheet>
  );
}
