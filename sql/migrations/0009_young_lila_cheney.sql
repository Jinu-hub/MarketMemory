ALTER TABLE "ocr_jobs" RENAME COLUMN "merged_text" TO "merged_text_raw";--> statement-breakpoint
ALTER TABLE "ocr_jobs" ALTER COLUMN "source_type" SET DEFAULT 'pdf';--> statement-breakpoint
ALTER TABLE "ocr_jobs" ADD COLUMN "merged_text_clean" text;--> statement-breakpoint
ALTER TABLE "ocr_jobs" ADD COLUMN "extraction_notes" jsonb;