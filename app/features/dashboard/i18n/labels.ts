/**
 * Locale-aware labels for DB-driven semantic keys (mood, trend, severity).
 */
import { DASHBOARD_MESSAGES } from "./messages";
import { pickLocalized } from "./resolve";
import type { MarketMoodKey, RiskSeverityKey, TrendStatusKey } from "../types";

const { semantic } = DASHBOARD_MESSAGES;

export function getTrendStatusLabel(
  key: TrendStatusKey | null,
  locale?: string | null,
): string {
  return pickLocalized(
    semantic.trendStatus,
    locale,
    key ?? "unknown",
  );
}

export function getRiskSeverityLabel(
  key: RiskSeverityKey | null,
  locale?: string | null,
): string {
  return pickLocalized(
    semantic.riskSeverity,
    locale,
    key ?? "unknown",
  );
}

export function getMarketMoodLabel(
  key: MarketMoodKey | null,
  locale?: string | null,
): string {
  return pickLocalized(
    semantic.marketMood.labels,
    locale,
    key ?? "unknown",
  );
}

export function getMarketMoodDescription(
  key: MarketMoodKey | null,
  locale?: string | null,
): string {
  return pickLocalized(
    semantic.marketMood.descriptions,
    locale,
    key ?? "unknown",
  );
}

export function getMarketMoodSubdescription(
  key: MarketMoodKey | null,
  locale?: string | null,
): string {
  return pickLocalized(
    semantic.marketMood.subdescriptions,
    locale,
    key ?? "unknown",
  );
}
