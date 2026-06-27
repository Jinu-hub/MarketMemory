import { readdir } from "node:fs/promises";
import path from "node:path";

const BLOG_DOCS_DIR = path.join(
  process.cwd(),
  "app",
  "features",
  "blog",
  "docs",
);

const LEGAL_DOCS_DIR = path.join(
  process.cwd(),
  "app",
  "features",
  "legal",
  "docs",
);

const LOCALE_SUFFIX = /_(?:en|ko|ja)$/;

/** Public static pages that should appear in the sitemap. */
export const PUBLIC_STATIC_PATHS = [
  "/",
  "/blog",
  "/login",
  "/join",
  "/contact",
  "/faq",
] as const;

export async function getBlogPostPaths(): Promise<string[]> {
  const files = await readdir(BLOG_DOCS_DIR);
  return files
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => `/blog/${file.replace(".mdx", "")}`)
    .sort();
}

export async function getLegalPolicyPaths(): Promise<string[]> {
  const files = await readdir(LEGAL_DOCS_DIR);
  const slugs = [
    ...new Set(
      files
        .filter((file) => file.endsWith(".mdx"))
        .map((file) => file.replace(".mdx", ""))
        .map((name) => name.replace(LOCALE_SUFFIX, "")),
    ),
  ];

  return slugs.map((slug) => `/legal/${slug}`).sort();
}

export async function getPublicSitemapPaths(): Promise<string[]> {
  const [blogPaths, legalPaths] = await Promise.all([
    getBlogPostPaths(),
    getLegalPolicyPaths(),
  ]);

  return [...PUBLIC_STATIC_PATHS, ...blogPaths, ...legalPaths];
}
