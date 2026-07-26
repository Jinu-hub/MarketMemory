ALTER TABLE "collection_runs" ADD COLUMN "sort_mode" text DEFAULT 'relevance' NOT NULL;--> statement-breakpoint
ALTER TABLE "collection_runs" ADD COLUMN "time_range" text DEFAULT 'all' NOT NULL;--> statement-breakpoint
ALTER TABLE "collection_runs" ADD COLUMN "post_fetched_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "collection_runs" ADD COLUMN "comment_fetched_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "collection_runs" ADD COLUMN "filtered_by_date_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "collection_runs" ADD COLUMN "title_only_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "collection_runs" ADD COLUMN "substantive_body_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "collection_runs" ADD COLUMN "high_priority_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "collection_runs" ADD COLUMN "keyword_stats" jsonb;--> statement-breakpoint
ALTER TABLE "collection_runs" ADD COLUMN "content_type_stats" jsonb;--> statement-breakpoint
ALTER TABLE "observations" ADD COLUMN "external_story_id" text;--> statement-breakpoint
ALTER TABLE "observations" ADD COLUMN "parent_observation_id" uuid;--> statement-breakpoint
ALTER TABLE "observations" ADD COLUMN "external_content_url" text;--> statement-breakpoint
ALTER TABLE "observations" ADD COLUMN "discussion_url" text;--> statement-breakpoint
ALTER TABLE "observations" ADD COLUMN "score" integer;--> statement-breakpoint
ALTER TABLE "observations" ADD COLUMN "comment_count" integer;--> statement-breakpoint
ALTER TABLE "observations" ADD COLUMN "hn_type" text;--> statement-breakpoint
ALTER TABLE "observations" ADD COLUMN "content_quality" text;--> statement-breakpoint
ALTER TABLE "observations" ADD COLUMN "has_substantive_body" boolean;--> statement-breakpoint
ALTER TABLE "observations" ADD COLUMN "observation_priority" text;--> statement-breakpoint
ALTER TABLE "observations" ADD COLUMN "priority_reasons" text[];--> statement-breakpoint
CREATE INDEX "idx_observations_external_story_id" ON "observations" USING btree ("external_story_id");--> statement-breakpoint
CREATE INDEX "idx_observations_source_content_type" ON "observations" USING btree ("source","content_type");--> statement-breakpoint
CREATE INDEX "idx_observations_observation_priority" ON "observations" USING btree ("observation_priority");--> statement-breakpoint
-- Backfill existing Hacker News rows from raw_payload (safe, idempotent)
UPDATE "observations" SET
  "discussion_url" = COALESCE("discussion_url", 'https://news.ycombinator.com/item?id=' || "external_id"),
  "external_content_url" = COALESCE("external_content_url", NULLIF("raw_payload"->>'url', ''), NULLIF("raw_payload"->>'story_url', '')),
  "external_story_id" = COALESCE("external_story_id", CASE WHEN "content_type" = 'comment' THEN COALESCE(NULLIF("raw_payload"->>'story_id', ''), NULLIF("raw_payload"->>'parent_id', '')) ELSE NULL END),
  "score" = COALESCE("score", NULLIF("raw_payload"->>'points', '')::int),
  "comment_count" = COALESCE("comment_count", NULLIF("raw_payload"->>'num_comments', '')::int),
  "hn_type" = COALESCE("hn_type", CASE
    WHEN "content_type" = 'comment' THEN 'comment'
    WHEN jsonb_exists("raw_payload"->'_tags', 'ask_hn') THEN 'ask_hn'
    WHEN jsonb_exists("raw_payload"->'_tags', 'show_hn') THEN 'show_hn'
    WHEN jsonb_exists("raw_payload"->'_tags', 'launch_hn') THEN 'launch_hn'
    ELSE 'story' END),
  "content_quality" = COALESCE("content_quality", CASE
    WHEN "body" IS NULL OR length(trim("body")) = 0 THEN 'empty'
    WHEN "title" IS NOT NULL AND lower(regexp_replace(trim("body"), E'\\s+', ' ', 'g')) = lower(regexp_replace(trim("title"), E'\\s+', ' ', 'g')) THEN 'title_only'
    WHEN length(trim("body")) < 100 THEN 'short'
    ELSE 'full' END)
WHERE "source" = 'hacker_news';--> statement-breakpoint
UPDATE "observations" SET
  "has_substantive_body" = COALESCE("has_substantive_body", ("content_quality" = 'full'))
WHERE "source" = 'hacker_news';