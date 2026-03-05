ALTER TABLE "final_reports" RENAME TO "reports";--> statement-breakpoint
ALTER TABLE "report_embeddings" DROP CONSTRAINT "report_embeddings_report_id_final_reports_id_fk";
--> statement-breakpoint
ALTER TABLE "report_items" DROP CONSTRAINT "report_items_report_id_final_reports_id_fk";
--> statement-breakpoint
ALTER TABLE "report_items" DROP CONSTRAINT "report_items_item_id_market_memory_items_id_fk";
--> statement-breakpoint
ALTER TABLE "report_items" DROP CONSTRAINT "report_items_report_id_item_id_pk";--> statement-breakpoint
ALTER TABLE "report_items" ALTER COLUMN "item_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "item_embeddings" ADD COLUMN "lang_type" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "market_memory_items" ADD COLUMN "source_lang" text;--> statement-breakpoint
ALTER TABLE "report_embeddings" ADD COLUMN "lang_type" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "report_items" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "report_items" ADD COLUMN "refer_report_id" uuid;--> statement-breakpoint
ALTER TABLE "report_embeddings" ADD CONSTRAINT "report_embeddings_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_items" ADD CONSTRAINT "report_items_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_items" ADD CONSTRAINT "report_items_refer_report_id_reports_id_fk" FOREIGN KEY ("refer_report_id") REFERENCES "public"."reports"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_items" ADD CONSTRAINT "report_items_item_id_market_memory_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."market_memory_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "report_items_report_id_item_id_unique" ON "report_items" USING btree ("report_id","item_id");