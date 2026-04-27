/**
 * ReportEntitiesFooter
 *
 * Closing block for the detail screen that surfaces the named entities
 * the editorial AI pipeline extracted into `item_contents.metadata.entitys`
 * (companies / persons / products / technologies / industries / institutions
 * / indicators).
 *
 * Out of scope on purpose:
 *   - `countries` — already covered by the right-rail meta sidebar.
 *   - `tags` (주제) — also surfaced by the meta sidebar, so showing them
 *     here would be a duplicate. If you need a tag list elsewhere, render
 *     it directly; this footer is entity-only by design.
 *
 * Design notes:
 *   - One row per entity bucket, with a fixed-width Korean label so the
 *     badges align cleanly down the page (editorial rhythm > flexbox jam).
 *   - Empty buckets are skipped entirely — never render a label with zero
 *     badges.
 *   - Entities are plain badges for now since we don't have an
 *     entity-search route yet.
 *   - The whole footer renders nothing when there are no entities, so
 *     callers can drop it in unconditionally.
 */
import {
  Building2Icon,
  CpuIcon,
  FactoryIcon,
  GaugeIcon,
  LandmarkIcon,
  PackageIcon,
  UserIcon,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

import { parseReportEntities, type ReportEntities } from "../lib/format";

type EntityKey = keyof ReportEntities;

// Order is intentional: business-impact buckets first (companies → people →
// products → tech), context buckets last (industries → institutions →
// indicators).
const ENTITY_GROUPS: ReadonlyArray<{
  key: EntityKey;
  label: string;
  icon: LucideIcon;
}> = [
  { key: "companies", label: "기업", icon: Building2Icon },
  { key: "persons", label: "인물", icon: UserIcon },
  { key: "products", label: "제품", icon: PackageIcon },
  { key: "technologies", label: "기술", icon: CpuIcon },
  { key: "industries", label: "산업", icon: FactoryIcon },
  { key: "institutions", label: "기관", icon: LandmarkIcon },
  { key: "indicators", label: "지표", icon: GaugeIcon },
];

type ReportEntitiesFooterProps = {
  metadata: unknown;
  className?: string;
};

export function ReportEntitiesFooter({
  metadata,
  className,
}: ReportEntitiesFooterProps) {
  const entities = parseReportEntities(metadata);
  const visibleGroups = entities
    ? ENTITY_GROUPS.filter((group) => entities[group.key].length > 0)
    : [];

  if (visibleGroups.length === 0) return null;

  return (
    <footer
      className={cn(
        "border-border space-y-2.5 border-t pt-6 text-sm",
        className,
      )}
    >
      {visibleGroups.map((group) => (
        <EntityRow key={group.key} icon={group.icon} label={group.label}>
          {entities![group.key].map((value) => (
            <NexBadge key={value} variant="outline" size="sm">
              {value}
            </NexBadge>
          ))}
        </EntityRow>
      ))}
    </footer>
  );
}

function EntityRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start gap-2">
      {/* h-6 / leading-6 mirrors NexBadge sm (py-0.5 + text-xs ≈ 1.5rem) so
          the icon sits at the badge's optical center instead of riding low
          (which made the GaugeIcon look clipped at the bottom). */}
      <span className="text-muted-foreground inline-flex h-6 w-14 shrink-0 items-center gap-1.5 text-xs leading-6">
        <Icon className="size-3 shrink-0" aria-hidden />
        {label}
      </span>
      <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
