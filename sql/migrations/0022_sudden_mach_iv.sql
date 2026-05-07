ALTER TYPE "public"."similarity_level" ADD VALUE 'high' BEFORE 'strong';--> statement-breakpoint
ALTER TABLE "item_similarity_edges" ALTER COLUMN "similarity_level" SET DEFAULT 'medium';