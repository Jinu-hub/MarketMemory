import { createHash } from "node:crypto";

export interface ContentHashInput {
  source: string;
  title?: string | null;
  body?: string | null;
  author?: string | null;
  publishedAt?: Date | string | null;
}

function normalizePart(value: string | null | undefined) {
  if (!value) {
    return "";
  }
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function normalizePublishedAt(value: Date | string | null | undefined) {
  if (!value) {
    return "";
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

/**
 * externalId를 안정적으로 제공하지 않는 소스를 대비한 2차 중복 판별 키.
 * 정규화한 source/title/body/author/publishedAt을 SHA-256으로 해싱한다.
 */
export function createContentHash(input: ContentHashInput): string {
  const payload = [
    normalizePart(input.source),
    normalizePart(input.title),
    normalizePart(input.body),
    normalizePart(input.author),
    normalizePublishedAt(input.publishedAt),
  ].join("\u0000");

  return createHash("sha256").update(payload, "utf8").digest("hex");
}
