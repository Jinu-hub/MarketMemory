/**
 * Authentication Login Buttons Module
 */
import { LockIcon, MailIcon } from "lucide-react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { Button } from "~/core/components/ui/button";

import { GithubLogo } from "./logos/github";
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
      <AuthLoginButton
        logo={<GithubLogo className="size-4 scale-125 dark:text-white" />}
        label={t("auth.providers.github")}
        href="/auth/social/start/github"
        disabled={disabled}
      />
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
