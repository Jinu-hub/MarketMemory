CREATE TYPE "public"."audio_type" AS ENUM('market_talk', 'brief_30s', 'read_aloud', 'deep_dive');--> statement-breakpoint
CREATE TYPE "public"."brief_type" AS ENUM('today_30s', 'short_summary', 'key_points', 'executive_summary');--> statement-breakpoint
CREATE TYPE "public"."content_audio_status" AS ENUM('script_ready', 'generated', 'failed');--> statement-breakpoint
CREATE TYPE "public"."content_brief_status" AS ENUM('draft', 'final');--> statement-breakpoint
CREATE TYPE "public"."content_target_type" AS ENUM('item_report', 'daily_market_memory');--> statement-breakpoint
CREATE TYPE "public"."market_memory_content_type" AS ENUM('global_market_issues', 'daily_market_issues', 'weekly_market_issues', 'weekly_ai_issues', 'analysis_report', 'thesis_report', 'timeline_report', 'briefing_report', 'daily_market_memory', 'weekly_market_memory', 'monthly_market_memory');--> statement-breakpoint
CREATE TYPE "public"."market_signal_period_type" AS ENUM('daily', 'weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."market_signal_scope_type" AS ENUM('content_type', 'global');--> statement-breakpoint
CREATE TYPE "public"."market_signal_snapshot_status" AS ENUM('draft', 'final');--> statement-breakpoint
CREATE TYPE "public"."market_signal_trend_type" AS ENUM('rising', 'falling', 'new', 'stable');--> statement-breakpoint
CREATE TYPE "public"."market_signal_type" AS ENUM('tag', 'entity', 'theme', 'industry', 'company', 'person', 'asset', 'region', 'country', 'indicator', 'technology', 'institution', 'product');--> statement-breakpoint
CREATE TABLE "content_audio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_type" "content_target_type" NOT NULL,
	"target_id" uuid NOT NULL,
	"content_type" "market_memory_content_type" NOT NULL,
	"audio_type" "audio_type" NOT NULL,
	"lang_code" text NOT NULL,
	"title" text,
	"script" text,
	"duration_seconds" integer,
	"storage_provider" text,
	"storage_key" text,
	"status" "content_audio_status" DEFAULT 'script_ready' NOT NULL,
	"market_date" date,
	"model_info" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_audio" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "content_briefs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_type" "content_target_type" NOT NULL,
	"target_id" uuid NOT NULL,
	"content_type" "market_memory_content_type" NOT NULL,
	"brief_type" "brief_type" NOT NULL,
	"lang_code" text NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"status" "content_brief_status" DEFAULT 'draft' NOT NULL,
	"market_date" date,
	"model_info" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "content_briefs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "market_signal_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snapshot_id" uuid NOT NULL,
	"signal_type" "market_signal_type" NOT NULL,
	"signal_key" text NOT NULL,
	"display_name" text NOT NULL,
	"rank" integer,
	"current_count" integer,
	"previous_count" integer,
	"change_rate" numeric(10, 4),
	"trend_type" "market_signal_trend_type",
	"signal_strength" numeric(10, 4),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "market_signal_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "market_signal_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope_type" "market_signal_scope_type" NOT NULL,
	"scope_key" text,
	"period_type" "market_signal_period_type" NOT NULL,
	"period_key" text NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"source_count" integer DEFAULT 0 NOT NULL,
	"status" "market_signal_snapshot_status" DEFAULT 'draft' NOT NULL,
	"generated_at" timestamp with time zone,
	"model_info" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "market_signal_snapshots" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "market_signal_items" ADD CONSTRAINT "market_signal_items_snapshot_id_market_signal_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."market_signal_snapshots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ca_target_audio_lang_unique" ON "content_audio" USING btree ("target_type","target_id","audio_type","lang_code");--> statement-breakpoint
CREATE INDEX "idx_ca_target" ON "content_audio" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "idx_ca_content_type_market_date" ON "content_audio" USING btree ("content_type","market_date" desc);--> statement-breakpoint
CREATE INDEX "idx_ca_audio_type_status" ON "content_audio" USING btree ("audio_type","status");--> statement-breakpoint
CREATE INDEX "idx_ca_lang_code" ON "content_audio" USING btree ("lang_code");--> statement-breakpoint
CREATE UNIQUE INDEX "cb_target_brief_lang_unique" ON "content_briefs" USING btree ("target_type","target_id","brief_type","lang_code");--> statement-breakpoint
CREATE INDEX "idx_cb_target" ON "content_briefs" USING btree ("target_type","target_id");--> statement-breakpoint
CREATE INDEX "idx_cb_content_type_market_date" ON "content_briefs" USING btree ("content_type","market_date" desc);--> statement-breakpoint
CREATE INDEX "idx_cb_brief_type_status" ON "content_briefs" USING btree ("brief_type","status");--> statement-breakpoint
CREATE INDEX "idx_cb_lang_code" ON "content_briefs" USING btree ("lang_code");--> statement-breakpoint
CREATE UNIQUE INDEX "msi_snapshot_signal_unique" ON "market_signal_items" USING btree ("snapshot_id","signal_type","signal_key");--> statement-breakpoint
CREATE INDEX "idx_msi_snapshot_rank" ON "market_signal_items" USING btree ("snapshot_id","rank");--> statement-breakpoint
CREATE INDEX "idx_msi_signal_type_key" ON "market_signal_items" USING btree ("signal_type","signal_key");--> statement-breakpoint
CREATE INDEX "idx_msi_trend_type" ON "market_signal_items" USING btree ("trend_type");--> statement-breakpoint
CREATE UNIQUE INDEX "mss_scope_period_unique" ON "market_signal_snapshots" USING btree ("scope_type","scope_key","period_type","period_key");--> statement-breakpoint
CREATE UNIQUE INDEX "mss_one_final_per_scope_period" ON "market_signal_snapshots" USING btree ("scope_type","scope_key","period_type","period_key") WHERE "market_signal_snapshots"."status" = 'final';--> statement-breakpoint
CREATE INDEX "idx_mss_scope_status" ON "market_signal_snapshots" USING btree ("scope_type","scope_key","status");--> statement-breakpoint
CREATE INDEX "idx_mss_period" ON "market_signal_snapshots" USING btree ("period_type","period_key" desc);--> statement-breakpoint
CREATE INDEX "idx_mss_period_range" ON "market_signal_snapshots" USING btree ("period_start","period_end");--> statement-breakpoint
CREATE POLICY "ca_select" ON "content_audio" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "ca_insert" ON "content_audio" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ca_update" ON "content_audio" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ca_delete" ON "content_audio" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "cb_select" ON "content_briefs" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "cb_insert" ON "content_briefs" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "cb_update" ON "content_briefs" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "cb_delete" ON "content_briefs" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "msi_select" ON "market_signal_items" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "msi_insert" ON "market_signal_items" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "msi_update" ON "market_signal_items" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "msi_delete" ON "market_signal_items" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "mss_select" ON "market_signal_snapshots" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "mss_insert" ON "market_signal_snapshots" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "mss_update" ON "market_signal_snapshots" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "mss_delete" ON "market_signal_snapshots" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));