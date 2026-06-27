import { index, layout, prefix, route } from "@react-router/dev/routes";

export const contentRoutes = [
  ...prefix("/legal", [route("/:slug", "features/legal/screens/policy.tsx")]),
  layout("features/blog/layouts/blog.layout.tsx", [
    ...prefix("/blog", [
      index("features/blog/screens/posts.tsx"),
      route("/:slug", "features/blog/screens/post.tsx"),
    ]),
  ]),
];
