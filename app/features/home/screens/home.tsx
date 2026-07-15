/**
 * Market Memory — Landing (/)
 *
 * Editorial, paper-like landing page. Six sections built around one promise:
 *
 *   "흩어진 시장의 흐름을, 하나의 시선으로."
 *
 * Design notes (see `.cursor/rules/components.mdc`):
 *   - Warm-paper base via semantic tokens (bg-background, bg-card, border-border).
 *     The Warm theme naturally amplifies the paper feel.
 *   - Serif headlines (`font-serif`) + default sans body for an editorial voice.
 *   - The Hero anchor composition now stages **four** real product surfaces:
 *       · MainReadingCard  — ReportBlock + embedded DataInsightBlock (§4.1/§4.4)
 *       · FloatingChip     — InsightCard w/ delta + sparkline (§4.2)
 *       · FloatingTimeline — chronological narrative (§4.3)
 *       · FloatingGraph    — relational node fragment (§4.5)
 *     Each carries the directional category accent (§4.7) so the brand's four
 *     pillars — Substack · TradingView · Obsidian · Linear — all fire at once.
 *   - Section §4 is intentionally the page's breath-holding moment: wider
 *     container, softer backdrop, display-size type. Everything else stays
 *     quiet so this hit lands.
 */
import {
  ArrowRightIcon,
  BookOpenIcon,
  CompassIcon,
  FlagIcon,
  Link2Icon,
  QuoteIcon,
  Share2Icon,
  SparklesIcon,
  TargetIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import { NexBadge, NexButton, NexHero } from "~/core/components/nex";
import i18next from "~/core/lib/i18next.server";
import { socialShareMeta } from "~/core/lib/social-meta";
import { cn } from "~/core/lib/utils";
import { brandPageTitle, brandSignature } from "~/locales/brand";

import type { Route } from "./+types/home";

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  return {
    meta: {
      title: brandPageTitle(t("brand.name"), t("brand.tagline")),
      description: t("home.meta.description"),
    },
  };
}

export const meta: Route.MetaFunction = ({ data }) => {
  const title = data?.meta.title ?? "Market Memory";
  const description = data?.meta.description ?? "";
  return [
    { title },
    { name: "description", content: description },
    ...socialShareMeta({
      title,
      description,
      url: "/",
    }),
  ];
};

export default function Home(_props: Route.ComponentProps) {
  return (
    <main className="bg-background text-foreground">
      <HeroSection />
      <SectionDivider />
      <ProductFeelSection />
      <SectionDivider />
      <ThreeWaysSection />
      <TimelineManifestoSection />
      <SectionDivider />
      <ForReadersSection />
      <SectionDivider />
      <ClosingSection />
    </main>
  );
}

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

function SectionShell({
  children,
  className,
  size = "md",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "md" | "lg" | "xl";
}) {
  return (
    <section
      className={cn(
        "mx-auto w-full px-6 md:px-10",
        size === "xl"
          ? "max-w-7xl"
          : size === "lg"
            ? "max-w-6xl"
            : "max-w-5xl",
        className,
      )}
    >
      {children}
    </section>
  );
}

function SectionDivider() {
  return (
    <div className="mx-auto flex w-full max-w-5xl justify-center px-6 py-24 md:py-32">
      <span aria-hidden className="bg-border inline-block h-px w-24 md:w-32" />
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground text-[12px] font-medium tracking-[0.22em] uppercase md:text-[13px]">
      {children}
    </p>
  );
}

function ReaderLineMarker() {
  return (
    <span
      aria-hidden
      className="relative mt-2 flex size-5 shrink-0 items-center justify-center"
    >
      <span className="border-border/80 absolute inset-0 rounded-full border" />
      <span className="bg-primary/70 size-[5px] rounded-full shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-primary)_12%,transparent)]" />
    </span>
  );
}

// ---------------------------------------------------------------------------
// § 1 — Hero
// ---------------------------------------------------------------------------

function HeroSection() {
  const { t } = useTranslation();

  return (
    <>
      {/*
        Hero header expressed as NexHero (Base Layer).
        - Uses the `minimal` variant for a clean centered layout
        - `background="none"` so our dual-layer glow on HeroAnchor stays the
          only atmospheric element on the page
        - The eyebrow text becomes a NexBadge (trade-off: loses the
          uppercase tracking treatment, gains a reusable base primitive)
        - Title is a single string — NexHero doesn't accept ReactNode, so
          the previous "line break + italic second line" treatment is
          flattened here. Headline emphasis now comes from the size itself.
      */}
      {/*
        Hero expressed with the `centered` NexHero showcase pattern
        (see app/core/components/showcase/design-showcase.tsx:725-763).
        Uses the full feature set of the Base Layer component:
        badge · title · subtitle · description · primary+secondary CTA ·
        features row · social proof line. Copy is rewritten in an
        editorial voice so the marketing-style scaffold still reads as
        Market Memory's calm reader product.
      */}
      <NexHero
        variant="centered"
        size="xl"
        background="none"
        badge={{
          text: t("home.hero.badge"),
          variant: "info",
        }}
        title={t("brand.tagline")}
        titleClassName="whitespace-pre-line"
        subtitle={t("home.hero.tagline")}
        description={t("home.hero.description")}
        actions={{
          tertiary: {
            label: t("home.hero.viewSamples"),
            href: "/public-dashboard",
            variant: "gradient",
            icon: <SparklesIcon className="h-4 w-4" />,
            className:
              "from-[#5E6AD2] to-[#8B7CF6] shadow-[0_6px_20px_rgba(94,106,210,0.35)] hover:shadow-[0_10px_28px_rgba(94,106,210,0.5)] dark:from-[#7C89F9] dark:to-[#A78BFA]",
          },
          primary: {
            label: t("home.getStarted"),
            href: "/join",
            variant: "primary",
            icon: <ArrowRightIcon className="h-4 w-4" />,
          },
          secondary: {
            label: t("auth.signIn"),
            href: "/login",
            variant: "secondary",
            icon: <BookOpenIcon className="h-4 w-4" />,
          },
        }}
        features={[
          {
            icon: <BookOpenIcon className="h-5 w-5" />,
            text: t("home.hero.features.editedResearch"),
          },
          {
            icon: <CompassIcon className="h-5 w-5" />,
            text: t("home.hero.features.exploreByTopic"),
          },
          {
            icon: <Share2Icon className="h-5 w-5" />,
            text: t("home.hero.features.connectFlows"),
          },
        ]}
        social={{
          count: t("home.hero.social.badge"),
          text: t("home.hero.social.text"),
        }}
        className="pt-16 pb-0 md:pt-20"
      />

      <SectionShell className="pb-16 md:pb-20" size="lg">
        <HeroAnchor className="mt-10 md:mt-16" />
      </SectionShell>
    </>
  );
}

// ---------------------------------------------------------------------------
// § 1b — Hero anchor visual (읽기 + 구조화 + 연결을 한 장에)
// ---------------------------------------------------------------------------

function HeroAnchor({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto max-w-4xl", className)}>
      {/*
        Dual-layer atmospheric glow.
        - Layer 1: primary tint at the top-center (brand light)
        - Layer 2: warm amber tint at the bottom-left (paper warmth — Warm
          theme gets amplified; Light/Dark stay subtle)
        Both use color-mix against existing theme tokens so everything
        adapts across Light / Dark / Warm (rule §5).
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[15%] -bottom-[10%] -left-[15%] -right-[15%] -z-10 blur-3xl"
        style={{
          backgroundImage: [
            "radial-gradient(55% 50% at 50% 30%, color-mix(in srgb, var(--color-primary) 12%, transparent) 0%, transparent 70%)",
            "radial-gradient(35% 40% at 15% 85%, color-mix(in srgb, #f59e0b 10%, transparent) 0%, transparent 70%)",
          ].join(","),
        }}
      />

      {/*
        Faint ruled-paper backdrop — visible only behind the card, implies
        "editorial notebook". Kept at very low opacity so it never competes
        with the type.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, currentColor 0, currentColor 1px, transparent 1px, transparent 32px)",
          color: "var(--color-foreground)",
          maskImage:
            "radial-gradient(60% 60% at 50% 50%, black 40%, transparent 80%)",
          WebkitMaskImage:
            "radial-gradient(60% 60% at 50% 50%, black 40%, transparent 80%)",
        }}
      />

      <div className="relative">
        {/* Floating insight chip — top-left (InsightCard pattern, §4.2) */}
        <div className="absolute -top-6 -left-4 z-20 hidden md:block lg:-left-10">
          <FloatingChip />
        </div>

        {/* Floating graph fragment — bottom-left (GraphView pattern, §4.5) */}
        <div className="absolute -bottom-14 -left-6 z-20 hidden md:block lg:-left-14">
          <FloatingGraph />
        </div>

        {/* Floating timeline — bottom-right (TimelineComponent, §4.3) */}
        <div className="absolute -right-6 -bottom-12 z-20 hidden md:block lg:-right-14">
          <FloatingTimeline />
        </div>

        {/* Main reading card (ReportBlock + DataInsightBlock, §4.1/§4.4) */}
        <MainReadingCard />
      </div>
    </div>
  );
}

function MainReadingCard() {
  const { t } = useTranslation();
  const hooks = t("home.preview.hooksList", {
    returnObjects: true,
  }) as string[];

  return (
    <article
      aria-label={t("home.preview.reportAriaLabel")}
      className="bg-card border-border relative z-10 mx-auto w-full overflow-hidden rounded-2xl border border-l-[3px] border-l-cyan-500 shadow-[0_40px_90px_-45px_rgba(0,0,0,0.28),0_14px_36px_-18px_rgba(0,0,0,0.1)] dark:border-l-cyan-400"
    >
      {/* Editorial masthead — thin top rule with issue + date */}
      <div className="border-border/70 text-muted-foreground flex items-center justify-between border-b px-6 py-2.5 font-mono text-[10px] tracking-[0.2em] uppercase md:px-10">
        <span className="flex items-center gap-2">
          <span className="bg-cyan-500 inline-block size-1 rounded-full dark:bg-cyan-400" />
          {t("home.preview.issueLabel")}
        </span>
        <span>2026 · 03 · 18</span>
      </div>

      <div className="px-6 pt-7 pb-6 md:px-10 md:pt-9">
        <div className="flex flex-wrap items-center gap-2">
          <NexBadge variant="info" size="sm">
            <SparklesIcon className="mr-1 size-3" />
            {t("home.preview.editorialAngle")}
          </NexBadge>
          <span className="text-foreground/70 inline-flex items-center gap-1 text-[11px] font-medium tracking-wider uppercase">
            <TrendingUpIcon
              strokeWidth={1.5}
              className="size-3 text-cyan-600 dark:text-cyan-400"
            />
            {t("home.preview.trend")}
          </span>
        </div>

        <h3 className="font-serif mt-5 text-xl leading-snug font-semibold tracking-tight md:text-[1.625rem] md:leading-[1.25]">
          {t("home.preview.headline")}
        </h3>

        <div className="mt-6 flex gap-3 md:gap-4">
          <TargetIcon
            strokeWidth={1.5}
            className="text-foreground/60 mt-1 size-4 shrink-0"
          />
          <div>
            <p className="text-muted-foreground mb-1 text-[11px] font-semibold tracking-wider uppercase">
              {t("home.preview.keyTakeaway")}
            </p>
            <p className="text-foreground/90 text-[15px] leading-[1.8] md:text-base">
              {t("home.preview.takeawayBody")}
            </p>
          </div>
        </div>
      </div>

      {/* DataInsightBlock strip (rule §4.4) — chart + number + interpretation */}
      <DataInsightStrip />

      <div className="border-border border-t px-6 py-5 md:px-10">
        <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-wider uppercase">
          {t("home.preview.hooks")}
        </p>
        <ol className="space-y-2.5">
          {hooks.map((text, idx) => (
            <li key={idx} className="flex gap-3 text-sm leading-[1.8]">
              <span className="bg-background border-border text-foreground/80 mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px] font-semibold">
                {idx + 1}
              </span>
              <span className="text-foreground/85">{text}</span>
            </li>
          ))}
        </ol>
      </div>

      <figure className="border-border bg-muted/20 border-t px-6 py-4 md:px-10">
        <QuoteIcon
          strokeWidth={1.5}
          className="text-muted-foreground mb-1.5 size-4 opacity-40"
        />
        <blockquote className="text-foreground/80 text-[14px] leading-[1.8] italic">
          {t("home.preview.quote")}
        </blockquote>
      </figure>
    </article>
  );
}

/**
 * DataInsightBlock (rule §4.4) — every chart must travel with its
 * interpretation. The strip renders three micro-visualizations (sparkline,
 * bar, capped gauge) alongside a KPI number, a delta and a one-line
 * caption so the card can't read as "chart alone".
 */
function DataInsightStrip() {
  const { t } = useTranslation();

  return (
    <div className="border-border bg-muted/30 grid grid-cols-3 divide-x divide-[var(--color-border)] border-t">
      <DataTile
        label={t("home.preview.data.capex.label")}
        value="$320B"
        delta={t("home.preview.data.capex.delta")}
        caption={t("home.preview.data.capex.caption")}
        accent="cyan"
        viz={<MiniSparkline accent="cyan" />}
      />
      <DataTile
        label={t("home.preview.data.hbm.label")}
        value="94%"
        delta={t("home.preview.data.hbm.delta")}
        caption={t("home.preview.data.hbm.caption")}
        accent="amber"
        viz={<MiniBars accent="amber" />}
      />
      <DataTile
        label={t("home.preview.data.power.label")}
        value="2.4×"
        delta={t("home.preview.data.power.delta")}
        caption={t("home.preview.data.power.caption")}
        accent="emerald"
        viz={<MiniGauge accent="emerald" value={0.72} />}
      />
    </div>
  );
}

type Accent = "cyan" | "amber" | "emerald";

const ACCENT_TEXT: Record<Accent, string> = {
  cyan: "text-cyan-600 dark:text-cyan-400",
  amber: "text-amber-600 dark:text-amber-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
};

function DataTile({
  label,
  value,
  delta,
  caption,
  accent,
  viz,
}: {
  label: string;
  value: string;
  delta: string;
  caption: string;
  accent: Accent;
  viz: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 px-4 py-4 md:px-6">
      <p className="text-muted-foreground truncate text-[10px] font-semibold tracking-wider uppercase">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-foreground font-serif text-xl font-semibold tracking-tight md:text-2xl">
          {value}
        </span>
        <span
          className={cn(
            "text-[11px] font-semibold tracking-wide",
            ACCENT_TEXT[accent],
          )}
        >
          {delta}
        </span>
      </div>
      <div className="text-current opacity-80">{viz}</div>
      <p className="text-muted-foreground truncate text-[10.5px]">{caption}</p>
    </div>
  );
}

function MiniSparkline({ accent }: { accent: Accent }) {
  const pts = [6, 9, 7, 11, 10, 14, 18, 22];
  const max = 24;
  const w = 100;
  const h = 22;
  const step = w / (pts.length - 1);
  const path = pts
    .map((v, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (v / max) * h}`)
    .join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("h-[22px] w-full", ACCENT_TEXT[accent])}
    >
      <path d={area} fill="currentColor" fillOpacity={0.14} />
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MiniBars({ accent }: { accent: Accent }) {
  const vals = [0.4, 0.55, 0.5, 0.7, 0.65, 0.85, 0.94];
  return (
    <div
      aria-hidden
      className={cn("flex h-[22px] items-end gap-[3px]", ACCENT_TEXT[accent])}
    >
      {vals.map((v, i) => (
        <span
          key={i}
          className="flex-1 rounded-[1px] bg-current"
          style={{ height: `${v * 100}%`, opacity: 0.35 + v * 0.5 }}
        />
      ))}
    </div>
  );
}

function MiniGauge({ accent, value }: { accent: Accent; value: number }) {
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <div
      aria-hidden
      className={cn(
        "bg-border/60 relative h-[6px] w-full overflow-hidden rounded-full",
        ACCENT_TEXT[accent],
      )}
    >
      <span
        className="absolute inset-y-0 left-0 rounded-full bg-current"
        style={{ width: `${clamped * 100}%`, opacity: 0.85 }}
      />
    </div>
  );
}

function FloatingChip() {
  const { t } = useTranslation();

  return (
    <div
      className="bg-card border-border w-[280px] rounded-xl border border-l-[3px] border-l-emerald-500 p-4 shadow-[0_18px_44px_-22px_rgba(0,0,0,0.22)] dark:border-l-emerald-400"
      style={{ transform: "rotate(-2.5deg)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
          {t("home.preview.floatingChip.title")}
        </p>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <TrendingUpIcon strokeWidth={2} className="size-3" />
          +12.4%
        </span>
      </div>

      <p className="text-foreground mt-2 text-[13px] leading-snug font-medium">
        {t("home.preview.floatingChip.headline")}
      </p>

      <div className="mt-3">
        <MiniSparkline accent="emerald" />
      </div>

      <div className="text-muted-foreground mt-2 flex items-center justify-between text-[10px]">
        <span>{t("home.preview.floatingChip.period")}</span>
        <span className="font-mono">{t("home.preview.floatingChip.tickers")}</span>
      </div>
    </div>
  );
}

/**
 * FloatingGraph — tiny knowledge-graph fragment (rule §4.5).
 *
 * Four nodes, three edges, rendered as inline SVG so it stays crisp in every
 * theme. The central node ("AI") is the hub; the satellites show the
 * entities currently connected to this report. Intentionally read-only and
 * low-density so it reads as an artefact, not a widget.
 */
function FloatingGraph() {
  const { t } = useTranslation();

  const nodes: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
    accent: Accent;
    hub?: boolean;
  }> = [
    { id: "ai", label: "AI", x: 90, y: 54, accent: "cyan", hub: true },
    {
      id: "power",
      label: t("home.preview.floatingGraph.nodes.power"),
      x: 22,
      y: 22,
      accent: "emerald",
    },
    {
      id: "semi",
      label: t("home.preview.floatingGraph.nodes.semi"),
      x: 158,
      y: 24,
      accent: "amber",
    },
    {
      id: "dc",
      label: t("home.preview.floatingGraph.nodes.dc"),
      x: 38,
      y: 92,
      accent: "cyan",
    },
  ];
  const edges: Array<[string, string]> = [
    ["ai", "power"],
    ["ai", "semi"],
    ["ai", "dc"],
  ];
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  return (
    <div
      className="bg-card border-border w-[220px] rounded-xl border border-l-[3px] border-l-cyan-500 p-4 shadow-[0_18px_44px_-22px_rgba(0,0,0,0.22)] dark:border-l-cyan-400"
      style={{ transform: "rotate(-3deg)" }}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
          {t("home.preview.floatingGraph.title")}
        </p>
        <Share2Icon
          strokeWidth={1.5}
          className="text-muted-foreground size-3.5"
        />
      </div>

      <svg
        viewBox="0 0 190 120"
        className="h-[120px] w-full"
        aria-label={t("home.preview.floatingGraph.ariaLabel")}
      >
        {edges.map(([a, b]) => {
          const from = byId[a];
          const to = byId[b];
          return (
            <line
              key={`${a}-${b}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              className="stroke-border"
              strokeWidth={1}
              strokeDasharray="2 3"
            />
          );
        })}
        {nodes.map((n) => (
          <g key={n.id} className={ACCENT_TEXT[n.accent]}>
            <circle
              cx={n.x}
              cy={n.y}
              r={n.hub ? 7 : 4.5}
              fill="currentColor"
              fillOpacity={0.14}
            />
            <circle
              cx={n.x}
              cy={n.y}
              r={n.hub ? 4 : 2.5}
              fill="currentColor"
            />
            <text
              x={n.x}
              y={n.y + (n.hub ? 20 : 16)}
              textAnchor="middle"
              className="fill-foreground font-medium"
              style={{ fontSize: n.hub ? 10 : 9 }}
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function FloatingTimeline() {
  const { t } = useTranslation();
  const titles = t("home.preview.floatingTimeline.rows", {
    returnObjects: true,
  }) as string[];

  const rows: Array<{
    date: string;
    title: string;
    color: string;
  }> = [
    {
      date: "03. 18",
      title: titles[0],
      color: "text-cyan-600 dark:text-cyan-400",
    },
    {
      date: "03. 09",
      title: titles[1],
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      date: "02. 24",
      title: titles[2],
      color: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div
      className="bg-card border-border w-[280px] rounded-xl border border-l-[3px] border-l-amber-500 p-5 shadow-[0_20px_48px_-24px_rgba(0,0,0,0.22)] dark:border-l-amber-400"
      style={{ transform: "rotate(2deg)" }}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
          {t("home.preview.floatingTimeline.title")}
        </p>
        <Link2Icon
          strokeWidth={1.5}
          className="text-muted-foreground size-3.5"
        />
      </div>

      <div className="relative">
        <div className="bg-border absolute top-2 bottom-2 left-[6px] w-px" />
        <ul className="space-y-3">
          {rows.map((row, idx) => (
            <li key={idx} className="relative flex gap-3">
              <span
                className={cn(
                  "bg-background relative z-10 mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border-2",
                  row.color,
                )}
                style={{ borderColor: "currentColor" }}
              >
                <span className="size-1 rounded-full bg-current" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground font-mono text-[10px]">
                  {row.date}
                </p>
                <p className="text-foreground/85 truncate text-[12px] leading-snug font-medium">
                  {row.title}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// § 2 — Product feel (실제 리포트 단면 프리뷰)
// ---------------------------------------------------------------------------

function ProductFeelSection() {
  const { t } = useTranslation();

  return (
    <SectionShell size="lg">
      <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-[1fr_1.1fr] md:gap-20">
        <div className="max-w-md space-y-6">
          <Eyebrow>{t("home.productFeel.eyebrow")}</Eyebrow>
          <h2 className="font-serif whitespace-pre-line text-3xl leading-tight font-semibold tracking-tight md:text-[2.75rem]">
            {t("home.productFeel.headline")}
          </h2>
          <p className="text-muted-foreground text-base leading-[1.85] md:text-[17px]">
            {t("home.productFeel.body")}
          </p>
        </div>

        <div className="md:pl-6">
          <CompactReportCard />
        </div>
      </div>
    </SectionShell>
  );
}

function CompactReportCard() {
  const { t } = useTranslation();

  return (
    <article className="bg-card border-border mx-auto w-full max-w-md overflow-hidden rounded-xl border">
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-center gap-2">
          <NexBadge variant="info" size="sm">
            <SparklesIcon className="mr-1 size-3" />
            {t("home.preview.editorialAngle")}
          </NexBadge>
        </div>

        <h3 className="font-serif mt-4 text-lg leading-snug font-semibold tracking-tight md:text-xl">
          {t("home.productFeel.card.headline")}
        </h3>

        <p className="text-muted-foreground mt-3 text-sm leading-7">
          {t("home.productFeel.card.body")}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {[
            "us-10-year-treasury",
            "federal-reserve",
            "liquidity",
          ].map((tag) => (
            <span
              key={tag}
              className="bg-muted/60 text-muted-foreground rounded-md px-2 py-0.5 text-[11px]"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="border-border text-muted-foreground flex items-center justify-between border-t px-6 py-3 text-xs">
        <span>{t("home.productFeel.card.footerMeta")}</span>
        <span className="flex items-center gap-1">
          {t("home.continueReading")}
          <ArrowRightIcon className="size-3" />
        </span>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// § 3 — Three ways to use (읽기 / 탐색 / 연결)
// ---------------------------------------------------------------------------

function ThreeWaysSection() {
  const { t } = useTranslation();

  const threeWays: Array<{
    icon: typeof BookOpenIcon;
    title: string;
    body: string;
    to: string;
  }> = [
    {
      icon: BookOpenIcon,
      title: t("home.threeWays.read.title"),
      body: t("home.threeWays.read.body"),
      to: "/item_reports",
    },
    {
      icon: CompassIcon,
      title: t("home.threeWays.explore.title"),
      body: t("home.threeWays.explore.body"),
      to: "/item_reports/explore",
    },
    {
      icon: Link2Icon,
      title: t("home.threeWays.connect.title"),
      body: t("home.threeWays.connect.body"),
      to: "/item_reports/timeline",
    },
  ];

  return (
    <SectionShell size="lg">
      <div className="max-w-2xl">
        <Eyebrow>{t("home.threeWays.eyebrow")}</Eyebrow>
        <h2 className="font-serif mt-6 text-3xl leading-tight font-semibold tracking-tight md:text-[2.5rem]">
          {t("home.threeWays.headline")}
        </h2>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-10 md:mt-20 md:grid-cols-3 md:gap-8">
        {threeWays.map(({ icon: Icon, title, body, to }) => (
          <Link
            key={to}
            to={to}
            viewTransition
            className="group border-border hover:border-foreground flex flex-col gap-4 border-t pt-6 transition-colors"
          >
            <Icon strokeWidth={1.25} className="text-foreground/70 size-5" />
            <h3 className="font-serif text-xl font-semibold tracking-tight md:text-2xl">
              {title}
            </h3>
            <p className="text-muted-foreground text-[15px] leading-[1.8]">
              {body}
            </p>
            <span className="text-muted-foreground group-hover:text-foreground mt-2 inline-flex items-center gap-1 text-xs font-medium tracking-wide uppercase transition-colors">
              {t("home.goToLink")}
              <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </SectionShell>
  );
}

// ---------------------------------------------------------------------------
// § 4 — Timeline manifesto (페이지의 숨 멈추는 순간)
// ---------------------------------------------------------------------------

type TimelineSample = {
  date: string;
  title: string;
  category: "market" | "trend" | "issue" | "research";
};

const CATEGORY_COLORS: Record<TimelineSample["category"], string> = {
  market: "text-emerald-600 dark:text-emerald-400",
  trend: "text-cyan-600 dark:text-cyan-400",
  issue: "text-amber-600 dark:text-amber-400",
  research: "text-blue-600 dark:text-blue-400",
};

const CATEGORY_ICONS: Record<
  TimelineSample["category"],
  typeof BookOpenIcon
> = {
  market: TrendingUpIcon,
  trend: TrendingUpIcon,
  issue: FlagIcon,
  research: BookOpenIcon,
};

/**
 * The page's single bold section. Breaks out of the normal rhythm:
 *   - wider container (max-w-7xl)
 *   - soft full-bleed backdrop (bg-muted/40)
 *   - display-size headline (up to ~7xl on desktop)
 *   - tighter copy beneath so the headline absolutely lands first
 */
function TimelineManifestoSection() {
  const { t } = useTranslation();

  return (
    <section className="bg-muted/40 mt-32 py-28 md:mt-40 md:py-40">
      <SectionShell size="xl">
        <div className="mx-auto max-w-4xl text-center">
          <Eyebrow>{t("home.timelineManifesto.eyebrow")}</Eyebrow>
          <h2 className="font-serif mt-8 text-[2.75rem] leading-[1.1] font-semibold tracking-tight md:text-[5rem] md:leading-[1.02]">
            {t("home.timelineManifesto.headline")}
            <br />
            <span className="text-foreground/85 italic">
              {t("home.timelineManifesto.headlineEmphasis")}
            </span>
          </h2>
          <p className="text-muted-foreground mx-auto mt-8 max-w-2xl whitespace-pre-line text-base leading-[1.85] md:mt-10 md:text-lg">
            {t("home.timelineManifesto.body")}
          </p>
        </div>

        <div className="relative mx-auto mt-20 max-w-3xl md:mt-28">
          {/* background glow — subtle */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[-10%] -top-12 -bottom-12 -z-10 opacity-60 blur-3xl"
            style={{
              background:
                "radial-gradient(55% 55% at 50% 50%, color-mix(in srgb, var(--color-primary) 8%, transparent) 0%, transparent 70%)",
            }}
          />
          <TimelinePreview />
        </div>
{/*
        <div className="mt-16 flex justify-center md:mt-20">
          <Link to="/item_reports/timeline" viewTransition>
            <NexButton
              variant="secondary"
              size="lg"
              rightIcon={<ArrowRightIcon className="size-4" />}
              className="h-12 px-6 text-[15px]"
            >
              연대기 전체 보기
            </NexButton>
          </Link>
        </div>
        */}
      </SectionShell>
    </section>
  );
}

function TimelinePreview() {
  const { t } = useTranslation();

  const timelineSamples: Array<{ month: string; rows: TimelineSample[] }> = [
    {
      month: t("home.timelineManifesto.months.march2026"),
      rows: [
        {
          date: "03. 18",
          title: t("home.timelineManifesto.samples.powerBottleneck"),
          category: "trend",
        },
        {
          date: "03. 09",
          title: t("home.timelineManifesto.samples.hbmPeak"),
          category: "market",
        },
      ],
    },
    {
      month: t("home.timelineManifesto.months.february2026"),
      rows: [
        {
          date: "02. 24",
          title: t("home.timelineManifesto.samples.euChipsAct"),
          category: "issue",
        },
        {
          date: "02. 12",
          title: t("home.timelineManifesto.samples.treasuryLiquidity"),
          category: "research",
        },
      ],
    },
  ];

  return (
    <div className="bg-card border-border rounded-2xl border p-8 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.18)] md:p-10">
      <div className="space-y-12">
        {timelineSamples.map((group) => (
          <div key={group.month}>
            <div className="mb-5 flex items-baseline gap-3">
              <h3 className="font-serif text-lg font-semibold tracking-tight md:text-xl">
                {group.month}
              </h3>
              <span className="text-muted-foreground text-xs">
                {t("home.reportCount", { count: group.rows.length })}
              </span>
            </div>

            <div className="relative">
              <div className="bg-border absolute top-2 bottom-2 left-[7px] w-px" />
              <ul className="space-y-6">
                {group.rows.map((row, idx) => {
                  const Icon = CATEGORY_ICONS[row.category];
                  return (
                    <li key={idx} className="relative flex gap-5">
                      <div
                        className={cn(
                          "bg-background relative z-10 mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                          CATEGORY_COLORS[row.category],
                        )}
                        style={{ borderColor: "currentColor" }}
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <time className="text-muted-foreground font-mono text-[11px] tracking-wide">
                            {row.date}
                          </time>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 text-[11px] font-medium",
                              CATEGORY_COLORS[row.category],
                            )}
                          >
                            <Icon className="size-3" />
                            {t(`home.categories.${row.category}`)}
                          </span>
                        </div>
                        <p className="text-foreground/90 text-[15px] leading-snug font-medium md:text-base">
                          {row.title}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// § 5 — For readers who…
// ---------------------------------------------------------------------------

function ForReadersSection() {
  const { t } = useTranslation();
  const readerLines = t("home.forReaders.lines", {
    returnObjects: true,
  }) as string[];

  return (
    <SectionShell>
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <Eyebrow>{t("home.forReaders.eyebrow")}</Eyebrow>
        <h2 className="font-serif mt-6 text-3xl leading-tight font-semibold tracking-tight md:text-[2.5rem]">
          {t("home.forReaders.headline")}
        </h2>
      </div>

      <ul className="mx-auto mt-14 max-w-xl space-y-10 md:mt-20">
        {readerLines.map((line, idx) => (
          <li key={idx} className="flex items-start gap-4 md:gap-5">
            <ReaderLineMarker />
            <p className="text-foreground/85 text-lg leading-[1.85] md:text-xl md:leading-[1.8]">
              {line}
            </p>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}

// ---------------------------------------------------------------------------
// § 6 — Closing invitation
// ---------------------------------------------------------------------------

function ClosingSection() {
  const { t } = useTranslation();

  return (
    <SectionShell className="pb-32 md:pb-40">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <Eyebrow>{t("home.closing.eyebrow")}</Eyebrow>

        <h2 className="font-serif mt-6 text-3xl leading-tight font-semibold tracking-tight md:text-[3.25rem] md:leading-[1.1]">
          {t("home.closing.headline")}
          <br />
          <span className="text-foreground/90 italic">
            {t("home.closing.headlineEmphasis")}
          </span>
        </h2>

        <p className="text-muted-foreground mt-6 text-base leading-relaxed md:text-lg">
          {t("home.closing.body")}
        </p>

        <div className="mt-14 flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
          <Link to="/item_reports" viewTransition>
            <NexButton
              variant="primary"
              size="lg"
              rightIcon={<ArrowRightIcon className="size-4" />}
              className="h-12 px-7 text-[15px] shadow-[0_1px_0_0_rgba(0,0,0,0.05)] cursor-pointer"
            >
              {t("home.getStarted")}
            </NexButton>
          </Link>
          <Link
            to="/login"
            className="text-foreground/75 hover:text-foreground text-sm font-medium underline-offset-[6px] transition-colors hover:underline"
          >
            {t("home.closing.signInLink")}
          </Link>
        </div>

        <p className="text-muted-foreground font-serif mt-24 text-sm italic md:mt-32">
          {brandSignature(t("brand.name"), t("brand.tagline"))}
        </p>
      </div>
    </SectionShell>
  );
}
