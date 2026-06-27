import { index, layout, prefix, route } from "@react-router/dev/routes";

export const publicRoutes = layout("core/layouts/navigation.layout.tsx", [
  route("/auth/confirm", "features/auth/screens/confirm.tsx"),
  index("features/home/screens/home.tsx"),
  route("/error", "core/screens/error.tsx"),
  route("/showcase/design", "core/components/showcase/design-showcase.tsx"),
  route("/showcase/content", "core/components/showcase/content-showcase.tsx"),
  route("/showcase/data", "core/components/showcase/data-showcase.tsx"),
  layout("core/layouts/public.layout.tsx", [
    route("/login", "features/auth/screens/login.tsx"),
    route("/join", "features/auth/screens/join.tsx"),
    ...prefix("/auth", [
      route("/api/resend", "features/auth/api/resend.tsx"),
      route(
        "/forgot-password/reset",
        "features/auth/screens/forgot-password.tsx",
      ),
      route("/magic-link", "features/auth/screens/magic-link.tsx"),
      ...prefix("/otp", [
        route("/start", "features/auth/screens/otp/start.tsx"),
        route("/complete", "features/auth/screens/otp/complete.tsx"),
      ]),
      ...prefix("/social", [
        route("/start/:provider", "features/auth/screens/social/start.tsx"),
        route(
          "/complete/:provider",
          "features/auth/screens/social/complete.tsx",
        ),
      ]),
    ]),
  ]),
  layout("core/layouts/private.layout.tsx", { id: "private-auth" }, [
    ...prefix("/auth", [
      route(
        "/forgot-password/create",
        "features/auth/screens/new-password.tsx",
      ),
      route("/email-verified", "features/auth/screens/email-verified.tsx"),
    ]),
    route("/logout", "features/auth/screens/logout.tsx"),
  ]),
  route("/contact", "features/contact/screens/contact-us.tsx"),
  route("/faq", "features/faq/screens/faq.tsx"),
  ...prefix("/payments", [
    route("/checkout", "features/payments/screens/checkout.tsx"),
    layout("core/layouts/private.layout.tsx", { id: "private-payments" }, [
      route("/success", "features/payments/screens/success.tsx"),
      route("/failure", "features/payments/screens/failure.tsx"),
    ]),
  ]),
]);
