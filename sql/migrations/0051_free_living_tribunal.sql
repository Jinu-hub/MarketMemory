CREATE TABLE "collection_presets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"source" "observation_source" NOT NULL,
	"keywords" text[] DEFAULT '{}' NOT NULL,
	"content_type" text DEFAULT 'all' NOT NULL,
	"sort_mode" text DEFAULT 'relevance' NOT NULL,
	"time_range" text DEFAULT 'all' NOT NULL,
	"requested_limit" integer DEFAULT 50 NOT NULL,
	"observation_strategy" jsonb,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "collection_presets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "idx_collection_presets_updated_at" ON "collection_presets" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "idx_collection_presets_last_used_at" ON "collection_presets" USING btree ("last_used_at");--> statement-breakpoint
CREATE POLICY "cp_select" ON "collection_presets" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "cp_insert" ON "collection_presets" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "cp_update" ON "collection_presets" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "cp_delete" ON "collection_presets" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));