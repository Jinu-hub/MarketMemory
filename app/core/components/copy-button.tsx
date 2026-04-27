/**
 * CopyButton & useCopyToClipboard — reusable clipboard utilities.
 *
 * The component is built on `NexButton` so the visual treatment matches
 * the rest of the Nex Design System out of the box. Three states
 * (`idle` → `copied` → reset, plus `error`) with a 1.5s auto-revert and
 * graceful fallback when the Clipboard API is unavailable (older
 * browsers / non-secure contexts).
 *
 * Two ways to use it:
 *
 *   1. The component, with sensible defaults:
 *
 *        <CopyButton text={markdown} label="본문 복사" />
 *        <CopyButton text={() => mdSource} iconOnly aria-label="복사" />
 *
 *   2. The hook, when you want to bring your own button:
 *
 *        const { copy, state } = useCopyToClipboard();
 *        <button onClick={() => copy(text)}>{state}</button>
 */
import { CheckIcon, CopyIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { NexButton } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export type CopyState = "idle" | "copied" | "error";

export type UseCopyToClipboardOptions = {
  /** ms to keep the `copied` / `error` state before reverting to `idle`. */
  feedbackDurationMs?: number;
  onCopy?: (text: string) => void;
  onError?: (error: unknown) => void;
};

export function useCopyToClipboard({
  feedbackDurationMs = 1500,
  onCopy,
  onError,
}: UseCopyToClipboardOptions = {}) {
  const [state, setState] = useState<CopyState>("idle");
  const timeoutRef = useRef<number | null>(null);

  // Clear any pending reset on unmount to avoid setState-after-unmount.
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const scheduleReset = useCallback(() => {
    if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(
      () => setState("idle"),
      feedbackDurationMs,
    );
  }, [feedbackDurationMs]);

  const copy = useCallback(
    async (
      text:
        | string
        | (() => string | null | undefined | Promise<string | null | undefined>),
    ) => {
      try {
        if (typeof navigator === "undefined" || !navigator.clipboard) {
          throw new Error("Clipboard API unavailable");
        }
        const value = typeof text === "function" ? await text() : text;
        if (value == null || value === "") return false;
        await navigator.clipboard.writeText(value);
        setState("copied");
        onCopy?.(value);
        scheduleReset();
        return true;
      } catch (err) {
        console.error("useCopyToClipboard: failed to copy", err);
        setState("error");
        onError?.(err);
        scheduleReset();
        return false;
      }
    },
    [onCopy, onError, scheduleReset],
  );

  return { state, copy };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type NexButtonVariant = "primary" | "secondary" | "ghost" | "gradient";
type NexButtonSize = "sm" | "md" | "lg";

export type CopyButtonProps = {
  /**
   * Text to copy. Either a literal string, or a callable that returns the
   * text on click (string | null | undefined | Promise of those). Returning
   * null / undefined / empty string is a no-op (state stays `idle`).
   */
  text:
    | string
    | (() => string | null | undefined | Promise<string | null | undefined>);
  /** Idle-state label. Defaults to "복사". */
  label?: string;
  /** Label shown after a successful copy. Defaults to "복사됨". */
  copiedLabel?: string;
  /** Label shown when the clipboard call fails. Defaults to "실패". */
  errorLabel?: string;
  /** ms before the button reverts to `idle`. Defaults to 1500. */
  feedbackDurationMs?: number;
  /** Hide the text label and render only the icon. */
  iconOnly?: boolean;
  variant?: NexButtonVariant;
  size?: NexButtonSize;
  className?: string;
  disabled?: boolean;
  /**
   * Required when `iconOnly` is true. Ignored otherwise — the visible
   * label already names the action.
   */
  "aria-label"?: string;
  onCopy?: (text: string) => void;
  onError?: (error: unknown) => void;
};

export function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied",
  errorLabel = "Failed",
  feedbackDurationMs,
  iconOnly = false,
  variant = "ghost",
  size = "sm",
  className,
  disabled,
  "aria-label": ariaLabel,
  onCopy,
  onError,
}: CopyButtonProps) {
  const { state, copy } = useCopyToClipboard({
    feedbackDurationMs,
    onCopy,
    onError,
  });

  const display =
    state === "copied" ? copiedLabel : state === "error" ? errorLabel : label;

  const icon =
    state === "copied" ? (
      <CheckIcon className="size-3.5 text-emerald-500 dark:text-emerald-400" />
    ) : (
      <CopyIcon className="size-3.5" />
    );

  return (
    <NexButton
      type="button"
      size={size}
      variant={variant}
      onClick={() => {
        void copy(text);
      }}
      disabled={disabled}
      leftIcon={icon}
      aria-label={ariaLabel ?? display}
      className={cn("shrink-0", className)}
    >
      {iconOnly ? null : display}
    </NexButton>
  );
}
