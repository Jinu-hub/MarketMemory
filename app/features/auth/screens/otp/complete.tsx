/**
 * One-Time Password (OTP) Authentication Complete Screen
 */
import type { Route } from "./+types/complete";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRef } from "react";
import { Form, data, redirect, useSubmit } from "react-router";
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
import { InputOTPSeparator } from "~/core/components/ui/input-otp";
import { InputOTPGroup } from "~/core/components/ui/input-otp";
import { InputOTPSlot } from "~/core/components/ui/input-otp";
import { InputOTP } from "~/core/components/ui/input-otp";
import i18next from "~/core/lib/i18next.server";
import makeServerClient from "~/core/lib/supa-client.server";

const paramsSchema = z.object({
  email: z.string().email(),
});

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  const url = new URL(request.url);
  const { success, data: validData } = paramsSchema.safeParse(
    Object.fromEntries(url.searchParams),
  );

  if (!success) {
    return redirect("/auth/otp/start");
  }

  return {
    email: validData.email,
    meta: {
      title: `${t("otp.meta.title")} | ${import.meta.env.VITE_APP_NAME}`,
    },
  };
}

export const meta: Route.MetaFunction = ({ data }) => {
  return [{ title: data?.meta?.title ?? "OTP Login" }];
};

export async function action({ request }: Route.ActionArgs) {
  const t = await i18next.getFixedT(request);
  const otpCompleteSchema = z.object({
    email: z.string().email(),
    code: z.string().length(6),
  });

  const formData = await request.formData();
  const { success, data: validData } = otpCompleteSchema.safeParse(
    Object.fromEntries(formData),
  );

  if (!success) {
    return data(
      { error: t("auth.validation.verifyCodeFailed") },
      { status: 400 },
    );
  }

  const [client, headers] = makeServerClient(request);

  const { error } = await client.auth.verifyOtp({
    email: validData.email,
    token: validData.code,
    type: "email",
  });

  if (error) {
    return data({ error: error.message }, { status: 400 });
  }

  return redirect(`/`, { headers });
}

export default function OtpComplete({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const submit = useSubmit();

  const handleComplete = () => {
    submit(formRef.current);
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center">
          <CardTitle className="text-2xl font-semibold">
            {t("otp.complete.title")}
          </CardTitle>
          <CardDescription className="text-center text-base">
            {t("otp.complete.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form
            className="flex w-full flex-col items-center gap-4"
            method="post"
            ref={formRef}
          >
            <Input
              id="email"
              name="email"
              hidden
              required
              type="email"
              defaultValue={loaderData.email}
              placeholder={t("otp.start.emailPlaceholder")}
            />

            <InputOTP
              name="code"
              required
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              onComplete={handleComplete}
            >
              <InputOTPGroup className="*:p-6 *:text-lg">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup className="*:p-6 *:text-lg">
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <FormButton
              label={t("otp.complete.submitButton")}
              className="w-full"
            />
            {actionData && "error" in actionData && actionData.error ? (
              <FormErrors errors={[actionData.error]} />
            ) : null}
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
