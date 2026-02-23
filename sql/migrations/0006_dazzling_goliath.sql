CREATE TYPE "public"."ocr_job_status" AS ENUM('queued', 'running', 'success', 'failed', 'partial');--> statement-breakpoint
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
	"job_code" text PRIMARY KEY NOT NULL,
	"source_name" text NOT NULL,
	"source_url" text,
	"status" "ocr_job_status" DEFAULT 'queued' NOT NULL,
	"page_total" integer,
	"merged_text" text,
	"last_error" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ocr_jobs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "ocr_job_pages" ADD CONSTRAINT "ocr_job_pages_job_code_ocr_jobs_job_code_fk" FOREIGN KEY ("job_code") REFERENCES "public"."ocr_jobs"("job_code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ocr_job_pages_unique" ON "ocr_job_pages" USING btree ("job_code","page_no");--> statement-breakpoint
CREATE INDEX "idx_ocr_job_pages_job_code_page_no" ON "ocr_job_pages" USING btree ("job_code","page_no");--> statement-breakpoint
CREATE INDEX "idx_ocr_job_pages_created_at" ON "ocr_job_pages" USING btree ("created_at" desc);--> statement-breakpoint
CREATE INDEX "idx_ocr_jobs_job_code" ON "ocr_jobs" USING btree ("job_code");--> statement-breakpoint
CREATE INDEX "idx_ocr_jobs_created_at" ON "ocr_jobs" USING btree ("created_at" desc);--> statement-breakpoint
CREATE POLICY "ojp_select" ON "ocr_job_pages" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ojp_insert" ON "ocr_job_pages" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ojp_update" ON "ocr_job_pages" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ojp_delete" ON "ocr_job_pages" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "oj_select" ON "ocr_jobs" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "oj_insert" ON "ocr_jobs" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "oj_update" ON "ocr_jobs" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "oj_delete" ON "ocr_jobs" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));