ALTER TYPE "public"."marketing_lang_code" RENAME TO "lang_code";--> statement-breakpoint
ALTER TYPE "public"."marketing_platform" RENAME TO "platform";--> statement-breakpoint
ALTER TYPE "public"."marketing_post_status" RENAME TO "post_status";--> statement-breakpoint
ALTER TABLE "marketing_posts" RENAME TO "content_posts";