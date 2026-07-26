import type { ComponentType, FormEvent, KeyboardEvent, ReactNode } from "react";

import {
  AlertTriangleIcon,
  ChevronDownIcon,
  PlusIcon,
  TelescopeIcon,
  XIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

import { NexButton, NexInput } from "~/core/components/nex";
import { cn } from "~/core/lib/utils";
import { adminSelectClassName } from "~/features/admin/components/admin-ui";

import {
  normalizeKeywords,
  parseKeywordsInput,
} from "../domain/match-keywords";
import {
  CONTENT_TYPE_OPTIONS,
  DEFAULT_COLLECT_LIMIT,
  MAX_COLLECT_LIMIT,
  MAX_KEYWORDS,
  MIN_COLLECT_LIMIT,
  SORT_MODE_OPTIONS,
  SOURCE_NOT_IMPLEMENTED_MESSAGE,
  SOURCE_OPTIONS,
  TIME_RANGE_OPTIONS,
  findSourceOption,
} from "../lib/collect-request";
import {
  OBSERVATION_DOMAINS,
  PROBLEM_SIGNALS,
  buildSearchCandidates,
  findObservationDomain,
} from "../lib/observation-strategy";

type FormComponent = ComponentType<{
  method?: "post";
  className?: string;
  children?: ReactNode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}>;

const KEYWORDS_PLACEHOLDER = "직접 입력 후 Enter 또는 추가";

const fieldLabelClass = "text-foreground text-sm font-medium";

function keywordKey(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function toggleId(current: string[], id: string): string[] {
  return current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id];
}

function SelectionChip({
  label,
  selected,
  onClick,
  description,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      title={description}
      className={cn(
        "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function CandidateChip({
  keyword,
  selected,
  disabled,
  onAdd,
}: {
  keyword: string;
  selected: boolean;
  disabled: boolean;
  onAdd: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={selected || disabled}
      aria-pressed={selected}
      aria-label={selected ? `${keyword} (이미 선택됨)` : `${keyword} 추가`}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors",
        selected
          ? "border-primary/30 bg-primary/10 text-primary cursor-default"
          : "border-border bg-background text-foreground hover:border-primary/40",
        !selected && disabled && "cursor-not-allowed opacity-40",
      )}
    >
      {keyword}
      {!selected ? (
        <PlusIcon className="size-2.5 opacity-60" aria-hidden />
      ) : null}
    </button>
  );
}

export function ObservationCollectorForm({
  Form,
  busy,
}: {
  Form: FormComponent;
  busy: boolean;
}) {
  const [source, setSource] = useState<string>(SOURCE_OPTIONS[0].value);
  const [domainIds, setDomainIds] = useState<string[]>([]);
  const [signalIds, setSignalIds] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [topicOpen, setTopicOpen] = useState(true);

  const selectedSource = findSourceOption(source);
  const sourceReady = selectedSource?.implemented ?? false;
  const atKeywordLimit = selectedKeywords.length >= MAX_KEYWORDS;
  const canSubmit = sourceReady && selectedKeywords.length > 0 && !busy;
  const selectedKeys = new Set(selectedKeywords.map(keywordKey));

  const searchCandidates = useMemo(
    () => buildSearchCandidates(domainIds, signalIds),
    [domainIds, signalIds],
  );

  const founderDevSelected = domainIds.includes("founder-dev");
  const topicGroups = founderDevSelected
    ? (findObservationDomain("founder-dev")?.topicGroups ?? [])
    : [];

  const availableCandidates = searchCandidates.filter(
    (keyword) => !selectedKeys.has(keywordKey(keyword)),
  );

  function addKeywords(rawKeywords: string[]) {
    if (rawKeywords.length === 0 || atKeywordLimit) {
      return;
    }
    setSelectedKeywords((current) => {
      const next = [...current];
      const seen = new Set(current.map(keywordKey));
      for (const keyword of normalizeKeywords(rawKeywords)) {
        if (next.length >= MAX_KEYWORDS) {
          break;
        }
        const key = keywordKey(keyword);
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        next.push(keyword);
      }
      return next;
    });
  }

  function addDraft() {
    addKeywords(parseKeywordsInput(draft));
    setDraft("");
  }

  function removeKeyword(keyword: string) {
    const key = keywordKey(keyword);
    setSelectedKeywords((current) =>
      current.filter((item) => keywordKey(item) !== key),
    );
  }

  function handleDraftKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") {
      return;
    }
    event.preventDefault();
    addDraft();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (!canSubmit) {
      event.preventDefault();
    }
  }

  return (
    <Form method="post" className="space-y-5" onSubmit={handleSubmit}>
      <input
        type="hidden"
        name="keywords"
        value={selectedKeywords.join(", ")}
      />
      <input type="hidden" name="domainIds" value={domainIds.join(",")} />
      <input type="hidden" name="signalIds" value={signalIds.join(",")} />

      {/* 기본 설정 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1 sm:col-span-1 lg:col-span-1">
          <label htmlFor="collector-source" className={fieldLabelClass}>
            Source
          </label>
          <select
            id="collector-source"
            name="source"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            className={adminSelectClassName}
            title={selectedSource?.description}
          >
            {SOURCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
                {option.implemented ? "" : " (미연결)"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="collector-limit" className={fieldLabelClass}>
            최대 개수
          </label>
          <NexInput
            id="collector-limit"
            name="limit"
            type="number"
            inputSize="md"
            defaultValue={DEFAULT_COLLECT_LIMIT}
            min={MIN_COLLECT_LIMIT}
            max={MAX_COLLECT_LIMIT}
            step={1}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="collector-sort" className={fieldLabelClass}>
            정렬
          </label>
          <select
            id="collector-sort"
            name="sortMode"
            defaultValue={SORT_MODE_OPTIONS[0].value}
            className={adminSelectClassName}
          >
            {SORT_MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="collector-time-range" className={fieldLabelClass}>
            기간
          </label>
          <select
            id="collector-time-range"
            name="timeRange"
            defaultValue="all"
            className={adminSelectClassName}
          >
            {TIME_RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 탐색 조건 */}
      <div className="border-border space-y-3 rounded-lg border p-3 sm:p-4">
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <p className={fieldLabelClass}>관찰 대상</p>
            <span className="text-muted-foreground text-[11px]">
              복수 선택
            </span>
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {OBSERVATION_DOMAINS.map((domain) => (
              <li key={domain.id}>
                <SelectionChip
                  label={domain.label}
                  description={domain.description}
                  selected={domainIds.includes(domain.id)}
                  onClick={() =>
                    setDomainIds((current) => toggleId(current, domain.id))
                  }
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="border-border border-t pt-3">
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <p className={fieldLabelClass}>문제 신호</p>
              <span className="text-muted-foreground text-[11px]">
                불편함을 말하는 표현
              </span>
            </div>
            <ul className="flex flex-wrap gap-1.5">
              {PROBLEM_SIGNALS.map((signal) => (
                <li key={signal.id}>
                  <SelectionChip
                    label={signal.label}
                    selected={signalIds.includes(signal.id)}
                    onClick={() =>
                      setSignalIds((current) => toggleId(current, signal.id))
                    }
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {topicGroups.length > 0 ? (
          <div className="border-border border-t pt-3">
            <button
              type="button"
              onClick={() => setTopicOpen((open) => !open)}
              className="text-foreground flex w-full items-center justify-between gap-2 text-sm font-medium"
              aria-expanded={topicOpen}
            >
              <span>개발자·시스템관리 주제 키워드</span>
              <ChevronDownIcon
                className={cn(
                  "text-muted-foreground size-4 transition-transform",
                  topicOpen && "rotate-180",
                )}
                aria-hidden
              />
            </button>
            {topicOpen ? (
              <div className="mt-2 max-h-40 space-y-2 overflow-y-auto pr-1">
                {topicGroups.map((group) => (
                  <div key={group.id} className="space-y-1">
                    <p className="text-muted-foreground text-[11px]">
                      {group.label}
                    </p>
                    <ul className="flex flex-wrap gap-1">
                      {group.keywords.map((keyword) => (
                        <li key={keyword}>
                          <CandidateChip
                            keyword={keyword}
                            selected={selectedKeys.has(keywordKey(keyword))}
                            disabled={atKeywordLimit}
                            onAdd={() => addKeywords([keyword])}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {signalIds.length > 0 && availableCandidates.length > 0 ? (
          <div className="border-border border-t pt-3">
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <p className={fieldLabelClass}>검색 후보</p>
              <span className="text-muted-foreground text-[11px]">
                클릭하여 추가 · {availableCandidates.length}개
              </span>
            </div>
            <ul className="flex max-h-28 flex-wrap gap-1 overflow-y-auto pr-1">
              {availableCandidates.map((keyword) => (
                <li key={keyword}>
                  <CandidateChip
                    keyword={keyword}
                    selected={false}
                    disabled={atKeywordLimit}
                    onAdd={() => addKeywords([keyword])}
                  />
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {/* 선택된 키워드 + 직접 입력 */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor="collector-keywords" className={fieldLabelClass}>
            검색 키워드
          </label>
          <span className="text-muted-foreground text-[11px] tabular-nums">
            {selectedKeywords.length}/{MAX_KEYWORDS}
          </span>
        </div>

        {selectedKeywords.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {selectedKeywords.map((keyword) => (
              <li key={keyword}>
                <span className="border-border bg-secondary text-secondary-foreground inline-flex items-center gap-0.5 rounded-md border py-0.5 pr-0.5 pl-2 text-xs font-medium">
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword)}
                    className="hover:bg-muted text-muted-foreground hover:text-foreground inline-flex size-5 items-center justify-center rounded"
                    aria-label={`${keyword} 제거`}
                  >
                    <XIcon className="size-3" aria-hidden />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-xs">
            {signalIds.length === 0
              ? "문제 신호를 고르거나 아래에서 직접 입력하세요."
              : "위 검색 후보를 클릭하거나 직접 입력하세요."}
          </p>
        )}

        <div className="flex gap-2">
          <div className="min-w-0 flex-1">
            <NexInput
              id="collector-keywords"
              inputSize="md"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleDraftKeyDown}
              placeholder={KEYWORDS_PLACEHOLDER}
              autoComplete="off"
              disabled={atKeywordLimit}
            />
          </div>
          <NexButton
            type="button"
            variant="secondary"
            size="md"
            onClick={addDraft}
            disabled={atKeywordLimit || draft.trim().length === 0}
            leftIcon={<PlusIcon className="size-4" aria-hidden />}
            aria-label="입력한 키워드 추가"
          >
            추가
          </NexButton>
        </div>
      </div>

      {/* 콘텐츠 타입 */}
      <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <legend className={cn(fieldLabelClass, "mr-1")}>콘텐츠</legend>
        {CONTENT_TYPE_OPTIONS.map((option, index) => (
          <label
            key={option.value}
            className="text-foreground flex items-center gap-1.5 text-sm"
          >
            <input
              type="radio"
              name="contentType"
              value={option.value}
              defaultChecked={index === 0}
              className="accent-primary size-3.5"
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      {!sourceReady ? (
        <p
          className="border-border bg-muted/40 text-muted-foreground flex items-start gap-2 rounded-lg border px-3 py-2 text-sm"
          role="status"
        >
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          {SOURCE_NOT_IMPLEMENTED_MESSAGE}
        </p>
      ) : null}

      <NexButton
        type="submit"
        variant="primary"
        size="lg"
        loading={busy}
        disabled={!canSubmit}
        leftIcon={<TelescopeIcon className="size-4" aria-hidden />}
      >
        관찰 데이터 수집
      </NexButton>
    </Form>
  );
}
