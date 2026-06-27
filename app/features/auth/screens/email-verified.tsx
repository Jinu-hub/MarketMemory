import type { Route } from "./+types/email-verified";

import { useSearchParams } from "react-router";
import { useTranslation } from "react-i18next";

import i18next from "~/core/lib/i18next.server";

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  return {
    meta: {
      title: `${t("emailVerified.meta.title")} | ${import.meta.env.VITE_APP_NAME}`,
    },
  };
}

export const meta: Route.MetaFunction = ({ data }) => {
  return [{ title: data?.meta.title ?? "Email Verification" }];
};

export default function ChangeEmail() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const message = searchParams.get("message");

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-semibold">{t("emailVerified.title")}</h1>
      <p className="text-muted-foreground">
        {decodeURIComponent(message ?? t("auth.confirm.emailUpdated"))}.
      </p>
    </div>
  );
}
