/**
 * FAQ — /faq
 *
 * Reading-oriented help surface (Content Layer, see `.cursor/rules/components.mdc`).
 * Not a settings list: questions are grouped into meaning-driven categories,
 * each answer keeps editorial typography, and the whole page reads calmly in
 * light / dark / warm themes via semantic tokens only.
 *
 * Structure:
 *   · Hero        — eyebrow badge + serif headline + subtitle
 *   · Search      — client-side filter across questions + answers
 *   · Categories  — directional-accent section header + Accordion of Q&A
 *   · Disclaimer  — "informational only" reminder
 *   · CTA         — nudge toward /contact when an answer is missing
 */
import { useMemo, useState } from "react";

import {
  CreditCardIcon,
  FileTextIcon,
  LifeBuoyIcon,
  type LucideIcon,
  MessageCircleQuestionIcon,
  RocketIcon,
  SearchIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/core/components/ui/accordion";
import { NexBadge, NexInput } from "~/core/components/nex";
import i18next from "~/core/lib/i18next.server";
import { cn } from "~/core/lib/utils";

import {
  FAQ_CATEGORY_ORDER,
  type FaqCategoryId,
  type FaqEntry,
  getFaqEntries,
} from "../lib/faq-content";

import type { Route } from "./+types/faq";

type NexBadgeVariant = React.ComponentProps<typeof NexBadge>["variant"];

const CATEGORY_META: Record<
  FaqCategoryId,
  { icon: LucideIcon; badge: NexBadgeVariant; accent: string }
> = {
  intro: { icon: SparklesIcon, badge: "info", accent: "border-l-[#3B82F6]" },
  reports: {
    icon: FileTextIcon,
    badge: "secondary",
    accent: "border-l-[#5E6AD2]",
  },
  account: {
    icon: CreditCardIcon,
    badge: "success",
    accent: "border-l-[#10B981]",
  },
  support: {
    icon: LifeBuoyIcon,
    badge: "warning",
    accent: "border-l-[#F59E0B]",
  },
  roadmap: {
    icon: RocketIcon,
    badge: "default",
    accent: "border-l-border",
  },
};

export async function loader({ request }: Route.LoaderArgs) {
  const t = await i18next.getFixedT(request);
  return {
    meta: {
      title: `${t("faq.meta.title")} | ${import.meta.env.VITE_APP_NAME}`,
      description: t("faq.meta.description"),
    },
  };
}

export const meta: Route.MetaFunction = ({ data }) => {
  const title = data?.meta.title ?? "FAQ";
  const description = data?.meta.description ?? "";
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ];
};

function matchesQuery(entry: FaqEntry, query: string): boolean {
  if (!query) return true;
  const haystack = [
    entry.question,
    ...entry.answer.flatMap((block) =>
      block.type === "p" ? [block.text] : block.items,
    ),
  ]
    .join("\n")
    .toLowerCase();
  return haystack.includes(query);
}

function FaqAnswer({ entry }: { entry: FaqEntry }) {
  return (
    <div className="space-y-3 pr-2 md:pr-8">
      {entry.answer.map((block, index) =>
        block.type === "p" ? (
          <p
            key={index}
            className="text-muted-foreground text-[15px] leading-relaxed md:text-base"
          >
            {block.text}
          </p>
        ) : (
          <ul key={index} className="space-y-2">
            {block.items.map((item, itemIndex) => (
              <li
                key={itemIndex}
                className="text-muted-foreground flex items-start gap-2.5 text-[15px] leading-relaxed md:text-base"
              >
                <span
                  aria-hidden
                  className="bg-primary/60 mt-[0.6em] size-1.5 shrink-0 rounded-full"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

function CategorySection({
  category,
  entries,
}: {
  category: FaqCategoryId;
  entries: FaqEntry[];
}) {
  const { t } = useTranslation();
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;

  return (
    <section aria-labelledby={`faq-cat-${category}`}>
      <div className="mb-5 flex items-center gap-3">
        <span
          className={cn(
            "border-border bg-card flex size-10 shrink-0 items-center justify-center rounded-xl border border-l-[3px]",
            meta.accent,
          )}
        >
          <Icon className="text-foreground/70 size-5" aria-hidden />
        </span>
        <h2
          id={`faq-cat-${category}`}
          className="text-foreground font-serif text-xl font-semibold tracking-tight md:text-2xl"
        >
          {t(`faq.categories.${category}` as const)}
        </h2>
        <NexBadge variant={meta.badge} size="sm">
          {entries.length}
        </NexBadge>
      </div>

      <Accordion
        type="multiple"
        className="bg-card border-border overflow-hidden rounded-2xl border px-5 md:px-6"
      >
        {entries.map((entry) => (
          <AccordionItem key={entry.id} value={entry.id}>
            <AccordionTrigger className="text-foreground py-5 text-[15px] font-medium hover:no-underline md:text-base">
              {entry.question}
            </AccordionTrigger>
            <AccordionContent>
              <FaqAnswer entry={entry} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export default function Faq(_props: Route.ComponentProps) {
  const { t, i18n } = useTranslation();
  const [rawQuery, setRawQuery] = useState("");

  const entries = useMemo(() => getFaqEntries(i18n.language), [i18n.language]);
  const query = rawQuery.trim().toLowerCase();

  const filtered = useMemo(
    () => entries.filter((entry) => matchesQuery(entry, query)),
    [entries, query],
  );

  const grouped = useMemo(
    () =>
      FAQ_CATEGORY_ORDER.map((category) => ({
        category,
        items: filtered.filter((entry) => entry.category === category),
      })).filter((group) => group.items.length > 0),
    [filtered],
  );

  const hasResults = filtered.length > 0;

  return (
    <main className="bg-background text-foreground mx-auto w-full max-w-3xl px-5 md:px-6">
      {/* Hero */}
      <header className="text-center">
        <NexBadge variant="info" size="md" className="mx-auto">
          {t("faq.hero.badge")}
        </NexBadge>
        <h1 className="text-foreground mt-5 font-serif text-3xl font-semibold tracking-tight md:text-5xl">
          {t("faq.hero.title")}
        </h1>
        <p className="text-muted-foreground mx-auto mt-4 max-w-xl text-[15px] leading-relaxed md:text-lg">
          {t("faq.hero.subtitle")}
        </p>
      </header>

      {/* Search */}
      <div className="mt-10 md:mt-12">
        <div className="relative">
          <NexInput
            inputSize="lg"
            aria-label={t("faq.search.label")}
            placeholder={t("faq.search.placeholder")}
            value={rawQuery}
            onChange={(event) => setRawQuery(event.target.value)}
            leftIcon={<SearchIcon className="text-muted-foreground size-4" />}
            className={cn(rawQuery && "pr-11")}
          />
          {rawQuery && (
            <button
              type="button"
              onClick={() => setRawQuery("")}
              aria-label={t("faq.empty.clear")}
              className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-3 z-10 flex items-center transition-colors"
            >
              <XIcon className="size-4" />
            </button>
          )}
        </div>
        <p className="text-muted-foreground mt-3 px-1 text-xs md:text-sm">
          {t("faq.resultsCount", { count: filtered.length })}
        </p>
      </div>

      {/* Categories */}
      {hasResults ? (
        <div className="mt-8 space-y-12 md:mt-10 md:space-y-16">
          {grouped.map((group) => (
            <CategorySection
              key={group.category}
              category={group.category}
              entries={group.items}
            />
          ))}
        </div>
      ) : (
        <div className="border-border bg-card mt-10 flex flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center">
          <span className="border-border bg-background flex size-12 items-center justify-center rounded-full border">
            <SearchIcon className="text-muted-foreground size-5" aria-hidden />
          </span>
          <h2 className="text-foreground mt-4 font-serif text-lg font-semibold">
            {t("faq.empty.title")}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
            {t("faq.empty.description")}
          </p>
          <button
            type="button"
            onClick={() => setRawQuery("")}
            className="text-primary hover:text-primary/80 mt-5 text-sm font-medium underline-offset-4 hover:underline"
          >
            {t("faq.empty.clear")}
          </button>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-muted-foreground border-border mt-12 border-t pt-6 text-xs leading-relaxed md:mt-16 md:text-[13px]">
        {t("faq.disclaimer")}
      </p>

      {/* Contact CTA */}
      <section className="border-border bg-card relative mt-8 overflow-hidden rounded-2xl border p-7 text-center md:mt-10 md:p-10">
        <span
          aria-hidden
          className="bg-primary/10 text-primary mx-auto flex size-11 items-center justify-center rounded-full"
        >
          <MessageCircleQuestionIcon className="size-5" />
        </span>
        <h2 className="text-foreground mt-4 font-serif text-xl font-semibold tracking-tight md:text-2xl">
          {t("faq.cta.title")}
        </h2>
        <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed md:text-base">
          {t("faq.cta.description")}
        </p>
        <Link
          to="/contact"
          viewTransition
          className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 inline-flex h-11 items-center justify-center rounded-md px-8 text-sm font-medium transition-colors"
        >
          {t("faq.cta.button")}
        </Link>
      </section>
    </main>
  );
}
