import { Form } from "react-router";

import { NexButton } from "~/core/components/nex";

/**
 * 단일 `item_contents` 행에 대한 유사도 재계산 POST 폼.
 */
export function RegenerateRowForm({
  sourceItemId,
  returnSearch,
  busy,
}: {
  sourceItemId: string;
  /** `?active=1` 형태(앞의 `?` 포함 가능) */
  returnSearch: string;
  busy: boolean;
}) {
  return (
    <Form method="post">
      <input type="hidden" name="intent" value="regenerate_one" />
      <input type="hidden" name="source_item_id" value={sourceItemId} />
      <input type="hidden" name="return_search" value={returnSearch.replace(/^\?/, "")} />
      <NexButton
        type="submit"
        variant="secondary"
        size="sm"
        loading={busy}
        disabled={busy}
        aria-label="이 리포트 유사도 생성"
      >
        유사도 생성
      </NexButton>
    </Form>
  );
}
