ALTER TABLE "item_similarity_edges" DROP CONSTRAINT "item_similarity_edges_source_item_id_item_contents_id_fk";
--> statement-breakpoint
ALTER TABLE "item_similarity_edges" DROP CONSTRAINT "item_similarity_edges_target_item_id_item_contents_id_fk";
--> statement-breakpoint
ALTER TABLE "item_similarity_edges" ADD CONSTRAINT "item_similarity_edges_source_item_id_item_contents_id_fk" FOREIGN KEY ("source_item_id") REFERENCES "public"."item_contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_similarity_edges" ADD CONSTRAINT "item_similarity_edges_target_item_id_item_contents_id_fk" FOREIGN KEY ("target_item_id") REFERENCES "public"."item_contents"("id") ON DELETE cascade ON UPDATE no action;