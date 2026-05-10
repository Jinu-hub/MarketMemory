import type { Route } from "./+types/index";

import { ArrowUpRightIcon } from "lucide-react";
import { Link } from "react-router";

import { AdminPageHeader } from "../components/admin-ui";
import { ADMIN_DASHBOARD_CARDS } from "../lib/admin-nav";
import { NexCard } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

export const meta: Route.MetaFunction = () => [
  { title: `관리자 | ${import.meta.env.VITE_APP_NAME}` },
];

export async function loader() {
  return {};
}

export default function AdminIndex() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
      <AdminPageHeader
        title="관리자"
        description="Market Memory의 실행 파이프라인, 에이전트, 프롬프트 설정을 한곳에서 조정합니다. 변경 사항은 즉시 DB와 RLS 정책에 반영됩니다."
      />

      <ul className="grid gap-5 sm:grid-cols-2">
        {ADMIN_DASHBOARD_CARDS.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                className="group block h-full rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              >
                <NexCard
                  variant="elevated"
                  padding="lg"
                  hoverable
                  className={cn(
                    "border-border bg-card text-card-foreground h-full border shadow-md",
                    "transition-[transform,box-shadow] duration-200",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="bg-muted/80 text-muted-foreground group-hover:bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors">
                      <Icon className="size-5" aria-hidden />
                    </div>
                    <ArrowUpRightIcon
                      className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 opacity-0 transition-all group-hover:opacity-100"
                      aria-hidden
                    />
                  </div>
                  <h2 className="text-foreground mt-4 text-lg font-semibold tracking-tight">
                    {item.dashboardTitle ?? item.label}
                  </h2>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {item.dashboardDescription}
                  </p>
                </NexCard>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
