/**
 * One-Time Password (OTP) Authentication Start Screen
 */
import type { Route } from "./+types/start";

import { Form, data, redirect } from "react-router";
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
      title: `${t("otp.meta.title")} | ${import.meta.env.VITE_APP_NAME}`,
    },
  };
}

export const meta: Route.MetaFunction = ({ data }) => {
  return [{ title: data?.meta.title ?? "OTP Login" }];
};

function createOtpStartSchema(t: Awaited<ReturnType<typeof i18next.getFixedT>>) {
  return z.object({
    email: z.string().email({ message: t("auth.validation.invalidEmail") }),
  });
}

export async function action({ request }: Route.ActionArgs) {
  const t = await i18next.getFixedT(request);
  const otpStartSchema = createOtpStartSchema(t);
  const formData = await request.formData();
  const { success, data: validData } = otpStartSchema.safeParse(
    Object.fromEntries(formData),
  );

  if (!success) {
    return data({ error: t("auth.validation.invalidEmail") }, { status: 400 });
  }

  const [client] = makeServerClient(request);
  const { error } = await client.auth.signInWithOtp({
    email: validData.email,
    options: {
      shouldCreateUser: false,
    },
  });

  if (error) {
    return data({ error: error.message }, { status: 400 });
  }

  return redirect(`/auth/otp/complete?email=${validData.email}`);
}

export default function OtpStart({ actionData }: Route.ComponentProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-2xl font-semibold">
            {t("otp.start.title")}
          </CardTitle>
          <CardDescription className="text-center text-base">
            {t("otp.start.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form className="flex w-full flex-col gap-4" method="post">
            <div className="flex flex-col items-start space-y-2">
              <Label htmlFor="email" className="flex flex-col items-start gap-1">
                {t("common.labels.email")}
              </Label>
              <Input
                id="email"
                name="email"
                required
                type="email"
                placeholder={t("otp.start.emailPlaceholder")}
              />
            </div>
            <FormButton label={t("otp.start.sendButton")} className="w-full" />
            {actionData && "error" in actionData && actionData.error ? (
              <FormErrors errors={[actionData.error]} />
            ) : null}
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
