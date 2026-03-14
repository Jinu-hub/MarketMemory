CREATE TABLE "structured_metric_facts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_item_id" uuid,
	"date_value" date,
	"metric_key" text,
	"metric_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "structured_metric_facts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "structured_metric_facts" ADD CONSTRAINT "structured_metric_facts_source_item_id_market_memory_items_id_fk" FOREIGN KEY ("source_item_id") REFERENCES "public"."market_memory_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_structured_metric_facts_source_item_id" ON "structured_metric_facts" USING btree ("source_item_id");--> statement-breakpoint
CREATE INDEX "idx_structured_metric_facts_date_value" ON "structured_metric_facts" USING btree ("date_value");--> statement-breakpoint
CREATE INDEX "idx_structured_metric_facts_metric_key" ON "structured_metric_facts" USING btree ("metric_key");--> statement-breakpoint
CREATE POLICY "smf_select" ON "structured_metric_facts" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "smf_insert" ON "structured_metric_facts" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "smf_update" ON "structured_metric_facts" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "smf_delete" ON "structured_metric_facts" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));