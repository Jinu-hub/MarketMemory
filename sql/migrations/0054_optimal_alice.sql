CREATE TABLE "observation_insight_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"collection_run_ids" uuid[] DEFAULT '{}' NOT NULL,
	"observation_ids" uuid[] DEFAULT '{}' NOT NULL,
	"summary" text NOT NULL,
	"stories" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"problems" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"service_ideas" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"excluded_observation_count" integer DEFAULT 0 NOT NULL,
	"raw_output" jsonb,
	"model" text NOT NULL,
	"prompt_version" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "observation_insight_reports" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP POLICY "oa_select" ON "observation_analyses" CASCADE;--> statement-breakpoint
DROP POLICY "oa_insert" ON "observation_analyses" CASCADE;--> statement-breakpoint
DROP POLICY "oa_update" ON "observation_analyses" CASCADE;--> statement-breakpoint
DROP POLICY "oa_delete" ON "observation_analyses" CASCADE;--> statement-breakpoint
DROP TABLE "observation_analyses" CASCADE;--> statement-breakpoint
DROP POLICY "pe_select" ON "problem_evidence" CASCADE;--> statement-breakpoint
DROP POLICY "pe_insert" ON "problem_evidence" CASCADE;--> statement-breakpoint
DROP POLICY "pe_update" ON "problem_evidence" CASCADE;--> statement-breakpoint
DROP POLICY "pe_delete" ON "problem_evidence" CASCADE;--> statement-breakpoint
DROP TABLE "problem_evidence" CASCADE;--> statement-breakpoint
DROP POLICY "prob_select" ON "problems" CASCADE;--> statement-breakpoint
DROP POLICY "prob_insert" ON "problems" CASCADE;--> statement-breakpoint
DROP POLICY "prob_update" ON "problems" CASCADE;--> statement-breakpoint
DROP POLICY "prob_delete" ON "problems" CASCADE;--> statement-breakpoint
DROP TABLE "problems" CASCADE;--> statement-breakpoint
CREATE INDEX "idx_observation_insight_reports_created_at" ON "observation_insight_reports" USING btree ("created_at");--> statement-breakpoint
CREATE POLICY "oir_select" ON "observation_insight_reports" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "oir_insert" ON "observation_insight_reports" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "oir_update" ON "observation_insight_reports" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "oir_delete" ON "observation_insight_reports" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
DROP TYPE "public"."evidence_strength";--> statement-breakpoint
DROP TYPE "public"."observation_analysis_disposition";--> statement-breakpoint
DROP TYPE "public"."problem_evidence_relationship";--> statement-breakpoint
DROP TYPE "public"."problem_evidence_representation";--> statement-breakpoint
DROP TYPE "public"."problem_evidence_type";--> statement-breakpoint
DROP TYPE "public"."problem_status";