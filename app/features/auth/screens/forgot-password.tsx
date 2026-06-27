/**
 * Password Reset Request Screen Component
 */
import type { Route } from "./+types/forgot-password";

import { useEffect, useRef } from "react";
import { Form, data } from "react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import FormButton from "~/core/components/form-button";
import FormErrors from "~/core/components/form-error";
import FormSuccess from "~/core/components/form-success";
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

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  return {
    meta: {
      title: `${t("forgotPassword.meta.title")} | ${import.meta.env.VITE_APP_NAME}`,
    },
  };
}

export const meta: Route.MetaFunction = ({ data }) => {
  return [{ title: data?.meta.title ?? "Forgot Password" }];
};

function createForgotPasswordSchema(
  t: Awaited<ReturnType<typeof i18next.getFixedT>>,
) {
  return z.object({
    email: z.string().email({ message: t("auth.validation.invalidEmail") }),
  });
}

export async function action({ request }: Route.ActionArgs) {
  const t = await i18next.getFixedT(request);
  const forgotPasswordSchema = createForgotPasswordSchema(t);
  const formData = await request.formData();
  const result = forgotPasswordSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return data(
      { fieldErrors: result.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const [client] = makeServerClient(request);
  const { error } = await client.auth.resetPasswordForEmail(result.data.email);

  if (error) {
    return data({ error: error.message }, { status: 400 });
  }

  return { success: true };
}

export default function ForgotPassword({ actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (actionData && "success" in actionData && actionData.success) {
      formRef.current?.reset();
      formRef.current?.blur();
    }
  }, [actionData]);

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-2xl font-semibold">
            {t("forgotPassword.title")}
          </CardTitle>
          <CardDescription className="text-center text-base">
            {t("forgotPassword.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form
            className="flex w-full flex-col gap-5"
            method="post"
            ref={formRef}
          >
            <div className="flex flex-col items-start space-y-2">
              <Label htmlFor="email" className="flex flex-col items-start gap-1">
                {t("common.labels.email")}
              </Label>
              <Input
                id="email"
                name="email"
                required
                type="email"
                placeholder={t("forgotPassword.emailPlaceholder")}
              />
              {actionData &&
              "fieldErrors" in actionData &&
              actionData.fieldErrors.email ? (
                <FormErrors errors={actionData.fieldErrors.email} />
              ) : null}
            </div>
            <FormButton
              label={t("forgotPassword.sendResetLink")}
              className="w-full"
            />
            {actionData && "error" in actionData && actionData.error ? (
              <FormErrors errors={[actionData.error]} />
            ) : null}
            {actionData && "success" in actionData && actionData.success ? (
              <FormSuccess message={t("forgotPassword.successMessage")} />
            ) : null}
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
