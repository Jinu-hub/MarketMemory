/**
 * Email Confirmation Screen
 */
import type { Route } from "./+types/confirm";

import { data, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import i18next from "~/core/lib/i18next.server";
import makeServerClient from "~/core/lib/supa-client.server";

const searchParamsSchema = z.object({
  token_hash: z.string(),
  type: z.enum(["email", "recovery", "email_change"]),
  next: z.string().default("/"),
});

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  const { searchParams } = new URL(request.url);

  const { success, data: validData } = searchParamsSchema.safeParse(
    Object.fromEntries(searchParams),
  );

  if (!success) {
    return data(
      {
        error: t("auth.validation.invalidConfirmationCode"),
        meta: {
          title: `${t("confirm.meta.title")} | ${import.meta.env.VITE_APP_NAME}`,
        },
      },
      { status: 400 },
    );
  }

  const [client, headers] = makeServerClient(request);

  const { error, data: verifyOtpData } = await client.auth.verifyOtp({
    ...validData,
  });

  if (error) {
    return data(
      {
        error: error.message,
        meta: {
          title: `${t("confirm.meta.title")} | ${import.meta.env.VITE_APP_NAME}`,
        },
      },
      { status: 400 },
    );
  }

  if (validData.type === "email_change") {
    return redirect(
      // @ts-ignore - Supabase returns a message in the user object for email changes
      `${validData.next}?message=${encodeURIComponent(verifyOtpData.user.msg ?? t("auth.confirm.emailUpdated"))}`,
      { headers },
    );
  }

  return redirect(validData.next, { headers });
}

export const meta: Route.MetaFunction = ({ data }) => {
  return [{ title: data?.meta?.title ?? "Confirm" }];
};

export default function Confirm({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center gap-2.5">
      <h1 className="text-2xl font-semibold">
        {t("auth.confirm.failedTitle")}
      </h1>
      <p className="text-muted-foreground">{loaderData.error}</p>
    </div>
  );
}
