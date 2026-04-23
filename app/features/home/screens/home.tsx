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
import { Link } from "react-router";

import { NexBadge, NexButton, NexHero } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import type { Route } from "./+types/home";

export const meta: Route.MetaFunction = () => {
  const title =
    "Market Memory — 흩어진 시장의 흐름을, 하나의 시선으로";
  const description =
    "AI가 정리한 글로벌 리서치를 편집자의 시선으로 읽고, 탐색하고, 연결하는 조용한 라이브러리.";
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ];
};

export async function loader(_args: Route.LoaderArgs) {
  return {};
}

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
    <p className="text-muted-foreground text-[11px] font-medium tracking-[0.22em] uppercase">
      {children}
    </p>
  );
}

// ---------------------------------------------------------------------------
// § 1 — Hero
// ---------------------------------------------------------------------------

function HeroSection() {
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
          text: "시장 · 인사이트 · 리서치 라이브러리",
          variant: "info",
        }}
        title="흩어진 시장의 흐름을, 하나의 시선으로."
        subtitle="하나의 뉴스가 아니라, 시장의 결을 읽습니다."
        description="매일의 글로벌 리서치를 편집자의 시선으로 읽고, 탐색하고, 연결할 수 있는 조용한 라이브러리."
        actions={{
          primary: {
            label: "리포트 읽어보기",
            href: "/item_reports",
            variant: "primary",
            icon: <ArrowRightIcon className="h-4 w-4" />,
          },
          secondary: {
            label: "샘플 리포트 보기",
            href: "/item_reports/explore",
            variant: "secondary",
            icon: <BookOpenIcon className="h-4 w-4" />,
          },
        }}
        features={[
          {
            icon: <BookOpenIcon className="h-5 w-5" />,
            text: "편집된 리서치",
          },
          {
            icon: <CompassIcon className="h-5 w-5" />,
            text: "카테고리 탐색",
          },
          {
            icon: <Share2Icon className="h-5 w-5" />,
            text: "맥락의 연결",
          },
        ]}
        social={{
          count: "Private Preview · 2026",
          text: "초대받은 리더를 위한 조용한 라이브러리",
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
  return (
    <article
      aria-label="리포트 미리보기"
      className="bg-card border-border relative z-10 mx-auto w-full overflow-hidden rounded-2xl border border-l-[3px] border-l-cyan-500 shadow-[0_40px_90px_-45px_rgba(0,0,0,0.28),0_14px_36px_-18px_rgba(0,0,0,0.1)] dark:border-l-cyan-400"
    >
      {/* Editorial masthead — thin top rule with issue + date */}
      <div className="border-border/70 text-muted-foreground flex items-center justify-between border-b px-6 py-2.5 font-mono text-[10px] tracking-[0.2em] uppercase md:px-10">
        <span className="flex items-center gap-2">
          <span className="bg-cyan-500 inline-block size-1 rounded-full dark:bg-cyan-400" />
          Issue 042 · Market Memory
        </span>
        <span>2026 · 03 · 18</span>
      </div>

      <div className="px-6 pt-7 pb-6 md:px-10 md:pt-9">
        <div className="flex flex-wrap items-center gap-2">
          <NexBadge variant="info" size="sm">
            <SparklesIcon className="mr-1 size-3" />
            Editorial Angle
          </NexBadge>
          <span className="text-foreground/70 inline-flex items-center gap-1 text-[11px] font-medium tracking-wider uppercase">
            <TrendingUpIcon
              strokeWidth={1.5}
              className="size-3 text-cyan-600 dark:text-cyan-400"
            />
            트렌드
          </span>
        </div>

        <h3 className="font-serif mt-5 text-xl leading-snug font-semibold tracking-tight md:text-[1.625rem] md:leading-[1.25]">
          AI 인프라 투자가 반도체 밸류체인을 다시 쓰고 있다.
        </h3>

        <div className="mt-6 flex gap-3 md:gap-4">
          <TargetIcon
            strokeWidth={1.5}
            className="text-foreground/60 mt-1 size-4 shrink-0"
          />
          <div>
            <p className="text-muted-foreground mb-1 text-[11px] font-semibold tracking-wider uppercase">
              Key Takeaway
            </p>
            <p className="text-foreground/90 text-[15px] leading-[1.8] md:text-base">
              2026년 하이퍼스케일러 CapEx는 320B에 도달하며, 첨단 패키징과
              HBM의 구조적 병목을 더 깊게 만들고 있습니다.
            </p>
          </div>
        </div>
      </div>

      {/* DataInsightBlock strip (rule §4.4) — chart + number + interpretation */}
      <DataInsightStrip />

      <div className="border-border border-t px-6 py-5 md:px-10">
        <p className="text-muted-foreground mb-3 text-[11px] font-semibold tracking-wider uppercase">
          Hooks
        </p>
        <ol className="space-y-2.5">
          {[
            "CapEx는 가속 중이며, 감속의 신호는 아직 보이지 않는다.",
            "CoWoS 공급은 여전히 가장 강한 제약 조건으로 남아 있다.",
            "전력과 권역 분산이 다음 투자 사이클의 축이 될 것이다.",
          ].map((text, idx) => (
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
          더 빠른 반도체가 아니라, 더 많은 전력이 병목이 되는 시대로 넘어가고
          있습니다.
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
  return (
    <div className="border-border bg-muted/30 grid grid-cols-3 divide-x divide-[var(--color-border)] border-t">
      <DataTile
        label="CapEx 2026e"
        value="$320B"
        delta="+23%"
        caption="vs 2024"
        accent="cyan"
        viz={<MiniSparkline accent="cyan" />}
      />
      <DataTile
        label="HBM Supply"
        value="94%"
        delta="tight"
        caption="할당 / 수요"
        accent="amber"
        viz={<MiniBars accent="amber" />}
      />
      <DataTile
        label="전력 부하"
        value="2.4×"
        delta="↑"
        caption="DC 전력 2024→26"
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
  return (
    <div
      className="bg-card border-border w-[280px] rounded-xl border border-l-[3px] border-l-emerald-500 p-4 shadow-[0_18px_44px_-22px_rgba(0,0,0,0.22)] dark:border-l-emerald-400"
      style={{ transform: "rotate(-2.5deg)" }}
    >
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
          관련 인사이트
        </p>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <TrendingUpIcon strokeWidth={2} className="size-3" />
          +12.4%
        </span>
      </div>

      <p className="text-foreground mt-2 text-[13px] leading-snug font-medium">
        반도체 CapEx 사이클, 확장 국면 지속
      </p>

      <div className="mt-3">
        <MiniSparkline accent="emerald" />
      </div>

      <div className="text-muted-foreground mt-2 flex items-center justify-between text-[10px]">
        <span>30일 · 시총 가중</span>
        <span className="font-mono">MSFT · GOOG · META</span>
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
  const nodes: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
    accent: Accent;
    hub?: boolean;
  }> = [
    { id: "ai", label: "AI", x: 90, y: 54, accent: "cyan", hub: true },
    { id: "power", label: "전력", x: 22, y: 22, accent: "emerald" },
    { id: "semi", label: "반도체", x: 158, y: 24, accent: "amber" },
    { id: "dc", label: "데이터센터", x: 38, y: 92, accent: "cyan" },
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
          연결된 주제
        </p>
        <Share2Icon
          strokeWidth={1.5}
          className="text-muted-foreground size-3.5"
        />
      </div>

      <svg
        viewBox="0 0 190 120"
        className="h-[120px] w-full"
        aria-label="관련 주제 관계도"
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
  const rows: Array<{
    date: string;
    title: string;
    color: string;
  }> = [
    {
      date: "03. 18",
      title: "AI 인프라 투자의 재편",
      color: "text-cyan-600 dark:text-cyan-400",
    },
    {
      date: "03. 09",
      title: "HBM 가격 사이클, 정점",
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      date: "02. 24",
      title: "EU Chips Act 2단계",
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
          최근 연대기
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
  return (
    <SectionShell size="lg">
      <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-[1fr_1.1fr] md:gap-20">
        <div className="max-w-md space-y-6">
          <Eyebrow>읽는 경험</Eyebrow>
          <h2 className="font-serif text-3xl leading-tight font-semibold tracking-tight md:text-[2.75rem]">
            한 편의 리포트를
            <br />
            읽는다는 것.
          </h2>
          <p className="text-muted-foreground text-base leading-[1.85] md:text-[17px]">
            모든 리포트는 핵심 앵글, 요약, 세 개의 훅, 그리고 공유용 인용까지
            편집 구조로 정돈됩니다. 숫자와 차트에는 해석이 함께 붙고,
            리포트는 언제든 다시 펼칠 수 있는 자료로 남습니다.
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
  return (
    <article className="bg-card border-border mx-auto w-full max-w-md overflow-hidden rounded-xl border">
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-center gap-2">
          <NexBadge variant="info" size="sm">
            <SparklesIcon className="mr-1 size-3" />
            Editorial Angle
          </NexBadge>
        </div>

        <h3 className="font-serif mt-4 text-lg leading-snug font-semibold tracking-tight md:text-xl">
          미국 10년물 금리와 유동성.
        </h3>

        <p className="text-muted-foreground mt-3 text-sm leading-7">
          재무부 현금 잔고 변동과 장기 금리 방향, 그리고 그 둘 사이의
          비선형 관계에 대한 짧은 리서치 노트.
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
        <span>리서치 노트 · 2026. 02. 12</span>
        <span className="flex items-center gap-1">
          계속 읽기
          <ArrowRightIcon className="size-3" />
        </span>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// § 3 — Three ways to use (읽기 / 탐색 / 연결)
// ---------------------------------------------------------------------------

const THREE_WAYS: Array<{
  icon: typeof BookOpenIcon;
  title: string;
  body: string;
  to: string;
}> = [
  {
    icon: BookOpenIcon,
    title: "읽다",
    body: "하루의 시장을 요약과 인사이트 중심으로 천천히 읽어 내립니다.",
    to: "/item_reports",
  },
  {
    icon: CompassIcon,
    title: "탐색하다",
    body: "카테고리, 지역, 태그로 관심의 결을 따라 자료를 넓혀 갑니다.",
    to: "/item_reports/explore",
  },
  {
    icon: Link2Icon,
    title: "연결하다",
    body: "리포트 사이의 맥락을 타임라인과 관련 콘텐츠로 이어서 봅니다.",
    to: "/item_reports/timeline",
  },
];

function ThreeWaysSection() {
  return (
    <SectionShell>
      <div className="max-w-2xl">
        <Eyebrow>쓰는 방법</Eyebrow>
        <h2 className="font-serif mt-6 text-3xl leading-tight font-semibold tracking-tight md:text-[2.5rem]">
          세 가지 자세로 읽을 수 있습니다.
        </h2>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-10 md:mt-20 md:grid-cols-3 md:gap-8">
        {THREE_WAYS.map(({ icon: Icon, title, body, to }) => (
          <Link
            key={title}
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
              바로 가기
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

const TIMELINE_SAMPLES: Array<{ month: string; rows: TimelineSample[] }> = [
  {
    month: "2026년 3월",
    rows: [
      {
        date: "03. 18",
        title: "전력 인프라가 AI 공급망의 다음 병목이 되다",
        category: "trend",
      },
      {
        date: "03. 09",
        title: "HBM 가격 사이클, 정점 이후의 시나리오",
        category: "market",
      },
    ],
  },
  {
    month: "2026년 2월",
    rows: [
      {
        date: "02. 24",
        title: "EU Chips Act 2단계 자금 승인이 의미하는 것",
        category: "issue",
      },
      {
        date: "02. 12",
        title: "미국 10년물 금리와 유동성, 리서치 노트",
        category: "research",
      },
    ],
  },
];

const CATEGORY_COLORS: Record<TimelineSample["category"], string> = {
  market: "text-emerald-600 dark:text-emerald-400",
  trend: "text-cyan-600 dark:text-cyan-400",
  issue: "text-amber-600 dark:text-amber-400",
  research: "text-blue-600 dark:text-blue-400",
};

const CATEGORY_LABELS: Record<TimelineSample["category"], string> = {
  market: "시장",
  trend: "트렌드",
  issue: "이슈",
  research: "리서치",
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
  return (
    <section className="bg-muted/40 mt-32 py-28 md:mt-40 md:py-40">
      <SectionShell size="xl">
        <div className="mx-auto max-w-4xl text-center">
          <Eyebrow>흐름을 본다는 것</Eyebrow>
          <h2 className="font-serif mt-8 text-[2.75rem] leading-[1.1] font-semibold tracking-tight md:text-[5rem] md:leading-[1.02]">
            하나의 뉴스가 아니라,
            <br />
            <span className="text-foreground/85 italic">
              시장의 결을 읽습니다.
            </span>
          </h2>
          <p className="text-muted-foreground mx-auto mt-8 max-w-2xl text-base leading-[1.85] md:mt-10 md:text-lg">
            개별 리포트는 쌓여서 시장의 서사가 됩니다.
            월별 타임라인과 카테고리 라인으로 그 흐름을 다시 펼쳐 봅니다.
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
      </SectionShell>
    </section>
  );
}

function TimelinePreview() {
  return (
    <div className="bg-card border-border rounded-2xl border p-8 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.18)] md:p-10">
      <div className="space-y-12">
        {TIMELINE_SAMPLES.map((group) => (
          <div key={group.month}>
            <div className="mb-5 flex items-baseline gap-3">
              <h3 className="font-serif text-lg font-semibold tracking-tight md:text-xl">
                {group.month}
              </h3>
              <span className="text-muted-foreground text-xs">
                {group.rows.length}편
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
                            {CATEGORY_LABELS[row.category]}
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

const READER_LINES = [
  "하루 한 편의 리서치를 꾸준히 읽는 리듬을 만들고 싶은 분",
  "숫자와 차트보다 해석과 맥락에 시간을 쓰고 싶은 분",
  "읽은 내용을 그때그때 흘리지 않고, 다시 찾을 수 있는 자리에 두고 싶은 분",
];

function ForReadersSection() {
  return (
    <SectionShell>
      <div className="mx-auto max-w-3xl">
        <Eyebrow>어울리는 자리</Eyebrow>
        <h2 className="font-serif mt-6 text-3xl leading-tight font-semibold tracking-tight md:text-[2.5rem]">
          이런 분께 어울립니다.
        </h2>

        <ul className="mt-12 space-y-8 md:mt-16">
          {READER_LINES.map((line, idx) => (
            <li key={idx} className="flex items-start gap-5">
              <span
                aria-hidden
                className="text-muted-foreground font-serif mt-1 shrink-0 text-2xl leading-none"
              >
                —
              </span>
              <p className="text-foreground/85 text-lg leading-[1.85] md:text-xl md:leading-[1.8]">
                {line}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}

// ---------------------------------------------------------------------------
// § 6 — Closing invitation
// ---------------------------------------------------------------------------

function ClosingSection() {
  return (
    <SectionShell className="pb-32 md:pb-40">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <Eyebrow>초대</Eyebrow>

        <h2 className="font-serif mt-6 text-3xl leading-tight font-semibold tracking-tight md:text-[3.25rem] md:leading-[1.1]">
          오늘의 시장을,
          <br />
          <span className="text-foreground/90 italic">
            천천히 읽어 보세요.
          </span>
        </h2>

        <p className="text-muted-foreground mt-6 text-base leading-relaxed md:text-lg">
          초대받은 리더만을 위한 조용한 리서치 공간입니다.
        </p>

        <div className="mt-14 flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
          <Link to="/item_reports" viewTransition>
            <NexButton
              variant="primary"
              size="lg"
              rightIcon={<ArrowRightIcon className="size-4" />}
              className="h-12 px-7 text-[15px] shadow-[0_1px_0_0_rgba(0,0,0,0.05)]"
            >
              리포트 읽어보기
            </NexButton>
          </Link>
          <Link
            to="/login"
            className="text-foreground/75 hover:text-foreground text-sm font-medium underline-offset-[6px] transition-colors hover:underline"
          >
            이미 계정이 있어요 →
          </Link>
        </div>

        <p className="text-muted-foreground font-serif mt-24 text-sm italic md:mt-32">
          Market Memory — 흩어진 시장의 흐름을, 하나의 시선으로.
        </p>
      </div>
    </SectionShell>
  );
}
