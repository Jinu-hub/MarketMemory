import { useEffect } from "react";
import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";
import { useFetcher, useRevalidator } from "react-router";

import { NexButton } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import { pickDashboardUi } from "../i18n";
import type { DailyMarketMemorySourcesConsistency } from "../lib/daily-market-memory-sources.server";

type ReconcileActionData =
  | { ok: true; sourceCount: number }
  | { message: string };

type AdminSourcesReconcileButtonProps = {
  memoryId: string;
  locale: string;
  consistency: DailyMarketMemorySourcesConsistency;
  className?: string;
};

export function AdminSourcesReconcileButton({
  memoryId,
  locale,
  consistency,
  className,
}: AdminSourcesReconcileButtonProps) {
  const fetcher = useFetcher<ReconcileActionData>();
  const revalidator = useRevalidator();
  const busy = fetcher.state !== "idle";
  const labels = pickDashboardUi(locale).todayMemory.sourceConsistency;

  useEffect(() => {
    if (fetcher.state !== "idle") return;
    const data = fetcher.data;
    if (data && "ok" in data && data.ok) {
      revalidator.revalidate();
    }
  }, [fetcher.state, fetcher.data, revalidator]);

  if (consistency.ok) return null;

  const errorMessage =
    fetcher.data && "message" in fetcher.data ? fetcher.data.message : null;
  const success =
    fetcher.state === "idle" && fetcher.data && "ok" in fetcher.data
      ? fetcher.data
      : null;

  return (
    <div
      className={cn(
        "border-warning/35 bg-warning/8 flex w-full flex-col gap-2 rounded-xl border px-3 py-2.5 sm:w-auto",
        className,
      )}
      role="status"
    >
      <div className="flex items-start gap-2">
        <AlertTriangleIcon
          className="text-warning mt-0.5 size-3.5 shrink-0"
          aria-hidden
        />
        <div className="min-w-0 space-y-0.5">
          <p className="text-foreground text-xs font-semibold">{labels.title}</p>
          <p className="text-muted-foreground text-[11px] leading-snug">
            {labels.description}
          </p>
          <p className="text-muted-foreground text-[11px] tabular-nums">
            {labels.detail
              .replace("{expected}", String(consistency.expectedCount))
              .replace("{actual}", String(consistency.actualCount))}
          </p>
        </div>
      </div>

      <fetcher.Form method="post" className="w-full sm:w-auto">
        <input type="hidden" name="intent" value="reconcile_sources" />
        <input type="hidden" name="memory_id" value={memoryId} />
        <NexButton
          type="submit"
          variant="secondary"
          size="sm"
          className="w-full sm:w-auto"
          loading={busy}
          disabled={busy}
          leftIcon={<RefreshCwIcon className="size-3.5" aria-hidden />}
          aria-label={labels.actionAria}
        >
          {labels.action}
        </NexButton>
      </fetcher.Form>

      {errorMessage ? (
        <p className="text-destructive text-[11px] leading-snug" role="alert">
          {errorMessage}
        </p>
      ) : null}
      {success ? (
        <p className="text-muted-foreground text-[11px] tabular-nums">
          {labels.success.replace("{count}", String(success.sourceCount))}
        </p>
      ) : null}
    </div>
  );
}
