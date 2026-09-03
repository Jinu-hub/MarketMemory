import { parseReportEntities } from "~/features/item-reports/lib/entities";
import { signalKeySlug } from "~/features/cron/lib/market-signal/slug";
import type {
  ItemContentSignalSource,
  MarketSignalType,
  SignalAtom,
} from "~/features/cron/lib/market-signal/types";

const ENTITY_SIGNAL_MAP = {
  companies: "company",
  industries: "industry",
  technologies: "technology",
  countries: "country",
  indicators: "indicator",
  products: "product",
  institutions: "institution",
  persons: "person",
} as const satisfies Record<string, MarketSignalType>;

function extractCoreTagStrings(metadata: unknown): string[] {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return [];
  }
  const tagsRoot = (metadata as Record<string, unknown>).tags;
  if (!tagsRoot || typeof tagsRoot !== "object" || Array.isArray(tagsRoot)) {
    return [];
  }
  const core = (tagsRoot as Record<string, unknown>).core;
  if (!Array.isArray(core)) {
    return [];
  }

  const out: string[] = [];
  for (const item of core) {
    if (item !== null && typeof item === "object" && !Array.isArray(item)) {
      const tag = (item as Record<string, unknown>).tag;
      if (typeof tag === "string" && tag.trim() !== "") {
        out.push(tag.trim());
      }
      continue;
    }
    if (typeof item === "string" && item.trim() !== "") {
      out.push(item.trim());
    }
  }
  return out;
}

/** metadata.entities + metadata.tags.core → deduped signal atoms for one source row. */
export function extractSignalAtomsFromItemContent(
  source: ItemContentSignalSource,
): SignalAtom[] {
  const atoms = new Map<string, SignalAtom>();

  const addAtom = (signalType: MarketSignalType, displayName: string) => {
    const trimmed = displayName.trim();
    if (!trimmed) return;
    const signalKey = signalKeySlug(trimmed);
    if (!signalKey) return;
    const mapKey = `${signalType}::${signalKey}`;
    if (!atoms.has(mapKey)) {
      atoms.set(mapKey, {
        signalType,
        signalKey,
        displayName: trimmed,
      });
    }
  };

  const entities = parseReportEntities(source.metadata);
  if (entities) {
    for (const [bucket, signalType] of Object.entries(ENTITY_SIGNAL_MAP)) {
      const list = entities[bucket as keyof typeof entities];
      for (const value of list) {
        addAtom(signalType, value);
      }
    }
  }

  for (const tag of extractCoreTagStrings(source.metadata)) {
    addAtom("tag", tag);
  }

  return [...atoms.values()];
}

export const MARKET_SIGNAL_AGGREGATION_VERSION = "metadata-v1";
