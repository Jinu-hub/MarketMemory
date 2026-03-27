DROP INDEX "idx_items_category";--> statement-breakpoint
DROP INDEX "idx_items_tags_gin";--> statement-breakpoint
ALTER TABLE "item_contents" ALTER COLUMN "is_active" SET DEFAULT true;--> statement-breakpoint
ALTER TABLE "item_contents" ADD COLUMN "input_date" date;--> statement-breakpoint
CREATE INDEX "idx_item_contents_input_date" ON "item_contents" USING btree ("input_date" desc);--> statement-breakpoint
CREATE INDEX "idx_item_contents_category" ON "item_contents" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_item_contents_tags_gin" ON "item_contents" USING gin ("tags");