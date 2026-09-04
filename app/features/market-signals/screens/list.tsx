/**
 * Market Signals — Insights hub (/insights/market-signals)
 * Experimental admin-only surface; visibility gated via MARKET_SIGNAL_VISIBILITY.
 */
import { data } from "react-router";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";

import { NexBadge } from "~/core/components/nex";
import { requireAuthentication } from "~/core/lib/guards.server";
import i18next from "~/core/lib/i18next.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";
import { getUserProfile } from "~/features/users/queries";

import type { Route } from "./+types/list";
import { SignalRankRow } from "../components/signal-rank-row";
import {
  canViewMarketSignals,
  MARKET_SIGNAL_DEFAULT_SCOPE_KEY,
} from "../lib/visibility";
import {
  getMarketSignalSnapshotByKey,
  listMarketSignalItems,
  listMarketSignalSnapshots,
  parseMarketSignalPeriodType,
  type MarketSignalItemRow,
  type MarketSignalSnapshotSummary,
} from "../queries.server";

export const meta: Route.MetaFunction = ({ data }) => [
  {
    title: `${data?.title ?? "Market Signals"} | ${import.meta.env.VITE_APP_NAME}`,
  },
];

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  const user = await requireAuthentication(client);
  const profile = await getUserProfile(client, { userId: user.id });
  const isAdmin = profile?.is_admin === true;

  if (!canViewMarketSignals({ isAdmin, isAuthenticated: true })) {
    throw data(null, { status: 403 });
  }

  const url = new URL(request.url);
  const periodType = parseMarketSignalPeriodType(url.searchParams.get("periodType"));
  const requestedKey = url.searchParams.get("periodKey")?.trim() || null;

  const snapshots = await listMarketSignalSnapshots(client, {
    scopeKey: MARKET_SIGNAL_DEFAULT_SCOPE_KEY,
    periodType,
  });

  let selected: MarketSignalSnapshotSummary | null = null;
  if (requestedKey) {
    selected =
      snapshots.find((s) => s.periodKey === requestedKey) ??
      (await getMarketSignalSnapshotByKey(client, {
        periodType,
        periodKey: requestedKey,
      }));
  }
  if (!selected) {
    selected = snapshots[0] ?? null;
  }

  let items: MarketSignalItemRow[] = [];
  if (selected) {
    items = await listMarketSignalItems(client, selected.id, 50);
  }

  const t = await i18next.getFixedT(
    await i18next.getLocale(request),
    "translation",
  );

  return {
    title: t("marketSignals.title"),
    periodType,
    snapshots,
    selected,
    items,
    scopeKey: MARKET_SIGNAL_DEFAULT_SCOPE_KEY,
  };
}

function hrefFor(periodType: string, periodKey?: string | null) {
  const params = new URLSearchParams({ periodType });
  if (periodKey) {
    params.set("periodKey", periodKey);
  }
  return `/insights/market-signals?${params.toString()}`;
}

export default function MarketSignalsListScreen({
  loaderData,
}: Route.ComponentProps) {
  const { t } = useTranslation();
  const { periodType, snapshots, selected, items } = loaderData;

  const maxCount = Math.max(0, ...items.map((item) => item.currentCount ?? 0));
  const risingCount = items.filter((item) => item.trendType === "rising").length;
  const newCount = items.filter((item) => item.trendType === "new").length;
  const top = items[0];

  const periodTypes = ["weekly", "monthly", "yearly"] as const;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 pb-16 md:px-8">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <NexBadge variant="warning" size="sm">
            {t("marketSignals.experimentalBadge")}
          </NexBadge>
          <NexBadge variant="outline" size="sm">
            {t("marketSignals.scopeValue")}
          </NexBadge>
        </div>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-4xl">
          {t("marketSignals.title")}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed md:text-base">
          {t("marketSignals.subtitle")}
        </p>
        <p className="text-muted-foreground text-xs">{t("marketSignals.adminOnlyHint")}</p>
      </header>

      <div
        className="border-border bg-muted/30 flex flex-wrap gap-1 rounded-xl border p-1"
        role="tablist"
        aria-label={t("marketSignals.title")}
      >
        {periodTypes.map((type) => {
          const active = periodType === type;
          return (
            <Link
              key={type}
              to={hrefFor(type)}
              role="tab"
              aria-selected={active}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`marketSignals.periodTypes.${type}`)}
            </Link>
          );
        })}
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)_240px]">
        <aside className="flex flex-col gap-2" aria-label={t("marketSignals.metaSidebar.period")}>
          {snapshots.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("marketSignals.empty.noSnapshots")}</p>
          ) : (
            snapshots.map((snap) => {
              const active = selected?.periodKey === snap.periodKey;
              return (
                <Link
                  key={snap.id}
                  to={hrefFor(periodType, snap.periodKey)}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "border-border bg-card text-foreground shadow-sm"
                      : "border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{snap.periodKey}</span>
                    <NexBadge
                      variant={snap.status === "final" ? "success" : "warning"}
                      size="sm"
                    >
                      {t(`marketSignals.status.${snap.status}`)}
                    </NexBadge>
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {snap.periodStart} → {snap.periodEnd}
                  </p>
                </Link>
              );
            })
          )}
        </aside>

        <section className="flex min-w-0 flex-col gap-4">
          {selected && top ? (
            <div className="border-border bg-card/50 rounded-xl border border-l-[3px] border-l-primary/80 px-4 py-3">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {t("marketSignals.takeaway.title")}
              </p>
              <p className="text-foreground mt-1 text-sm leading-relaxed">
                {t("marketSignals.takeaway.topSignal", {
                  name: top.displayName,
                  count: top.currentCount ?? 0,
                })}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {t("marketSignals.takeaway.risingCount", { count: risingCount })}
                {" · "}
                {t("marketSignals.takeaway.newCount", { count: newCount })}
              </p>
            </div>
          ) : null}

          {items.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              {snapshots.length === 0
                ? t("marketSignals.empty.noSnapshots")
                : t("marketSignals.empty.noItems")}
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {items.map((item) => (
                <li key={item.id}>
                  <SignalRankRow
                    item={item}
                    maxCount={maxCount}
                    typeLabel={item.signalType}
                    trendLabel={
                      item.trendType
                        ? t(`marketSignals.trends.${item.trendType}`)
                        : ""
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="border-border bg-muted/20 h-fit rounded-xl border p-4">
          {selected ? (
            <dl className="flex flex-col gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground text-xs">
                  {t("marketSignals.metaSidebar.period")}
                </dt>
                <dd className="text-foreground mt-0.5 font-medium">{selected.periodKey}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">
                  {t("marketSignals.metaSidebar.range")}
                </dt>
                <dd className="text-foreground mt-0.5">
                  {selected.periodStart} → {selected.periodEnd}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">
                  {t("marketSignals.metaSidebar.sources")}
                </dt>
                <dd className="text-foreground mt-0.5 font-mono tabular-nums">
                  {selected.sourceCount}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">
                  {t("marketSignals.metaSidebar.signals")}
                </dt>
                <dd className="text-foreground mt-0.5 font-mono tabular-nums">
                  {items.length}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">
                  {t("marketSignals.metaSidebar.updated")}
                </dt>
                <dd className="text-foreground mt-0.5 text-xs">
                  {new Date(selected.updatedAt).toLocaleString()}
                </dd>
              </div>
              {selected.aggregationLayer ? (
                <div>
                  <dt className="text-muted-foreground text-xs">
                    {t("marketSignals.metaSidebar.layer")}
                  </dt>
                  <dd className="text-foreground mt-0.5 font-mono text-xs">
                    {selected.aggregationLayer}
                  </dd>
                </div>
              ) : null}
              {selected.partial !== null ? (
                <div>
                  <dt className="text-muted-foreground text-xs">
                    {t("marketSignals.metaSidebar.partial")}
                  </dt>
                  <dd className="text-foreground mt-0.5 text-xs">
                    {selected.partial
                      ? t("marketSignals.metaSidebar.partialYes")
                      : t("marketSignals.metaSidebar.partialNo")}
                  </dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <p className="text-muted-foreground text-sm">
              {t("marketSignals.empty.noSnapshots")}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
