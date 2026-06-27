import type { Config } from "@react-router/dev/config";

import { sentryOnBuildEnd } from "@sentry/react-router";
import { vercelPreset } from "@vercel/react-router/vite";

import {
  getBlogPostPaths,
  getLegalPolicyPaths,
  PUBLIC_STATIC_PATHS,
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
    return [
      ...PUBLIC_STATIC_PATHS,
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
