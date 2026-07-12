import type { Config } from "@react-router/dev/config";

import { sentryOnBuildEnd } from "@sentry/react-router";
import { vercelPreset } from "@vercel/react-router/vite";

import {
  getBlogPostPaths,
  getLegalPolicyPaths,
} from "./app/core/lib/public-urls";

declare module "react-router" {
  interface Future {
    unstable_middleware: true;
  }
}

const [blogPaths, legalPaths] = await Promise.all([
  getBlogPostPaths(),
  getLegalPolicyPaths(),
]);

export default {
  ssr: true,
  async prerender() {
    // NOTE: The interactive pages in `PUBLIC_STATIC_PATHS` (/, /blog, /login,
    // /join, /contact, /faq) are rendered from runtime i18n resources, so they
    // must be server-rendered per request — NOT prerendered. Prerendering would
    // freeze them into the build-time language, breaking `?lang=` and the locale
    // cookie in production (both work locally only because dev always SSRs).
    // Those paths still power the sitemap via `PUBLIC_STATIC_PATHS`.
    // Only content-driven, locale-file-based routes are prerendered here.
    return [
      ...legalPaths,
      "/sitemap.xml",
      "/robots.txt",
      ...blogPaths,
    ];
  },
  presets: [
    ...(process.env.VERCEL_ENV === "production" ? [vercelPreset()] : []),
  ],
  buildEnd: async ({ viteConfig, reactRouterConfig, buildManifest }) => {
    if (
      process.env.SENTRY_ORG &&
      process.env.SENTRY_PROJECT &&
      process.env.SENTRY_AUTH_TOKEN
    ) {
      await sentryOnBuildEnd({
        viteConfig,
        reactRouterConfig,
        buildManifest,
      });
    }
  },
} satisfies Config;
