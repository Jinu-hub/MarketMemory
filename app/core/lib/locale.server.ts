import i18next from "~/core/lib/i18next.server";
import adminClient from "~/core/lib/supa-admin-client.server";
import { supportedLngs } from "~/i18n";

export type SupportedLocale = (typeof supportedLngs)[number];

export function normalizeLocale(
  locale: string | null | undefined,
): SupportedLocale {
  return supportedLngs.includes(locale as SupportedLocale)
    ? (locale as SupportedLocale)
    : "ko";
}

export async function getRequestLocale(
  request: Request,
): Promise<SupportedLocale> {
  const locale = await i18next.getLocale(request);
  return normalizeLocale(locale);
}

export async function updateProfileLocale(
  profileId: string,
  locale: SupportedLocale,
) {
  const { error } = await adminClient
    .from("profiles")
    .update({ locale })
    .eq("profile_id", profileId);

  if (error) {
    throw error;
  }
}
