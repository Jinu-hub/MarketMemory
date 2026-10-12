CREATE TYPE "public"."thinking_level" AS ENUM('none', 'low', 'medium', 'high');--> statement-breakpoint
ALTER TABLE "prompt_templates" ADD COLUMN "thinking_level" "thinking_level";