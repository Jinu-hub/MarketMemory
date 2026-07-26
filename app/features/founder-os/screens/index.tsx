import type { Route } from "./+types/index";

import { ArrowUpRightIcon, TelescopeIcon } from "lucide-react";
import { Link } from "react-router";

import { NexButton, NexCard } from "~/core/components/nex";
import { requireAdmin } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";
import {
  AdminPageHeader,
  AdminSection,
} from "~/features/admin/components/admin-ui";

export const meta: Route.MetaFunction = () => [
  { title: `Founder OS | ${import.meta.env.VITE_APP_NAME}` },
];

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  await requireAdmin(client);
  return {};
}

export default function FounderOsIndexScreen() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
      <AdminPageHeader
        title="Founder OS"
        description="창업자를 대신해 사람들의 이야기를 관찰합니다. 현재 단계는 외부 소스에서 원문을 수집해 저장하는 것까지이며, 분석·아이디어 생성은 포함하지 않습니다."
      />

      <AdminSection
        title="기능"
        description="아래 항목을 선택해 세부 화면으로 이동하세요."
      >
        <ul className="grid gap-5 sm:grid-cols-2">
          <li>
            <Link
              to="/admin/founder-os/observations"
              className="group focus-visible:ring-ring/50 block h-full rounded-xl outline-none focus-visible:ring-[3px]"
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
                    <TelescopeIcon className="size-5" aria-hidden />
                  </div>
                  <ArrowUpRightIcon
                    className="text-muted-foreground group-hover:text-foreground size-4 shrink-0 opacity-0 transition-all group-hover:opacity-100"
                    aria-hidden
                  />
                </div>
                <h2 className="text-foreground mt-4 text-lg font-semibold tracking-tight">
                  소스 수집
                </h2>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  Hacker News 등 외부 소스에서 키워드와 관련된 게시물·댓글을
                  수집하고, 정규화·중복 제거 후 저장합니다.
                </p>
                <div className="mt-5">
                  <NexButton
                    type="button"
                    variant="primary"
                    leftIcon={<TelescopeIcon className="size-4" aria-hidden />}
                    tabIndex={-1}
                  >
                    소스 수집
                  </NexButton>
                </div>
              </NexCard>
            </Link>
          </li>
        </ul>
      </AdminSection>
    </div>
  );
}
