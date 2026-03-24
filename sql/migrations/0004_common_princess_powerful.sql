CREATE TYPE "public"."category" AS ENUM('foundation', 'issue', 'research', 'market', 'trend', 'deep_dive', 'column', 'narrative_analysis', 'review', 'watchlist');--> statement-breakpoint
CREATE TYPE "public"."content_type" AS ENUM('summary', 'md_summary', 'source_text');--> statement-breakpoint
CREATE TYPE "public"."item_status" AS ENUM('ready', 'running', 'done', 'failed');--> statement-breakpoint
CREATE TYPE "public"."prompt_status" AS ENUM('draft', 'active', 'deprecated');--> statement-breakpoint
CREATE TYPE "public"."region" AS ENUM('AFRICA', 'AMERICAS', 'ANZ', 'APAC', 'ASIA', 'BENELUX', 'CARIBBEAN', 'CEE', 'CENTRAL_AMERICA', 'CENTRAL_ASIA', 'DACH', 'EAST_ASIA', 'EASTERN_EUROPE', 'EMEA', 'EUROPE', 'GCC', 'GLOBAL', 'LATAM', 'MENA', 'MIDDLE_EAST', 'NORTH_AFRICA', 'NORTH_AMERICA', 'NORDICS', 'OCEANIA', 'SEA', 'SOUTH_ASIA', 'SUB_SAHARAN_AFRICA', 'UK_AND_IRELAND', 'UNKNOWN', 'WESTERN_EUROPE');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('digest-report', 'full-report', 'analysis-report', 'briefing-report', 'baseline-report');--> statement-breakpoint
CREATE TYPE "public"."tag_source" AS ENUM('ai', 'manual');--> statement-breakpoint
CREATE TABLE "item_contents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"prompt_id" uuid,
	"is_active" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"report_type" "report_type",
	"summary_short" text,
	"summary_md" text,
	"tags" text[],
	"metadata" jsonb,
	"category" text,
	"regions" "region"[],
	"countries" text[],
	"pipeline_info" jsonb,
	"confidence" jsonb,
	"input_hash" text,
	"tracking" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "item_contents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "item_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"lang_type" text DEFAULT 'en' NOT NULL,
	"content_type" "content_type" NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"model" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "item_embeddings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "item_tags" (
	"item_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	"source" "tag_source" NOT NULL,
	"confidence" numeric(5, 4),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "item_tags_item_id_tag_id_pk" PRIMARY KEY("item_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "item_tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "market_memory_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_code" text NOT NULL,
	"input_date" date,
	"source_lang" text,
	"topic" text,
	"detail" text,
	"notes" text,
	"status" "item_status" DEFAULT 'ready' NOT NULL,
	"current_content_id" uuid,
	"normalized_document_id" uuid,
	"ocr_job_id" uuid,
	"raw_log_link" text,
	"executed_date" timestamp with time zone,
	"executed_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "market_memory_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "prompt_releases" (
	"purpose" text PRIMARY KEY NOT NULL,
	"active_prompt_id" uuid NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prompt_releases" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "prompt_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"purpose" text NOT NULL,
	"status" "prompt_status" NOT NULL,
	"version" integer NOT NULL,
	"template" text NOT NULL,
	"output_schema" jsonb,
	"default_model" text,
	"default_params" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prompt_templates" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "report_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_id" uuid NOT NULL,
	"lang_type" text DEFAULT 'en' NOT NULL,
	"content_type" "content_type" NOT NULL,
	"embedding" vector(1536) NOT NULL,
	"model" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_embeddings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "report_items" (
	"report_id" uuid NOT NULL,
	"item_id" uuid NOT NULL,
	"refer_report_id" uuid,
	"ord" integer,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "report_items_report_id_item_id_pk" PRIMARY KEY("report_id","item_id")
);
--> statement-breakpoint
ALTER TABLE "report_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"md_body" text NOT NULL,
	"html_body" text,
	"summary" text,
	"category" "category",
	"regions" "region"[],
	"countries" text[],
	"tags" text[],
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "reports" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"display_name" text,
	"type" text,
	"aliases" text[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "vector_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" text,
	"metadata" jsonb,
	"embedding" vector(1536)
);
--> statement-breakpoint
ALTER TABLE "vector_documents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "item_contents" ADD CONSTRAINT "item_contents_item_id_market_memory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."market_memory_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_contents" ADD CONSTRAINT "item_contents_prompt_id_prompt_templates_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."prompt_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_embeddings" ADD CONSTRAINT "item_embeddings_item_id_market_memory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."market_memory_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_tags" ADD CONSTRAINT "item_tags_item_id_market_memory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."market_memory_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_tags" ADD CONSTRAINT "item_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_memory_items" ADD CONSTRAINT "market_memory_items_normalized_document_id_normalized_documents_id_fk" FOREIGN KEY ("normalized_document_id") REFERENCES "public"."normalized_documents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "market_memory_items" ADD CONSTRAINT "market_memory_items_ocr_job_id_ocr_jobs_id_fk" FOREIGN KEY ("ocr_job_id") REFERENCES "public"."ocr_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_releases" ADD CONSTRAINT "prompt_releases_active_prompt_id_prompt_templates_id_fk" FOREIGN KEY ("active_prompt_id") REFERENCES "public"."prompt_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_embeddings" ADD CONSTRAINT "report_embeddings_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_items" ADD CONSTRAINT "report_items_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_items" ADD CONSTRAINT "report_items_item_id_market_memory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."market_memory_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_items" ADD CONSTRAINT "report_items_refer_report_id_reports_id_fk" FOREIGN KEY ("refer_report_id") REFERENCES "public"."reports"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_item_contents_item_id_created_at" ON "item_contents" USING btree ("item_id","created_at" desc);--> statement-breakpoint
CREATE INDEX "idx_item_contents_prompt_id" ON "item_contents" USING btree ("prompt_id");--> statement-breakpoint
CREATE INDEX "idx_items_category" ON "item_contents" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_items_tags_gin" ON "item_contents" USING gin ("tags");--> statement-breakpoint
CREATE UNIQUE INDEX "item_contents_one_active_per_item" ON "item_contents" USING btree ("item_id") WHERE "item_contents"."is_active" = true;--> statement-breakpoint
CREATE UNIQUE INDEX "mmi_job_code_unique" ON "market_memory_items" USING btree ("job_code");--> statement-breakpoint
CREATE INDEX "idx_items_status" ON "market_memory_items" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_items_input_date" ON "market_memory_items" USING btree ("input_date" desc);--> statement-breakpoint
CREATE INDEX "idx_items_executed_id" ON "market_memory_items" USING btree ("executed_id");--> statement-breakpoint
CREATE INDEX "idx_prompt_templates_purpose_version" ON "prompt_templates" USING btree ("purpose","version" desc);--> statement-breakpoint
CREATE INDEX "idx_prompt_templates_status" ON "prompt_templates" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_reports_created_at" ON "reports" USING btree ("created_at" desc);--> statement-breakpoint
CREATE INDEX "idx_reports_tags_gin" ON "reports" USING gin ("tags");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_tags_slug_unique" ON "tags" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_tags_aliases_gin" ON "tags" USING gin ("aliases");--> statement-breakpoint
CREATE POLICY "ic_select" ON "item_contents" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ic_insert" ON "item_contents" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ic_update" ON "item_contents" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ic_delete" ON "item_contents" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ie_select" ON "item_embeddings" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ie_insert" ON "item_embeddings" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ie_update" ON "item_embeddings" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ie_delete" ON "item_embeddings" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "it_select" ON "item_tags" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "it_insert" ON "item_tags" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "it_update" ON "item_tags" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "it_delete" ON "item_tags" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "mmi_select" ON "market_memory_items" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "mmi_insert" ON "market_memory_items" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "mmi_update" ON "market_memory_items" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "mmi_delete" ON "market_memory_items" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "pr_select" ON "prompt_releases" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "pr_insert" ON "prompt_releases" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "pr_update" ON "prompt_releases" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "pr_delete" ON "prompt_releases" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "pt_select" ON "prompt_templates" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "pt_insert" ON "prompt_templates" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "pt_update" ON "prompt_templates" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "pt_delete" ON "prompt_templates" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "re_select" ON "report_embeddings" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "re_insert" ON "report_embeddings" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "re_update" ON "report_embeddings" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "re_delete" ON "report_embeddings" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ri_select" ON "report_items" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ri_insert" ON "report_items" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ri_update" ON "report_items" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ri_delete" ON "report_items" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "fr_select" ON "reports" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "fr_insert" ON "reports" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "fr_update" ON "reports" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "fr_delete" ON "reports" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "t_select" ON "tags" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "t_insert" ON "tags" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "t_update" ON "tags" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "t_delete" ON "tags" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "vd_select" ON "vector_documents" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "vd_insert" ON "vector_documents" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "vd_update" ON "vector_documents" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "vd_delete" ON "vector_documents" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));