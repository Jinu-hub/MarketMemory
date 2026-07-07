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

import { getEntityGroupLabel } from "../i18n/labels";
import { useItemReportsLocale } from "../i18n";
import { parseReportEntities, type ReportEntities } from "../lib/entities";

type FooterEntityKey = Exclude<keyof ReportEntities, "countries">;

const ENTITY_GROUPS: ReadonlyArray<{
  key: FooterEntityKey;
  icon: LucideIcon;
}> = [
  { key: "companies", icon: Building2Icon },
  { key: "persons", icon: UserIcon },
  { key: "products", icon: PackageIcon },
  { key: "technologies", icon: CpuIcon },
  { key: "industries", icon: FactoryIcon },
  { key: "institutions", icon: LandmarkIcon },
  { key: "indicators", icon: GaugeIcon },
];

type ReportEntitiesFooterProps = {
  metadata: unknown;
  className?: string;
};

export function ReportEntitiesFooter({
  metadata,
  className,
}: ReportEntitiesFooterProps) {
  const locale = useItemReportsLocale();
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
        <EntityRow
          key={group.key}
          icon={group.icon}
          label={getEntityGroupLabel(group.key, locale)}
        >
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
    <div className="grid grid-cols-[auto_1fr] items-start gap-x-3 gap-y-1.5">
      <span className="text-muted-foreground inline-flex shrink-0 items-center gap-1.5 text-xs whitespace-nowrap">
        <Icon className="size-3 shrink-0" aria-hidden />
        {label}
      </span>
      <div className="flex min-w-0 flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
