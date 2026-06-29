/**
 * Social Authentication Complete Screen
 */
import type { Route } from "./+types/complete";

import { data, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import i18next from "~/core/lib/i18next.server";
import makeServerClient from "~/core/lib/supa-client.server";

const searchParamsSchema = z.object({
  code: z.string(),
});

const errorSchema = z.object({
  error: z.string(),
  error_code: z.string(),
  error_description: z.string(),
});

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  const { searchParams } = new URL(request.url);

  const { success, data: validData } = searchParamsSchema.safeParse(
    Object.fromEntries(searchParams),
  );

  const meta = {
    title: `${t("confirm.meta.title")} | ${import.meta.env.VITE_APP_NAME}`,
  };

  if (!success) {
    const { data: errorData, success: errorSuccess } = errorSchema.safeParse(
      Object.fromEntries(searchParams),
    );

    if (!errorSuccess) {
      return data(
        { error: t("auth.validation.invalidCode"), meta },
        { status: 400 },
      );
    }

    return data({ error: errorData.error_description, meta }, { status: 400 });
  }

  const [client, headers] = makeServerClient(request);

  const { error } = await client.auth.exchangeCodeForSession(validData.code);

  if (error) {
    return data({ error: error.message, meta }, { status: 400 });
  }

  return redirect("/dashboard", { headers });
}

export const meta: Route.MetaFunction = ({ data }) => {
  return [{ title: data?.meta?.title ?? "Confirm" }];
};

export default function Confirm({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center gap-2.5">
      <h1 className="text-2xl font-semibold">
        {t("auth.social.loginFailedTitle")}
      </h1>
      <p className="text-muted-foreground">{loaderData.error}</p>
    </div>
  );
}
