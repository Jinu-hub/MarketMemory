CREATE TYPE "public"."similarity_level" AS ENUM('weak', 'medium', 'strong');--> statement-breakpoint
CREATE TYPE "public"."similarity_status" AS ENUM('ready', 'done', 'nothing', 'pending');--> statement-breakpoint
ALTER TABLE "item_similarity_edges" ADD COLUMN "ranking" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "item_similarity_edges" ADD COLUMN "similarity_level" "similarity_level" DEFAULT 'weak' NOT NULL;--> statement-breakpoint
ALTER TABLE "market_memory_items" ADD COLUMN "similarity_status" "similarity_status" DEFAULT 'ready' NOT NULL;