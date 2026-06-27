import type { RouteConfig } from "@react-router/dev/routes";

import { apiRoutes } from "./routes/api";
import { contentRoutes } from "./routes/content";
import { debugRoutes } from "./routes/debug";
import { privateRoutes } from "./routes/private";
import { publicRoutes } from "./routes/public";
import { seoRoutes } from "./routes/seo";

export default [
  ...seoRoutes,
  ...debugRoutes,
  ...apiRoutes,
  publicRoutes,
  privateRoutes,
  ...contentRoutes,
] satisfies RouteConfig;
