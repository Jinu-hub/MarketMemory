import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '~/core/components/ui/card';
import { Skeleton } from '~/core/components/ui/skeleton';
import { NexBadge } from '~/core/components/nex';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertCircle,
  RefreshCw,
  Lightbulb,
  Database,
  BookOpen,
  Target,
  Zap,
  Building2,
  BarChart3,
} from 'lucide-react';

// ─────────────────────────────────────────────────────────
// THEME CONSTANTS
// ─────────────────────────────────────────────────────────

const CHART = {
  c1: 'var(--color-chart-1)',
  c2: 'var(--color-chart-2)',
  c3: 'var(--color-chart-3)',
  c4: 'var(--color-chart-4)',
  c5: 'var(--color-chart-5)',
};

const TICK_STYLE = { fontSize: 11, fill: '#888' };
const GRID_COLOR = 'rgba(128, 128, 128, 0.1)';

// ─────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────

const CAPEX_TREND = [
  { q: "Q1'24", msft: 14, googl: 12, amzn: 12 },
  { q: "Q2'24", msft: 19, googl: 13, amzn: 15 },
  { q: "Q3'24", msft: 20, googl: 13, amzn: 22 },
  { q: "Q4'24", msft: 22, googl: 14, amzn: 26 },
  { q: "Q1'25", msft: 25, googl: 17, amzn: 28 },
  { q: "Q2'25", msft: 27, googl: 20, amzn: 30 },
  { q: "Q3'25", msft: 29, googl: 22, amzn: 32 },
  { q: "Q4'25", msft: 32, googl: 24, amzn: 36 },
];

const ANNUAL_CAPEX = [
  { co: 'AMZN', v: 105 },
  { co: 'MSFT', v: 80 },
  { co: 'GOOGL', v: 75 },
  { co: 'META', v: 65 },
  { co: 'AAPL', v: 25 },
];

const CLOUD_GROWTH = [
  { m: "Jan'25", aws: 29.3, azure: 41.5 },
  { m: "Mar'25", aws: 30.9, azure: 43.2 },
  { m: "May'25", aws: 32.1, azure: 45.0 },
  { m: "Jul'25", aws: 33.8, azure: 46.9 },
  { m: "Sep'25", aws: 35.2, azure: 49.1 },
  { m: "Nov'25", aws: 36.7, azure: 51.0 },
  { m: "Jan'26", aws: 38.9, azure: 53.8 },
  { m: "Mar'26", aws: 40.4, azure: 56.2 },
];

const GPU_SHARE = [
  { name: 'NVIDIA', v: 78 },
  { name: 'AMD', v: 17 },
  { name: 'Intel', v: 5 },
];

const PLATFORM_RADAR = [
  { d: 'Performance', nvda: 98, amd: 75 },
  { d: 'Software', nvda: 95, amd: 55 },
  { d: 'Memory', nvda: 90, amd: 70 },
  { d: 'Power Eff', nvda: 72, amd: 80 },
  { d: 'Price/Perf', nvda: 60, amd: 82 },
];

const HBM_DATA = [
  { q: "Q1'25", price: 28.5, shipments: 420 },
  { q: "Q2'25", price: 31.2, shipments: 510 },
  { q: "Q3'25", price: 29.8, shipments: 580 },
  { q: "Q4'25", price: 27.4, shipments: 640 },
  { q: "Q1'26", price: 26.1, shipments: 720 },
];

const NVDA_VS_AMD = [
  { q: "Q3'24", nvda: 35.1, amd: 6.8 },
  { q: "Q4'24", nvda: 39.3, amd: 7.1 },
  { q: "Q1'25", nvda: 44.1, amd: 7.4 },
  { q: "Q2'25", nvda: 45.0, amd: 7.7 },
  { q: "Q3'25", nvda: 47.5, amd: 8.1 },
  { q: "Q4'25", nvda: 51.0, amd: 8.6 },
];

const METRICS_DATA = [
  {
    label: 'AI CapEx Committed',
    value: '$320B',
    delta: '+78%',
    trend: 'up' as const,
    sub: '2026E vs. 2025',
  },
  {
    label: 'NVDA Data Center Rev',
    value: '$176B',
    delta: '+112%',
    trend: 'up' as const,
    sub: 'TTM, YoY',
  },
  {
    label: 'HBM Market Size',
    value: '$18.5B',
    delta: '+145%',
    trend: 'up' as const,
    sub: '2026E, YoY',
  },
  {
    label: 'Avg GPU Lead Time',
    value: '14 wks',
    delta: '+2wk',
    trend: 'neutral' as const,
    sub: "vs. Q4'25",
  },
];

const COST_CAPEX = [
  { yr: '2020', cost: 100, capex: 40 },
  { yr: '2021', cost: 68, capex: 55 },
  { yr: '2022', cost: 42, capex: 72 },
  { yr: '2023', cost: 24, capex: 95 },
  { yr: '2024', cost: 12, capex: 155 },
  { yr: '2025', cost: 6, capex: 248 },
  { yr: '2026E', cost: 3, capex: 380 },
];

// ─────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────

type TrendType = 'up' | 'down' | 'neutral';

interface TooltipPayloadEntry {
  color: string;
  name: string;
  value: number | string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  prefix?: string;
  suffix?: string;
}

// ─────────────────────────────────────────────────────────
// UTILITY COMPONENTS
// ─────────────────────────────────────────────────────────

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
      {badge && (
        <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">
          {badge}
        </p>
      )}
      <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">{title}</h2>
      <p className="text-base text-muted-foreground max-w-2xl">{description}</p>
    </div>
  );
}

function ChartTooltip({ active, payload, label, prefix = '', suffix = '' }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3.5 py-2.5 shadow-lg text-sm">
      <p className="text-xs font-medium text-muted-foreground mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-5">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: entry.color }}
              />
              {entry.name}
            </span>
            <span className="font-semibold text-foreground tabular-nums">
              {prefix}
              {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
              {suffix}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartContainer({
  title,
  description,
  badge,
  children,
  className = '',
}: {
  title: string;
  description?: string;
  badge?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            {description && (
              <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
            )}
          </div>
          {badge && (
            <NexBadge variant="outline" size="sm" className="flex-shrink-0">
              {badge}
            </NexBadge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">{children}</CardContent>
    </Card>
  );
}

function MetricCard({
  label,
  value,
  delta,
  trend,
  sub,
}: {
  label: string;
  value: string;
  delta: string;
  trend: TrendType;
  sub?: string;
}) {
  const Icon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity;
  const colorClass =
    trend === 'up'
      ? 'text-emerald-600 dark:text-emerald-400'
      : trend === 'down'
        ? 'text-red-500 dark:text-red-400'
        : 'text-amber-500 dark:text-amber-400';

  return (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
        {label}
      </p>
      <p className="text-3xl font-bold text-foreground tracking-tight leading-none">{value}</p>
      <div className="flex items-center gap-1.5">
        <Icon className={`w-3.5 h-3.5 ${colorClass}`} />
        <span className={`text-sm font-semibold ${colorClass}`}>{delta}</span>
        {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}

function EmptyState({ message = 'No data available' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
      <Database className="w-8 h-8 opacity-30" />
      <p className="text-sm font-medium text-foreground">{message}</p>
      <p className="text-xs opacity-60">Try adjusting the date range or filters</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-3 p-1">
      <div className="flex gap-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-44 w-full" />
      <div className="flex gap-3">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-14" />
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-3">
      <AlertCircle className="w-8 h-8 text-destructive opacity-50" />
      <p className="text-sm font-semibold text-foreground">Failed to load data</p>
      <p className="text-xs text-muted-foreground">The data source may be temporarily unavailable</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SECTION 1 — CHART FOUNDATIONS
// ─────────────────────────────────────────────────────────

function ChartFoundationsSection() {
  return (
    <section className="mb-16">
      <SectionHeader
        badge="Chart Patterns"
        title="Chart Foundations"
        description="Core reusable chart patterns for Market Memory's data layer. Each type serves a specific analytical role — trends over time, distributions, comparisons, and multi-dimensional profiles."
      />

      {/* Row 1: Line Chart — full width */}
      <div className="mb-6">
        <ChartContainer
          title="Hyperscaler AI CapEx — Quarterly Trend"
          description="Quarterly AI infrastructure spending per provider ($B)"
          badge="Line"
        >
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={CAPEX_TREND} margin={{ top: 4, right: 12, left: -4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="q" tick={TICK_STYLE} />
              <YAxis tick={TICK_STYLE} tickFormatter={(v) => `$${v}B`} />
              <Tooltip
                content={(props: any) => <ChartTooltip {...props} prefix="$" suffix="B" />}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Line
                type="monotone"
                dataKey="msft"
                name="Microsoft"
                stroke={CHART.c1}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="googl"
                name="Google"
                stroke={CHART.c2}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="amzn"
                name="Amazon"
                stroke={CHART.c3}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Row 2: Bar + Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <ChartContainer
          title="2026E Annual AI CapEx Commitments"
          description="Declared AI infrastructure spend ($B)"
          badge="Bar"
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ANNUAL_CAPEX} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="co" tick={TICK_STYLE} />
              <YAxis tick={TICK_STYLE} tickFormatter={(v) => `$${v}B`} />
              <Tooltip
                content={(props: any) => <ChartTooltip {...props} prefix="$" suffix="B" />}
              />
              <Bar dataKey="v" name="AI CapEx" fill={CHART.c1} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer
          title="Cloud Revenue Growth"
          description="Quarterly cloud segment revenue ($B)"
          badge="Area"
        >
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={CLOUD_GROWTH} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="gradAws" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART.c1} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={CHART.c1} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradAzure" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART.c2} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={CHART.c2} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="m" tick={TICK_STYLE} />
              <YAxis tick={TICK_STYLE} tickFormatter={(v) => `$${v}B`} />
              <Tooltip
                content={(props: any) => <ChartTooltip {...props} prefix="$" suffix="B" />}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Area
                type="monotone"
                dataKey="aws"
                name="AWS"
                stroke={CHART.c1}
                fill="url(#gradAws)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="azure"
                name="Azure"
                stroke={CHART.c2}
                fill="url(#gradAzure)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* Row 3: Pie + Radar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartContainer
          title="AI Accelerator Market Share"
          description="GPU vendor share — Q4 2025 estimate"
          badge="Pie"
        >
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie
                  data={GPU_SHARE}
                  dataKey="v"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={3}
                >
                  {GPU_SHARE.map((_, i) => (
                    <Cell key={i} fill={Object.values(CHART)[i] as string} />
                  ))}
                </Pie>
                <Tooltip content={(props: any) => <ChartTooltip {...props} suffix="%" />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              {GPU_SHARE.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ background: Object.values(CHART)[i] as string }}
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground tabular-nums">
                    {item.v}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartContainer>

        <ChartContainer
          title="Platform Capability Profile"
          description="NVIDIA vs AMD — indexed to 100 per dimension"
          badge="Radar"
        >
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart
              data={PLATFORM_RADAR}
              margin={{ top: 8, right: 24, left: 24, bottom: 8 }}
            >
              <PolarGrid stroke={GRID_COLOR} />
              <PolarAngleAxis dataKey="d" tick={{ fontSize: 11, fill: '#888' }} />
              <Radar
                name="NVIDIA"
                dataKey="nvda"
                stroke={CHART.c1}
                fill={CHART.c1}
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Radar
                name="AMD"
                dataKey="amd"
                stroke={CHART.c2}
                fill={CHART.c2}
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip content={(props: any) => <ChartTooltip {...props} />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// SECTION 2 — DATA INSIGHT BLOCK
// ─────────────────────────────────────────────────────────

function DataInsightBlockSection() {
  return (
    <section className="mb-16">
      <SectionHeader
        badge="Chart + Context"
        title="DataInsightBlock"
        description="Charts are not standalone objects. Every visualization in Market Memory is paired with explanation and conclusion — turning raw data into readable intelligence."
      />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="text-base font-semibold text-foreground">
              HBM Memory: Price Moderation Amid Volume Growth
            </h3>
            <NexBadge variant="secondary" size="sm">
              Semiconductor
            </NexBadge>
          </div>
          <p className="text-sm text-muted-foreground">
            Quarterly pricing ($/unit) and shipment volume (K units) — Q1 2025 to Q1 2026
          </p>
        </div>

        {/* Chart */}
        <div className="px-6 pt-5 pb-2">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={HBM_DATA} margin={{ top: 4, right: 20, left: -4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
              <XAxis dataKey="q" tick={TICK_STYLE} />
              <YAxis
                yAxisId="price"
                orientation="left"
                tick={TICK_STYLE}
                tickFormatter={(v) => `$${v}`}
              />
              <YAxis
                yAxisId="vol"
                orientation="right"
                tick={TICK_STYLE}
                tickFormatter={(v) => `${v}K`}
              />
              <Tooltip content={(props: any) => <ChartTooltip {...props} />} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              <Bar
                yAxisId="price"
                dataKey="price"
                name="Price ($/unit)"
                fill={CHART.c1}
                radius={[3, 3, 0, 0]}
                opacity={0.85}
              />
              <Bar
                yAxisId="vol"
                dataKey="shipments"
                name="Shipments (K units)"
                fill={CHART.c2}
                radius={[3, 3, 0, 0]}
                opacity={0.85}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* What this shows */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border">
          <div className="flex gap-3">
            <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1.5">What this shows</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                HBM pricing peaked in Q2 2025 as supply was severely constrained by CoWoS packaging
                bottlenecks at TSMC. As Samsung improved HBM3e yields through H2 2025, supply
                loosened — driving price moderation despite continued volume growth. This is a
                supply catch-up cycle, not a demand reversal.
              </p>
            </div>
          </div>
        </div>

        {/* Conclusion */}
        <div className="px-6 py-4 border-t border-border">
          <div className="flex gap-3">
            <Target className="w-4 h-4 text-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground mb-1.5">Conclusion</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                The price/volume divergence in Q4 2025–Q1 2026 is a healthy normalization, not a
                structural demand shift. Unit economics for HBM producers will compress, but revenue
                growth remains positive as volume increases offset per-unit price erosion. Monitor SK
                Hynix Q2 2026 guidance for signals on whether the price floor has been reached.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// SECTION 3 — COMPARISON PATTERNS
// ─────────────────────────────────────────────────────────

function ComparisonSection() {
  const latest = NVDA_VS_AMD[NVDA_VS_AMD.length - 1];
  const prev = NVDA_VS_AMD[NVDA_VS_AMD.length - 2];
  const nvdaDelta = (((latest.nvda - prev.nvda) / prev.nvda) * 100).toFixed(1);
  const amdDelta = (((latest.amd - prev.amd) / prev.amd) * 100).toFixed(1);
  const revenueRatio = (latest.nvda / latest.amd).toFixed(1);
  const nvdaShare = ((latest.nvda / (latest.nvda + latest.amd)) * 100).toFixed(0);
  const amdShare = ((latest.amd / (latest.nvda + latest.amd)) * 100).toFixed(0);

  return (
    <section className="mb-16">
      <SectionHeader
        badge="Comparison"
        title="Comparison Patterns"
        description="Side-by-side analysis of companies, time periods, or metrics. Delta indicators surface the directionality of change so users can scan without calculating."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main chart */}
        <div className="lg:col-span-2">
          <ChartContainer
            title="Quarterly Revenue: NVIDIA vs AMD"
            description="Total company revenue per quarter ($B)"
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={NVDA_VS_AMD}
                margin={{ top: 4, right: 4, left: -4, bottom: 0 }}
                barCategoryGap="25%"
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                <XAxis dataKey="q" tick={TICK_STYLE} />
                <YAxis tick={TICK_STYLE} tickFormatter={(v) => `$${v}B`} />
                <Tooltip
                  content={(props: any) => <ChartTooltip {...props} prefix="$" suffix="B" />}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="nvda" name="NVIDIA" fill={CHART.c1} radius={[3, 3, 0, 0]} />
                <Bar dataKey="amd" name="AMD" fill={CHART.c2} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Delta panel */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Latest Quarter ({latest.q})
            </p>

            <div className="mb-4 pb-4 border-b border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-foreground">NVIDIA</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                  <TrendingUp className="w-3 h-3" />
                  +{nvdaDelta}% QoQ
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">${latest.nvda}B</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Revenue</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-foreground">AMD</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                  <TrendingUp className="w-3 h-3" />
                  +{amdDelta}% QoQ
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">${latest.amd}B</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Revenue</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Revenue Gap
            </p>
            <p className="text-3xl font-bold text-foreground">{revenueRatio}×</p>
            <p className="text-xs text-muted-foreground mt-1 mb-3">
              NVIDIA to AMD revenue ratio in {latest.q}
            </p>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${nvdaShare}%`,
                  background: CHART.c1,
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5">
              <span>NVDA {nvdaShare}%</span>
              <span>AMD {amdShare}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// SECTION 4 — METRIC SUMMARY UI
// ─────────────────────────────────────────────────────────

function MetricSummarySection() {
  return (
    <section className="mb-16">
      <SectionHeader
        badge="KPI Layer"
        title="Metric Summary UI"
        description="Lightweight data tiles for high-level signal scanning. Each metric conveys value, direction, and context in a single unit — more refined than generic dashboard cards."
      />

      {/* Primary KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {METRICS_DATA.map((m, i) => (
          <MetricCard key={i} {...m} />
        ))}
      </div>

      {/* Mini sparkline tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                  NVDA Revenue
                </p>
                <p className="text-xl font-bold text-foreground mt-1">$51.0B</p>
              </div>
              <NexBadge variant="success" size="sm" icon={<TrendingUp className="w-3 h-3" />}>
                Q4&apos;25
              </NexBadge>
            </div>
            <ResponsiveContainer width="100%" height={56}>
              <LineChart data={NVDA_VS_AMD} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <Line
                  type="monotone"
                  dataKey="nvda"
                  stroke={CHART.c1}
                  strokeWidth={2}
                  dot={false}
                />
                <Tooltip content={() => null} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                  AMD Revenue
                </p>
                <p className="text-xl font-bold text-foreground mt-1">$8.6B</p>
              </div>
              <NexBadge variant="success" size="sm" icon={<TrendingUp className="w-3 h-3" />}>
                Q4&apos;25
              </NexBadge>
            </div>
            <ResponsiveContainer width="100%" height={56}>
              <LineChart data={NVDA_VS_AMD} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <Line
                  type="monotone"
                  dataKey="amd"
                  stroke={CHART.c2}
                  strokeWidth={2}
                  dot={false}
                />
                <Tooltip content={() => null} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                  HBM Shipments
                </p>
                <p className="text-xl font-bold text-foreground mt-1">720K units</p>
              </div>
              <NexBadge variant="info" size="sm">
                Q1&apos;26
              </NexBadge>
            </div>
            <ResponsiveContainer width="100%" height={56}>
              <LineChart data={HBM_DATA} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <Line
                  type="monotone"
                  dataKey="shipments"
                  stroke={CHART.c3}
                  strokeWidth={2}
                  dot={false}
                />
                <Tooltip content={() => null} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// SECTION 5 — CHART STATES
// ─────────────────────────────────────────────────────────

function ChartStatesSection() {
  const [retryCount, setRetryCount] = useState(0);

  return (
    <section className="mb-16">
      <SectionHeader
        badge="UI States"
        title="Chart States"
        description="Production-ready states for loading, empty data, and error conditions. Each state provides clear feedback and actionable affordances where appropriate."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <ChartContainer
          title="Loading State"
          description="Skeleton pulse while data fetches"
          badge="Loading"
        >
          <LoadingState />
        </ChartContainer>

        <ChartContainer
          title="Empty State"
          description="No data returned for this selection"
          badge="Empty"
        >
          <EmptyState message="No data for selected range" />
        </ChartContainer>

        <ChartContainer
          title="Error State"
          description="Failed to retrieve from data source"
          badge="Error"
        >
          <ErrorState onRetry={() => setRetryCount((c) => c + 1)} />
          {retryCount > 0 && (
            <p className="text-[11px] text-center text-muted-foreground pb-2">
              Retry attempted {retryCount}×
            </p>
          )}
        </ChartContainer>
      </div>

      {/* No comparison state */}
      <ChartContainer
        title="NVIDIA vs AMD — Revenue Comparison"
        description="Comparison period not selected"
        badge="No Comparison"
      >
        <div className="flex flex-col md:flex-row items-stretch gap-6">
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Current period only (Q4&apos;25)
            </p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart
                data={[NVDA_VS_AMD[NVDA_VS_AMD.length - 1]]}
                margin={{ top: 4, right: 4, left: -4, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} vertical={false} />
                <XAxis dataKey="q" tick={TICK_STYLE} />
                <YAxis tick={TICK_STYLE} tickFormatter={(v) => `$${v}B`} />
                <Tooltip
                  content={(props: any) => <ChartTooltip {...props} prefix="$" suffix="B" />}
                />
                <Bar dataKey="nvda" name="NVIDIA" fill={CHART.c1} radius={[3, 3, 0, 0]} />
                <Bar dataKey="amd" name="AMD" fill={CHART.c2} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center w-full md:w-56 h-36 md:h-auto border border-dashed border-border rounded-lg gap-2 text-muted-foreground bg-muted/20">
            <div className="text-center px-6">
              <Database className="w-5 h-5 opacity-30 mx-auto mb-2" />
              <p className="text-xs leading-relaxed">
                Select a comparison period to see side-by-side analysis
              </p>
            </div>
          </div>
        </div>
      </ChartContainer>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// SECTION 6 — READING-FRIENDLY DATA LAYOUT
// ─────────────────────────────────────────────────────────

function ReadingLayoutSection() {
  return (
    <section className="mb-16">
      <SectionHeader
        badge="Editorial + Data"
        title="Reading-Friendly Data Layout"
        description="Charts embedded in editorial report structure. Data and narrative coexist — each chart section is preceded by context and followed by interpretation."
      />

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Report header */}
        <div className="px-6 md:px-10 lg:px-14 pt-8 pb-6 border-b border-border">
          <div className="flex items-center gap-2 mb-4">
            <NexBadge variant="info" size="sm" icon={<BookOpen className="w-3 h-3" />}>
              Analysis
            </NexBadge>
            <span className="text-xs text-muted-foreground">March 2026</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight mb-3 max-w-2xl">
            The Compute-Cost Paradox: CapEx Rises as Price Per FLOP Falls
          </h3>
          <p className="text-base md:text-lg leading-relaxed text-muted-foreground max-w-2xl">
            AI training costs have declined 97% since 2020, yet total AI infrastructure investment
            is growing faster than at any point in technology history. Understanding why these
            trends coexist is essential for positioning in the current cycle.
          </p>
        </div>

        {/* Article body */}
        <div className="px-6 md:px-10 lg:px-16 py-8 md:py-12">
          <div className="max-w-2xl mx-auto">
            <p className="text-base leading-[1.85] text-foreground/85 mb-6">
              The unit economics of AI compute have improved at a pace that rivals semiconductor
              improvements over the last 50 years. A training run that cost $4.6M in 2020 now costs
              approximately $80,000 for equivalent output — a 98% reduction in five years. Yet
              paradoxically, total AI infrastructure spending is accelerating, not decelerating.
            </p>

            {/* Embedded chart */}
            <div className="my-8 rounded-xl border border-border overflow-hidden">
              <div className="px-5 pt-5 pb-3 bg-muted/30 border-b border-border">
                <p className="text-sm font-semibold text-foreground mb-0.5">
                  Training Cost Index vs. Infrastructure CapEx
                </p>
                <p className="text-xs text-muted-foreground">
                  Cost indexed to 2020 = 100 (left) · CapEx in $B (right)
                </p>
              </div>
              <div className="px-4 pt-4 pb-2">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart
                    data={COST_CAPEX}
                    margin={{ top: 4, right: 16, left: -4, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
                    <XAxis dataKey="yr" tick={TICK_STYLE} />
                    <YAxis yAxisId="cost" orientation="left" tick={TICK_STYLE} />
                    <YAxis
                      yAxisId="capex"
                      orientation="right"
                      tick={TICK_STYLE}
                      tickFormatter={(v) => `$${v}B`}
                    />
                    <Tooltip content={(props: any) => <ChartTooltip {...props} />} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Line
                      yAxisId="cost"
                      type="monotone"
                      dataKey="cost"
                      name="Cost Index"
                      stroke={CHART.c4}
                      strokeWidth={2}
                      dot={{ r: 3, fill: CHART.c4 }}
                    />
                    <Line
                      yAxisId="capex"
                      type="monotone"
                      dataKey="capex"
                      name="AI CapEx ($B)"
                      stroke={CHART.c1}
                      strokeWidth={2}
                      strokeDasharray="5 3"
                      dot={{ r: 3, fill: CHART.c1 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <p className="text-base leading-[1.85] text-foreground/85 mb-6">
              The resolution lies in the relationship between declining unit cost and expanding
              model scale. Each time the cost of training a given capability level halved,
              researchers used the savings to build models four times larger and eight times more
              capable. This is Jevons Paradox applied to compute: cheaper resources leads to more
              total consumption, not less.
            </p>

            {/* Insight callout */}
            <div className="flex items-start gap-3 p-4 rounded-lg border-l-[3px] border-l-primary/50 bg-primary/5 my-8">
              <Zap className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground mb-0.5">Key Insight</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Every 10× reduction in training cost has historically been followed by a 30–100×
                  increase in training budget. This pattern suggests the current CapEx cycle is
                  sustainable as long as model capabilities continue to improve meaningfully.
                </p>
              </div>
            </div>

            {/* Supporting metrics */}
            <div className="grid grid-cols-3 gap-3 my-8">
              {[
                { label: 'Cost Reduction', value: '97%', desc: '2020→2026', trend: 'down' as TrendType },
                { label: 'CapEx Growth', value: '850%', desc: '2020→2026', trend: 'up' as TrendType },
                { label: 'Model Scale', value: '1000×', desc: '2020→2026', trend: 'up' as TrendType },
              ].map((m, i) => {
                const Icon = m.trend === 'up' ? TrendingUp : TrendingDown;
                const colorClass =
                  m.trend === 'up'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-500 dark:text-amber-400';
                return (
                  <div
                    key={i}
                    className="bg-muted/40 border border-border rounded-lg p-3 text-center"
                  >
                    <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                    <p className="text-xl font-bold text-foreground">{m.value}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Icon className={`w-3 h-3 ${colorClass}`} />
                      <span className="text-[11px] text-muted-foreground">{m.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-base leading-[1.85] text-foreground/85">
              The investment implication is that infrastructure spending should be understood not as
              waste, but as the prerequisite for future capability. Companies that constrain CapEx
              in pursuit of short-term margin preservation risk falling behind on the capability
              curve that determines long-term competitive positioning in AI.
            </p>
          </div>
        </div>

        {/* Article footer */}
        <div className="px-6 md:px-10 lg:px-14 py-5 border-t border-border bg-muted/20">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground mr-1">Related:</span>
            <NexBadge variant="outline" size="sm">AI Economics</NexBadge>
            <NexBadge variant="outline" size="sm">CapEx Cycles</NexBadge>
            <NexBadge variant="outline" size="sm">Model Scaling</NexBadge>
            <NexBadge variant="outline" size="sm">Semiconductor</NexBadge>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────

export default function DataShowcasePage() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <NexBadge variant="secondary" size="sm" icon={<Building2 className="w-3 h-3" />}>
              Market Memory
            </NexBadge>
            <NexBadge variant="outline" size="sm">
              Data UI Showcase
            </NexBadge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Data + Intelligence UI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            Market Memory의 데이터 시각화 레이어 샘플 모음입니다. 차트 기본 패턴,
            데이터-인사이트 결합 블록, 비교 분석 UI, KPI 요약 타일, 상태 처리, 에디토리얼
            리포트 레이아웃을 포함합니다.
          </p>
          <div className="mt-6 h-px bg-border" />
        </div>

        <ChartFoundationsSection />
        <DataInsightBlockSection />
        <ComparisonSection />
        <MetricSummarySection />
        <ChartStatesSection />
        <ReadingLayoutSection />

        {/* Design notes */}
        <div className="bg-card border border-border rounded-xl p-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <p className="font-semibold text-foreground">Chart System</p>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Recharts 3 + CSS custom property color tokens. All charts adapt to light, dark, and
                warm themes via <code className="text-primary">var(--color-chart-N)</code>.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                <p className="font-semibold text-foreground">Insight Coupling</p>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                DataInsightBlock enforces the pattern: every chart is paired with context and
                conclusion. Data is never presented without interpretation.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <p className="font-semibold text-foreground">Editorial Layout</p>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                The reading layout section demonstrates how charts coexist with long-form narrative
                content in a report reading context.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
