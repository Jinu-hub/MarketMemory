CREATE TABLE "normalized_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_code" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"file_name" text,
	"page_count" integer,
	"root_block_count" integer,
	"item_count" integer,
	"table_count" integer,
	"md_body" text NOT NULL,
	"warnings" text[] DEFAULT '{}'::text[],
	"stats" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "normalized_documents" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE UNIQUE INDEX "normalized_documents_job_code_version_unique" ON "normalized_documents" USING btree ("job_code","version");--> statement-breakpoint
CREATE INDEX "idx_normalized_documents_job_code" ON "normalized_documents" USING btree ("job_code");--> statement-breakpoint
CREATE INDEX "idx_normalized_documents_created_at" ON "normalized_documents" USING btree ("created_at" desc);--> statement-breakpoint
CREATE POLICY "nd_select" ON "normalized_documents" AS PERMISSIVE FOR SELECT TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "nd_insert" ON "normalized_documents" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "nd_update" ON "normalized_documents" AS PERMISSIVE FOR UPDATE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)) WITH CHECK (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));--> statement-breakpoint
CREATE POLICY "nd_delete" ON "normalized_documents" AS PERMISSIVE FOR DELETE TO "authenticated" USING (exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true));