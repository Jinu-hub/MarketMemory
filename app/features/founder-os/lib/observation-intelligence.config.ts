/**
 * Observation Intelligence → n8n Webhook SSOT.
 * 선택된 collection_run id 목록을 POST body로 전달한다.
 */
export const OBSERVATION_INTELLIGENCE_WEBHOOK = {
  label: "n8n-observation-intelligence",
  url: "https://n8n.nex.it.com/webhook/5ff207cc-c36b-4049-a78f-c5d371fc1894",
  secret: null as string | null,
} as const;
