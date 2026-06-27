/**
 * New Password Screen Component
 */
import type { Route } from "./+types/new-password";

import { CheckCircle2Icon } from "lucide-react";
import { useEffect, useRef } from "react";
import { redirect } from "react-router";
import { Form, data } from "react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import FormButton from "~/core/components/form-button";
import FormErrors from "~/core/components/form-error";
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
      title: `${t("newPassword.meta.title")} | ${import.meta.env.VITE_APP_NAME}`,
    },
  };
}

export const meta: Route.MetaFunction = ({ data }) => {
  return [{ title: data?.meta.title ?? "Update password" }];
};

function createUpdatePasswordSchema(
  t: Awaited<ReturnType<typeof i18next.getFixedT>>,
) {
  return z
    .object({
      password: z.string().min(8, {
        message: t("auth.validation.passwordMinLength"),
      }),
      confirmPassword: z.string().min(8, {
        message: t("auth.validation.passwordMinLength"),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.validation.passwordsMustMatch"),
      path: ["confirmPassword"],
    });
}

export async function action({ request }: Route.ActionArgs) {
  const t = await i18next.getFixedT(request);
  const updatePasswordSchema = createUpdatePasswordSchema(t);
  const [client] = makeServerClient(request);
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return redirect("/auth/forgot-password");
  }

  const formData = await request.formData();
  const {
    success,
    data: validData,
    error,
  } = updatePasswordSchema.safeParse(Object.fromEntries(formData));

  if (!success) {
    return data({ fieldErrors: error.flatten().fieldErrors }, { status: 400 });
  }

  const { error: updateError } = await client.auth.updateUser({
    password: validData.password,
  });

  if (updateError) {
    return data({ error: updateError.message }, { status: 400 });
  }

  return {
    success: true,
  };
}

export default function ChangePassword({ actionData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (actionData && "success" in actionData && actionData.success) {
      formRef.current?.reset();
      formRef.current?.blur();
      formRef.current?.querySelectorAll("input")?.forEach((input) => {
        input.blur();
      });
    }
  }, [actionData]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-2xl font-semibold">
            {t("newPassword.title")}
          </CardTitle>
          <CardDescription className="text-center text-base">
            {t("newPassword.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form
            className="flex w-full flex-col gap-4"
            method="post"
            ref={formRef}
          >
            <div className="flex flex-col items-start space-y-2">
              <Label
                htmlFor="password"
                className="flex flex-col items-start gap-1"
              >
                {t("common.labels.password")}
              </Label>
              <Input
                id="password"
                name="password"
                required
                type="password"
                placeholder={t("newPassword.passwordPlaceholder")}
              />
              {actionData &&
              "fieldErrors" in actionData &&
              actionData.fieldErrors.password ? (
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
                placeholder={t("newPassword.confirmPasswordPlaceholder")}
              />
              {actionData &&
              "fieldErrors" in actionData &&
              actionData.fieldErrors.confirmPassword ? (
                <FormErrors errors={actionData.fieldErrors.confirmPassword} />
              ) : null}
            </div>
            <FormButton label={t("newPassword.updateButton")} />
            {actionData && "error" in actionData && actionData.error ? (
              <FormErrors errors={[actionData.error]} />
            ) : null}
            {actionData && "success" in actionData && actionData.success ? (
              <div className="flex items-center justify-center gap-2 text-sm text-green-500">
                <CheckCircle2Icon className="size-4" />
                <p>{t("newPassword.successMessage")}</p>
              </div>
            ) : null}
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
