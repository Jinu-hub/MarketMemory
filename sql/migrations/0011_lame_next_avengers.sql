CREATE TABLE IF NOT EXISTS "agents" (
	"agent_key" text PRIMARY KEY NOT NULL,
	"display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "prompt_releases" DROP CONSTRAINT IF EXISTS "prompt_releases_pipeline_key_pipelines_pipeline_key_fk";
--> statement-breakpoint
ALTER TABLE "prompt_templates" DROP CONSTRAINT IF EXISTS "prompt_templates_pipeline_key_pipelines_pipeline_key_fk";
--> statement-breakpoint
ALTER TABLE "prompt_releases" DROP CONSTRAINT IF EXISTS "prompt_releases_pipeline_agent_env_unique";
--> statement-breakpoint
ALTER TABLE "prompt_templates" DROP CONSTRAINT IF EXISTS "prompt_templates_pipeline_agent_version_unique";
--> statement-breakpoint
DROP INDEX IF EXISTS "prompt_releases_pipeline_agent_env_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "prompt_templates_pipeline_agent_version_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_prompt_templates_pipeline_agent_version";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_prompt_templates_pipeline_key_status";--> statement-breakpoint
INSERT INTO "agents" ("agent_key")
SELECT DISTINCT "agent_key" FROM "pipeline_steps"
ON CONFLICT ("agent_key") DO NOTHING;--> statement-breakpoint
INSERT INTO "agents" ("agent_key")
SELECT DISTINCT "agent_key" FROM "prompt_templates"
ON CONFLICT ("agent_key") DO NOTHING;--> statement-breakpoint
INSERT INTO "agents" ("agent_key")
SELECT DISTINCT "agent_key" FROM "prompt_releases"
ON CONFLICT ("agent_key") DO NOTHING;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "pipeline_steps" ADD CONSTRAINT "pipeline_steps_agent_key_agents_agent_key_fk" FOREIGN KEY ("agent_key") REFERENCES "public"."agents"("agent_key") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "prompt_releases" ADD CONSTRAINT "prompt_releases_agent_key_agents_agent_key_fk" FOREIGN KEY ("agent_key") REFERENCES "public"."agents"("agent_key") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "prompt_templates" ADD CONSTRAINT "prompt_templates_agent_key_agents_agent_key_fk" FOREIGN KEY ("agent_key") REFERENCES "public"."agents"("agent_key") ON DELETE no action ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "prompt_releases_agent_env_unique" ON "prompt_releases" USING btree ("agent_key","environment");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "prompt_templates_agent_version_unique" ON "prompt_templates" USING btree ("agent_key","version");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_prompt_templates_agent_version" ON "prompt_templates" USING btree ("agent_key","version");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_prompt_templates_agent_key_status" ON "prompt_templates" USING btree ("agent_key","status");--> statement-breakpoint
ALTER TABLE "prompt_releases" DROP COLUMN IF EXISTS "pipeline_key";--> statement-breakpoint
ALTER TABLE "prompt_templates" DROP COLUMN IF EXISTS "pipeline_key";--> statement-breakpoint
DROP POLICY IF EXISTS "ag_select" ON "agents";--> statement-breakpoint
CREATE POLICY "ag_select" ON "agents" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
DROP POLICY IF EXISTS "ag_insert" ON "agents";--> statement-breakpoint
CREATE POLICY "ag_insert" ON "agents" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
DROP POLICY IF EXISTS "ag_update" ON "agents";--> statement-breakpoint
CREATE POLICY "ag_update" ON "agents" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
DROP POLICY IF EXISTS "ag_delete" ON "agents";--> statement-breakpoint
CREATE POLICY "ag_delete" ON "agents" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));