/**
 * Shared Open Graph / Twitter card meta helpers for social link previews.
 *
 * Social crawlers (Threads, X, Slack, etc.) require an absolute `og:image` URL.
 * Before favicon optimization, some platforms fell back to the oversized
 * favicon PNG — that no longer works with a real small ICO, so pages need an
 * explicit OG image.
 */

const DEFAULT_SITE_URL = "https://marketmemory.app";
const OG_IMAGE_PATH = "/og.png";
const OG_IMAGE_WIDTH = "1200";
const OG_IMAGE_HEIGHT = "630";

export function getSiteUrl(): string {
  const fromEnv = process.env.SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return DEFAULT_SITE_URL;
}

export function getDefaultOgImageUrl(): string {
  return `${getSiteUrl()}${OG_IMAGE_PATH}`;
}

/**
 * Returns OG + Twitter meta descriptors for a page share preview.
 */
export function socialShareMeta(options: {
  title: string;
  description: string;
  /** Absolute or site-relative image URL. Defaults to `/og.png`. */
  image?: string;
  url?: string;
  type?: string;
}): Array<
  | { property: string; content: string }
  | { name: string; content: string }
> {
  const siteUrl = getSiteUrl();
  const image = options.image
    ? options.image.startsWith("http")
      ? options.image
      : `${siteUrl}${options.image.startsWith("/") ? "" : "/"}${options.image}`
    : getDefaultOgImageUrl();
  const url = options.url
    ? options.url.startsWith("http")
      ? options.url
      : `${siteUrl}${options.url.startsWith("/") ? "" : "/"}${options.url}`
    : undefined;

  return [
    { property: "og:title", content: options.title },
    { property: "og:description", content: options.description },
    { property: "og:image", content: image },
    { property: "og:image:width", content: OG_IMAGE_WIDTH },
    { property: "og:image:height", content: OG_IMAGE_HEIGHT },
    { property: "og:type", content: options.type ?? "website" },
    ...(url ? [{ property: "og:url", content: url }] : []),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: options.title },
    { name: "twitter:description", content: options.description },
    { name: "twitter:image", content: image },
  ];
}
