CREATE TYPE "public"."target_type" AS ENUM('agent', 'pipeline', 'prompt_template');--> statement-breakpoint
ALTER TABLE "pipeline_steps" RENAME COLUMN "agent_key" TO "target_key";--> statement-breakpoint
ALTER TABLE "pipeline_steps" DROP CONSTRAINT IF EXISTS "pipeline_steps_agent_key_agents_agent_key_fk";
--> statement-breakpoint
DROP INDEX IF EXISTS "pipeline_steps_pipeline_key_agent_key_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "idx_pipeline_steps_agent_key";--> statement-breakpoint
ALTER TABLE "pipeline_steps" ADD COLUMN "target_type" "target_type" DEFAULT 'agent' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "pipeline_steps_pipeline_key_target_key_unique" ON "pipeline_steps" USING btree ("pipeline_key","target_key");--> statement-breakpoint
CREATE INDEX "idx_pipeline_steps_target_key" ON "pipeline_steps" USING btree ("target_key");