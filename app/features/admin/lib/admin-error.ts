export type ParsedAdminError = {
  title: string;
  summary: string;
  detail: string;
  hint?: string;
};

const COLUMN_MISSING_RE =
  /column\s+"([^"]+)"\s+of\s+relation\s+"([^"]+)"\s+does\s+not\s+exist/i;
const COLUMN_MISSING_SIMPLE_RE = /column\s+"([^"]+)"\s+does\s+not\s+exist/i;
const RELATION_MISSING_RE = /relation\s+"([^"]+)"\s+does\s+not\s+exist/i;
const FUNCTION_MISSING_RE =
  /function\s+([^\s(]+)\s*\([^)]*\)\s+does\s+not\s+exist/i;

/**
 * Supabase/Postgres RPC·DB 오류 메시지를 관리자 화면용으로 요약합니다.
 */
export function parseAdminErrorMessage(message: string): ParsedAdminError {
  const detail = message.trim() || "알 수 없는 오류가 발생했습니다.";

  const columnOfRelation = detail.match(COLUMN_MISSING_RE);
  if (columnOfRelation) {
    const [, column, relation] = columnOfRelation;
    const dmmRankHint =
      relation === "daily_market_memory_similarity_edges" && column === "ranking"
        ? "이 테이블 컬럼명은 similarity_rank 입니다. regenerate_daily_market_memory_similarity SQL을 DB에 다시 적용했는지 확인하세요."
        : undefined;
    return {
      title: "DB 컬럼 오류",
      summary: `「${relation}」 테이블에 「${column}」 컬럼이 없습니다.`,
      detail,
      hint:
        dmmRankHint ??
        "마이그레이션·RPC 함수 정의가 DB와 일치하는지 확인한 뒤, sql/functions 아래 SQL을 Supabase에서 다시 실행하세요.",
    };
  }

  const columnSimple = detail.match(COLUMN_MISSING_SIMPLE_RE);
  if (columnSimple) {
    const column = columnSimple[1]!;
    const dmmRankHint =
      column === "ranking"
        ? "daily_market_memory_similarity_edges 는 similarity_rank 를 사용합니다. regenerate_daily_market_memory_similarity.sql 을 DB에 적용하세요."
        : undefined;
    return {
      title: "DB 컬럼 오류",
      summary: `「${column}」 컬럼을 찾을 수 없습니다.`,
      detail,
      hint: dmmRankHint,
    };
  }

  const relationMissing = detail.match(RELATION_MISSING_RE);
  if (relationMissing) {
    return {
      title: "DB 테이블 오류",
      summary: `「${relationMissing[1]}」 테이블이 없습니다.`,
      detail,
      hint: "db:migrate 또는 해당 CREATE TABLE 마이그레이션을 DB에 적용했는지 확인하세요.",
    };
  }

  const fnMissing = detail.match(FUNCTION_MISSING_RE);
  if (fnMissing) {
    return {
      title: "DB 함수(RPC) 오류",
      summary: `「${fnMissing[1]}」 함수가 DB에 없습니다.`,
      detail,
      hint: "sql/functions 폴더의 create or replace function 을 Supabase SQL Editor에서 실행하세요.",
    };
  }

  if (/permission denied|row-level security|rls/i.test(detail)) {
    return {
      title: "권한 오류",
      summary: "이 작업을 수행할 권한이 없습니다.",
      detail,
      hint: "관리자 계정(profiles.is_admin)과 RLS 정책을 확인하세요.",
    };
  }

  if (/JWT|session|not authenticated|unauthorized/i.test(detail)) {
    return {
      title: "인증 오류",
      summary: "로그인 세션이 유효하지 않습니다.",
      detail,
      hint: "다시 로그인한 뒤 재시도하세요.",
    };
  }

  if (/timeout|timed out/i.test(detail)) {
    return {
      title: "시간 초과",
      summary: "요청이 제한 시간 안에 끝나지 않았습니다.",
      detail,
      hint: "잠시 후 다시 시도하거나, 일괄 처리 대상 건수를 줄여 보세요.",
    };
  }

  if (/duplicate key|unique constraint/i.test(detail)) {
    return {
      title: "중복 데이터",
      summary: "유니크 제약 조건과 충돌했습니다.",
      detail,
    };
  }

  const firstLine = detail.split("\n")[0]?.trim() ?? detail;
  return {
    title: "작업 실패",
    summary: firstLine.length > 160 ? `${firstLine.slice(0, 157)}…` : firstLine,
    detail,
  };
}
