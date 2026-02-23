DROP POLICY "ojp_select" ON "ocr_job_pages" CASCADE;--> statement-breakpoint
DROP POLICY "ojp_insert" ON "ocr_job_pages" CASCADE;--> statement-breakpoint
DROP POLICY "ojp_update" ON "ocr_job_pages" CASCADE;--> statement-breakpoint
DROP POLICY "ojp_delete" ON "ocr_job_pages" CASCADE;--> statement-breakpoint
DROP TABLE "ocr_job_pages" CASCADE;--> statement-breakpoint
DROP POLICY "oj_select" ON "ocr_jobs" CASCADE;--> statement-breakpoint
DROP POLICY "oj_insert" ON "ocr_jobs" CASCADE;--> statement-breakpoint
DROP POLICY "oj_update" ON "ocr_jobs" CASCADE;--> statement-breakpoint
DROP POLICY "oj_delete" ON "ocr_jobs" CASCADE;--> statement-breakpoint
DROP TABLE "ocr_jobs" CASCADE;--> statement-breakpoint
DROP TYPE "public"."ocr_job_status";