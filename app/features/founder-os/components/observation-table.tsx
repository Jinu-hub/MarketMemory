import type { RecentObservation } from "../server/queries.server";

import {
  ExternalLinkIcon,
  MessageSquareIcon,
  MessagesSquareIcon,
  NewspaperIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { NexBadge } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";
import {
  AdminEmptyState,
  AdminPanel,
} from "~/features/admin/components/admin-ui";

import { truncateText } from "../domain/html-text";
import {
  contentQualityLabel,
  contentQualityVariant,
  contentTypeLabel,
  formatDateTime,
  hnTypeLabel,
  priorityLabel,
  priorityVariant,
  sourceLabel,
} from "../lib/observation-display";

const TITLE_MAX_LENGTH = 110;
const BODY_MAX_LENGTH = 220;

type FilterKey =
  | "all"
  | "post"
  | "comment"
  | "high"
  | "ask_hn"
  | "substantive"
  | "title_only";

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "전체" },
  { key: "post", label: "게시글" },
  { key: "comment", label: "댓글" },
  { key: "high", label: "High Priority" },
  { key: "ask_hn", label: "Ask HN" },
  { key: "substantive", label: "본문 있음" },
  { key: "title_only", label: "제목만" },
];

function matchesFilter(observation: RecentObservation, filter: FilterKey) {
  switch (filter) {
    case "all":
      return true;
    case "post":
      return observation.content_type === "post";
    case "comment":
      return observation.content_type === "comment";
    case "high":
      return observation.observation_priority === "high";
    case "ask_hn":
      return observation.hn_type === "ask_hn";
    case "substantive":
      return observation.has_substantive_body === true;
    case "title_only":
      return observation.content_quality === "title_only";
    default:
      return true;
  }
}

/** 제목이 없는 댓글은 본문 앞부분을 제목처럼 사용한다. */
function resolveHeadline(observation: RecentObservation) {
  const title = observation.title?.trim();
  if (title && title.length > 0) {
    return truncateText(title, TITLE_MAX_LENGTH);
  }
  return truncateText(observation.body, TITLE_MAX_LENGTH);
}

export function ObservationTable({
  observations,
  emptyTitle = "선택한 실행에서 신규 저장된 데이터가 없습니다.",
  emptyHint = "모두 기존 데이터와 중복되었거나 키워드에 매칭된 결과가 없을 수 있습니다.",
}: {
  observations: RecentObservation[];
  emptyTitle?: string;
  emptyHint?: string;
}) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(
    () => observations.filter((item) => matchesFilter(item, filter)),
    [observations, filter],
  );

  if (observations.length === 0) {
    return (
      <AdminPanel padding="none">
        <AdminEmptyState
          title={emptyTitle}
          hint={emptyHint}
        />
      </AdminPanel>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((option) => {
          const active = filter === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => setFilter(option.key)}
              aria-pressed={active}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <AdminPanel padding="none">
          <AdminEmptyState
            title="선택한 필터에 해당하는 데이터가 없습니다."
            hint="다른 필터를 선택해 보세요."
          />
        </AdminPanel>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((observation) => (
            <ObservationCard key={observation.id} observation={observation} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ObservationCard({ observation }: { observation: RecentObservation }) {
  const isComment = observation.content_type === "comment";
  const Icon = isComment ? MessageSquareIcon : NewspaperIcon;
  const headline = resolveHeadline(observation);

  return (
    <li>
      <article
        className={cn(
          "border-border bg-card text-card-foreground rounded-xl border border-l-[3px] px-4 py-4 shadow-sm",
          isComment ? "border-l-sky-500" : "border-l-emerald-500",
        )}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium">
            <Icon className="size-3.5" aria-hidden />
            {contentTypeLabel(observation.content_type)}
          </span>
          {observation.hn_type ? (
            <NexBadge variant="secondary" size="sm">
              {hnTypeLabel(observation.hn_type)}
            </NexBadge>
          ) : null}
          {observation.content_quality ? (
            <NexBadge
              variant={contentQualityVariant(observation.content_quality)}
              size="sm"
            >
              {contentQualityLabel(observation.content_quality)}
            </NexBadge>
          ) : null}
          {observation.observation_priority ? (
            <NexBadge
              variant={priorityVariant(observation.observation_priority)}
              size="sm"
            >
              {priorityLabel(observation.observation_priority)}
            </NexBadge>
          ) : null}
        </div>

        <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span>{sourceLabel(observation.source)}</span>
          <span>·</span>
          <span>{observation.author ?? "작성자 미상"}</span>
          {typeof observation.score === "number" ? (
            <>
              <span>·</span>
              <span>score {observation.score}</span>
            </>
          ) : null}
          {typeof observation.comment_count === "number" ? (
            <>
              <span>·</span>
              <span>댓글 {observation.comment_count}</span>
            </>
          ) : null}
        </div>

        <h3 className="text-foreground mt-2 text-[15px] leading-snug font-semibold">
          {headline}
        </h3>

        {isComment && observation.title ? (
          <p className="text-muted-foreground mt-1 text-xs">
            원문 게시글: {truncateText(observation.title, TITLE_MAX_LENGTH)}
          </p>
        ) : null}

        <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
          {truncateText(observation.body, BODY_MAX_LENGTH)}
        </p>

        {observation.matched_keywords.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {observation.matched_keywords.map((keyword) => (
              <li key={keyword}>
                <NexBadge variant="info" size="sm">
                  {keyword}
                </NexBadge>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span>원문 {formatDateTime(observation.published_at)}</span>
          <span>저장 {formatDateTime(observation.created_at)}</span>
          {observation.external_content_url ? (
            <a
              href={observation.external_content_url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-foreground inline-flex items-center gap-1 font-medium hover:underline"
              aria-label={`${headline} 외부 콘텐츠 열기`}
            >
              외부 콘텐츠
              <ExternalLinkIcon className="size-3.5" aria-hidden />
            </a>
          ) : null}
          <a
            href={observation.discussion_url ?? observation.source_url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-foreground inline-flex items-center gap-1 font-medium hover:underline"
            aria-label={`${headline} HN 토론 열기`}
          >
            <MessagesSquareIcon className="size-3.5" aria-hidden />
            HN 토론
          </a>
        </div>
      </article>
    </li>
  );
}
