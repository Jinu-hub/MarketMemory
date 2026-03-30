import React, { useState } from 'react';
import {
  NexCard,
  NexCardHeader,
  NexCardTitle,
  NexCardDescription,
  NexCardContent,
  NexBadge,
} from '~/core/components/nex';
import {
  TrendingUp,
  TrendingDown,
  BookOpen,
  Clock,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Zap,
  AlertTriangle,
  ArrowRight,
  Lightbulb,
  Quote,
  Target,
  Activity,
  Globe,
  Cpu,
  DollarSign,
  Building2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const REPORT_DATA = {
  headline: 'AI Infrastructure Spending Surge Reshapes Semiconductor Landscape',
  date: 'March 28, 2026',
  readTime: '8 min read',
  category: 'Sector Analysis',
  summary:
    'Major hyperscalers have collectively committed over $320B in AI-related capital expenditure for 2026, representing a 78% year-over-year increase. This unprecedented spending wave is creating structural demand shifts across the semiconductor value chain, with particular implications for advanced packaging, HBM memory, and custom silicon.',
  keyPoints: [
    {
      icon: TrendingUp,
      title: 'CapEx Acceleration',
      text: 'Combined AI infrastructure spending by top 5 hyperscalers reached $320B, up from $180B in 2025.',
    },
    {
      icon: Cpu,
      title: 'Supply Chain Bottleneck',
      text: 'Advanced packaging capacity (CoWoS) remains the primary constraint, with lead times extending to 12+ months.',
    },
    {
      icon: DollarSign,
      title: 'Margin Expansion',
      text: 'Semiconductor companies with AI exposure are seeing gross margins expand 300-500bps above historical averages.',
    },
    {
      icon: AlertTriangle,
      title: 'Risk Factor',
      text: 'Potential demand pullback in H2 2027 if enterprise AI ROI fails to materialize at scale.',
    },
  ],
  detailedAnalysis: `The current AI infrastructure buildout represents the largest concentrated capital deployment in technology history. Unlike previous cycles driven by consumer internet or mobile adoption, this cycle is characterized by extreme capital intensity per unit of compute capacity.

Three structural dynamics are shaping the investment thesis:

First, the compute-to-revenue ratio for AI workloads remains significantly higher than traditional cloud. Training runs for frontier models now require clusters exceeding 100,000 GPUs, creating demand visibility that extends 18-24 months forward. This has fundamentally changed the procurement cycle from just-in-time to strategic reservation.

Second, the architecture transition from monolithic GPUs to system-level solutions (combining custom ASICs, advanced packaging, and high-bandwidth memory) is broadening the beneficiary set. Companies previously considered second-tier suppliers are now critical bottleneck providers.

Third, geographic diversification of supply chains, driven by both policy and risk management, is creating parallel investment tracks. Capacity expansion in the US, Japan, and Europe is being subsidized at unprecedented levels, adding complexity but also resilience to the ecosystem.

The key risk remains the gap between infrastructure investment and revenue realization. Current implied AI revenue forecasts suggest the market needs to generate $600B+ in annual AI-specific revenue by 2028 to justify current spending levels.`,
};

const INSIGHTS = [
  {
    id: 1,
    text: 'TSMC CoWoS capacity expansion targets 2x by Q3 2026 — direct tailwind for AI accelerator supply',
    category: 'Supply Chain',
    impact: 'positive' as const,
    source: 'Earnings Call Analysis',
  },
  {
    id: 2,
    text: 'Enterprise AI adoption rate inflecting: 34% of Fortune 500 now running production AI workloads vs 12% a year ago',
    category: 'Demand Signal',
    impact: 'positive' as const,
    source: 'Survey Data',
  },
  {
    id: 3,
    text: 'Memory pricing cycle peaking — HBM premium narrowing as Samsung ramps yield to 78%',
    category: 'Pricing',
    impact: 'negative' as const,
    source: 'Channel Check',
  },
  {
    id: 4,
    text: 'Custom silicon trend accelerating: Google TPU v6, Amazon Trainium3, Microsoft Maia 2 all in volume production',
    category: 'Competition',
    impact: 'neutral' as const,
    source: 'Product Tracker',
  },
  {
    id: 5,
    text: 'Power infrastructure becoming binding constraint — Northern Virginia data center permits delayed 6-9 months',
    category: 'Infrastructure',
    impact: 'negative' as const,
    source: 'Field Research',
  },
  {
    id: 6,
    text: 'Japan semiconductor subsidy program expanded to ¥4T — Rapidus fab on track for 2027 pilot production',
    category: 'Policy',
    impact: 'positive' as const,
    source: 'Government Filing',
  },
];

const TIMELINE_EVENTS = [
  {
    date: 'Jan 2026',
    title: 'NVIDIA Blackwell Ultra Announced',
    description:
      'Next-generation GPU architecture with 2.5x training performance improvement. Major hyperscalers confirm multi-billion dollar orders.',
    significance: 'high' as const,
  },
  {
    date: 'Feb 2026',
    title: 'Meta Commits $65B AI CapEx',
    description:
      'Largest single-company AI infrastructure commitment to date. Signals sustained demand trajectory for custom silicon and networking equipment.',
    significance: 'high' as const,
  },
  {
    date: 'Feb 2026',
    title: 'Samsung HBM4 Yield Breakthrough',
    description:
      'Production yields reach 78%, narrowing the gap with SK Hynix. Pricing pressure expected in H2 as supply normalizes.',
    significance: 'medium' as const,
  },
  {
    date: 'Mar 2026',
    title: 'EU Chips Act Phase 2 Funding Approved',
    description:
      '€15B allocated for advanced semiconductor manufacturing capacity in Europe. Intel and TSMC confirmed as primary beneficiaries.',
    significance: 'medium' as const,
  },
  {
    date: 'Mar 2026',
    title: 'OpenAI Stargate Cluster Online',
    description:
      'World\'s largest AI training cluster begins operations in Texas. 500,000+ GPU equivalent compute capacity demonstrates next-scale infrastructure requirements.',
    significance: 'high' as const,
  },
];

const CHART_DATA = [
  { label: 'Q1 \'25', value: 42, projected: false },
  { label: 'Q2 \'25', value: 48, projected: false },
  { label: 'Q3 \'25', value: 55, projected: false },
  { label: 'Q4 \'25', value: 68, projected: false },
  { label: 'Q1 \'26', value: 82, projected: false },
  { label: 'Q2 \'26', value: 91, projected: true },
  { label: 'Q3 \'26', value: 98, projected: true },
  { label: 'Q4 \'26', value: 105, projected: true },
];

const GRAPH_NODES = [
  { id: 'nvidia', label: 'NVIDIA', type: 'company' as const, x: 300, y: 180 },
  { id: 'tsmc', label: 'TSMC', type: 'company' as const, x: 520, y: 100 },
  { id: 'ai-capex', label: 'AI CapEx Surge', type: 'event' as const, x: 140, y: 100 },
  { id: 'hbm', label: 'HBM Memory', type: 'sector' as const, x: 520, y: 280 },
  { id: 'skhynix', label: 'SK Hynix', type: 'company' as const, x: 680, y: 190 },
  { id: 'packaging', label: 'Adv. Packaging', type: 'sector' as const, x: 300, y: 320 },
  { id: 'power', label: 'Power Infra', type: 'sector' as const, x: 100, y: 260 },
];

const GRAPH_EDGES = [
  { from: 'ai-capex', to: 'nvidia' },
  { from: 'nvidia', to: 'tsmc' },
  { from: 'nvidia', to: 'hbm' },
  { from: 'tsmc', to: 'packaging' },
  { from: 'hbm', to: 'skhynix' },
  { from: 'ai-capex', to: 'power' },
  { from: 'packaging', to: 'hbm' },
  { from: 'ai-capex', to: 'hbm' },
];

// ---------------------------------------------------------------------------
// Section Header Component
// ---------------------------------------------------------------------------

function SectionHeader({
  title,
  description,
  badge,
}: {
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        {badge && (
          <span className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            {badge}
          </span>
        )}
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">{title}</h2>
      <p className="text-base text-muted-foreground max-w-2xl">{description}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section 1: ReportBlock
// ---------------------------------------------------------------------------

function ReportBlockDemo() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="mb-16">
      <SectionHeader
        badge="Content Block"
        title="ReportBlock"
        description="Structured long-form report container with strong typography hierarchy, key points extraction, and expandable detailed analysis. Designed for reading comfort, not dashboard metrics."
      />

      <article className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Report Header */}
        <div className="px-8 pt-8 pb-6 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <NexBadge variant="secondary" size="sm">
              {REPORT_DATA.category}
            </NexBadge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {REPORT_DATA.readTime}
            </span>
            <span className="text-xs text-muted-foreground">{REPORT_DATA.date}</span>
          </div>

          <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight mb-4">
            {REPORT_DATA.headline}
          </h3>

          <p className="text-base md:text-lg leading-relaxed text-muted-foreground max-w-3xl">
            {REPORT_DATA.summary}
          </p>
        </div>

        {/* Key Points */}
        <div className="px-8 py-6 bg-muted/30">
          <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Key Points
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {REPORT_DATA.keyPoints.map((point, idx) => {
              const Icon = point.icon;
              return (
                <div
                  key={idx}
                  className="flex gap-3 p-4 rounded-lg bg-card border border-border"
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground mb-1">{point.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{point.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expandable Analysis */}
        <div className="px-8 py-6 border-t border-border">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors mb-4"
          >
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            {expanded ? 'Collapse Analysis' : 'Read Detailed Analysis'}
          </button>

          {expanded && (
            <div className="max-w-3xl animate-in fade-in slide-in-from-top-2 duration-300">
              {REPORT_DATA.detailedAnalysis.split('\n\n').map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-base leading-[1.8] text-foreground/85 mb-5 last:mb-0"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>
      </article>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section 2: InsightCard
// ---------------------------------------------------------------------------

function InsightCardsDemo() {
  const impactColors = {
    positive: 'border-l-emerald-500 dark:border-l-emerald-400',
    negative: 'border-l-red-500 dark:border-l-red-400',
    neutral: 'border-l-amber-500 dark:border-l-amber-400',
  };

  const impactBadgeVariant = {
    positive: 'success' as const,
    negative: 'error' as const,
    neutral: 'warning' as const,
  };

  const impactIcons = {
    positive: TrendingUp,
    negative: TrendingDown,
    neutral: Activity,
  };

  return (
    <section className="mb-16">
      <SectionHeader
        badge="Insight Layer"
        title="InsightCards"
        description="Compact, high-signal insight cards for surfacing key takeaways. Denser than generic cards — designed for scanning, not browsing. Each card encodes direction and urgency through its accent color."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {INSIGHTS.map((insight) => {
          const ImpactIcon = impactIcons[insight.impact];
          return (
            <div
              key={insight.id}
              className={`
                bg-card border border-border rounded-lg p-4 border-l-[3px]
                ${impactColors[insight.impact]}
                hover:bg-accent/50 transition-colors cursor-pointer group
              `}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <NexBadge variant={impactBadgeVariant[insight.impact]} size="sm">
                  <ImpactIcon className="w-3 h-3 mr-1" />
                  {insight.category}
                </NexBadge>
              </div>

              <p className="text-sm font-medium leading-snug text-foreground mb-3 group-hover:text-foreground/90">
                {insight.text}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{insight.source}</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section 3: Timeline
// ---------------------------------------------------------------------------

function TimelineDemo() {
  const significanceStyles = {
    high: 'bg-primary border-primary',
    medium: 'bg-muted-foreground/60 border-muted-foreground/60',
    low: 'bg-muted-foreground/30 border-muted-foreground/30',
  };

  return (
    <section className="mb-16">
      <SectionHeader
        badge="Chronological"
        title="Timeline"
        description="Narrative-driven event timeline for tracking sequential developments. Each node carries context and significance — this is a storyline, not a changelog."
      />

      <div className="bg-card border border-border rounded-xl p-6 md:p-8">
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[7px] md:left-[9px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-8">
            {TIMELINE_EVENTS.map((event, idx) => (
              <div key={idx} className="relative flex gap-5 md:gap-6">
                {/* Node marker */}
                <div className="flex-shrink-0 relative z-10">
                  <div
                    className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 ${significanceStyles[event.significance]}`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 pb-2 -mt-0.5">
                  <div className="flex items-center gap-3 mb-1.5">
                    <time className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                      {event.date}
                    </time>
                    {event.significance === 'high' && (
                      <NexBadge variant="secondary" size="sm">
                        High Impact
                      </NexBadge>
                    )}
                  </div>
                  <h4 className="text-base font-semibold text-foreground mb-1.5">{event.title}</h4>
                  <p className="text-sm leading-relaxed text-muted-foreground max-w-xl">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section 4: DataInsightBlock
// ---------------------------------------------------------------------------

function DataInsightBlockDemo() {
  const maxValue = Math.max(...CHART_DATA.map((d) => d.value));
  const chartHeight = 200;

  return (
    <section className="mb-16">
      <SectionHeader
        badge="Data + Interpretation"
        title="DataInsightBlock"
        description="Charts should never appear in isolation. This block combines visual data, explanatory context, and a clear conclusion — ensuring every chart tells a complete story."
      />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Chart Header */}
        <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-base font-semibold text-foreground">
              Hyperscaler AI CapEx Trajectory
            </h4>
            <NexBadge variant="info" size="sm">
              <BarChart3 className="w-3 h-3 mr-1" />
              Quarterly ($B)
            </NexBadge>
          </div>
          <p className="text-sm text-muted-foreground">
            Combined AI infrastructure spending — Top 5 hyperscalers
          </p>
        </div>

        {/* Chart Area */}
        <div className="px-6 md:px-8 pb-4">
          <div className="relative border border-border rounded-lg bg-muted/20 p-4 md:p-6">
            {/* Y-axis grid lines */}
            <svg
              viewBox={`0 0 ${CHART_DATA.length * 80} ${chartHeight}`}
              className="w-full"
              preserveAspectRatio="none"
              style={{ height: chartHeight }}
            >
              {/* Horizontal grid lines */}
              {[0.25, 0.5, 0.75, 1].map((ratio) => (
                <line
                  key={ratio}
                  x1="0"
                  y1={chartHeight * (1 - ratio)}
                  x2={CHART_DATA.length * 80}
                  y2={chartHeight * (1 - ratio)}
                  className="stroke-border"
                  strokeDasharray="4 4"
                />
              ))}

              {/* Bars */}
              {CHART_DATA.map((d, i) => {
                const barHeight = (d.value / maxValue) * (chartHeight - 20);
                const barX = i * 80 + 20;
                const barWidth = 40;
                return (
                  <g key={i}>
                    <rect
                      x={barX}
                      y={chartHeight - barHeight}
                      width={barWidth}
                      height={barHeight}
                      rx={4}
                      className={
                        d.projected
                          ? 'fill-primary/30 stroke-primary stroke-1 stroke-dasharray-[4,2]'
                          : 'fill-primary/70'
                      }
                      style={d.projected ? { strokeDasharray: '4 2' } : undefined}
                    />
                    <text
                      x={barX + barWidth / 2}
                      y={chartHeight - barHeight - 6}
                      textAnchor="middle"
                      className="fill-muted-foreground text-[10px]"
                    >
                      ${d.value}B
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2 px-5">
              {CHART_DATA.map((d, i) => (
                <span
                  key={i}
                  className={`text-xs ${d.projected ? 'text-muted-foreground/60 italic' : 'text-muted-foreground'}`}
                >
                  {d.label}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-primary/70" />
                <span className="text-xs text-muted-foreground">Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-primary/30 border border-primary border-dashed" />
                <span className="text-xs text-muted-foreground">Projected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interpretation */}
        <div className="px-6 md:px-8 py-5 bg-muted/30 border-t border-border">
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-foreground mb-1.5">Interpretation</h5>
              <p className="text-sm leading-relaxed text-muted-foreground">
                The quarter-over-quarter acceleration is steepening, not flattening. Q1 2026 alone
                exceeded full-year 2024 AI CapEx for most hyperscalers. The projected trajectory
                assumes current order book visibility and announced capacity plans, but does not
                factor potential demand elasticity if inference costs decline faster than expected.
              </p>
            </div>
          </div>
        </div>

        {/* Conclusion */}
        <div className="px-6 md:px-8 py-5 border-t border-border">
          <div className="flex gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <Target className="w-4 h-4 text-foreground" />
            </div>
            <div>
              <h5 className="text-sm font-semibold text-foreground mb-1.5">Conclusion</h5>
              <p className="text-sm leading-relaxed text-muted-foreground">
                At current run rates, the semiconductor supply chain will struggle to keep pace
                through 2026. Companies with structural exposure to advanced packaging,
                high-bandwidth memory, and power delivery infrastructure remain the most direct
                beneficiaries. Monitor Q2 earnings calls for signals of demand durability beyond
                the current committed order cycle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section 5: GraphView Preview
// ---------------------------------------------------------------------------

function GraphViewDemo() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodeStyles = {
    company: {
      fill: 'fill-primary/20',
      stroke: 'stroke-primary',
      textClass: 'fill-foreground',
      radius: 28,
    },
    event: {
      fill: 'fill-amber-500/15 dark:fill-amber-400/15',
      stroke: 'stroke-amber-500 dark:stroke-amber-400',
      textClass: 'fill-foreground',
      radius: 32,
    },
    sector: {
      fill: 'fill-emerald-500/15 dark:fill-emerald-400/15',
      stroke: 'stroke-emerald-500 dark:stroke-emerald-400',
      textClass: 'fill-foreground',
      radius: 28,
    },
  };

  return (
    <section className="mb-16">
      <SectionHeader
        badge="Relational"
        title="GraphView Preview"
        description="Conceptual knowledge graph connecting companies, sectors, and events. Hover to explore relationships. This is a mock preview — full interactive graph implementation would use a dedicated graph library."
      />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 md:px-8 pt-6 pb-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary/40 border border-primary" />
              <span className="text-xs text-muted-foreground">Company</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500" />
              <span className="text-xs text-muted-foreground">Event</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500" />
              <span className="text-xs text-muted-foreground">Sector</span>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="relative border border-border rounded-lg bg-muted/10 overflow-hidden">
            <svg viewBox="0 0 780 400" className="w-full" style={{ minHeight: 320 }}>
              {/* Edges */}
              {GRAPH_EDGES.map((edge, idx) => {
                const from = GRAPH_NODES.find((n) => n.id === edge.from)!;
                const to = GRAPH_NODES.find((n) => n.id === edge.to)!;
                const isHighlighted =
                  hoveredNode === edge.from || hoveredNode === edge.to;
                return (
                  <line
                    key={idx}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    className={`transition-all duration-200 ${
                      isHighlighted
                        ? 'stroke-primary/60'
                        : 'stroke-border'
                    }`}
                    strokeWidth={isHighlighted ? 2 : 1}
                  />
                );
              })}

              {/* Nodes */}
              {GRAPH_NODES.map((node) => {
                const style = nodeStyles[node.type];
                const isHovered = hoveredNode === node.id;
                const isConnected =
                  hoveredNode !== null &&
                  GRAPH_EDGES.some(
                    (e) =>
                      (e.from === hoveredNode && e.to === node.id) ||
                      (e.to === hoveredNode && e.from === node.id),
                  );
                const dimmed = hoveredNode !== null && !isHovered && !isConnected;

                return (
                  <g
                    key={node.id}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className={`cursor-pointer transition-opacity duration-200 ${
                      dimmed ? 'opacity-25' : 'opacity-100'
                    }`}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isHovered ? style.radius + 4 : style.radius}
                      className={`${style.fill} ${style.stroke} transition-all duration-200`}
                      strokeWidth={isHovered ? 2 : 1.5}
                    />
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className={`${style.textClass} text-[11px] font-medium pointer-events-none`}
                    >
                      {node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <div className="px-6 md:px-8 pb-6">
          <p className="text-xs text-muted-foreground">
            Hover over nodes to explore connections. In a full implementation, nodes would be
            clickable to navigate to detailed entity pages, and the graph layout would be computed
            dynamically using force-directed algorithms.
          </p>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Section 6: Reading Layout
// ---------------------------------------------------------------------------

function ReadingLayoutDemo() {
  return (
    <section className="mb-16">
      <SectionHeader
        badge="Reading Experience"
        title="Reading-Focused Layout"
        description="Long-form content layout optimized for sustained reading. Generous line height, constrained measure, and clear typographic hierarchy reduce cognitive load across all themes."
      />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-6 md:px-8 pt-8 pb-6 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <NexBadge variant="info" size="sm">
              <BookOpen className="w-3 h-3 mr-1" />
              Deep Dive
            </NexBadge>
            <span className="text-xs text-muted-foreground">15 min read</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight mb-3">
            The Compute-Energy Nexus: Why Power Infrastructure Is the Next Bottleneck
          </h3>
          <p className="text-lg text-muted-foreground leading-relaxed">
            As AI workloads scale beyond current projections, the binding constraint is shifting
            from silicon to electrons. Understanding this transition is critical for positioning
            in the next phase of the infrastructure buildout.
          </p>
        </div>

        {/* Article Body */}
        <div className="px-6 md:px-12 lg:px-16 py-8 md:py-12">
          <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-base leading-[1.85] text-foreground/85">
              The semiconductor industry has long operated under the assumption that compute
              density improvements would outpace demand growth. Moore&apos;s Law, and its various
              successors, provided a reliable framework: each generation of chips delivered more
              performance per watt, keeping total power consumption manageable even as workloads
              expanded.
            </p>

            <p className="text-base leading-[1.85] text-foreground/85">
              AI has shattered this assumption. Training runs for frontier models now consume
              power measured in hundreds of megawatts, sustained over weeks or months. A single
              large training cluster can draw more electricity than a small city. And unlike
              traditional data center workloads that exhibit daily cycling patterns, AI training
              runs at near-peak utilization 24/7.
            </p>

            {/* Pull Quote */}
            <blockquote className="relative pl-6 py-4 my-8 border-l-[3px] border-primary/50">
              <Quote className="absolute -left-3 -top-2 w-6 h-6 text-primary/20" />
              <p className="text-lg font-medium leading-relaxed text-foreground/90 italic">
                &ldquo;We&apos;re no longer in a world where power is a line item on the data
                center budget. It&apos;s becoming the strategic constraint that determines where
                and how fast you can build.&rdquo;
              </p>
              <cite className="block mt-3 text-sm text-muted-foreground not-italic">
                — Infrastructure Lead, Major Hyperscaler (Q1 2026 Earnings Call)
              </cite>
            </blockquote>

            <h4 className="text-xl font-semibold text-foreground mt-10 mb-4">
              The Numbers Tell the Story
            </h4>

            <p className="text-base leading-[1.85] text-foreground/85">
              Northern Virginia — the world&apos;s largest data center market — added 1.2 GW of
              committed power capacity in 2025 alone. Yet the pipeline of approved projects
              already exceeds available grid capacity by an estimated 3-4 GW. Permitting
              timelines have stretched from 12 months to 36+ months in some jurisdictions,
              creating a multi-year bottleneck that semiconductor companies cannot solve alone.
            </p>

            {/* Inline Highlight Box */}
            <div className="rounded-lg bg-muted/50 border border-border p-5 my-8">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Key Metric</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Global data center power consumption is projected to reach 1,000 TWh by 2028,
                    up from 460 TWh in 2024. AI workloads account for approximately 40% of the
                    incremental demand. At current grid expansion rates, the supply gap widens
                    to ~150 TWh by 2027.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-base leading-[1.85] text-foreground/85">
              This dynamic is creating a new class of investment opportunities at the
              intersection of energy and technology. Companies that can deliver power — whether
              through grid infrastructure, on-site generation, nuclear microreactors, or advanced
              battery storage — are becoming critical enablers of the AI buildout. The compute
              stack is expanding downward, from software and silicon into physical infrastructure.
            </p>

            <h4 className="text-xl font-semibold text-foreground mt-10 mb-4">
              Implications for Investors
            </h4>

            <p className="text-base leading-[1.85] text-foreground/85">
              The investment thesis is shifting from &ldquo;who makes the best chips&rdquo; to
              &ldquo;who can deliver complete compute infrastructure at scale.&rdquo; This favors
              vertically integrated players and creates opportunities for infrastructure
              companies that were previously outside the technology investment universe. Power
              utilities, electrical equipment manufacturers, and energy storage companies are
              becoming part of the AI supply chain — whether they intended to or not.
            </p>

            {/* In-Content Insight Callout */}
            <div className="flex items-start gap-3 p-4 rounded-lg border-l-[3px] border-l-emerald-500 dark:border-l-emerald-400 bg-emerald-500/5 dark:bg-emerald-400/5 my-8">
              <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">Related Insight</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Japan&apos;s expanded semiconductor subsidy program (¥4T) includes dedicated
                  allocations for data center power infrastructure, recognizing that chip
                  manufacturing capacity without adequate power is a stranded asset.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Article Footer */}
        <div className="px-6 md:px-8 py-5 border-t border-border bg-muted/20">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground mr-2">Topics:</span>
            <NexBadge variant="outline" size="sm">Power Infrastructure</NexBadge>
            <NexBadge variant="outline" size="sm">AI CapEx</NexBadge>
            <NexBadge variant="outline" size="sm">Data Centers</NexBadge>
            <NexBadge variant="outline" size="sm">Energy Transition</NexBadge>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function SampleComponentsPage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <NexBadge variant="secondary" size="sm">
              <Building2 className="w-3 h-3 mr-1" />
              Market Memory
            </NexBadge>
            <NexBadge variant="outline" size="sm">
              Content Layer Samples
            </NexBadge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Content + Insight UI Showcase
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Market Memory를 위한 콘텐츠 중심 UI 컴포넌트 샘플 모음입니다. 기존 Nex 디자인
            시스템 위에 리포트, 인사이트, 타임라인, 데이터 해석, 그래프 탐색 등 의미 기반
            콘텐츠 레이어를 확장합니다.
          </p>
          <div className="mt-6 h-px bg-border" />
        </div>

        {/* Demo Sections */}
        <ReportBlockDemo />
        <InsightCardsDemo />
        <TimelineDemo />
        <DataInsightBlockDemo />
        <GraphViewDemo />
        <ReadingLayoutDemo />

        {/* Footer Note */}
        <NexCard className="mt-8">
          <NexCardHeader>
            <NexCardTitle as="h4">Design Notes</NexCardTitle>
            <NexCardDescription>
              이 페이지의 모든 컴포넌트는 시맨틱 테마 토큰(bg-background, text-foreground,
              border-border 등)을 사용합니다. Light, Dark, Warm 테마 모두에서 동작하도록
              설계되었으며, 하드코딩된 색상 값을 의도적으로 배제했습니다.
            </NexCardDescription>
          </NexCardHeader>
          <NexCardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="font-semibold text-foreground mb-1">Base Layer</p>
                <p className="text-muted-foreground">
                  NexCard, NexBadge 등 기존 디자인 시스템 프리미티브를 그대로 활용
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="font-semibold text-foreground mb-1">Content Layer</p>
                <p className="text-muted-foreground">
                  ReportBlock, InsightCard, Timeline 등 의미 기반 콘텐츠 블록
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="font-semibold text-foreground mb-1">Theme Compatible</p>
                <p className="text-muted-foreground">
                  시맨틱 토큰 전용 — warm reading theme 확장 시 자동 대응
                </p>
              </div>
            </div>
          </NexCardContent>
        </NexCard>
      </div>
    </div>
  );
}
