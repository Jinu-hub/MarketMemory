import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

import { localeCookie } from "~/core/lib/i18next.server";
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

export async function getProfileLocale(
  client: SupabaseClient<Database>,
  profileId: string,
): Promise<SupportedLocale> {
  const { data, error } = await client
    .from("profiles")
    .select("locale")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return normalizeLocale(data?.locale);
}

export async function localeCookieHeader(
  locale: SupportedLocale,
): Promise<HeadersInit> {
  return {
    "Set-Cookie": await localeCookie.serialize(locale),
  };
}

export async function appendLocaleCookie(
  headers: Headers,
  locale: SupportedLocale,
): Promise<Headers> {
  const merged = new Headers(headers);
  merged.append("Set-Cookie", await localeCookie.serialize(locale));
  return merged;
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
