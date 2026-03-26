CREATE TYPE "public"."api_mode" AS ENUM('responses', 'streaming');--> statement-breakpoint
ALTER TABLE "prompt_templates" ADD COLUMN "temperature" numeric(5, 4);--> statement-breakpoint
ALTER TABLE "prompt_templates" ADD COLUMN "api_mode" "api_mode" DEFAULT 'responses';