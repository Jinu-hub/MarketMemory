/**
 * In-App Browser Modal
 *
 * Shown when the user tries Google sign-in inside a mobile in-app browser
 * (WebView) such as Threads, Instagram, Facebook, KakaoTalk, or Line — where
 * Google OAuth is often blocked (403 disallowed_useragent) — and guides them
 * to open the current page in an external browser.
 *
 * - Android: offers a button that force-opens Chrome via the `intent://` scheme
 *   (with a KakaoTalk-specific `openExternal` fallback).
 * - iOS: shows a visual guide pointing to the top-right `...` menu, since iOS
 *   WebViews cannot programmatically launch an external browser.
 */
import { useId } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowUpRightIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
  ShareIcon,
  XIcon,
} from "lucide-react";

import { NexButton } from "~/core/components/nex";
import { useInAppBrowser } from "~/core/hooks/use-in-app-browser";
import { cn } from "~/core/lib/utils";

type InAppBrowserModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Determines the dismiss CTA copy (login vs join). */
  intent: "sign-in" | "sign-up";
};

export function InAppBrowserModal({
  open,
  onOpenChange,
  intent,
}: InAppBrowserModalProps) {
  const { t } = useTranslation();
  const { platform, appName } = useInAppBrowser();
  const titleId = useId();
  const descId = useId();

  if (!open) return null;

  const handleClose = () => onOpenChange(false);

  const continueWithEmailLabel =
    intent === "sign-up"
      ? t("inAppBrowser.continueWithEmailSignUp")
      : t("inAppBrowser.continueWithEmailSignIn");

  const handleOpenExternal = () => {
    if (typeof window === "undefined") return;

    const url = window.location.href;

    if (appName === "kakaotalk") {
      window.location.href =
        "kakaotalk://web/openExternal?url=" + encodeURIComponent(url);
      return;
    }

    const noScheme = url.replace(/^https?:\/\//, "");
    window.location.href = `intent://${noScheme}#Intent;scheme=https;package=com.android.chrome;end`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
    >
      <div
        aria-hidden
        className="bg-background/70 absolute inset-0 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        className={cn(
          "bg-card text-foreground border-border relative w-full max-w-md rounded-2xl border p-6 shadow-2xl",
          "animate-in fade-in zoom-in-95 duration-200",
        )}
      >
        <button
          type="button"
          onClick={handleClose}
          aria-label={t("inAppBrowser.close")}
          className="text-muted-foreground hover:text-foreground hover:bg-muted absolute top-4 right-4 inline-flex size-8 items-center justify-center rounded-lg transition-colors"
        >
          <XIcon className="size-4" aria-hidden />
        </button>

        <div className="flex flex-col gap-2 pr-8">
          <h2 id={titleId} className="text-lg font-semibold tracking-tight">
            {t("inAppBrowser.title")}
          </h2>
          <p
            id={descId}
            className="text-muted-foreground text-sm leading-relaxed"
          >
            {t("inAppBrowser.description")}
          </p>
        </div>

        <div className="mt-5">
          {platform === "android" ? (
            <NexButton
              variant="primary"
              size="lg"
              className="w-full"
              leftIcon={<ExternalLinkIcon className="size-4" aria-hidden />}
              onClick={handleOpenExternal}
            >
              {t("inAppBrowser.openInBrowser")}
            </NexButton>
          ) : (
            <IosGuide title={t("inAppBrowser.iosGuideTitle")}>
              <IosStep
                icon={<MoreHorizontalIcon className="size-4" aria-hidden />}
                text={t("inAppBrowser.iosStep1")}
              />
              <IosStep
                icon={<ShareIcon className="size-4" aria-hidden />}
                text={t("inAppBrowser.iosStep2")}
              />
            </IosGuide>
          )}
        </div>

        <button
          type="button"
          onClick={handleClose}
          className="text-muted-foreground hover:text-foreground mt-4 w-full text-center text-sm underline-offset-4 transition-colors hover:underline"
        >
          {continueWithEmailLabel}
        </button>
      </div>
    </div>
  );
}

/**
 * iOS guidance container with a placeholder arrow pointing to the top-right
 * `...` menu, where the "Open in Safari" option lives in most WebViews.
 */
function IosGuide({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border bg-muted/40 relative rounded-xl border border-dashed p-4">
      {/* Arrow placeholder pointing to the top-right (...) / share menu. */}
      <div
        aria-hidden
        className="text-primary absolute -top-3 right-3 inline-flex size-9 items-center justify-center"
      >
        <ArrowUpRightIcon className="size-6 animate-bounce" />
      </div>

      <p className="text-foreground text-sm font-semibold">{title}</p>
      <ol className="mt-3 flex flex-col gap-3">{children}</ol>
    </div>
  );
}

function IosStep({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <li className="flex items-center gap-3">
      <span className="bg-background text-foreground border-border inline-flex size-8 shrink-0 items-center justify-center rounded-lg border">
        {icon}
      </span>
      <span className="text-muted-foreground text-sm leading-snug">{text}</span>
    </li>
  );
}
