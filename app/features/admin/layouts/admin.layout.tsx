import type { Route } from "./+types/admin.layout";

import {
  ArrowLeftIcon,
  ClipboardListIcon,
  GitBranchIcon,
  HomeIcon,
  PackageIcon,
  SparklesIcon,
} from "lucide-react";
import { NavLink, Outlet } from "react-router";

import { requireAdmin } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";

const nav = [
  { to: "/admin", end: true, label: "개요", icon: HomeIcon },
  { to: "/admin/pipelines", label: "파이프라인", icon: GitBranchIcon },
  { to: "/admin/agents", label: "에이전트", icon: SparklesIcon },
  { to: "/admin/prompts", label: "프롬프트", icon: ClipboardListIcon },
  { to: "/admin/prompt-releases", label: "프롬프트 릴리스", icon: PackageIcon },
] as const;

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  await requireAdmin(client);
  return {};
}

export default function AdminLayout() {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col md:flex-row">
      <aside className="border-border bg-muted/25 flex w-full shrink-0 flex-col gap-8 border-b p-5 md:sticky md:top-0 md:h-screen md:w-60 md:border-r md:border-b-0 md:px-5 md:py-8">
        <div className="flex flex-col gap-3">
          <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
            Admin
          </span>
          <NavLink
            to="/dashboard"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <ArrowLeftIcon className="size-4 shrink-0 opacity-70" aria-hidden />
            앱으로 돌아가기
          </NavLink>
        </div>
        <nav className="flex flex-col gap-0.5" aria-label="관리자 메뉴">
          {nav.map(({ to, label, icon: Icon, ...rest }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "bg-background text-foreground border-border shadow-sm ring-1 ring-border/80"
                    : "text-muted-foreground hover:bg-background/80 hover:text-foreground",
                )
              }
              {...rest}
            >
              <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex min-h-0 flex-1 flex-col px-4 py-8 md:px-10 md:py-10 lg:px-14">
        <Outlet />
      </main>
    </div>
  );
}
