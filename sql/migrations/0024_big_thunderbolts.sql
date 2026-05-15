CREATE TABLE "daily_market_memories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_date" date NOT NULL,
	"market_scope" text NOT NULL,
	"coverage_start_at" timestamp with time zone,
	"coverage_end_at" timestamp with time zone,
	"generation_timezone" text DEFAULT 'Asia/Tokyo' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finalized_at" timestamp with time zone,
	"source_report_count" integer DEFAULT 0 NOT NULL,
	"core_lang_code" text DEFAULT 'en' NOT NULL,
	"market_snapshot" jsonb,
	"top_tags" jsonb,
	"top_entities" jsonb,
	"risk_signals" jsonb,
	"input_context" jsonb,
	"model_info" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_market_memories" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "daily_market_memory_i18n" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"daily_market_memory_id" uuid NOT NULL,
	"lang_code" text NOT NULL,
	"display_title" text,
	"display_subtitle" text,
	"core_summary" text,
	"top_themes" jsonb,
	"market_mood_type" text,
	"market_mood_label" text,
	"market_mood_summary" text,
	"localization_status" text DEFAULT 'draft' NOT NULL,
	"source_lang_code" text,
	"model_info" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_market_memory_i18n" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "daily_market_memory_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"daily_market_memory_id" uuid NOT NULL,
	"item_content_id" uuid NOT NULL,
	"market_memory_item_id" uuid,
	"report_title_snapshot" text,
	"report_type" text,
	"lang_code" text,
	"source_weight" numeric(8, 4),
	"inclusion_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_market_memory_sources" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "daily_market_memory_i18n" ADD CONSTRAINT "daily_market_memory_i18n_daily_market_memory_id_daily_market_memories_id_fk" FOREIGN KEY ("daily_market_memory_id") REFERENCES "public"."daily_market_memories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_market_memory_sources" ADD CONSTRAINT "daily_market_memory_sources_daily_market_memory_id_daily_market_memories_id_fk" FOREIGN KEY ("daily_market_memory_id") REFERENCES "public"."daily_market_memories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_market_memory_sources" ADD CONSTRAINT "daily_market_memory_sources_item_content_id_item_contents_id_fk" FOREIGN KEY ("item_content_id") REFERENCES "public"."item_contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_market_memory_sources" ADD CONSTRAINT "daily_market_memory_sources_market_memory_item_id_market_memory_items_id_fk" FOREIGN KEY ("market_memory_item_id") REFERENCES "public"."market_memory_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "dmm_one_final_per_date_scope" ON "daily_market_memories" USING btree ("market_date","market_scope") WHERE "daily_market_memories"."status" = 'final';--> statement-breakpoint
CREATE INDEX "idx_dmm_scope_status_generated" ON "daily_market_memories" USING btree ("market_scope","status","generated_at" desc);--> statement-breakpoint
CREATE INDEX "idx_dmm_market_date" ON "daily_market_memories" USING btree ("market_date" desc);--> statement-breakpoint
CREATE UNIQUE INDEX "dmm_i18n_memory_lang_unique" ON "daily_market_memory_i18n" USING btree ("daily_market_memory_id","lang_code");--> statement-breakpoint
CREATE INDEX "idx_dmm_i18n_memory_id" ON "daily_market_memory_i18n" USING btree ("daily_market_memory_id");--> statement-breakpoint
CREATE INDEX "idx_dmm_i18n_lang_code" ON "daily_market_memory_i18n" USING btree ("lang_code");--> statement-breakpoint
CREATE UNIQUE INDEX "dms_memory_content_unique" ON "daily_market_memory_sources" USING btree ("daily_market_memory_id","item_content_id");--> statement-breakpoint
CREATE INDEX "idx_dms_memory_id" ON "daily_market_memory_sources" USING btree ("daily_market_memory_id");--> statement-breakpoint
CREATE INDEX "idx_dms_item_content_id" ON "daily_market_memory_sources" USING btree ("item_content_id");--> statement-breakpoint
CREATE INDEX "idx_dms_market_memory_item_id" ON "daily_market_memory_sources" USING btree ("market_memory_item_id");--> statement-breakpoint
CREATE POLICY "dmm_select" ON "daily_market_memories" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dmm_insert" ON "daily_market_memories" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dmm_update" ON "daily_market_memories" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dmm_delete" ON "daily_market_memories" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dmm_i18n_select" ON "daily_market_memory_i18n" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dmm_i18n_insert" ON "daily_market_memory_i18n" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dmm_i18n_update" ON "daily_market_memory_i18n" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dmm_i18n_delete" ON "daily_market_memory_i18n" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dms_select" ON "daily_market_memory_sources" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dms_insert" ON "daily_market_memory_sources" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dms_update" ON "daily_market_memory_sources" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dms_delete" ON "daily_market_memory_sources" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));