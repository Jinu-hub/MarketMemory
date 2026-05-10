import { useRef, useState } from "react";
import { Form } from "react-router";

import { AdminConfirmDialog } from "../admin-confirm-dialog";
import { AdminPanel } from "../admin-ui";
import { NexButton } from "~/core/components/nex";

/**
 * 임베딩 후보 전체 일괄 재작성 + `similarity_status = ready` 항목만 일괄 재작성.
 */
export function BulkRegenerateCard({
  candidateCount,
  readyCount,
  returnSearch,
  busy,
}: {
  candidateCount: number;
  readyCount: number;
  returnSearch: string;
  busy: boolean;
}) {
  const [openAll, setOpenAll] = useState(false);
  const [openReady, setOpenReady] = useState(false);
  const formAllRef = useRef<HTMLFormElement>(null);
  const formReadyRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <AdminPanel padding="lg" className="w-full min-w-0">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-foreground text-sm font-medium">일괄 유사도 작성</p>
              <p className="text-muted-foreground text-xs leading-relaxed">
                영어 summary 임베딩이 있는 리포트{" "}
                <span className="text-foreground font-mono tabular-nums">{candidateCount}</span>건을
                순차 재계산합니다. 시간이 걸릴 수 있습니다.
              </p>
            </div>
            <Form method="post" ref={formAllRef}>
              <input type="hidden" name="intent" value="regenerate_all" />
              <input type="hidden" name="return_search" value={returnSearch.replace(/^\?/, "")} />
              <NexButton
                type="button"
                variant="primary"
                loading={busy}
                disabled={busy || candidateCount === 0}
                onClick={() => setOpenAll(true)}
                aria-label="일괄 유사도 작성 확인 열기"
              >
                일괄 유사도 작성
              </NexButton>
            </Form>
          </div>

          <div className="border-border border-t pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-foreground text-sm font-medium">대기(ready) 유사도 작성</p>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  <code className="text-foreground">similarity_status</code>가{" "}
                  <span className="text-foreground font-mono">ready</span>인 리포트{" "}
                  <span className="text-foreground font-mono tabular-nums">{readyCount}</span>건만
                  재계산합니다. 크론 배치와 동일한 대상 범위입니다.
                </p>
              </div>
              <Form method="post" ref={formReadyRef}>
                <input type="hidden" name="intent" value="regenerate_ready" />
                <input
                  type="hidden"
                  name="return_search"
                  value={returnSearch.replace(/^\?/, "")}
                />
                <NexButton
                  type="button"
                  variant="secondary"
                  loading={busy}
                  disabled={busy || readyCount === 0}
                  onClick={() => setOpenReady(true)}
                  aria-label="대기 상태 유사도 작성 확인 열기"
                >
                  대기 항목만 작성
                </NexButton>
              </Form>
            </div>
          </div>
        </div>
      </AdminPanel>

      <AdminConfirmDialog
        open={openAll}
        onOpenChange={setOpenAll}
        title="일괄 유사도를 다시 작성할까요?"
        description={`임베딩 후보 ${candidateCount}건에 대해 기존 엣지를 지우고 RPC 결과로 다시 채웁니다. 서버 부하가 있을 수 있습니다.`}
        confirmLabel="진행"
        cancelLabel="취소"
        tone="danger"
        onConfirm={() => formAllRef.current?.requestSubmit()}
      />

      <AdminConfirmDialog
        open={openReady}
        onOpenChange={setOpenReady}
        title="대기(ready) 항목만 유사도를 작성할까요?"
        description={`현재 ready 상태인 ${readyCount}건에 대해서만 기존 엣지를 지우고 RPC 결과로 다시 채웁니다.`}
        confirmLabel="진행"
        cancelLabel="취소"
        tone="danger"
        onConfirm={() => formReadyRef.current?.requestSubmit()}
      />
    </>
  );
}
