import {
  AlertTriangleIcon,
  CompassIcon,
  GaugeIcon,
  LandmarkIcon,
  ScaleIcon,
  SparklesIcon,
  type LucideIcon,
} from "lucide-react";

import {
  SEMANTIC_ACCENTS,
  type NexBadgeVariant,
} from "~/core/lib/semantic-style";

import type {
  ImpactLevel,
  SignalType,
} from "../fixtures/signal-radar";

type SignalTypeVisual = {
  accentBorder: string;
  accentBg: string;
  accentText: string;
  badgeVariant: NexBadgeVariant;
  icon: LucideIcon;
};

/**
 * Visual accent per `signal_type`.
 * Reuses the shared `SEMANTIC_ACCENTS` palette so the Signal Radar shares
 * its language with other directional-accent surfaces in the app.
 */
export const SIGNAL_TYPE_STYLE = {
  risk: { ...SEMANTIC_ACCENTS.negative, icon: AlertTriangleIcon },
  opportunity: { ...SEMANTIC_ACCENTS.positive, icon: SparklesIcon },
  turning_point: { ...SEMANTIC_ACCENTS.info, icon: CompassIcon },
  macro_pressure: { ...SEMANTIC_ACCENTS.caution, icon: GaugeIcon },
  valuation_watch: { ...SEMANTIC_ACCENTS.caution, icon: ScaleIcon },
  policy_watch: { ...SEMANTIC_ACCENTS.info, icon: LandmarkIcon },
} as const satisfies Record<SignalType, SignalTypeVisual>;

export function getSignalTypeStyle(type: SignalType): SignalTypeVisual {
  return SIGNAL_TYPE_STYLE[type];
}

/** Badge variant per `impact_level` (potential market impact, not probability). */
export const IMPACT_LEVEL_BADGE_VARIANT = {
  Low: "outline",
  Medium: "warning",
  High: "error",
} as const satisfies Record<ImpactLevel, NexBadgeVariant>;

export function getImpactBadgeVariant(level: ImpactLevel): NexBadgeVariant {
  return IMPACT_LEVEL_BADGE_VARIANT[level];
}
