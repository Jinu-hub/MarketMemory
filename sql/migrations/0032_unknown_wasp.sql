ALTER TABLE "item_contents" RENAME COLUMN "input_date" TO "market_date";--> statement-breakpoint
ALTER TABLE "market_memory_items" RENAME COLUMN "input_date" TO "market_date";--> statement-breakpoint
DROP INDEX "idx_item_contents_input_date";--> statement-breakpoint
DROP INDEX "idx_items_input_date";--> statement-breakpoint
CREATE INDEX "idx_item_contents_market_date" ON "item_contents" USING btree ("market_date" desc);--> statement-breakpoint
CREATE INDEX "idx_items_market_date" ON "market_memory_items" USING btree ("market_date" desc);