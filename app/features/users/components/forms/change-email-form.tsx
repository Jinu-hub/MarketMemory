import type { Route } from "@rr/app/features/users/api/+types/change-email";

import { ArrowDown, Ban, Mail } from "lucide-react";
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

export default function ChangeEmailForm({ email }: { email: string }) {
  const { t } = useTranslation();
  const fetcher = useFetcher<Route.ComponentProps["actionData"]>();
  const formRef = useRef<HTMLFormElement>(null);
  const isChangeMode = Boolean(email);
  const submitLabel = isChangeMode
    ? t("account.email.changeTitle")
    : t("account.email.addTitle");

  useEffect(() => {
    if (fetcher.data && "success" in fetcher.data && fetcher.data.success) {
      formRef.current?.reset();
      formRef.current?.blur();
      formRef.current?.querySelectorAll("input").forEach((input) => {
        if (!input.disabled) {
          input.blur();
        }
      });
    }
  }, [fetcher.data]);

  return (
    <fetcher.Form
      ref={formRef}
      method="post"
      className="w-full max-w-screen-md"
      action="/api/users/email"
    >
      <NexCard variant="elevated" padding="lg" className="w-full">
        <NexCardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-3 shadow-lg">
              <Mail className="size-5 text-white" />
            </div>
            <div>
              <NexCardTitle>{submitLabel}</NexCardTitle>
              <NexCardDescription>
                {isChangeMode
                  ? t("account.email.changeDescription")
                  : t("account.email.addDescription")}
              </NexCardDescription>
            </div>
          </div>
        </NexCardHeader>

        <NexCardContent>
          <div className="flex flex-col gap-4">
            {isChangeMode ? (
              <>
                <div className="group cursor-not-allowed [&_input]:pointer-events-none">
                  <NexInput
                    label={t("account.email.currentEmail")}
                    id="currentEmail"
                    name="currentEmail"
                    required
                    type="email"
                    disabled
                    value={email}
                    leftIcon={<Mail className="size-4" />}
                    rightIcon={
                      <Ban
                        className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    }
                    className="opacity-80 disabled:cursor-not-allowed"
                    aria-describedby="current-email-hint"
                  />
                  <span id="current-email-hint" className="sr-only">
                    {t("account.email.currentEmailHint")}
                  </span>
                </div>

                <div className="flex justify-center py-1">
                  <div
                    className="flex size-8 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md"
                    aria-hidden="true"
                  >
                    <ArrowDown className="size-4 text-white" />
                  </div>
                </div>
              </>
            ) : null}

            <NexInput
              label={
                isChangeMode
                  ? t("account.email.newEmail")
                  : t("account.email.emailLabel")
              }
              id="email"
              name="email"
              required
              type="email"
              placeholder={t("account.email.emailPlaceholder")}
              leftIcon={<Mail className="size-4" />}
            />
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
            <FormSuccess message={t("account.email.updateStarted")} />
          ) : null}
          {fetcher.data && "error" in fetcher.data && fetcher.data.error ? (
            <FormErrors errors={[fetcher.data.error]} />
          ) : null}
        </NexCardFooter>
      </NexCard>
    </fetcher.Form>
  );
}
