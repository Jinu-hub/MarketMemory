/**
 * Visual mapping for risk signal `severity`.
 * Labels: `~/features/dashboard/i18n/labels`.
 */
import type { LucideIcon } from "lucide-react";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  ShieldAlertIcon,
} from "lucide-react";

import type { NexBadgeVariant } from "~/core/lib/semantic-style";
import { SEMANTIC_ACCENTS } from "~/core/lib/semantic-style";

import type { RiskSeverity, RiskSeverityKey } from "../types";

export { getRiskSeverityLabel } from "../i18n/labels";

export type RiskSeverityStyle = {
  key: RiskSeverityKey | null;
  accentBorder: string;
  accentBg: string;
  accentText: string;
  badgeVariant: NexBadgeVariant;
  icon: LucideIcon;
};

const SEVERITY_VISUAL: Record<
  RiskSeverityKey,
  Omit<RiskSeverityStyle, "key">
> = {
  low: {
    ...SEMANTIC_ACCENTS.info,
    icon: InfoIcon,
  },
  medium: {
    ...SEMANTIC_ACCENTS.caution,
    icon: AlertTriangleIcon,
  },
  high: {
    accentBorder: "border-l-orange-500 dark:border-l-orange-400",
    accentBg: "bg-orange-500/5 dark:bg-orange-400/5",
    accentText: "text-orange-600 dark:text-orange-400",
    badgeVariant: "warning",
    icon: AlertCircleIcon,
  },
  critical: {
    ...SEMANTIC_ACCENTS.negative,
    icon: ShieldAlertIcon,
  },
};

const FALLBACK_STYLE: RiskSeverityStyle = {
  key: null,
  ...SEMANTIC_ACCENTS.muted,
  icon: AlertTriangleIcon,
};

function normalize(
  severity: RiskSeverity | null | undefined,
): RiskSeverityKey | null {
  if (!severity) return null;
  const key = severity.toString().trim().toLowerCase();
  if (["low", "minor", "낮음"].includes(key)) return "low";
  if (["medium", "moderate", "중간"].includes(key)) return "medium";
  if (["high", "elevated", "높음"].includes(key)) return "high";
  if (["critical", "severe", "심각"].includes(key)) return "critical";
  return null;
}

export function getRiskSeverityStyle(
  severity: RiskSeverity | null | undefined,
): RiskSeverityStyle {
  const key = normalize(severity);
  if (!key) return FALLBACK_STYLE;
  return { key, ...SEVERITY_VISUAL[key] };
}
