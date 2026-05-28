ALTER POLICY "ici_select" ON "item_content_i18n" TO authenticated USING (true);--> statement-breakpoint
ALTER POLICY "ic_select" ON "item_contents" TO authenticated USING (true);--> statement-breakpoint
ALTER POLICY "ise_select" ON "item_similarity_edges" TO authenticated USING (true);--> statement-breakpoint
ALTER POLICY "dmm_select" ON "daily_market_memories" TO authenticated USING (true);--> statement-breakpoint
ALTER POLICY "dmm_i18n_select" ON "daily_market_memory_i18n" TO authenticated USING (true);--> statement-breakpoint
ALTER POLICY "dmmri_select" ON "daily_market_memory_recall_i18n" TO authenticated USING (true);