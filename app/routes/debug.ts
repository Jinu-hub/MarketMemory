import { prefix, route } from "@react-router/dev/routes";

export const debugRoutes =
  process.env.NODE_ENV !== "production"
    ? prefix("/debug", [
        route("/sentry", "debug/sentry.tsx"),
        route("/analytics", "debug/analytics.tsx"),
      ])
    : [];
