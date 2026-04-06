-- Ensure agents.agent_key updates cascade to referencing tables.
-- Note: pipeline_steps.target_key is polymorphic (agent/pipeline/prompt_template),
-- so FK cannot be declared directly there. Trigger sync is used for target_type='agent'.

BEGIN;

ALTER TABLE "prompt_templates"
  DROP CONSTRAINT IF EXISTS "prompt_templates_agent_key_agents_agent_key_fk";

ALTER TABLE "prompt_templates"
  ADD CONSTRAINT "prompt_templates_agent_key_agents_agent_key_fk"
  FOREIGN KEY ("agent_key")
  REFERENCES "public"."agents"("agent_key")
  ON DELETE NO ACTION
  ON UPDATE CASCADE;

ALTER TABLE "prompt_releases"
  DROP CONSTRAINT IF EXISTS "prompt_releases_agent_key_agents_agent_key_fk";

ALTER TABLE "prompt_releases"
  ADD CONSTRAINT "prompt_releases_agent_key_agents_agent_key_fk"
  FOREIGN KEY ("agent_key")
  REFERENCES "public"."agents"("agent_key")
  ON DELETE NO ACTION
  ON UPDATE CASCADE;

CREATE OR REPLACE FUNCTION public.sync_pipeline_steps_target_key_from_agents()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.agent_key IS DISTINCT FROM OLD.agent_key THEN
    UPDATE public.pipeline_steps
       SET target_key = NEW.agent_key
     WHERE target_type = 'agent'
       AND target_key = OLD.agent_key;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_agents_key_update_sync_pipeline_steps ON public.agents;

CREATE TRIGGER trg_agents_key_update_sync_pipeline_steps
AFTER UPDATE OF agent_key ON public.agents
FOR EACH ROW
EXECUTE FUNCTION public.sync_pipeline_steps_target_key_from_agents();

COMMIT;
