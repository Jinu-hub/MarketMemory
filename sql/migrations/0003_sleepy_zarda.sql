CREATE TYPE "public"."ocr_job_status" AS ENUM('queued', 'running', 'success', 'failed', 'partial');--> statement-breakpoint
CREATE TABLE "normalized_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_code" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"file_name" text,
	"page_count" integer,
	"root_block_count" integer,
	"item_count" integer,
	"table_count" integer,
	"md_body" text NOT NULL,
	"warnings" text[] DEFAULT '{}'::text[],
	"stats" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "normalized_documents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ocr_job_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_code" text NOT NULL,
	"page_no" integer NOT NULL,
	"file_name" text,
	"text" text,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ocr_job_pages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ocr_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_code" text NOT NULL,
	"source_type" text DEFAULT 'pdf' NOT NULL,
	"source_name" text NOT NULL,
	"source_url" text,
	"status" "ocr_job_status" DEFAULT 'queued' NOT NULL,
	"page_total" integer,
	"merged_text_raw" text,
	"merged_text_clean" text,
	"extraction_notes" jsonb,
	"last_error" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ocr_jobs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE UNIQUE INDEX "normalized_documents_job_code_version_unique" ON "normalized_documents" USING btree ("job_code","version");--> statement-breakpoint
CREATE INDEX "idx_normalized_documents_job_code" ON "normalized_documents" USING btree ("job_code");--> statement-breakpoint
CREATE INDEX "idx_normalized_documents_created_at" ON "normalized_documents" USING btree ("created_at" desc);--> statement-breakpoint
CREATE UNIQUE INDEX "ocr_job_pages_unique" ON "ocr_job_pages" USING btree ("job_code","page_no");--> statement-breakpoint
CREATE INDEX "idx_ocr_job_pages_job_code_page_no" ON "ocr_job_pages" USING btree ("job_code","page_no");--> statement-breakpoint
CREATE INDEX "idx_ocr_job_pages_created_at" ON "ocr_job_pages" USING btree ("created_at" desc);--> statement-breakpoint
CREATE UNIQUE INDEX "ocr_jobs_job_code_unique" ON "ocr_jobs" USING btree ("job_code");--> statement-breakpoint
CREATE INDEX "idx_ocr_jobs_created_at" ON "ocr_jobs" USING btree ("created_at" desc);--> statement-breakpoint
CREATE POLICY "nd_select" ON "normalized_documents" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "nd_insert" ON "normalized_documents" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "nd_update" ON "normalized_documents" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "nd_delete" ON "normalized_documents" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ojp_select" ON "ocr_job_pages" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ojp_insert" ON "ocr_job_pages" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ojp_update" ON "ocr_job_pages" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ojp_delete" ON "ocr_job_pages" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "oj_select" ON "ocr_jobs" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "oj_insert" ON "ocr_jobs" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "oj_update" ON "ocr_jobs" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "oj_delete" ON "ocr_jobs" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));