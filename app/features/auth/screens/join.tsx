/**
 * User Registration Screen Component
 */
import type { Route } from "./+types/join";

import { CheckCircle2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Form, Link, data } from "react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import {
  createPasswordFieldSchema,
  getPasswordValidationMessages,
} from "../lib/password-schema";
import FormButton from "~/core/components/form-button";
import FormErrors from "~/core/components/form-error";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "~/core/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/core/components/ui/card";
import { Checkbox } from "~/core/components/ui/checkbox";
import { Input } from "~/core/components/ui/input";
import { Label } from "~/core/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/core/components/ui/tabs";
import { getRequestLocale, updateProfileLocale } from "~/core/lib/locale.server";
import i18next from "~/core/lib/i18next.server";
import makeServerClient from "~/core/lib/supa-client.server";

import { SignUpButtons } from "../components/auth-login-buttons";
import { isSignupEnabled } from "../lib/signup-enabled";
import { doesUserExist } from "../lib/queries.server";

type AuthTab = "social" | "email";

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  return {
    signupEnabled: isSignupEnabled(),
    meta: {
      title: `${t("join.meta.title")} | ${import.meta.env.VITE_APP_NAME}`,
    },
  };
}

export const meta: Route.MetaFunction = ({ data }) => {
  return [{ title: data?.meta.title ?? "Create an account" }];
};

function createJoinSchema(t: Awaited<ReturnType<typeof i18next.getFixedT>>) {
  const passwordMessages = getPasswordValidationMessages(t);
  const passwordField = createPasswordFieldSchema(passwordMessages);

  return z
    .object({
      name: z.string().min(1, { message: t("auth.validation.nameRequired") }),
      email: z.string().email({ message: t("auth.validation.invalidEmail") }),
      password: passwordField,
      confirmPassword: passwordField,
      marketing: z.coerce.boolean().default(false),
      terms: z.coerce.boolean(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: passwordMessages.mustMatch,
      path: ["confirmPassword"],
    });
}

export async function action({ request }: Route.ActionArgs) {
  const t = await i18next.getFixedT(request);

  if (!isSignupEnabled()) {
    return data({ error: t("join.comingSoonDescription") }, { status: 403 });
  }

  const joinSchema = createJoinSchema(t);
  const formData = await request.formData();
  const {
    data: validData,
    success,
    error,
  } = joinSchema.safeParse(Object.fromEntries(formData));

  if (!success) {
    return data({ fieldErrors: error.flatten().fieldErrors }, { status: 400 });
  }

  if (!validData.terms) {
    return data(
      { error: t("auth.validation.termsRequired") },
      { status: 400 },
    );
  }

  const userExists = await doesUserExist(validData.email);

  if (userExists) {
    return data(
      { error: t("auth.validation.accountExists") },
      { status: 400 },
    );
  }

  const validLocale = await getRequestLocale(request);

  const [client] = makeServerClient(request);
  const { data: signUpData, error: signInError } = await client.auth.signUp({
    email: validData.email,
    password: validData.password,
    options: {
      data: {
        name: validData.name,
        display_name: validData.name,
        marketing_consent: validData.marketing,
      },
    },
  });

  if (signInError) {
    return data({ error: signInError.message }, { status: 400 });
  }

  if (signUpData.user?.id) {
    try {
      await updateProfileLocale(signUpData.user.id, validLocale);
    } catch (error) {
      console.error("[join] Failed to set profile locale:", error);
    }
  }

  return {
    success: true,
  };
}

function shouldOpenEmailTab(actionData: Route.ComponentProps["actionData"]) {
  if (!actionData) return false;
  return (
    "fieldErrors" in actionData ||
    "error" in actionData ||
    ("success" in actionData && actionData.success)
  );
}

function TermsAgreement({
  id,
  disabled = false,
  includeName = false,
}: {
  id: string;
  disabled?: boolean;
  /** Include `name="terms"` for email form submission. */
  includeName?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        {...(includeName ? { name: "terms" } : {})}
        checked
        disabled={disabled}
      />
      <Label htmlFor={id} className="text-muted-foreground">
        <span>
          {t("join.termsPrefix")}{" "}
          <Link
            to="/legal/terms-of-service"
            viewTransition
            className="text-muted-foreground text-underline hover:text-foreground underline transition-colors"
          >
            {t("common.links.terms")}
          </Link>{" "}
          {t("common.links.and")}{" "}
          <Link
            to="/legal/privacy-policy"
            viewTransition
            className="text-muted-foreground hover:text-foreground text-underline underline transition-colors"
          >
            {t("common.links.privacy")}
          </Link>
        </span>
      </Label>
    </div>
  );
}

export default function Join({ actionData, loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const signupEnabled = loaderData.signupEnabled;
  const [tab, setTab] = useState<AuthTab>(
    shouldOpenEmailTab(actionData) ? "email" : "social",
  );

  useEffect(() => {
    if (actionData && "success" in actionData && actionData.success) {
      formRef.current?.reset();
      formRef.current?.blur();
    }
  }, [actionData]);

  useEffect(() => {
    if (shouldOpenEmailTab(actionData)) {
      setTab("email");
    }
  }, [actionData]);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-2xl font-semibold" role="heading">
            {t("join.title")}
          </CardTitle>
          <CardDescription className="text-base">
            {t("join.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {!signupEnabled ? (
            <div
              role="alert"
              className="rounded-xl border border-amber-700/50 px-5 py-4 text-sm leading-relaxed text-amber-900/80 dark:border-[#8B5A3C]/80 dark:text-[#E7D9C5]"
            >
              {t("join.comingSoonDescription")}
            </div>
          ) : null}
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as AuthTab)}
            className="gap-4"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="social">{t("join.tabSocial")}</TabsTrigger>
              <TabsTrigger value="email" data-testid="auth-email-tab">
                {t("auth.tabs.email")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="social" className="mt-0">
              <div className="grid gap-5">
                <SignUpButtons disabled={!signupEnabled} />
                <TermsAgreement id="terms-social" disabled={!signupEnabled} />
              </div>
            </TabsContent>

            <TabsContent value="email" className="mt-0">
              <Form
                className="flex w-full flex-col gap-5"
                method="post"
                ref={formRef}
              >
                <div className="flex flex-col items-start space-y-2">
                  <Label htmlFor="name" className="flex flex-col items-start gap-1">
                    {t("common.labels.name")}
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    type="text"
                    placeholder={t("join.namePlaceholder")}
                    disabled={!signupEnabled}
                  />
                  {actionData &&
                  "fieldErrors" in actionData &&
                  actionData.fieldErrors?.name ? (
                    <FormErrors errors={actionData.fieldErrors.name} />
                  ) : null}
                </div>
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
                    placeholder={t("join.emailPlaceholder")}
                    disabled={!signupEnabled}
                  />
                  {actionData &&
                  "fieldErrors" in actionData &&
                  actionData.fieldErrors?.email ? (
                    <FormErrors errors={actionData.fieldErrors.email} />
                  ) : null}
                </div>
                <div className="flex flex-col items-start space-y-2">
                  <Label
                    htmlFor="password"
                    className="flex flex-col items-start gap-1"
                  >
                    {t("common.labels.password")}
                    <small className="text-muted-foreground">
                      {t("join.passwordHint")}
                    </small>
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    required
                    type="password"
                    placeholder={t("join.passwordPlaceholder")}
                    disabled={!signupEnabled}
                  />
                  {actionData &&
                  "fieldErrors" in actionData &&
                  actionData.fieldErrors?.password ? (
                    <FormErrors errors={actionData.fieldErrors.password} />
                  ) : null}
                </div>
                <div className="flex flex-col items-start space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="flex flex-col items-start gap-1"
                  >
                    {t("common.labels.confirmPassword")}
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    type="password"
                    placeholder={t("join.confirmPasswordPlaceholder")}
                    disabled={!signupEnabled}
                  />
                  {actionData &&
                  "fieldErrors" in actionData &&
                  actionData.fieldErrors?.confirmPassword ? (
                    <FormErrors errors={actionData.fieldErrors.confirmPassword} />
                  ) : null}
                </div>
                <FormButton
                  label={t("join.createAccountButton")}
                  className="w-full"
                  {...(signupEnabled ? {} : { disabled: true })}
                />
                {actionData && "error" in actionData && actionData.error ? (
                  <FormErrors errors={[actionData.error]} />
                ) : null}

                <div className="flex items-center gap-2">
                  <Checkbox id="marketing" name="marketing" disabled={!signupEnabled} />
                  <Label htmlFor="marketing" className="text-muted-foreground">
                    {t("join.marketing")}
                  </Label>
                </div>
                <TermsAgreement
                  id="terms"
                  includeName
                  disabled={!signupEnabled}
                />
                {actionData && "success" in actionData && actionData.success ? (
                  <Alert className="bg-green-600/20 text-green-700 dark:bg-green-950/20 dark:text-green-600">
                    <CheckCircle2Icon
                      className="size-4"
                      color="oklch(0.627 0.194 149.214)"
                    />
                    <AlertTitle>{t("join.accountCreatedTitle")}</AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-600">
                      {t("join.accountCreatedDesc")}
                    </AlertDescription>
                  </Alert>
                ) : null}
              </Form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <div className="flex flex-col items-center justify-center text-sm">
        <p className="text-muted-foreground">
          {t("auth.alreadyHaveAccount")}{" "}
          <Link
            to="/login"
            viewTransition
            data-testid="form-signin-link"
            className="text-muted-foreground hover:text-foreground text-underline underline transition-colors"
          >
            {t("auth.signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
