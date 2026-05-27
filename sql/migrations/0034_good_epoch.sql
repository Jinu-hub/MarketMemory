CREATE TABLE "report_series" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "report_series" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "market_memory_items" ADD COLUMN "series_id" uuid;--> statement-breakpoint
ALTER TABLE "market_memory_items" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "report_series_slug_unique" ON "report_series" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "market_memory_items" ADD CONSTRAINT "market_memory_items_series_id_report_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."report_series"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_market_memory_items_series_published" ON "market_memory_items" USING btree ("series_id","published_at" desc);--> statement-breakpoint
CREATE POLICY "rs_select" ON "report_series" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "rs_insert" ON "report_series" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "rs_update" ON "report_series" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "rs_delete" ON "report_series" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));