ALTER TABLE "public"."content_audio" ALTER COLUMN "target_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "public"."content_briefs" ALTER COLUMN "target_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."content_target_type";--> statement-breakpoint
CREATE TYPE "public"."content_target_type" AS ENUM('analysis-report', 'thesis-report', 'timeline-report', 'briefing-report', 'daily-market-memory');--> statement-breakpoint
ALTER TABLE "public"."content_audio" ALTER COLUMN "target_type" SET DATA TYPE "public"."content_target_type" USING "target_type"::"public"."content_target_type";--> statement-breakpoint
ALTER TABLE "public"."content_briefs" ALTER COLUMN "target_type" SET DATA TYPE "public"."content_target_type" USING "target_type"::"public"."content_target_type";--> statement-breakpoint
ALTER TABLE "public"."content_audio" ALTER COLUMN "content_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "public"."content_briefs" ALTER COLUMN "content_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."market_memory_content_type";--> statement-breakpoint
CREATE TYPE "public"."market_memory_content_type" AS ENUM('global-market-issues', 'daily-market-issues', 'report-summary', 'weekly-market-issues', 'weekly-ai-issues', 'daily-market-memory', 'weekly-market-memory', 'monthly-market-memory');--> statement-breakpoint
ALTER TABLE "public"."content_audio" ALTER COLUMN "content_type" SET DATA TYPE "public"."market_memory_content_type" USING "content_type"::"public"."market_memory_content_type";--> statement-breakpoint
ALTER TABLE "public"."content_briefs" ALTER COLUMN "content_type" SET DATA TYPE "public"."market_memory_content_type" USING "content_type"::"public"."market_memory_content_type";