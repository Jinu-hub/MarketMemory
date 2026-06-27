/**
 * Social Authentication Start Screen
 */
import type { Route } from "./+types/start";

import { data, redirect } from "react-router";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import i18next from "~/core/lib/i18next.server";
import makeServerClient from "~/core/lib/supa-client.server";

const paramsSchema = z.object({
  provider: z.enum(["github", "kakao"]),
});

export async function loader({ params, request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  const { error, success, data: parsedParams } = paramsSchema.safeParse(params);

  if (!success) {
    return data(
      {
        error: t("auth.validation.invalidProvider"),
        meta: {
          title: `${t("confirm.meta.title")} | ${import.meta.env.VITE_APP_NAME}`,
        },
      },
      { status: 400 },
    );
  }

  const [client, headers] = makeServerClient(request);

  const { data: signInData, error: signInError } =
    await client.auth.signInWithOAuth({
      provider: parsedParams.provider,
      options: {
        redirectTo: `${process.env.SITE_URL}/auth/social/complete/${parsedParams.provider}`,
      },
    });

  if (signInError) {
    return data(
      {
        error: signInError.message,
        meta: {
          title: `${t("confirm.meta.title")} | ${import.meta.env.VITE_APP_NAME}`,
        },
      },
      { status: 400 },
    );
  }

  return redirect(signInData.url, { headers });
}

export const meta: Route.MetaFunction = ({ data }) => {
  return [{ title: data?.meta?.title ?? "Confirm" }];
};

export default function StartSocialLogin({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { error } = loaderData;

  return (
    <div className="flex flex-col items-center justify-center gap-2.5">
      <h1 className="text-2xl font-semibold">{error}</h1>
      <p className="text-muted-foreground">{t("auth.pleaseTryAgain")}</p>
    </div>
  );
}
