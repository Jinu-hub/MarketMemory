CREATE TYPE "public"."report_tier" AS ENUM('free', 'premium', 'premium_plus');--> statement-breakpoint
ALTER TABLE "reports" RENAME COLUMN "md_body" TO "content";--> statement-breakpoint
ALTER TABLE "item_contents" ADD COLUMN "report_tier" "report_tier" DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "item_contents" ADD COLUMN "html_body" text;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "report_type" "report_type";--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "report_tier" "report_tier" DEFAULT 'premium' NOT NULL;