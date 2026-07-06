import type { Route } from "./+types/user-list";

import { ArrowLeftIcon, SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

import {
  AdminPageHeader,
  AdminSection,
  AdminSortAffix,
  AdminTableShell,
  adminSortColumnButtonClass,
  adminTdClass,
} from "../components/admin-ui";
import { useTableSortState } from "../hooks/use-table-sort-filter";
import { listProfilesForAdmin, type AdminUserListRow } from "../queries/users";
import { NexBadge, NexButton, NexInput } from "~/core/components/nex";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/core/components/ui/table";
import { requireAdmin } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";
import { cn } from "~/core/lib/utils";

export const meta: Route.MetaFunction = () => [
  { title: `유저 리스트 | ${import.meta.env.VITE_APP_NAME}` },
];

type AdminUserListLoaderData = {
  users: AdminUserListRow[];
};

type SortKey =
  | "name"
  | "email"
  | "providers"
  | "locale"
  | "is_admin"
  | "last_sign_in_at"
  | "created_at";

const PROVIDER_LABELS: Record<string, string> = {
  email: "Email",
  google: "Google",
  github: "GitHub",
  apple: "Apple",
  kakao: "Kakao",
};

function formatProviderLabel(provider: string) {
  return PROVIDER_LABELS[provider] ?? provider;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function loader({ request }: Route.LoaderArgs) {
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  const { data, error } = await listProfilesForAdmin();
  if (error) {
    throw new Error(error.message);
  }

  const payload: AdminUserListLoaderData = { users: data ?? [] };
  return payload;
}

export default function AdminUserListScreen({ loaderData }: Route.ComponentProps) {
  if (!loaderData) {
    return null;
  }

  const { users } = loaderData as AdminUserListLoaderData;
  const [query, setQuery] = useState("");
  const { sortKey, sortDir, toggleSort } = useTableSortState<SortKey>(
    "created_at",
    "desc",
  );

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = users;
    if (q.length > 0) {
      list = users.filter((user) => {
        const blob = [
          user.name,
          user.email ?? "",
          user.profile_id,
          user.locale,
          user.providers.join(" "),
          user.is_admin ? "admin" : "user",
        ]
          .join(" ")
          .toLowerCase();
        return blob.includes(q);
      });
    }

    const m = sortDir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name, "ko") * m;
        case "email": {
          const ae = a.email ?? "";
          const be = b.email ?? "";
          return ae.localeCompare(be) * m;
        }
        case "providers":
          return a.providers.join(",").localeCompare(b.providers.join(",")) * m;
        case "locale":
          return a.locale.localeCompare(b.locale) * m;
        case "is_admin":
          return (Number(a.is_admin) - Number(b.is_admin)) * m;
        case "last_sign_in_at": {
          const at = a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0;
          const bt = b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0;
          return (at - bt) * m;
        }
        case "created_at":
          return (
            (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) *
            m
          );
        default:
          return 0;
      }
    });
  }, [users, query, sortKey, sortDir]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 pb-20">
      <AdminPageHeader
        title="유저 리스트"
        description="가입 유저의 프로필·이메일·로그인 방식·권한·최근 로그인을 한눈에 확인합니다."
      />

      <AdminSection
        title="등록된 유저"
        description={`총 ${users.length}명 · 이름, 이메일, provider, profile_id로 검색할 수 있습니다.`}
      >
        <div className="space-y-4">
          <NexInput
            placeholder="이름, 이메일, provider, profile_id, locale…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={<SearchIcon className="size-4 opacity-70" aria-hidden />}
            inputSize="md"
            aria-label="유저 목록 필터"
            autoComplete="off"
          />

          <AdminTableShell>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                    <button
                      type="button"
                      className={cn(
                        adminSortColumnButtonClass,
                        "justify-start py-3.5 pr-4 pl-5 text-left",
                      )}
                      onClick={() => toggleSort("name")}
                      aria-sort={
                        sortKey === "name"
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      이름
                      <AdminSortAffix active={sortKey === "name"} dir={sortDir} />
                    </button>
                  </TableHead>
                  <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                    <button
                      type="button"
                      className={cn(
                        adminSortColumnButtonClass,
                        "justify-start px-4 py-3.5 text-left",
                      )}
                      onClick={() => toggleSort("email")}
                      aria-sort={
                        sortKey === "email"
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      이메일
                      <AdminSortAffix active={sortKey === "email"} dir={sortDir} />
                    </button>
                  </TableHead>
                  <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                    <button
                      type="button"
                      className={cn(
                        adminSortColumnButtonClass,
                        "justify-start px-4 py-3.5 text-left",
                      )}
                      onClick={() => toggleSort("providers")}
                      aria-sort={
                        sortKey === "providers"
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      Provider
                      <AdminSortAffix
                        active={sortKey === "providers"}
                        dir={sortDir}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                    <button
                      type="button"
                      className={cn(
                        adminSortColumnButtonClass,
                        "justify-start px-4 py-3.5 text-left",
                      )}
                      onClick={() => toggleSort("locale")}
                      aria-sort={
                        sortKey === "locale"
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      언어
                      <AdminSortAffix active={sortKey === "locale"} dir={sortDir} />
                    </button>
                  </TableHead>
                  <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                    <button
                      type="button"
                      className={cn(
                        adminSortColumnButtonClass,
                        "justify-start px-4 py-3.5 text-left",
                      )}
                      onClick={() => toggleSort("is_admin")}
                      aria-sort={
                        sortKey === "is_admin"
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      권한
                      <AdminSortAffix active={sortKey === "is_admin"} dir={sortDir} />
                    </button>
                  </TableHead>
                  <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                    <button
                      type="button"
                      className={cn(
                        adminSortColumnButtonClass,
                        "justify-start px-4 py-3.5 text-left",
                      )}
                      onClick={() => toggleSort("last_sign_in_at")}
                      aria-sort={
                        sortKey === "last_sign_in_at"
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      마지막 로그인
                      <AdminSortAffix
                        active={sortKey === "last_sign_in_at"}
                        dir={sortDir}
                      />
                    </button>
                  </TableHead>
                  <TableHead className="text-muted-foreground h-auto !p-0 align-middle">
                    <button
                      type="button"
                      className={cn(
                        adminSortColumnButtonClass,
                        "justify-start px-4 py-3.5 text-left",
                      )}
                      onClick={() => toggleSort("created_at")}
                      aria-sort={
                        sortKey === "created_at"
                          ? sortDir === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                      }
                    >
                      가입일
                      <AdminSortAffix
                        active={sortKey === "created_at"}
                        dir={sortDir}
                      />
                    </button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSorted.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-muted-foreground py-10 text-center text-sm"
                    >
                      {query.trim().length > 0
                        ? "검색 조건에 맞는 유저가 없습니다."
                        : "등록된 유저가 없습니다."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSorted.map((user) => (
                    <TableRow key={user.profile_id} className="border-border">
                      <TableCell className={cn(adminTdClass, "font-medium")}>
                        {user.name}
                      </TableCell>
                      <TableCell className={adminTdClass}>
                        <span className="text-muted-foreground text-sm">
                          {user.email ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell className={adminTdClass}>
                        {user.providers.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {user.providers.map((provider) => (
                              <NexBadge key={provider} variant="outline" size="sm">
                                {formatProviderLabel(provider)}
                              </NexBadge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className={adminTdClass}>
                        <NexBadge variant="secondary" size="sm">
                          {user.locale}
                        </NexBadge>
                      </TableCell>
                      <TableCell className={adminTdClass}>
                        {user.is_admin ? (
                          <NexBadge variant="warning" size="sm">
                            Admin
                          </NexBadge>
                        ) : (
                          <NexBadge variant="secondary" size="sm">
                            User
                          </NexBadge>
                        )}
                      </TableCell>
                      <TableCell className={adminTdClass}>
                        <span className="text-muted-foreground text-sm">
                          {user.last_sign_in_at
                            ? formatDate(user.last_sign_in_at)
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell className={adminTdClass}>
                        <span className="text-muted-foreground text-sm">
                          {formatDate(user.created_at)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </AdminTableShell>
        </div>
      </AdminSection>

      <div className="fixed right-6 bottom-6 z-50">
        <Link to="/admin/user-management">
          <NexButton
            type="button"
            variant="secondary"
            leftIcon={<ArrowLeftIcon className="size-4" aria-hidden />}
            aria-label="유저 관리 목록으로 돌아가기"
            className="border-border bg-card text-card-foreground shadow-lg"
          >
            뒤로가기
          </NexButton>
        </Link>
      </div>
    </div>
  );
}
