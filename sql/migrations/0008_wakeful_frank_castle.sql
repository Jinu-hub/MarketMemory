ALTER TABLE "market_memory_items" DROP COLUMN "source_links";--> statement-breakpoint
DROP INDEX "idx_ocr_jobs_job_code";--> statement-breakpoint
ALTER TABLE "ocr_jobs" DROP CONSTRAINT "ocr_jobs_pkey";--> statement-breakpoint
ALTER TABLE "market_memory_items" ADD COLUMN "job_code" text;--> statement-breakpoint
ALTER TABLE "ocr_jobs" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "ocr_jobs" ADD COLUMN "source_type" text NOT NULL DEFAULT 'pdf';--> statement-breakpoint
ALTER TABLE "market_memory_items" ADD COLUMN "ocr_job_id" uuid;--> statement-breakpoint
ALTER TABLE "market_memory_items" ADD CONSTRAINT "market_memory_items_ocr_job_id_ocr_jobs_id_fk" FOREIGN KEY ("ocr_job_id") REFERENCES "public"."ocr_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "mmi_job_code_unique" ON "market_memory_items" USING btree ("job_code");--> statement-breakpoint
CREATE UNIQUE INDEX "ocr_jobs_job_code_unique" ON "ocr_jobs" USING btree ("job_code");