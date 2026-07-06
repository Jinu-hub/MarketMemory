CREATE TYPE "public"."i18n_status" AS ENUM('ready', 'done', 'partial');--> statement-breakpoint
ALTER TABLE "item_contents" ADD COLUMN "i18n_status" "i18n_status" DEFAULT 'ready' NOT NULL;