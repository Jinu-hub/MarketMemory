import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/core/components/ui/dialog";
import { NexButton } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

type AdminConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 위험 작업일 때 시각적 강조 */
  tone?: "default" | "danger";
  onConfirm: () => void;
};

/**
 * Admin 전용 확인 다이얼로그. 삭제·일괄 재생성 등 확인이 필요한 액션에 재사용한다.
 */
export function AdminConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  tone = "default",
  onConfirm,
}: AdminConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <NexButton type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </NexButton>
          <NexButton
            type="button"
            variant="primary"
            className={cn(
              tone === "danger" &&
                "border-destructive/40 bg-destructive/90 hover:bg-destructive text-destructive-foreground",
            )}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </NexButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
