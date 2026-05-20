CREATE TABLE "daily_market_snapshot_staging" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"market_date" date NOT NULL,
	"market_scope" text NOT NULL,
	"generation_timezone" text DEFAULT 'Asia/Tokyo' NOT NULL,
	"fetched_at" timestamp with time zone NOT NULL,
	"snapshot" jsonb NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"daily_market_memory_id" uuid,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_market_snapshot_staging" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "daily_market_snapshot_staging" ADD CONSTRAINT "daily_market_snapshot_staging_daily_market_memory_id_daily_market_memories_id_fk" FOREIGN KEY ("daily_market_memory_id") REFERENCES "public"."daily_market_memories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "dmss_one_active_per_date_scope" ON "daily_market_snapshot_staging" USING btree ("market_date","market_scope") WHERE "daily_market_snapshot_staging"."status" = 'active';--> statement-breakpoint
CREATE INDEX "idx_dmss_market_date" ON "daily_market_snapshot_staging" USING btree ("market_date" desc);--> statement-breakpoint
CREATE INDEX "idx_dmss_scope_status_fetched" ON "daily_market_snapshot_staging" USING btree ("market_scope","status","fetched_at" desc);--> statement-breakpoint
CREATE INDEX "idx_dmss_memory_id" ON "daily_market_snapshot_staging" USING btree ("daily_market_memory_id");--> statement-breakpoint
CREATE POLICY "dmss_select" ON "daily_market_snapshot_staging" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dmss_insert" ON "daily_market_snapshot_staging" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dmss_update" ON "daily_market_snapshot_staging" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dmss_delete" ON "daily_market_snapshot_staging" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));