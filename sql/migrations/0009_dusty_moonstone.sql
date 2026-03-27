ALTER TABLE "item_contents" DROP CONSTRAINT "item_contents_prompt_id_prompt_templates_id_fk";
--> statement-breakpoint
DROP INDEX "idx_item_contents_prompt_id";--> statement-breakpoint
ALTER TABLE "item_contents" DROP COLUMN "prompt_id";