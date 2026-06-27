/**
 * User Registration Screen Component
 */
import type { Route } from "./+types/join";

import { CheckCircle2Icon } from "lucide-react";
import { useEffect, useRef } from "react";
import { Form, Link, data } from "react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

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
import i18next from "~/core/lib/i18next.server";
import makeServerClient from "~/core/lib/supa-client.server";

import { SignUpButtons } from "../components/auth-login-buttons";
import { doesUserExist } from "../lib/queries.server";

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  return {
    meta: {
      title: `${t("join.meta.title")} | ${import.meta.env.VITE_APP_NAME}`,
    },
  };
}

export const meta: Route.MetaFunction = ({ data }) => {
  return [{ title: data?.meta.title ?? "Create an account" }];
};

function createJoinSchema(t: Awaited<ReturnType<typeof i18next.getFixedT>>) {
  return z
    .object({
      name: z.string().min(1, { message: t("auth.validation.nameRequired") }),
      email: z.string().email({ message: t("auth.validation.invalidEmail") }),
      password: z.string().min(8, {
        message: t("auth.validation.passwordMinLength"),
      }),
      confirmPassword: z.string().min(8, {
        message: t("auth.validation.passwordMinLength"),
      }),
      marketing: z.coerce.boolean().default(false),
      terms: z.coerce.boolean(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.validation.passwordsMustMatch"),
      path: ["confirmPassword"],
    });
}

export async function action({ request }: Route.ActionArgs) {
  const t = await i18next.getFixedT(request);
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

  const [client] = makeServerClient(request);
  const { error: signInError } = await client.auth.signUp({
    ...validData,
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

  return {
    success: true,
  };
}

export default function Join({ actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (actionData && "success" in actionData && actionData.success) {
      formRef.current?.reset();
      formRef.current?.blur();
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
            />
            {actionData && "error" in actionData && actionData.error ? (
              <FormErrors errors={[actionData.error]} />
            ) : null}

            <div className="flex items-center gap-2">
              <Checkbox id="marketing" name="marketing" />
              <Label htmlFor="marketing" className="text-muted-foreground">
                {t("join.marketing")}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="terms" name="terms" checked />
              <Label htmlFor="terms" className="text-muted-foreground">
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
          <SignUpButtons />
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
