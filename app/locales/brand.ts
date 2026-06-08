/** Single-line brand tagline (`\n` → space). */
export function brandTaglineInline(tagline: string) {
  return tagline.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
}

/** Page `<title>` — brand name + tagline, no trailing period. */
export function brandPageTitle(name: string, tagline: string) {
  const inline = brandTaglineInline(tagline);
  const withoutPeriod = inline.endsWith(".") ? inline.slice(0, -1) : inline;
  return `${name} — ${withoutPeriod}`;
}

/** Closing / footer signature — `Market Memory — …` */
export function brandSignature(name: string, tagline: string) {
  return `${name} — ${brandTaglineInline(tagline)}`;
}
