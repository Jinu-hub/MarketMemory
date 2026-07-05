ALTER TABLE "content_posts" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "content_posts" DROP COLUMN "source_type";--> statement-breakpoint
ALTER TABLE "content_posts" DROP COLUMN "source_id";