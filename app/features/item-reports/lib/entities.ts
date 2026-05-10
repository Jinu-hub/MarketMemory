/**
 * Named entities extracted from a report's `metadata.entitys` block by
 * the editorial AI pipeline. Every key is required in the parsed shape
 * (defaulting to `[]`) so consumers don't need to null-check each list,
 * just check `.length`.
 */
export type ReportEntities = {
  persons: string[];
  products: string[];
  companies: string[];
  countries: string[];
  indicators: string[];
  industries: string[];
  institutions: string[];
  technologies: string[];
};

/**
 * Safely parse `item_contents.metadata.entitys` (note: pipeline uses the
 * misspelled `entitys`; we also fall back to the correct `entities` key
 * for forward-compat). Strips empty/whitespace-only values and de-dupes
 * each list so the UI never renders a blank or repeated badge.
 */
export function parseReportEntities(metadata: unknown): ReportEntities | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  const meta = metadata as Record<string, unknown>;
  const raw = meta.entitys ?? meta.entities;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const source = raw as Record<string, unknown>;

  const pickList = (value: unknown): string[] => {
    if (!Array.isArray(value)) return [];
    const seen = new Set<string>();
    const out: string[] = [];
    for (const item of value) {
      if (typeof item !== "string") continue;
      const trimmed = item.trim();
      if (!trimmed || seen.has(trimmed)) continue;
      seen.add(trimmed);
      out.push(trimmed);
    }
    return out;
  };

  return {
    persons: pickList(source.persons),
    products: pickList(source.products),
    companies: pickList(source.companies),
    countries: pickList(source.countries),
    indicators: pickList(source.indicators),
    industries: pickList(source.industries),
    institutions: pickList(source.institutions),
    technologies: pickList(source.technologies),
  };
}

/** True when at least one entity bucket has a value. */
export function hasAnyEntity(entities: ReportEntities | null): boolean {
  if (!entities) return false;
  return Object.values(entities).some((list) => list.length > 0);
}
