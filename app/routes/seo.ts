import { route } from "@react-router/dev/routes";

export const seoRoutes = [
  route("/robots.txt", "core/screens/robots.ts"),
  route("/sitemap.xml", "core/screens/sitemap.ts"),
];
