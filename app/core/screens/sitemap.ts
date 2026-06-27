import { getPublicSitemapPaths } from "~/core/lib/public-urls";

function formatSitemapEntry(domain: string, path: string) {
  return `<url>
      <loc>${domain}${path}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
    </url>`;
}

export async function loader() {
  const domain = process.env.SITE_URL ?? "";
  const paths = await getPublicSitemapPaths();
  const entries = paths.map((path) => formatSitemapEntry(domain, path));

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
    <urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
    >
      ${entries.join("\n")}
    </urlset>
    `,
    {
      headers: { "Content-Type": "application/xml" },
    },
  );
}
