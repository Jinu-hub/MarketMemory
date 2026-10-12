
ALTER TABLE "prompt_releases" DROP CONSTRAINT IF EXISTS "prompt_releases_environment_check";--> statement-breakpoint
ALTER TABLE "prompt_releases" ADD CONSTRAINT "prompt_releases_environment_check" CHECK ("prompt_releases"."environment" in ('default', 'production', 'dev'));