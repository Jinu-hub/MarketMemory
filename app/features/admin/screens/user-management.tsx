import type { Route } from "./+types/user-management";

import { ArrowUpRightIcon, UsersIcon } from "lucide-react";
import { Link } from "react-router";

import { AdminPageHeader, AdminSection } from "../components/admin-ui";
import { NexCard } from "~/core/components/nex";
import { requireAdmin } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";

export const meta: Route.MetaFunction = () => [
  { title: `유저 관리 | ${import.meta.env.VITE_APP_NAME}` },
];

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  await requireAdmin(client);
  return {};
}

export default function AdminUserManagementScreen() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10">
      <AdminPageHeader
        title="유저 관리"
        description="가입 유저의 프로필·권한·계정 정보를 검토·관리하는 허브 화면입니다. 관리 항목은 계속 확장됩니다."
      />

      <AdminSection
        title="관리 목록"
        description="아래 항목을 선택해 개별 유저 관리 페이지로 이동하세요."
      >
        <ul className="grid gap-5 sm:grid-cols-2">
          <li>
            <Link
              to="/admin/user-list"
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
                    <UsersIcon className="size-5" aria-hidden />
                  </div>
                  <ArrowUpRightIcon
                    className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 opacity-0 transition-all group-hover:opacity-100"
                    aria-hidden
                  />
                </div>
                <h2 className="text-foreground mt-4 text-lg font-semibold tracking-tight">
                  유저 리스트
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  profiles·auth.users 기준 가입 유저 목록을 조회합니다.
                </p>
              </NexCard>
            </Link>
          </li>
        </ul>
      </AdminSection>
    </div>
  );
}
