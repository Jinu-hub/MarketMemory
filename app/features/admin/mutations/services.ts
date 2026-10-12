import type { AdminDb } from "./types";

export async function createService(
  client: AdminDb,
  values: {
    service_key: string;
    display_name: string | null;
  },
) {
  return client.from("services").insert(values);
}

export async function updateServiceDisplayName(
  client: AdminDb,
  values: {
    service_key: string;
    display_name: string | null;
  },
) {
  return client
    .from("services")
    .update({ display_name: values.display_name })
    .eq("service_key", values.service_key);
}

export async function deleteServiceByKey(client: AdminDb, serviceKey: string) {
  return client.from("services").delete().eq("service_key", serviceKey);
}
