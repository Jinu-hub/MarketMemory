/**
 * 데일리 마켓 메모리 → n8n Webhook SSOT.
 * 파이프라인 DB 저장 성공 후 순서대로 POST (2번째부터 5초 간격).
 *
 * `url`: n8n Webhook 노드 Production URL
 * `secret`: Header Auth 사용 시 Authorization 값 (미사용이면 null)
 */
export interface DailyMarketMemoryN8nWebhookConfig {
  url: string;
  secret?: string | null;
}

export const DAILY_MARKET_MEMORY_N8N_WEBHOOKS: DailyMarketMemoryN8nWebhookConfig[] =
  [
    {
      url: "https://n8n.nex.it.com/webhook/db6e33fd-656f-4738-8639-a0606c12f0b0",
      secret: null,
    },
    // {
    //   url: "https://your-n8n.example/webhook/second-workflow",
    //   secret: null,
    // },
  ];
