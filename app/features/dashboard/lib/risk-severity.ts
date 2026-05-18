/**
 * Visual semantic mapping for risk signal severity.
 */
import type { LucideIcon } from "lucide-react";
import {
  AlertCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  ShieldAlertIcon,
} from "lucide-react";

import type { RiskSeverity } from "../types";

type NexBadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "secondary"
  | "outline";

export type RiskSeverityStyle = {
  label: string;
  accentBorder: string;
  accentBg: string;
  accentText: string;
  badgeVariant: NexBadgeVariant;
  icon: LucideIcon;
};

const STYLES: Record<"low" | "medium" | "high" | "critical", RiskSeverityStyle> = {
  low: {
    label: "Low",
    accentBorder: "border-l-sky-500 dark:border-l-sky-400",
    accentBg: "bg-sky-500/5 dark:bg-sky-400/5",
    accentText: "text-sky-600 dark:text-sky-400",
    badgeVariant: "info",
    icon: InfoIcon,
  },
  medium: {
    label: "Medium",
    accentBorder: "border-l-amber-500 dark:border-l-amber-400",
    accentBg: "bg-amber-500/5 dark:bg-amber-400/5",
    accentText: "text-amber-600 dark:text-amber-400",
    badgeVariant: "warning",
    icon: AlertTriangleIcon,
  },
  high: {
    label: "High",
    accentBorder: "border-l-orange-500 dark:border-l-orange-400",
    accentBg: "bg-orange-500/5 dark:bg-orange-400/5",
    accentText: "text-orange-600 dark:text-orange-400",
    badgeVariant: "warning",
    icon: AlertCircleIcon,
  },
  critical: {
    label: "Critical",
    accentBorder: "border-l-rose-500 dark:border-l-rose-400",
    accentBg: "bg-rose-500/5 dark:bg-rose-400/5",
    accentText: "text-rose-600 dark:text-rose-400",
    badgeVariant: "error",
    icon: ShieldAlertIcon,
  },
};

const FALLBACK_STYLE: RiskSeverityStyle = {
  label: "주의",
  accentBorder: "border-l-border",
  accentBg: "bg-muted/40",
  accentText: "text-muted-foreground",
  badgeVariant: "outline",
  icon: AlertTriangleIcon,
};

function normalize(severity: RiskSeverity | null | undefined): keyof typeof STYLES | null {
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
  return STYLES[key];
}
