import { useRef, useState } from "react";
import { Form } from "react-router";

import { AdminConfirmDialog } from "../admin-confirm-dialog";
import { AdminPanel } from "../admin-ui";
import { NexButton } from "~/core/components/nex";

/**
 * 임베딩 후보 전체에 대해 유사도 엣지를 일괄 재작성하는 영역.
 */
export function BulkRegenerateCard({
  candidateCount,
  returnSearch,
  busy,
}: {
  candidateCount: number;
  returnSearch: string;
  busy: boolean;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  return (
    <>
      <AdminPanel padding="lg" className="w-full min-w-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-foreground text-sm font-medium">전체 유사도 작성</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              영어 summary 임베딩이 있는 리포트{" "}
              <span className="text-foreground font-mono tabular-nums">{candidateCount}</span>건을
              순차 재계산합니다. 시간이 걸릴 수 있습니다.
            </p>
          </div>
          <Form method="post" ref={formRef}>
            <input type="hidden" name="intent" value="regenerate_all" />
            <input type="hidden" name="return_search" value={returnSearch.replace(/^\?/, "")} />
            <NexButton
              type="button"
              variant="primary"
              loading={busy}
              disabled={busy || candidateCount === 0}
              onClick={() => setOpen(true)}
              aria-label="전체 유사도 작성 확인 열기"
            >
              전체 유사도 작성
            </NexButton>
          </Form>
        </div>
      </AdminPanel>

      <AdminConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="전체 유사도를 다시 작성할까요?"
        description={`임베딩 후보 ${candidateCount}건에 대해 기존 엣지를 지우고 RPC 결과로 다시 채웁니다. 서버 부하가 있을 수 있습니다.`}
        confirmLabel="진행"
        cancelLabel="취소"
        tone="danger"
        onConfirm={() => formRef.current?.requestSubmit()}
      />
    </>
  );
}
