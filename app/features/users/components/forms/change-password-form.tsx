import type { Route } from "@rr/app/features/users/api/+types/change-password";

import { KeyRound, ShieldCheck } from "lucide-react";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useFetcher } from "react-router";

import FormErrors from "~/core/components/form-error";
import FormSuccess from "~/core/components/form-success";
import {
  NexButton,
  NexCard,
  NexCardContent,
  NexCardDescription,
  NexCardFooter,
  NexCardHeader,
  NexCardTitle,
  NexInput,
} from "~/core/components/nex";

const PASSWORD_REQUIREMENT_KEYS = [
  "account.password.requirements.minLength",
  "account.password.requirements.upperLower",
  "account.password.requirements.numbers",
] as const;

export default function ChangePasswordForm({
  hasPassword,
}: {
  hasPassword: boolean;
}) {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const fetcher = useFetcher<Route.ComponentProps["actionData"]>();
  const submitLabel = hasPassword
    ? t("account.password.changeTitle")
    : t("account.password.addTitle");

  useEffect(() => {
    if (fetcher.data && "success" in fetcher.data && fetcher.data.success) {
      formRef.current?.reset();
      formRef.current?.blur();
      formRef.current?.querySelectorAll("input").forEach((input) => {
        input.blur();
      });
    }
  }, [fetcher.data]);

  const passwordError =
    fetcher.data &&
    "fieldErrors" in fetcher.data &&
    fetcher.data.fieldErrors?.password
      ? fetcher.data.fieldErrors.password[0]
      : undefined;

  const confirmPasswordError =
    fetcher.data &&
    "fieldErrors" in fetcher.data &&
    fetcher.data.fieldErrors?.confirmPassword
      ? fetcher.data.fieldErrors.confirmPassword[0]
      : undefined;

  return (
    <fetcher.Form
      ref={formRef}
      method="post"
      className="w-full max-w-screen-md"
      action="/api/users/password"
    >
      <NexCard variant="elevated" padding="lg" className="w-full">
        <NexCardHeader>
          <div className="flex items-center gap-3">
            <div
              className="rounded-full bg-gradient-to-br from-emerald-500 to-green-600 p-3 shadow-lg ring-1 ring-emerald-400/20"
              aria-hidden="true"
            >
              <ShieldCheck className="size-5 text-white" strokeWidth={2.25} />
            </div>
            <div>
              <NexCardTitle>{submitLabel}</NexCardTitle>
              <NexCardDescription>
                {hasPassword
                  ? t("account.password.changeDescription")
                  : t("account.password.addDescription")}
              </NexCardDescription>
            </div>
          </div>
        </NexCardHeader>

        <NexCardContent>
          <div className="flex flex-col gap-4">
            <NexInput
              label={t("account.password.newPassword")}
              id="password"
              name="password"
              required
              type="password"
              autoComplete="new-password"
              leftIcon={<KeyRound className="size-4" />}
              error={passwordError}
            />

            <NexInput
              label={t("account.password.confirmNewPassword")}
              id="confirmPassword"
              name="confirmPassword"
              required
              type="password"
              autoComplete="new-password"
              leftIcon={
                <ShieldCheck
                  className="size-4 text-emerald-600 dark:text-emerald-400"
                  strokeWidth={2.25}
                />
              }
              error={confirmPasswordError}
            />

            <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 dark:border-blue-800/60 dark:bg-blue-950/40">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                {t("account.password.requirementsTitle")}
              </p>
              <ul className="mt-2 space-y-1.5">
                {PASSWORD_REQUIREMENT_KEYS.map((requirementKey) => (
                  <li
                    key={requirementKey}
                    className="text-muted-foreground flex items-start gap-2 text-sm"
                  >
                    <span
                      className="mt-1.5 size-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400"
                      aria-hidden="true"
                    />
                    {t(requirementKey)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </NexCardContent>

        <NexCardFooter className="flex flex-col gap-4 border-t-0 pt-2">
          <NexButton
            type="submit"
            variant="primary"
            size="lg"
            loading={fetcher.state === "submitting"}
            disabled={fetcher.state === "submitting"}
            className="w-full font-semibold"
          >
            {submitLabel}
          </NexButton>
          {fetcher.data && "success" in fetcher.data && fetcher.data.success ? (
            <FormSuccess message={t("account.password.passwordUpdated")} />
          ) : null}
          {fetcher.data && "error" in fetcher.data && fetcher.data.error ? (
            <FormErrors errors={[fetcher.data.error]} />
          ) : null}
        </NexCardFooter>
      </NexCard>
    </fetcher.Form>
  );
}
