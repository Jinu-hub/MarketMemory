import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon, SparklesIcon } from "lucide-react";

import { NexBadge } from "~/core/components/nex";

type TrendType = "rising" | "falling" | "new" | "stable" | null;

const TREND_CONFIG = {
  rising: {
    variant: "success" as const,
    icon: ArrowUpRightIcon,
  },
  falling: {
    variant: "error" as const,
    icon: ArrowDownRightIcon,
  },
  new: {
    variant: "info" as const,
    icon: SparklesIcon,
  },
  stable: {
    variant: "secondary" as const,
    icon: MinusIcon,
  },
};

type SignalTrendBadgeProps = {
  trendType: TrendType;
  label: string;
};

export function SignalTrendBadge({ trendType, label }: SignalTrendBadgeProps) {
  if (!trendType) {
    return null;
  }
  const config = TREND_CONFIG[trendType];
  const Icon = config.icon;

  return (
    <NexBadge variant={config.variant} size="sm" icon={<Icon className="size-3" aria-hidden />}>
      {label}
    </NexBadge>
  );
}
