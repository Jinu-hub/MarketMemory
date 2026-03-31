CREATE TABLE "item_content_cores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_content_id" uuid NOT NULL,
	"core_lang" text DEFAULT 'en' NOT NULL,
	"core_type" text NOT NULL,
	"core_data" jsonb NOT NULL,
	"pipeline_info" jsonb,
	"input_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "item_content_cores" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "item_content_i18n" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_content_id" uuid NOT NULL,
	"core_id" uuid,
	"lang_code" text NOT NULL,
	"title" text,
	"summary" text,
	"content" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"status" text,
	"pipeline_info" jsonb,
	"input_hash" text,
	"tracking" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "item_content_i18n" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reports_i18n" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"lang_code" text NOT NULL,
	"title" text NOT NULL,
	"summary_short" text,
	"content_md" text NOT NULL,
	"html_body" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"status" text,
	"pipeline_info" jsonb,
	"input_hash" text,
	"tracking" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reports_i18n" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "item_content_cores" ADD CONSTRAINT "item_content_cores_item_content_id_item_contents_id_fk" FOREIGN KEY ("item_content_id") REFERENCES "public"."item_contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_content_i18n" ADD CONSTRAINT "item_content_i18n_item_content_id_item_contents_id_fk" FOREIGN KEY ("item_content_id") REFERENCES "public"."item_contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_content_i18n" ADD CONSTRAINT "item_content_i18n_core_id_item_content_cores_id_fk" FOREIGN KEY ("core_id") REFERENCES "public"."item_content_cores"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports_i18n" ADD CONSTRAINT "reports_i18n_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_item_content_cores_item_content_id" ON "item_content_cores" USING btree ("item_content_id");--> statement-breakpoint
CREATE INDEX "idx_item_content_cores_core_lang" ON "item_content_cores" USING btree ("core_lang");--> statement-breakpoint
CREATE INDEX "idx_item_content_cores_core_type" ON "item_content_cores" USING btree ("core_type");--> statement-breakpoint
CREATE INDEX "idx_item_content_cores_created_at" ON "item_content_cores" USING btree ("created_at" desc);--> statement-breakpoint
CREATE INDEX "idx_item_content_i18n_item_content_id" ON "item_content_i18n" USING btree ("item_content_id");--> statement-breakpoint
CREATE INDEX "idx_item_content_i18n_core_id" ON "item_content_i18n" USING btree ("core_id");--> statement-breakpoint
CREATE INDEX "idx_item_content_i18n_lang_code" ON "item_content_i18n" USING btree ("lang_code");--> statement-breakpoint
CREATE INDEX "idx_item_content_i18n_created_at" ON "item_content_i18n" USING btree ("created_at" desc);--> statement-breakpoint
CREATE INDEX "idx_item_content_i18n_is_public" ON "item_content_i18n" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "idx_item_content_i18n_status" ON "item_content_i18n" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_reports_i18n_report_lang" ON "reports_i18n" USING btree ("report_id","lang_code");--> statement-breakpoint
CREATE INDEX "idx_reports_i18n_report_id" ON "reports_i18n" USING btree ("report_id");--> statement-breakpoint
CREATE INDEX "idx_reports_i18n_lang_code" ON "reports_i18n" USING btree ("lang_code");--> statement-breakpoint
CREATE INDEX "idx_reports_i18n_created_at" ON "reports_i18n" USING btree ("created_at" desc);--> statement-breakpoint
CREATE INDEX "idx_reports_i18n_is_public" ON "reports_i18n" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "idx_reports_i18n_status" ON "reports_i18n" USING btree ("status");--> statement-breakpoint
CREATE POLICY "icc_select" ON "item_content_cores" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "icc_insert" ON "item_content_cores" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "icc_update" ON "item_content_cores" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "icc_delete" ON "item_content_cores" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ici_select" ON "item_content_i18n" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ici_insert" ON "item_content_i18n" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ici_update" ON "item_content_i18n" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ici_delete" ON "item_content_i18n" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ri18n_select" ON "reports_i18n" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ri18n_insert" ON "reports_i18n" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ri18n_update" ON "reports_i18n" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ri18n_delete" ON "reports_i18n" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));