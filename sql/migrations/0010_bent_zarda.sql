ALTER TABLE "item_contents" RENAME COLUMN "item_id" TO "market_memory_item_id";--> statement-breakpoint
ALTER TABLE "item_contents" DROP CONSTRAINT "item_contents_item_id_market_memory_items_id_fk";
--> statement-breakpoint
ALTER TABLE "item_embeddings" DROP CONSTRAINT "item_embeddings_item_id_market_memory_items_id_fk";
--> statement-breakpoint
ALTER TABLE "item_tags" DROP CONSTRAINT "item_tags_item_id_market_memory_items_id_fk";
--> statement-breakpoint
ALTER TABLE "report_items" DROP CONSTRAINT "report_items_item_id_market_memory_items_id_fk";
--> statement-breakpoint
ALTER TABLE "structured_metric_facts" DROP CONSTRAINT "structured_metric_facts_source_item_id_market_memory_items_id_fk";
--> statement-breakpoint
DROP INDEX "idx_item_contents_item_id_created_at";--> statement-breakpoint
DROP INDEX "item_contents_one_active_per_item";--> statement-breakpoint
ALTER TABLE "item_contents" ADD CONSTRAINT "item_contents_market_memory_item_id_market_memory_items_id_fk" FOREIGN KEY ("market_memory_item_id") REFERENCES "public"."market_memory_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_embeddings" ADD CONSTRAINT "item_embeddings_item_id_item_contents_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item_contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_tags" ADD CONSTRAINT "item_tags_item_id_item_contents_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item_contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_items" ADD CONSTRAINT "report_items_item_id_item_contents_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."item_contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "structured_metric_facts" ADD CONSTRAINT "structured_metric_facts_source_item_id_item_contents_id_fk" FOREIGN KEY ("source_item_id") REFERENCES "public"."item_contents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_item_contents_item_id_created_at" ON "item_contents" USING btree ("market_memory_item_id","created_at" desc);--> statement-breakpoint
CREATE UNIQUE INDEX "item_contents_one_active_per_item" ON "item_contents" USING btree ("market_memory_item_id") WHERE "item_contents"."is_active" = true;