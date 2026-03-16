/**
 * Updated_at triggers for admin / app tables
 *
 * Calls public.set_updated_at() (see sql/functions/set_updated_at.sql).
 * profiles and payments are defined in migration 0001.
 */

-- market_memory_items
CREATE TRIGGER set_market_memory_items_updated_at
BEFORE UPDATE ON public.market_memory_items
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- ocr_jobs
CREATE TRIGGER set_ocr_jobs_updated_at
BEFORE UPDATE ON public.ocr_jobs
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- normalized_documents
CREATE TRIGGER set_normalized_documents_updated_at
BEFORE UPDATE ON public.normalized_documents
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- item_tags
CREATE TRIGGER set_item_tags_updated_at
BEFORE UPDATE ON public.item_tags
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- prompt_releases
CREATE TRIGGER set_prompt_releases_updated_at
BEFORE UPDATE ON public.prompt_releases
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- reports
CREATE TRIGGER set_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- structured_metric_facts
CREATE TRIGGER set_structured_metric_facts_updated_at
BEFORE UPDATE ON public.structured_metric_facts
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();
