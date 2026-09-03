CREATE TYPE "public"."market_signal_source_kind" AS ENUM('item_content', 'daily_market_memory');--> statement-breakpoint
CREATE TABLE "market_signal_snapshot_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snapshot_id" uuid NOT NULL,
	"source_kind" "market_signal_source_kind" NOT NULL,
	"source_id" uuid NOT NULL,
	"market_date" date,
	"report_type" text,
	"input_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "market_signal_snapshot_sources" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "market_signal_snapshot_sources" ADD CONSTRAINT "market_signal_snapshot_sources_snapshot_id_market_signal_snapshots_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."market_signal_snapshots"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "msss_snapshot_source_unique" ON "market_signal_snapshot_sources" USING btree ("snapshot_id","source_kind","source_id");--> statement-breakpoint
CREATE INDEX "idx_msss_snapshot_id" ON "market_signal_snapshot_sources" USING btree ("snapshot_id");--> statement-breakpoint
CREATE INDEX "idx_msss_source" ON "market_signal_snapshot_sources" USING btree ("source_kind","source_id");--> statement-breakpoint
CREATE INDEX "idx_msss_market_date" ON "market_signal_snapshot_sources" USING btree ("market_date" desc);--> statement-breakpoint
CREATE POLICY "msss_select" ON "market_signal_snapshot_sources" AS PERMISSIVE FOR SELECT TO "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "msss_insert" ON "market_signal_snapshot_sources" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "msss_update" ON "market_signal_snapshot_sources" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "msss_delete" ON "market_signal_snapshot_sources" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));