/**
 * Login Screen Component
 *
 * This component handles user authentication via email/password login,
 * social authentication providers, and provides options for password reset
 * and email verification. It demonstrates form validation, error handling,
 * and Supabase authentication integration.
 */
import type { Route } from "./+types/login";

import { AlertCircle, Loader2Icon } from "lucide-react";
import { useRef } from "react";
import { Form, Link, data, redirect, useFetcher } from "react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import FormButton from "~/core/components/form-button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "~/core/components/ui/alert";
import { Button } from "~/core/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import i18next from "~/core/lib/i18next.server";
import makeServerClient from "~/core/lib/supa-client.server";

import FormErrors from "../../../core/components/form-error";
import { SignInButtons } from "../components/auth-login-buttons";

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  return {
    meta: {
      title: `${t("login.meta.title")} | ${import.meta.env.VITE_APP_NAME}`,
    },
  };
}

export const meta: Route.MetaFunction = ({ data }) => {
  return [{ title: data?.meta.title ?? "Log in" }];
};

function createLoginSchema(t: Awaited<ReturnType<typeof i18next.getFixedT>>) {
  return z.object({
    email: z.string().email({ message: t("auth.validation.invalidEmail") }),
    password: z.string().min(8, {
      message: t("auth.validation.passwordMinLength"),
    }),
  });
}

/**
 * Server action for handling login form submission
 */
export async function action({ request }: Route.ActionArgs) {
  const t = await i18next.getFixedT(request);
  const loginSchema = createLoginSchema(t);
  const formData = await request.formData();
  const {
    data: validData,
    success,
    error,
  } = loginSchema.safeParse(Object.fromEntries(formData));

  if (!success) {
    return data({ fieldErrors: error.flatten().fieldErrors }, { status: 400 });
  }

  const [client, headers] = makeServerClient(request);

  const { error: signInError } = await client.auth.signInWithPassword({
    ...validData,
  });

  if (signInError) {
    if (signInError.message === "Email not confirmed") {
      return data({ errorCode: "email_not_confirmed" as const }, { status: 400 });
    }
    return data({ error: signInError.message }, { status: 400 });
  }

  return redirect("/dashboard", { headers });
}

export default function Login({ actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const fetcher = useFetcher();

  const onResendClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    formData.delete("password");
    fetcher.submit(formData, {
      method: "post",
      action: "/auth/api/resend",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-2xl font-semibold">
            {t("login.title")}
          </CardTitle>
          <CardDescription className="text-base">
            {t("login.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form
            className="flex w-full flex-col gap-5"
            method="post"
            ref={formRef}
          >
            <div className="flex flex-col items-start space-y-2">
              <Label
                htmlFor="email"
                className="flex flex-col items-start gap-1"
              >
                {t("common.labels.email")}
              </Label>
              <Input
                id="email"
                name="email"
                required
                type="email"
                placeholder={t("login.emailPlaceholder")}
              />
              {actionData &&
              "fieldErrors" in actionData &&
              actionData.fieldErrors.email ? (
                <FormErrors errors={actionData.fieldErrors.email} />
              ) : null}
            </div>
            <div className="flex flex-col items-start space-y-2">
              <div className="flex w-full items-center justify-between">
                <Label
                  htmlFor="password"
                  className="flex flex-col items-start gap-1"
                >
                  {t("common.labels.password")}
                </Label>
                <Link
                  to="/auth/forgot-password/reset"
                  className="text-muted-foreground text-underline hover:text-foreground self-end text-sm underline transition-colors"
                  tabIndex={-1}
                  viewTransition
                >
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                required
                type="password"
                placeholder={t("login.passwordPlaceholder")}
              />

              {actionData &&
              "fieldErrors" in actionData &&
              actionData.fieldErrors.password ? (
                <FormErrors errors={actionData.fieldErrors.password} />
              ) : null}
            </div>
            <FormButton label={t("login.loginButton")} className="w-full" />
            {actionData && "errorCode" in actionData ? (
              actionData.errorCode === "email_not_confirmed" ? (
                <Alert variant="destructive" className="bg-destructive/10">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t("auth.emailNotConfirmedTitle")}</AlertTitle>
                  <AlertDescription className="flex flex-col items-start gap-2">
                    {t("auth.emailNotConfirmedDesc")}
                    <Button
                      variant="outline"
                      className="text-foreground flex items-center justify-between gap-2"
                      onClick={onResendClick}
                    >
                      {t("auth.resendConfirmation")}
                      {fetcher.state === "submitting" ? (
                        <Loader2Icon
                          data-testid="resend-confirmation-email-spinner"
                          className="size-4 animate-spin"
                        />
                      ) : null}
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : null
            ) : null}
            {actionData && "error" in actionData ? (
              <FormErrors errors={[actionData.error]} />
            ) : null}
          </Form>
          <SignInButtons />
        </CardContent>
      </Card>
      <div className="flex flex-col items-center justify-center text-sm">
        <p className="text-muted-foreground">
          {t("auth.dontHaveAccount")}{" "}
          <Link
            to="/join"
            viewTransition
            data-testid="form-signup-link"
            className="text-muted-foreground hover:text-foreground text-underline underline transition-colors"
          >
            {t("auth.signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
