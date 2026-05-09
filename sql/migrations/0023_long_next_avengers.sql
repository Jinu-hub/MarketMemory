ALTER TABLE "item_contents" ADD COLUMN "similarity_status" "similarity_status" DEFAULT 'ready' NOT NULL;--> statement-breakpoint
ALTER TABLE "market_memory_items" DROP COLUMN "similarity_status";