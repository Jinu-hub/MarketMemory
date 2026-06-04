import { FileSearchIcon } from "lucide-react";

import { NexButton } from "~/core/components/nex";
import { hasActiveListFilterParams } from "../lib/list-filter-active";
import { useItemReportsSearchParams } from "../lib/use-item-reports-search-params";

type Props = {
  title?: string;
  description?: string;
};

export function ReportEmptyState({
  title = "결과가 없습니다",
  description = "필터 조건을 조금 완화해 보세요. 검색어를 지우거나 카테고리 선택을 해제하면 더 많은 리포트를 볼 수 있어요.",
}: Props) {
  const { searchParams, resetAllParams } = useItemReportsSearchParams();
  const hasFilters = hasActiveListFilterParams(searchParams);

  return (
    <div className="border-border bg-card/40 text-muted-foreground flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed px-6 py-16 text-center">
      <FileSearchIcon className="size-10 opacity-70" />
      <div className="space-y-1">
        <h3 className="text-foreground text-base font-semibold">{title}</h3>
        <p className="mx-auto max-w-md text-sm leading-6">{description}</p>
      </div>
      {hasFilters ? (
        <NexButton
          variant="secondary"
          size="sm"
          onClick={resetAllParams}
        >
          모든 필터 초기화
        </NexButton>
      ) : null}
    </div>
  );
}
