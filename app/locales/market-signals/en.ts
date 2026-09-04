import type { MarketSignalsTranslation } from "./types";

const marketSignalsEn: MarketSignalsTranslation = {
  meta: {
    title: "Market Signals",
  },
  title: "Market Signals",
  subtitle: "Period rankings aggregated from Global Market Issues",
  experimentalBadge: "Experimental",
  adminOnlyHint: "Admin-only preview. Can be opened to all users later.",
  scopeLabel: "Scope",
  scopeValue: "Global Market Issues",
  periodTypes: {
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
  },
  status: {
    draft: "In progress",
    final: "Final",
  },
  empty: {
    noSnapshots: "No snapshots for this period type yet.",
    noItems: "No signals to show (may be below minCount).",
  },
  metaSidebar: {
    period: "Period",
    range: "Range",
    sources: "Sources",
    signals: "Signals",
    updated: "Updated",
    layer: "Aggregation layer",
    partial: "Partial",
    partialYes: "Includes in-progress child periods",
    partialNo: "Complete",
  },
  trends: {
    rising: "Rising",
    falling: "Falling",
    new: "New",
    stable: "Stable",
  },
  takeaway: {
    title: "At a glance",
    topSignal: "Top signal is {{name}} ({{count}}).",
    risingCount: "{{count}} rising",
    newCount: "{{count}} new",
  },
};

export default marketSignalsEn;
