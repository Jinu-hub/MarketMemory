import { index, layout, prefix, route } from "@react-router/dev/routes";

export const privateRoutes = layout(
  "core/layouts/private.layout.tsx",
  { id: "private-dashboard" },
  [
    layout("features/users/layouts/dashboard.layout.tsx", [
      ...prefix("/dashboard", [
        index("features/users/screens/dashboard.tsx"),
        route("/payments", "features/payments/screens/payments.tsx"),
      ]),
      route("/account/edit", "features/users/screens/account.tsx"),
      ...prefix("/item_reports", [
        index("features/item-reports/screens/list.tsx"),
        route("/explore", "features/item-reports/screens/explore.tsx"),
        route("/timeline", "features/item-reports/screens/timeline.tsx"),
        route("/:id", "features/item-reports/screens/detail.tsx"),
      ]),
      ...prefix("/weekly-ai-issue-digest", [
        index("features/weekly-ai-issue-digest/screens/list.tsx"),
        route("/:id", "features/weekly-ai-issue-digest/screens/detail.tsx"),
      ]),
      ...prefix("/weekly-market-issues", [
        index("features/weekly-market-issues/screens/list.tsx"),
        route("/:id", "features/weekly-market-issues/screens/detail.tsx"),
      ]),
    ]),
    ...prefix("/admin", [
      layout("features/admin/layouts/admin.layout.tsx", [
        index("features/admin/screens/index.tsx"),
        ...prefix("/pipelines", [
          index("features/admin/screens/pipelines.tsx"),
          route("/new", "features/admin/screens/pipeline-new.tsx"),
          route("/:pipelineKey", "features/admin/screens/pipeline-detail.tsx"),
        ]),
        ...prefix("/agents", [
          index("features/admin/screens/agents.tsx"),
          route("/new", "features/admin/screens/agent-new.tsx"),
        ]),
        ...prefix("/prompts", [
          index("features/admin/screens/prompts.tsx"),
          route("/new", "features/admin/screens/prompt-new.tsx"),
          route("/:id", "features/admin/screens/prompt-detail.tsx"),
        ]),
        route("/api-tests", "features/admin/screens/api-tests.tsx"),
        route(
          "/similarity-measurements",
          "features/admin/screens/similarity-measurements.tsx",
        ),
        route(
          "/prompt-releases",
          "features/admin/screens/prompt-releases.tsx",
        ),
        route(
          "/item-similarities",
          "features/admin/screens/item-similarities.tsx",
        ),
        route(
          "/dmm-similarities",
          "features/admin/screens/dmm-similarities.tsx",
        ),
        route(
          "/market-snapshot-test",
          "features/admin/screens/market-snapshot-test.tsx",
        ),
        route(
          "/daily-market-memory-test",
          "features/admin/screens/daily-market-memory-test.tsx",
        ),
        route(
          "/daily-market-memory-n8n-test",
          "features/admin/screens/daily-market-memory-n8n-test.tsx",
        ),
        route(
          "/i18n-management",
          "features/admin/screens/i18n-management.tsx",
        ),
        route(
          "/item-content-reports-i18n",
          "features/admin/screens/item-content-reports-i18n.tsx",
        ),
        route(
          "/user-management",
          "features/admin/screens/user-management.tsx",
        ),
        route("/user-list", "features/admin/screens/user-list.tsx"),
      ]),
    ]),
  ],
);
