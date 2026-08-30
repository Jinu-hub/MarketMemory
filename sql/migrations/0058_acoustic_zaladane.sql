ALTER TABLE "public"."content_audio" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "public"."content_audio" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."content_audio_status";--> statement-breakpoint
CREATE TYPE "public"."content_audio_status" AS ENUM('script_ready', 'generating', 'completed', 'cancelled', 'failed');--> statement-breakpoint
ALTER TABLE "public"."content_audio" ALTER COLUMN "status" SET DATA TYPE "public"."content_audio_status" USING "status"::"public"."content_audio_status";--> statement-breakpoint
ALTER TABLE "public"."content_audio" ALTER COLUMN "status" SET DEFAULT 'script_ready';