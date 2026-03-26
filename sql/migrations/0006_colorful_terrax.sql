CREATE TYPE "public"."pipeline_status" AS ENUM('draft', 'active', 'deprecated');--> statement-breakpoint
ALTER TYPE "public"."prompt_status" ADD VALUE 'archived';--> statement-breakpoint
CREATE TABLE "pipeline_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pipeline_key" text NOT NULL,
	"step" integer NOT NULL,
	"agent_key" text NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pipeline_steps" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "pipelines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pipeline_key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "pipeline_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pipelines" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP INDEX "idx_prompt_templates_purpose_version";--> statement-breakpoint
ALTER TABLE "prompt_releases" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_releases" ADD COLUMN "pipeline_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_releases" ADD COLUMN "agent_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_releases" ADD COLUMN "environment" text NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_releases" ADD COLUMN "release_note" text;--> statement-breakpoint
ALTER TABLE "prompt_releases" ADD COLUMN "released_by" text;--> statement-breakpoint
ALTER TABLE "prompt_templates" ADD COLUMN "pipeline_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_templates" ADD COLUMN "agent_key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_templates" ADD COLUMN "input_schema" jsonb;--> statement-breakpoint
ALTER TABLE "prompt_templates" ADD COLUMN "default_provider" text;--> statement-breakpoint
ALTER TABLE "prompt_templates" ADD COLUMN "changelog" text;--> statement-breakpoint
ALTER TABLE "prompt_templates" ADD COLUMN "is_backward_compatible" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_templates" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "prompt_templates" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "pipeline_steps" ADD CONSTRAINT "pipeline_steps_pipeline_key_pipelines_pipeline_key_fk" FOREIGN KEY ("pipeline_key") REFERENCES "public"."pipelines"("pipeline_key") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "pipeline_steps_pipeline_key_step_unique" ON "pipeline_steps" USING btree ("pipeline_key","step");--> statement-breakpoint
CREATE UNIQUE INDEX "pipeline_steps_pipeline_key_agent_key_unique" ON "pipeline_steps" USING btree ("pipeline_key","agent_key");--> statement-breakpoint
CREATE INDEX "idx_pipeline_steps_pipeline_key_step" ON "pipeline_steps" USING btree ("pipeline_key","step");--> statement-breakpoint
CREATE INDEX "idx_pipeline_steps_agent_key" ON "pipeline_steps" USING btree ("agent_key");--> statement-breakpoint
CREATE UNIQUE INDEX "pipelines_pipeline_key_unique" ON "pipelines" USING btree ("pipeline_key");--> statement-breakpoint
CREATE INDEX "idx_pipelines_status" ON "pipelines" USING btree ("status");--> statement-breakpoint
ALTER TABLE "prompt_releases" ADD CONSTRAINT "prompt_releases_pipeline_key_pipelines_pipeline_key_fk" FOREIGN KEY ("pipeline_key") REFERENCES "public"."pipelines"("pipeline_key") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_templates" ADD CONSTRAINT "prompt_templates_pipeline_key_pipelines_pipeline_key_fk" FOREIGN KEY ("pipeline_key") REFERENCES "public"."pipelines"("pipeline_key") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "prompt_releases_pipeline_agent_env_unique" ON "prompt_releases" USING btree ("pipeline_key","agent_key","environment");--> statement-breakpoint
CREATE UNIQUE INDEX "prompt_templates_pipeline_agent_version_unique" ON "prompt_templates" USING btree ("pipeline_key","agent_key","version");--> statement-breakpoint
CREATE INDEX "idx_prompt_templates_pipeline_agent_version" ON "prompt_templates" USING btree ("pipeline_key","agent_key","version" desc);--> statement-breakpoint
CREATE INDEX "idx_prompt_templates_pipeline_key_status" ON "prompt_templates" USING btree ("pipeline_key","status");--> statement-breakpoint
ALTER TABLE "prompt_releases" DROP COLUMN "purpose";--> statement-breakpoint
ALTER TABLE "prompt_templates" DROP COLUMN "purpose";--> statement-breakpoint
CREATE POLICY "ps_select" ON "pipeline_steps" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ps_insert" ON "pipeline_steps" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ps_update" ON "pipeline_steps" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "ps_delete" ON "pipeline_steps" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "pl_select" ON "pipelines" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "pl_insert" ON "pipelines" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "pl_update" ON "pipelines" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "pl_delete" ON "pipelines" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));