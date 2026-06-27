import { index, prefix, route } from "@react-router/dev/routes";

export const apiRoutes = prefix("/api", [
  ...prefix("/settings", [
    route("/theme", "features/settings/api/set-theme.tsx"),
    route("/locale", "features/settings/api/set-locale.tsx"),
  ]),
  ...prefix("/users", [
    index("features/users/api/delete-account.tsx"),
    route("/password", "features/users/api/change-password.tsx"),
    route("/email", "features/users/api/change-email.tsx"),
    route("/profile", "features/users/api/edit-profile.tsx"),
    route("/providers", "features/users/api/connect-provider.tsx"),
    route(
      "/providers/:provider",
      "features/users/api/disconnect-provider.tsx",
    ),
  ]),
  ...prefix("/cron", [
    route("/mailer", "features/cron/api/mailer.tsx"),
    route("/market-snapshot", "features/cron/api/market-snapshot.tsx"),
    route(
      "/daily-market-memory",
      "features/cron/api/daily-market-memory.tsx",
    ),
  ]),
  ...prefix("/blog", [route("/og", "features/blog/api/og.tsx")]),
]);
