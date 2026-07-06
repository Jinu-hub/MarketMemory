ALTER TABLE "content_posts" ADD COLUMN "market_date" date;--> statement-breakpoint
CREATE INDEX "idx_marketing_posts_market_date_lang" ON "content_posts" USING btree ("market_date","lang_code");