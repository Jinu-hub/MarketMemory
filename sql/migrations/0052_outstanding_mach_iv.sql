CREATE TYPE "public"."evidence_strength" AS ENUM('weak', 'moderate', 'strong');--> statement-breakpoint
CREATE TYPE "public"."observation_analysis_disposition" AS ENUM('problem', 'insight', 'mixed', 'noise', 'unclear');--> statement-breakpoint
CREATE TYPE "public"."problem_evidence_relationship" AS ENUM('supports', 'exemplifies', 'contradicts', 'contextualizes');--> statement-breakpoint
CREATE TYPE "public"."problem_evidence_representation" AS ENUM('quote', 'paraphrase', 'structured_extraction');--> statement-breakpoint
CREATE TYPE "public"."problem_evidence_type" AS ENUM('first_person_experience', 'direct_report', 'observed_behavior', 'operational_observation', 'third_party_claim', 'general_opinion');--> statement-breakpoint
CREATE TYPE "public"."problem_status" AS ENUM('candidate', 'investigating', 'validated', 'dismissed', 'archived');--> statement-breakpoint
CREATE TABLE "observation_analyses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"observation_id" uuid NOT NULL,
	"disposition" "observation_analysis_disposition" NOT NULL,
	"signal_types" text[] DEFAULT '{}' NOT NULL,
	"summary" text NOT NULL,
	"confidence" numeric(5, 4) NOT NULL,
	"evidence_strength" "evidence_strength" NOT NULL,
	"extracted_data" jsonb,
	"model" text NOT NULL,
	"prompt_version" text NOT NULL,
	"analyzed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "observation_analyses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "problem_evidence" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"problem_id" uuid NOT NULL,
	"observation_id" uuid NOT NULL,
	"observation_analysis_id" uuid,
	"relationship" "problem_evidence_relationship" NOT NULL,
	"relevance_score" numeric(5, 4) NOT NULL,
	"evidence_type" "problem_evidence_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "problem_evidence" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "problems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"affected_users" text,
	"context" text,
	"root_cause_hypotheses" text[] DEFAULT '{}' NOT NULL,
	"first_seen_at" timestamp with time zone NOT NULL,
	"last_seen_at" timestamp with time zone NOT NULL,
	"evidence_count" integer DEFAULT 0 NOT NULL,
	"source_count" integer DEFAULT 0 NOT NULL,
	"status" "problem_status" DEFAULT 'candidate' NOT NULL,
	"confidence" numeric(5, 4) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "problems" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "observation_analyses" ADD CONSTRAINT "observation_analyses_observation_id_observations_id_fk" FOREIGN KEY ("observation_id") REFERENCES "public"."observations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_evidence" ADD CONSTRAINT "problem_evidence_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_evidence" ADD CONSTRAINT "problem_evidence_observation_id_observations_id_fk" FOREIGN KEY ("observation_id") REFERENCES "public"."observations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_evidence" ADD CONSTRAINT "problem_evidence_observation_analysis_id_observation_analyses_id_fk" FOREIGN KEY ("observation_analysis_id") REFERENCES "public"."observation_analyses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_observation_analyses_observation_id" ON "observation_analyses" USING btree ("observation_id");--> statement-breakpoint
CREATE INDEX "idx_observation_analyses_disposition" ON "observation_analyses" USING btree ("disposition");--> statement-breakpoint
CREATE INDEX "idx_observation_analyses_analyzed_at" ON "observation_analyses" USING btree ("analyzed_at");--> statement-breakpoint
CREATE INDEX "idx_observation_analyses_evidence_strength" ON "observation_analyses" USING btree ("evidence_strength");--> statement-breakpoint
CREATE UNIQUE INDEX "problem_evidence_problem_observation_unique" ON "problem_evidence" USING btree ("problem_id","observation_id");--> statement-breakpoint
CREATE INDEX "idx_problem_evidence_problem_id" ON "problem_evidence" USING btree ("problem_id");--> statement-breakpoint
CREATE INDEX "idx_problem_evidence_observation_id" ON "problem_evidence" USING btree ("observation_id");--> statement-breakpoint
CREATE INDEX "idx_problem_evidence_analysis_id" ON "problem_evidence" USING btree ("observation_analysis_id");--> statement-breakpoint
CREATE INDEX "idx_problem_evidence_relationship" ON "problem_evidence" USING btree ("relationship");--> statement-breakpoint
CREATE INDEX "idx_problems_status" ON "problems" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_problems_last_seen_at" ON "problems" USING btree ("last_seen_at");--> statement-breakpoint
CREATE INDEX "idx_problems_first_seen_at" ON "problems" USING btree ("first_seen_at");--> statement-breakpoint
CREATE INDEX "idx_problems_confidence" ON "problems" USING btree ("confidence");--> statement-breakpoint
CREATE POLICY "oa_select" ON "observation_analyses" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "oa_insert" ON "observation_analyses" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "oa_update" ON "observation_analyses" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "oa_delete" ON "observation_analyses" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "pe_select" ON "problem_evidence" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "pe_insert" ON "problem_evidence" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "pe_update" ON "problem_evidence" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "pe_delete" ON "problem_evidence" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "prob_select" ON "problems" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "prob_insert" ON "problems" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "prob_update" ON "problems" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "prob_delete" ON "problems" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));