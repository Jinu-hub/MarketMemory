import type { ComponentProps } from "react";

import type {
  CollectionRunStatus,
  HackerNewsObservationType,
  ObservationContentQuality,
  ObservationContentType,
  ObservationPriority,
  ObservationSource,
  SortMode,
  TimeRange,
} from "../domain/observation.types";

import type { NexBadge } from "~/core/components/nex";

import {
  SORT_MODE_OPTIONS,
  SOURCE_OPTIONS,
  TIME_RANGE_OPTIONS,
} from "./collect-request";

type BadgeVariant = ComponentProps<typeof NexBadge>["variant"];

const RUN_STATUS_LABELS: Record<CollectionRunStatus, string> = {
  pending: "대기",
  running: "실행 중",
  completed: "완료",
  failed: "실패",
  partial: "부분 성공",
};

const RUN_STATUS_VARIANTS: Record<CollectionRunStatus, BadgeVariant> = {
  pending: "secondary",
  running: "info",
  completed: "success",
  failed: "error",
  partial: "warning",
};

export function runStatusLabel(status: string) {
  return RUN_STATUS_LABELS[status as CollectionRunStatus] ?? status;
}

export function runStatusVariant(status: string): BadgeVariant {
  return RUN_STATUS_VARIANTS[status as CollectionRunStatus] ?? "default";
}

const CONTENT_TYPE_LABELS: Record<ObservationContentType, string> = {
  post: "게시물",
  comment: "댓글",
};

export function contentTypeLabel(value: string) {
  return CONTENT_TYPE_LABELS[value as ObservationContentType] ?? value;
}

/** 수집 조건의 콘텐츠 타입 필터 (`all` 포함) */
export function contentTypeFilterLabel(value: string) {
  return value === "all" ? "전체" : contentTypeLabel(value);
}

export function sourceLabel(value: string) {
  return (
    SOURCE_OPTIONS.find(
      (option) => option.value === (value as ObservationSource),
    )?.label ?? value
  );
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const HN_TYPE_LABELS: Record<HackerNewsObservationType, string> = {
  ask_hn: "Ask HN",
  show_hn: "Show HN",
  launch_hn: "Launch HN",
  story: "Story",
  comment: "Comment",
};

export function hnTypeLabel(value: string | null | undefined) {
  if (!value) {
    return "-";
  }
  return HN_TYPE_LABELS[value as HackerNewsObservationType] ?? value;
}

const CONTENT_QUALITY_LABELS: Record<ObservationContentQuality, string> = {
  full: "본문 있음",
  short: "짧은 본문",
  title_only: "제목만",
  empty: "본문 없음",
};

const CONTENT_QUALITY_VARIANTS: Record<
  ObservationContentQuality,
  BadgeVariant
> = {
  full: "success",
  short: "secondary",
  title_only: "warning",
  empty: "error",
};

export function contentQualityLabel(value: string | null | undefined) {
  if (!value) {
    return "-";
  }
  return CONTENT_QUALITY_LABELS[value as ObservationContentQuality] ?? value;
}

export function contentQualityVariant(
  value: string | null | undefined,
): BadgeVariant {
  return (
    CONTENT_QUALITY_VARIANTS[value as ObservationContentQuality] ?? "default"
  );
}

const PRIORITY_LABELS: Record<ObservationPriority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const PRIORITY_VARIANTS: Record<ObservationPriority, BadgeVariant> = {
  high: "error",
  medium: "warning",
  low: "secondary",
};

export function priorityLabel(value: string | null | undefined) {
  if (!value) {
    return "-";
  }
  return PRIORITY_LABELS[value as ObservationPriority] ?? value;
}

export function priorityVariant(
  value: string | null | undefined,
): BadgeVariant {
  return PRIORITY_VARIANTS[value as ObservationPriority] ?? "default";
}

export function sortModeLabel(value: string | null | undefined) {
  if (!value) {
    return "-";
  }
  return (
    SORT_MODE_OPTIONS.find((option) => option.value === (value as SortMode))
      ?.label ?? value
  );
}

export function timeRangeLabel(value: string | null | undefined) {
  if (!value) {
    return "-";
  }
  return (
    TIME_RANGE_OPTIONS.find((option) => option.value === (value as TimeRange))
      ?.label ?? value
  );
}

export function formatDuration(durationMs: number | null | undefined) {
  if (durationMs === null || durationMs === undefined) {
    return "-";
  }
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }
  return `${(durationMs / 1000).toFixed(1)}s`;
}
