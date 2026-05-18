CREATE TABLE "daily_market_memory_embeddings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"daily_market_memory_id" uuid NOT NULL,
	"content_type" text NOT NULL,
	"lang_code" text NOT NULL,
	"embedding_text" text,
	"embedding" vector(3072) NOT NULL,
	"model" text,
	"version" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_market_memory_embeddings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint

CREATE TABLE "daily_market_memory_recall_i18n" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"similarity_edge_id" uuid NOT NULL,
	"lang_code" text NOT NULL,
	"display_label" text,
	"similarity_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "daily_market_memory_recall_i18n" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "daily_market_memory_similarity_edges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source_daily_market_memory_id" uuid NOT NULL,
	"target_daily_market_memory_id" uuid NOT NULL,
	"final_score" numeric,
	"vector_score" numeric,
	"tag_score" numeric,
	"entity_score" numeric,
	"mood_risk_score" numeric,
	"similarity_rank" integer,
	"similarity_method" text,
	"matched_tags" jsonb,
	"matched_entities" jsonb,
	"matched_themes" jsonb,
	"matched_risk_signals" jsonb,
	"source_snapshot" jsonb,
	"target_snapshot" jsonb,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

--> statement-breakpoint
ALTER TABLE "daily_market_memory_similarity_edges" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "item_embeddings" ADD COLUMN "embedding_text" text;--> statement-breakpoint
ALTER TABLE "report_embeddings" ADD COLUMN "embedding_text" text;--> statement-breakpoint
ALTER TABLE "daily_market_memory_embeddings" ADD CONSTRAINT "daily_market_memory_embeddings_daily_market_memory_id_daily_market_memories_id_fk" FOREIGN KEY ("daily_market_memory_id") REFERENCES "public"."daily_market_memories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_market_memory_recall_i18n" ADD CONSTRAINT "daily_market_memory_recall_i18n_similarity_edge_id_daily_market_memory_similarity_edges_id_fk" FOREIGN KEY ("similarity_edge_id") REFERENCES "public"."daily_market_memory_similarity_edges"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_market_memory_similarity_edges" ADD CONSTRAINT "daily_market_memory_similarity_edges_source_daily_market_memory_id_daily_market_memories_id_fk" FOREIGN KEY ("source_daily_market_memory_id") REFERENCES "public"."daily_market_memories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_market_memory_similarity_edges" ADD CONSTRAINT "daily_market_memory_similarity_edges_target_daily_market_memory_id_daily_market_memories_id_fk" FOREIGN KEY ("target_daily_market_memory_id") REFERENCES "public"."daily_market_memories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_daily_market_memory_embeddings_memory_id" ON "daily_market_memory_embeddings" USING btree ("daily_market_memory_id");--> statement-breakpoint
CREATE INDEX "idx_daily_market_memory_embeddings_content_lang" ON "daily_market_memory_embeddings" USING btree ("content_type","lang_code");--> statement-breakpoint
CREATE INDEX "idx_daily_market_memory_recall_i18n_edge_lang" ON "daily_market_memory_recall_i18n" USING btree ("similarity_edge_id","lang_code");--> statement-breakpoint
CREATE INDEX "idx_daily_market_memory_recall_i18n_lang" ON "daily_market_memory_recall_i18n" USING btree ("lang_code");--> statement-breakpoint
CREATE INDEX "idx_daily_market_memory_similarity_edges_source_rank" ON "daily_market_memory_similarity_edges" USING btree ("source_daily_market_memory_id","similarity_rank");--> statement-breakpoint
CREATE INDEX "idx_daily_market_memory_similarity_edges_source_visible_rank" ON "daily_market_memory_similarity_edges" USING btree ("source_daily_market_memory_id","is_visible","similarity_rank");--> statement-breakpoint
CREATE INDEX "idx_daily_market_memory_similarity_edges_target" ON "daily_market_memory_similarity_edges" USING btree ("target_daily_market_memory_id");--> statement-breakpoint
CREATE INDEX "idx_daily_market_memory_similarity_edges_score" ON "daily_market_memory_similarity_edges" USING btree ("final_score" desc);--> statement-breakpoint
CREATE POLICY "dmme_select" ON "daily_market_memory_embeddings" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dmme_insert" ON "daily_market_memory_embeddings" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dmme_update" ON "daily_market_memory_embeddings" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dmme_delete" ON "daily_market_memory_embeddings" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dmmri_select" ON "daily_market_memory_recall_i18n" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dmmri_insert" ON "daily_market_memory_recall_i18n" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dmmri_update" ON "daily_market_memory_recall_i18n" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dmmri_delete" ON "daily_market_memory_recall_i18n" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dmmse_select" ON "daily_market_memory_similarity_edges" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dmmse_insert" ON "daily_market_memory_similarity_edges" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dmmse_update" ON "daily_market_memory_similarity_edges" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "dmmse_delete" ON "daily_market_memory_similarity_edges" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));
