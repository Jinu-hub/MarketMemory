ALTER TABLE "item_contents" RENAME COLUMN "summary_short" TO "summary";--> statement-breakpoint
ALTER TABLE "item_contents" RENAME COLUMN "summary_md" TO "content";--> statement-breakpoint
ALTER TABLE "item_embeddings" RENAME COLUMN "lang_type" TO "lang_code";--> statement-breakpoint
ALTER TABLE "report_embeddings" RENAME COLUMN "lang_type" TO "lang_code";--> statement-breakpoint
ALTER TABLE "item_contents" ADD COLUMN "lang_code" text DEFAULT 'ko' NOT NULL;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "lang_code" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_item_contents_lang_code" ON "item_contents" USING btree ("lang_code");--> statement-breakpoint
CREATE INDEX "idx_item_contents_regions_gin" ON "item_contents" USING gin ("regions");--> statement-breakpoint
CREATE INDEX "idx_item_contents_countries_gin" ON "item_contents" USING gin ("countries");--> statement-breakpoint
CREATE INDEX "idx_item_contents_metadata_gin" ON "item_contents" USING gin ("metadata");--> statement-breakpoint
CREATE INDEX "idx_reports_lang_code" ON "reports" USING btree ("lang_code");--> statement-breakpoint
CREATE INDEX "idx_reports_regions_gin" ON "reports" USING gin ("regions");--> statement-breakpoint
CREATE INDEX "idx_reports_countries_gin" ON "reports" USING gin ("countries");--> statement-breakpoint
CREATE INDEX "idx_reports_metadata_gin" ON "reports" USING gin ("metadata");