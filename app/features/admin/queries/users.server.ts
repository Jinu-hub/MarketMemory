import type { User } from "@supabase/supabase-js";
import type { Database } from "database.types";

import adminClient from "~/core/lib/supa-admin-client.server";

export type AdminUserListRow = Database["public"]["Tables"]["profiles"]["Row"] & {
  email: string | null;
  last_sign_in_at: string | null;
  providers: string[];
};

type AuthUserMeta = {
  email: string | null;
  last_sign_in_at: string | null;
  providers: string[];
};

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function extractProviders(user: User): string[] {
  const fromIdentities = (user.identities ?? []).map((identity) => identity.provider);

  const appMetadata = user.app_metadata as Record<string, unknown> | undefined;
  const fromAppMetadataProviders = readStringArray(appMetadata?.providers);
  const fromAppMetadataProvider =
    typeof appMetadata?.provider === "string" ? [appMetadata.provider] : [];

  // Admin listUsers raw payload may expose providers at the root level.
  const fromRootProviders = readStringArray(
    (user as User & { providers?: unknown }).providers,
  );

  return [
    ...new Set([
      ...fromIdentities,
      ...fromAppMetadataProviders,
      ...fromAppMetadataProvider,
      ...fromRootProviders,
    ]),
  ].sort();
}

function extractAuthUserMeta(user: User): AuthUserMeta {
  return {
    email: user.email ?? null,
    last_sign_in_at: user.last_sign_in_at ?? null,
    providers: extractProviders(user),
  };
}

export async function listProfilesForAdmin() {
  const { data: profiles, error } = await adminClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error };
  }

  const { data: authData, error: authError } =
    await adminClient.auth.admin.listUsers({ perPage: 1000 });

  if (authError) {
    return { data: null, error: authError };
  }

  const authById = new Map(
    authData.users.map((user) => [user.id, extractAuthUserMeta(user)]),
  );

  const rows: AdminUserListRow[] = (profiles ?? []).map((profile) => {
    const auth = authById.get(profile.profile_id);
    return {
      ...profile,
      email: auth?.email ?? null,
      last_sign_in_at: auth?.last_sign_in_at ?? null,
      providers: auth?.providers ?? [],
    };
  });

  return { data: rows, error: null };
}
