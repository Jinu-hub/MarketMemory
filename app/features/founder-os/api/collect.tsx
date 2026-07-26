import type { Route } from "./+types/collect";

import { data } from "react-router";

import { requireAdmin, requireMethod } from "~/core/lib/guards.server";
import makeServerClient from "~/core/lib/supa-client.server";

import { parseKeywordsInput } from "../domain/match-keywords";
import {
  DEFAULT_COLLECT_LIMIT,
  SOURCE_NOT_IMPLEMENTED_MESSAGE,
  collectRequestSchema,
} from "../lib/collect-request";
import { runCollection } from "../server/run-collection.server";
import { SourceNotImplementedError } from "../sources/source-adapter";

function normalizeKeywordsPayload(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }
  if (typeof value === "string") {
    return parseKeywordsInput(value);
  }
  return [];
}

/**
 * POST /api/admin/observations/collect
 *
 * 관리자 화면과 동일한 수집 파이프라인을 JSON으로 노출한다.
 * 인증은 기존 관리자 가드(`profiles.is_admin`)를 그대로 재사용한다.
 */
export async function action({ request }: Route.ActionArgs) {
  requireMethod("POST")(request);
  const [client] = makeServerClient(request);
  await requireAdmin(client);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return data({ error: "JSON 본문을 해석하지 못했습니다." }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const normalizeIdList = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string");
    }
    if (typeof value === "string") {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
    return [];
  };
  const parsed = collectRequestSchema.safeParse({
    source: raw.source,
    keywords: normalizeKeywordsPayload(raw.keywords),
    domainIds: normalizeIdList(raw.domainIds),
    signalIds: normalizeIdList(raw.signalIds),
    contentType: raw.contentType ?? "all",
    sortMode: raw.sortMode ?? "relevance",
    timeRange: raw.timeRange ?? "all",
    limit: raw.limit === undefined ? DEFAULT_COLLECT_LIMIT : Number(raw.limit),
  });

  if (!parsed.success) {
    return data(
      { error: parsed.error.issues[0]?.message ?? "유효하지 않은 요청입니다." },
      { status: 400 },
    );
  }

  try {
    const summary = await runCollection(client, parsed.data);
    return data(summary);
  } catch (error) {
    if (error instanceof SourceNotImplementedError) {
      return data({ error: SOURCE_NOT_IMPLEMENTED_MESSAGE }, { status: 400 });
    }
    console.error("[founder-os] collect api failed", error);
    return data(
      { error: "수집 실행 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
