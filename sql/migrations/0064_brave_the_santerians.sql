ALTER TABLE "public"."prompt_templates" ALTER COLUMN "thinking_level" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."thinking_level";--> statement-breakpoint
CREATE TYPE "public"."thinking_level" AS ENUM('off', 'minimal', 'low', 'medium', 'high');--> statement-breakpoint
ALTER TABLE "public"."prompt_templates" ALTER COLUMN "thinking_level" SET DATA TYPE "public"."thinking_level" USING "thinking_level"::"public"."thinking_level";