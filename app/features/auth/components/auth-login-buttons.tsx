/**
 * Authentication Login Buttons Module
 */
import { LockIcon, MailIcon } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { Button } from "~/core/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/core/components/ui/tooltip";

import { AppleLogo } from "./logos/apple";
import { GoogleLogo } from "./logos/google";

function AuthLoginButton({
  logo,
  label,
  href,
  disabled = false,
}: {
  logo: React.ReactNode;
  label: string;
  href: string;
  disabled?: boolean;
}) {
  const { t } = useTranslation();

  if (disabled) {
    return (
      <Button
        variant="outline"
        className="inline-flex items-center justify-center gap-2"
        disabled
        type="button"
      >
        <span>{logo}</span>
        <span>{t("auth.continueWith", { provider: label })}</span>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      className="inline-flex items-center justify-center gap-2"
      asChild
    >
      <Link to={href}>
        <span>{logo}</span>
        <span>{t("auth.continueWith", { provider: label })}</span>
      </Link>
    </Button>
  );
}

function AppleComingSoonButton() {
  const { t } = useTranslation();

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <span className="inline-flex w-full" tabIndex={0}>
          <Button
            variant="outline"
            className="relative inline-flex w-full items-center justify-center gap-2"
            disabled
            type="button"
            aria-label={t("auth.continueWith", {
              provider: t("auth.providers.apple"),
            })}
          >
            <span>
              <AppleLogo className="size-4 scale-110 dark:text-white" />
            </span>
            <span>
              {t("auth.continueWith", { provider: t("auth.providers.apple") })}
            </span>
            <span className="bg-muted text-muted-foreground absolute top-1/2 right-3 shrink-0 -translate-y-1/2 rounded-full px-1.5 py-px text-[10px] font-medium tracking-wide uppercase">
              {t("dashboardSidebar.soonBadge")}
            </span>
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={5}>
        <p>{t("auth.appComingSoon")}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function Divider() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-4">
      <span className="bg-input h-px w-full"></span>
      <span className="text-muted-foreground text-xs">{t("auth.or")}</span>
      <span className="bg-input h-px w-full"></span>
    </div>
  );
}

function _SignInButtons() {
  const { t } = useTranslation();

  return (
    <>
      <AuthLoginButton
        logo={<LockIcon className="size-4 scale-110 dark:text-white" />}
        label={t("auth.providers.otp")}
        href="/auth/otp/start"
      />
      <AuthLoginButton
        logo={<MailIcon className="size-4 scale-110 dark:text-white" />}
        label={t("auth.providers.magicLink")}
        href="/auth/magic-link"
      />
    </>
  );
}

function SocialLoginButtons({ disabled = false }: { disabled?: boolean }) {
  const { t } = useTranslation();

  return (
    <>
      <AuthLoginButton
        logo={<GoogleLogo className="size-4" />}
        label={t("auth.providers.google")}
        href="/auth/social/start/google"
        disabled={disabled}
      />
      <AppleComingSoonButton />
    </>
  );
}

export function SignInButtons() {
  return (
    <>
      <Divider />
      <SocialLoginButtons />
      <_SignInButtons />
    </>
  );
}

export function SignUpButtons({ disabled = false }: { disabled?: boolean }) {
  return (
    <>
      <Divider />
      <SocialLoginButtons disabled={disabled} />
    </>
  );
}
