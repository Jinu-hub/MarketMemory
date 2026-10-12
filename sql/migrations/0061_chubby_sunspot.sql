CREATE TABLE "services" (
	"service_key" text PRIMARY KEY NOT NULL,
	"display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "services" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
INSERT INTO "services" ("service_key", "display_name") VALUES
  ('shared', '공용'),
  ('market_memory', 'Market Memory');--> statement-breakpoint
DROP INDEX "prompt_releases_agent_env_unique";--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "owner_service" text DEFAULT 'market_memory' NOT NULL;--> statement-breakpoint
ALTER TABLE "pipelines" ADD COLUMN "owner_service" text DEFAULT 'market_memory' NOT NULL;--> statement-breakpoint
ALTER TABLE "prompt_releases" ADD COLUMN "service_key" text DEFAULT 'market_memory' NOT NULL;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_owner_service_services_service_key_fk" FOREIGN KEY ("owner_service") REFERENCES "public"."services"("service_key") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pipelines" ADD CONSTRAINT "pipelines_owner_service_services_service_key_fk" FOREIGN KEY ("owner_service") REFERENCES "public"."services"("service_key") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prompt_releases" ADD CONSTRAINT "prompt_releases_service_key_services_service_key_fk" FOREIGN KEY ("service_key") REFERENCES "public"."services"("service_key") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "prompt_releases_agent_service_env_unique" ON "prompt_releases" USING btree ("agent_key","service_key","environment");--> statement-breakpoint
CREATE POLICY "sv_select" ON "services" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "sv_insert" ON "services" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "sv_update" ON "services" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "sv_delete" ON "services" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));