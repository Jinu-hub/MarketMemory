import type { ComponentProps } from "react";
import { useEffect, useMemo, useState } from "react";

import {
  AlertCircleIcon,
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  BotIcon,
  LayoutGridIcon,
  SearchIcon,
} from "lucide-react";

import { parseAdminErrorMessage } from "../lib/admin-error";

import { NexBadge, NexCard, NexInput } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";

/** 정렬 가능 컬럼 헤더 버튼 — 목록 화면 테이블에서 공통 사용 */
export const adminSortColumnButtonClass =
  "hover:bg-muted/55 text-muted-foreground hover:text-foreground flex min-h-[3rem] w-full items-center gap-2 border-0 bg-transparent text-xs font-semibold tracking-wider uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none";

/**
 * 정렬 활성/방향을 나타내는 아이콘 (비활성: 위아래 화살표).
 */
export function AdminSortAffix({
  active,
  dir,
}: {
  active: boolean;
  dir: "asc" | "desc";
}) {
  if (!active) {
    return (
      <ArrowUpDownIcon
        className="text-muted-foreground size-4 shrink-0 opacity-45"
        aria-hidden
      />
    );
  }
  return dir === "asc" ? (
    <ArrowUpIcon className="text-foreground size-4 shrink-0" aria-hidden />
  ) : (
    <ArrowDownIcon className="text-foreground size-4 shrink-0" aria-hidden />
  );
}

export function AdminPageHeader({
  title,
  description,
  eyebrow = "Admin",
}: {
  title: string;
  description?: string;
  eyebrow?: string;
}) {
  return (
    <header className="border-border/80 space-y-2 border-b pb-8">
      <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
        {eyebrow}
      </p>
      <h1 className="text-foreground text-3xl font-semibold tracking-tight md:text-[2rem]">
        {title}
      </h1>
      {description ? (
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed md:text-[15px]">
          {description}
        </p>
      ) : null}
    </header>
  );
}

export function AdminSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div className="space-y-1.5">
        <h2 className="text-foreground text-lg font-semibold tracking-tight">{title}</h2>
        {description ? (
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function AdminPanel({
  children,
  className,
  padding = "md",
}: {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}) {
  return (
    <NexCard
      variant="elevated"
      padding={padding}
      className={cn(
        "border-border bg-card text-card-foreground border shadow-md",
        className,
      )}
    >
      {children}
    </NexCard>
  );
}

/** Table + horizontal scroll; semantic surface for data-heavy blocks */
export function AdminTableShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <NexCard
      variant="default"
      padding="none"
      hoverable={false}
      className={cn(
        "border-border bg-card text-card-foreground overflow-hidden border shadow-sm",
        className,
      )}
    >
      <div className="overflow-x-auto">{children}</div>
    </NexCard>
  );
}

export const adminSelectClassName = cn(
  "border-border bg-background text-foreground h-11 w-full rounded-lg border px-3 text-sm",
  "shadow-sm outline-none transition-[border-color,box-shadow]",
  "focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px]",
);

export const adminTextareaClassName = cn(
  "border-border bg-background text-foreground min-h-[120px] w-full rounded-lg border px-3 py-2.5 font-mono text-sm leading-relaxed",
  "shadow-sm outline-none transition-[border-color,box-shadow]",
  "focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px]",
);

export type AdminAgentOption = {
  agent_key: string;
  display_name: string | null;
};

/**
 * Native select + instant filter (agent_key / display_name). Filter field is not submitted.
 * Select is controlled so the choice resets when it falls outside the filtered set.
 */
export function AdminAgentSelectWithFilter({
  agents,
  selectName = "agent_key",
  selectAriaLabel = "에이전트",
  filterPlaceholder = "에이전트 검색…",
}: {
  agents: AdminAgentOption[];
  selectName?: string;
  selectAriaLabel?: string;
  filterPlaceholder?: string;
}) {
  const [filter, setFilter] = useState("");
  const [agentKey, setAgentKey] = useState("");

  const filteredAgents = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (q.length === 0) {
      return agents;
    }
    return agents.filter((a) => {
      const haystack = [a.agent_key, a.display_name ?? ""].join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [agents, filter]);

  useEffect(() => {
    if (agentKey && !filteredAgents.some((a) => a.agent_key === agentKey)) {
      setAgentKey("");
    }
  }, [filteredAgents, agentKey]);

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3">
      <div className="min-w-0 flex-1">
        <select
          name={selectName}
          required
          value={agentKey}
          onChange={(e) => setAgentKey(e.target.value)}
          className={adminSelectClassName}
          aria-label={selectAriaLabel}
        >
          <option value="" disabled>
            선택…
          </option>
          {filteredAgents.map((a) => (
            <option key={a.agent_key} value={a.agent_key}>
              {a.agent_key}
              {a.display_name ? ` — ${a.display_name}` : ""}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full min-w-[10rem] shrink-0 sm:max-w-xs sm:self-center">
        <NexInput
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={filterPlaceholder}
          aria-label="에이전트 목록 필터"
          inputSize="lg"
          autoComplete="off"
          leftIcon={<SearchIcon className="size-4 opacity-70" aria-hidden />}
        />
      </div>
    </div>
  );
}

export type AdminPromptTemplateOption = {
  id: string;
  name: string;
  version: number;
  agent_key: string;
};

function formatPromptTemplateOptionLabel(t: AdminPromptTemplateOption) {
  return `${t.name} v${t.version} (${t.agent_key})`;
}

/**
 * Template picker with instant filter (name / version / agent_key / id label text).
 */
export function AdminPromptTemplateSelectWithFilter({
  templates,
  selectName = "active_prompt_id",
  selectAriaLabel = "활성 프롬프트 템플릿",
  filterPlaceholder = "템플릿 검색…",
}: {
  templates: AdminPromptTemplateOption[];
  selectName?: string;
  selectAriaLabel?: string;
  filterPlaceholder?: string;
}) {
  const [filter, setFilter] = useState("");
  const [templateId, setTemplateId] = useState("");

  const filteredTemplates = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (q.length === 0) {
      return templates;
    }
    return templates.filter((t) => {
      const label = formatPromptTemplateOptionLabel(t);
      const haystack = [t.name, t.agent_key, String(t.version), t.id, label]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [templates, filter]);

  useEffect(() => {
    if (templateId && !filteredTemplates.some((t) => t.id === templateId)) {
      setTemplateId("");
    }
  }, [filteredTemplates, templateId]);

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-3">
      <div className="min-w-0 flex-1">
        <select
          name={selectName}
          required
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
          className={adminSelectClassName}
          aria-label={selectAriaLabel}
        >
          <option value="" disabled>
            선택…
          </option>
          {filteredTemplates.map((t) => (
            <option key={t.id} value={t.id}>
              {formatPromptTemplateOptionLabel(t)}
            </option>
          ))}
        </select>
      </div>
      <div className="w-full min-w-[10rem] shrink-0 sm:max-w-xs sm:self-center">
        <NexInput
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={filterPlaceholder}
          aria-label="프롬프트 템플릿 목록 필터"
          inputSize="lg"
          autoComplete="off"
          leftIcon={<SearchIcon className="size-4 opacity-70" aria-hidden />}
        />
      </div>
    </div>
  );
}

export function AdminErrorAlert({
  message,
  context,
}: {
  message: string;
  /** 화면 맥락 (예: 유사도 재생성) — 제목 옆에 표시 */
  context?: string;
}) {
  const parsed = parseAdminErrorMessage(message);

  return (
    <div
      className="border-destructive/50 bg-destructive/10 rounded-xl border-2 px-4 py-4 shadow-sm"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex gap-3">
        <div className="bg-destructive/15 text-destructive flex size-10 shrink-0 items-center justify-center rounded-lg">
          <AlertCircleIcon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-destructive text-sm font-semibold">{parsed.title}</p>
            {context ? (
              <span className="text-destructive/80 text-[11px] font-medium">{context}</span>
            ) : null}
          </div>
          <p className="text-foreground text-base font-medium leading-snug">{parsed.summary}</p>
          {parsed.hint ? (
            <p className="text-muted-foreground text-sm leading-relaxed">{parsed.hint}</p>
          ) : null}
          <details className="group">
            <summary className="text-muted-foreground cursor-pointer text-xs font-medium select-none hover:underline">
              원본 오류 메시지 보기
            </summary>
            <pre className="bg-background/80 text-foreground/90 mt-2 max-h-40 overflow-auto rounded-md border border-destructive/20 p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all">
              {parsed.detail}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}

export function EnvironmentBadge({ env }: { env: string }) {
  const e = env.toLowerCase();
  let variant: ComponentProps<typeof NexBadge>["variant"] = "outline";
  if (e === "production" || e === "prod") {
    variant = "success";
  } else if (e === "staging" || e === "stage" || e === "stg") {
    variant = "warning";
  } else if (
    e === "dev" ||
    e === "development" ||
    e === "local" ||
    e === "preview"
  ) {
    variant = "info";
  }
  return (
    <NexBadge variant={variant} size="sm" className="font-mono">
      {env}
    </NexBadge>
  );
}

const pipelineStatusVariant: Record<
  string,
  ComponentProps<typeof NexBadge>["variant"]
> = {
  draft: "secondary",
  active: "success",
  deprecated: "warning",
};

export function PipelineStatusBadge({ status }: { status: string }) {
  return (
    <NexBadge variant={pipelineStatusVariant[status] ?? "default"} size="sm">
      {status}
    </NexBadge>
  );
}

const promptStatusVariant: Record<
  string,
  ComponentProps<typeof NexBadge>["variant"]
> = {
  draft: "secondary",
  active: "success",
  deprecated: "warning",
  archived: "outline",
};

export function PromptStatusBadge({ status }: { status: string }) {
  return (
    <NexBadge variant={promptStatusVariant[status] ?? "default"} size="sm">
      {status}
    </NexBadge>
  );
}

export function TargetTypeBadge({ type }: { type: string }) {
  const variant: ComponentProps<typeof NexBadge>["variant"] =
    type === "agent" ? "info" : type === "pipeline" ? "secondary" : "outline";
  return (
    <NexBadge variant={variant} size="sm" className="font-mono">
      {type}
    </NexBadge>
  );
}

export function AdminEmptyState({
  title,
  hint,
  icon = "grid",
}: {
  title: string;
  hint?: string;
  icon?: "grid" | "bot";
}) {
  const Icon = icon === "bot" ? BotIcon : LayoutGridIcon;
  return (
    <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-14 text-center">
      <Icon className="size-9 opacity-40" aria-hidden />
      <p className="text-foreground text-sm font-medium">{title}</p>
      {hint ? <p className="text-muted-foreground max-w-sm text-xs">{hint}</p> : null}
    </div>
  );
}

/** Apply to `TableHead` for admin data tables */
export const adminThClass = cn(
  "text-muted-foreground h-12 px-4 text-left text-xs font-semibold tracking-wider uppercase",
  "first:pl-5 last:pr-5",
);

/** Apply to `TableCell` for admin data tables */
export const adminTdClass = "px-4 py-3.5 text-sm first:pl-5 last:pr-5";
