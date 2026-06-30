CREATE TYPE "public"."marketing_lang_code" AS ENUM('ko', 'ja', 'en');--> statement-breakpoint
CREATE TYPE "public"."marketing_platform" AS ENUM('threads', 'x', 'instagram', 'linkedin', 'blog', 'other');--> statement-breakpoint
CREATE TYPE "public"."marketing_post_status" AS ENUM('draft', 'ready', 'scheduled', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "marketing_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_key" text,
	"platform" "marketing_platform" NOT NULL,
	"lang_code" "marketing_lang_code" NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"status" "marketing_post_status" DEFAULT 'draft' NOT NULL,
	"source_type" text,
	"source_id" uuid,
	"scheduled_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"published_url" text,
	"external_post_id" text,
	"like_count" integer,
	"reply_count" integer,
	"repost_count" integer,
	"view_count" integer,
	"saved_count" integer,
	"metric_checked_at" timestamp with time zone,
	"metrics" jsonb,
	"memo" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "marketing_posts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "idx_marketing_posts_status" ON "marketing_posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_marketing_posts_platform_lang" ON "marketing_posts" USING btree ("platform","lang_code");--> statement-breakpoint
CREATE INDEX "idx_marketing_posts_published_at" ON "marketing_posts" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "idx_marketing_posts_group_key" ON "marketing_posts" USING btree ("group_key");--> statement-breakpoint
CREATE POLICY "mp_select" ON "marketing_posts" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "mp_insert" ON "marketing_posts" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "mp_update" ON "marketing_posts" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "mp_delete" ON "marketing_posts" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));