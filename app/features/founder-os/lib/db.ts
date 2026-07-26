import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "database.types";

type FounderOsTables = Database["public"]["Tables"];

export type CollectionRunRow = FounderOsTables["collection_runs"]["Row"];
export type CollectionRunInsert = FounderOsTables["collection_runs"]["Insert"];
export type ObservationRow = FounderOsTables["observations"]["Row"];
export type ObservationInsert = FounderOsTables["observations"]["Insert"];

export type FounderOsDb = SupabaseClient<Database>;
