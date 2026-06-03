/**
 * Visual mapping for theme `signal_strength`.
 * Labels: `~/features/dashboard/i18n/labels`.
 */
import type { LucideIcon } from "lucide-react";
import {
  MinusIcon,
  SignalHighIcon,
  SignalLowIcon,
  SignalMediumIcon,
} from "lucide-react";

import type { NexBadgeVariant } from "~/core/lib/semantic-style";
import { SEMANTIC_ACCENTS } from "~/core/lib/semantic-style";

import type { SignalStrengthKey, ThemeSignalStrength } from "../types";

export { getSignalStrengthLabel } from "../i18n/labels";

export type SignalStrengthStyle = {
  key: SignalStrengthKey | null;
  accentBorder: string;
  accentText: string;
  badgeVariant: NexBadgeVariant;
  icon: LucideIcon;
};

const VISUALS: Record<
  SignalStrengthKey,
  Omit<SignalStrengthStyle, "key">
> = {
  high: {
    accentBorder: SEMANTIC_ACCENTS.positive.accentBorder,
    accentText: SEMANTIC_ACCENTS.positive.accentText,
    badgeVariant: SEMANTIC_ACCENTS.positive.badgeVariant,
    icon: SignalHighIcon,
  },
  medium: {
    accentBorder: SEMANTIC_ACCENTS.caution.accentBorder,
    accentText: SEMANTIC_ACCENTS.caution.accentText,
    badgeVariant: SEMANTIC_ACCENTS.caution.badgeVariant,
    icon: SignalMediumIcon,
  },
  low: {
    accentBorder: SEMANTIC_ACCENTS.muted.accentBorder,
    accentText: SEMANTIC_ACCENTS.muted.accentText,
    badgeVariant: SEMANTIC_ACCENTS.muted.badgeVariant,
    icon: SignalLowIcon,
  },
};

const FALLBACK_STYLE: SignalStrengthStyle = {
  key: null,
  accentBorder: SEMANTIC_ACCENTS.muted.accentBorder,
  accentText: SEMANTIC_ACCENTS.muted.accentText,
  badgeVariant: SEMANTIC_ACCENTS.muted.badgeVariant,
  icon: MinusIcon,
};

/** Normalize pipeline `signal_strength` (English aliases only) to a canonical key. */
export function resolveSignalStrengthKey(
  strength: ThemeSignalStrength | null | undefined,
): SignalStrengthKey | null {
  if (strength == null) return null;
  const key = strength.toString().trim().toLowerCase();
  if (["high", "strong", "elevated"].includes(key)) return "high";
  if (["medium", "moderate", "mid"].includes(key)) return "medium";
  if (["low", "weak", "minor"].includes(key)) return "low";
  return null;
}

export function getSignalStrengthStyle(
  strength: ThemeSignalStrength | null | undefined,
): SignalStrengthStyle {
  const key = resolveSignalStrengthKey(strength);
  if (!key) return FALLBACK_STYLE;
  return { key, ...VISUALS[key] };
}
