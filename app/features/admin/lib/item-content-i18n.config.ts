/**
 * item_content 리포트 다언어 관리 SSOT.
 * 지원 언어·웹훅 URL은 이 파일에서만 수정합니다.
 */
export const ITEM_CONTENT_I18N_SUPPORTED_LANGS = ["ko", "en", "ja"] as const;

export type ItemContentI18nLangCode = (typeof ITEM_CONTENT_I18N_SUPPORTED_LANGS)[number];

export const ITEM_CONTENT_I18N_LANG_LABELS: Record<ItemContentI18nLangCode, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
};

export interface ItemContentI18nWebhookConfig {
  url: string;
  secret?: string | null;
}

/** n8n 등 다언어 생성 파이프라인 Webhook — URL 확정 전까지 빈 문자열 */
export const ITEM_CONTENT_I18N_WEBHOOK: ItemContentI18nWebhookConfig = {
  url: "https://n8n.nex.it.com/webhook/c1220c74-a2e5-4f1e-81a0-bc57b090fb24",
  secret: null,
};

export const ITEM_CONTENT_I18N_TRACKING_KEY = "i18n_webhook_runs" as const;

/** URL에 `i18n` 쿼리가 없을 때 적용되는 다언어 필터 */
export const ITEM_CONTENT_I18N_DEFAULT_I18N_FILTER = "missing" as const;
