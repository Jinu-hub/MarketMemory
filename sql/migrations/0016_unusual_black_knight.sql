ALTER TABLE "item_contents" ADD COLUMN "summary_meta" jsonb;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "summary_meta" jsonb;--> statement-breakpoint
CREATE INDEX "idx_item_contents_summary_meta_gin" ON "item_contents" USING gin ("summary_meta");--> statement-breakpoint
CREATE INDEX "idx_reports_summary_meta_gin" ON "reports" USING gin ("summary_meta");