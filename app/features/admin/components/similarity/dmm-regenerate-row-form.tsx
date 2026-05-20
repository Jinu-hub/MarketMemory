import { Form } from "react-router";

import { NexButton } from "~/core/components/nex";

export function DmmRegenerateRowForm({
  sourceDailyMarketMemoryId,
  returnSearch,
  busy,
}: {
  sourceDailyMarketMemoryId: string;
  returnSearch: string;
  busy: boolean;
}) {
  return (
    <Form method="post">
      <input type="hidden" name="intent" value="regenerate_one" />
      <input type="hidden" name="source_daily_market_memory_id" value={sourceDailyMarketMemoryId} />
      <input type="hidden" name="return_search" value={returnSearch.replace(/^\?/, "")} />
      <NexButton
        type="submit"
        variant="secondary"
        size="sm"
        loading={busy}
        disabled={busy}
        aria-label="이 일별 마켓 메모리 유사도 생성"
      >
        유사도 생성
      </NexButton>
    </Form>
  );
}
