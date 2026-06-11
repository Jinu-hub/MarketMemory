import { FileSearchIcon } from "lucide-react";

import { NexButton } from "~/core/components/nex";
import { useItemReportsUi } from "../i18n";
import { hasActiveListFilterParams } from "../lib/list-filter-active";
import { useItemReportsSearchParams } from "../lib/use-item-reports-search-params";

type Props = {
  title?: string;
  description?: string;
};

export function ReportEmptyState({ title, description }: Props) {
  const ui = useItemReportsUi();
  const { searchParams, resetAllParams } = useItemReportsSearchParams();
  const hasFilters = hasActiveListFilterParams(searchParams);

  return (
    <div className="border-border bg-card/40 text-muted-foreground flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed px-6 py-16 text-center">
      <FileSearchIcon className="size-10 opacity-70" />
      <div className="space-y-1">
        <h3 className="text-foreground text-base font-semibold">
          {title ?? ui.empty.title}
        </h3>
        <p className="mx-auto max-w-md text-sm leading-6">
          {description ?? ui.empty.description}
        </p>
      </div>
      {hasFilters ? (
        <NexButton
          variant="secondary"
          size="sm"
          onClick={resetAllParams}
        >
          {ui.empty.resetAll}
        </NexButton>
      ) : null}
    </div>
  );
}
