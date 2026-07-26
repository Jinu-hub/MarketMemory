CREATE TYPE "public"."collection_run_status" AS ENUM('pending', 'running', 'completed', 'failed', 'partial');--> statement-breakpoint
CREATE TYPE "public"."observation_content_type" AS ENUM('post', 'comment');--> statement-breakpoint
CREATE TYPE "public"."observation_source" AS ENUM('hacker_news', 'github', 'reddit');--> statement-breakpoint
CREATE TABLE "collection_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" "observation_source" NOT NULL,
	"keywords" text[] NOT NULL,
	"content_type" text DEFAULT 'all' NOT NULL,
	"requested_limit" integer NOT NULL,
	"status" "collection_run_status" DEFAULT 'pending' NOT NULL,
	"fetched_count" integer DEFAULT 0 NOT NULL,
	"matched_count" integer DEFAULT 0 NOT NULL,
	"inserted_count" integer DEFAULT 0 NOT NULL,
	"duplicate_count" integer DEFAULT 0 NOT NULL,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"error_message" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	"duration_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "collection_runs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "observations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" "observation_source" NOT NULL,
	"external_id" text NOT NULL,
	"external_parent_id" text,
	"content_type" "observation_content_type" NOT NULL,
	"title" text,
	"body" text NOT NULL,
	"author" text,
	"community" text,
	"source_url" text NOT NULL,
	"matched_keywords" text[] DEFAULT '{}' NOT NULL,
	"published_at" timestamp with time zone,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL,
	"content_hash" text NOT NULL,
	"raw_payload" jsonb,
	"collection_run_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "observations" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "observations" ADD CONSTRAINT "observations_collection_run_id_collection_runs_id_fk" FOREIGN KEY ("collection_run_id") REFERENCES "public"."collection_runs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_collection_runs_started_at" ON "collection_runs" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "idx_collection_runs_source_status" ON "collection_runs" USING btree ("source","status");--> statement-breakpoint
CREATE UNIQUE INDEX "observations_source_external_id_unique" ON "observations" USING btree ("source","external_id");--> statement-breakpoint
CREATE INDEX "idx_observations_source_content_hash" ON "observations" USING btree ("source","content_hash");--> statement-breakpoint
CREATE INDEX "idx_observations_published_at" ON "observations" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "idx_observations_created_at" ON "observations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_observations_collection_run_id" ON "observations" USING btree ("collection_run_id");--> statement-breakpoint
CREATE POLICY "cr_select" ON "collection_runs" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "cr_insert" ON "collection_runs" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "cr_update" ON "collection_runs" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "cr_delete" ON "collection_runs" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "obs_select" ON "observations" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "obs_insert" ON "observations" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "obs_update" ON "observations" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "obs_delete" ON "observations" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));