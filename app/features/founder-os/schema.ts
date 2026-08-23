// schema.ts — Founder OS / Observation Collector
// Drizzle ORM for PostgreSQL + pgPolicy helpers (Supabase-compatible)
// 외부 소스에서 수집한 관찰 → 분석 → 문제 집계까지의 데이터를 저장한다.
// RLS: Admin 전용 (profiles.is_admin = true)
import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";

/* =========================================================
   Enums
   ========================================================= */
export const observationSource = pgEnum("observation_source", [
  "hacker_news",
  "github",
  "reddit",
]);

export const observationContentType = pgEnum("observation_content_type", [
  "post",
  "comment",
]);

export const collectionRunStatus = pgEnum("collection_run_status", [
  "pending",
  "running",
  "completed",
  "failed",
  "partial",
]);

// /**
//  * Observation 분석 결과의 전체 판정.
//  *
//  * - problem: 하나 이상의 의미 있는 문제 신호가 발견됨
//  * - insight: 문제 증거는 아니지만 재사용 가능한 인사이트가 발견됨
//  * - mixed: 문제 신호와 비문제 인사이트가 함께 발견됨
//  * - noise: 저장할 가치가 없는 키워드 일치, 일반론, 중복 등의 노이즈
//  * - unclear: 추가 문맥 없이는 안전하게 판단하기 어려움
//  */
// export const observationAnalysisDisposition = pgEnum(
//   "observation_analysis_disposition",
//   ["problem", "insight", "mixed", "noise", "unclear"],
// );
//
// /**
//  * 분석이 추출한 증거의 강도.
//  *
//  * 증거가 없는 noise 또는 판단 불가능한 unclear에서는
//  * 해당 컬럼을 nullable로 두는 것을 권장한다.
//  */
// export const evidenceStrength = pgEnum("evidence_strength", [
//   "weak",
//   "moderate",
//   "strong",
// ]);
//
// /**
//  * Problem의 검증 및 관리 상태.
//  *
//  * open은 의미가 모호하므로, 아직 검증되지 않은 초기 상태를
//  * 명확히 표현하는 candidate를 사용한다.
//  */
// export const problemStatus = pgEnum("problem_status", [
//   "candidate",
//   "investigating",
//   "validated",
//   "dismissed",
//   "archived",
// ]);
//
// /**
//  * Problem과 Observation 증거 사이의 의미적 관계.
//  *
//  * - supports: 문제의 존재 또는 설명을 뒷받침함
//  * - exemplifies: 해당 문제의 구체적인 실제 사례임
//  * - contradicts: 문제에 대한 기존 해석이나 가설에 반대되는 증거임
//  * - contextualizes: 문제를 직접 증명하지는 않지만 이해에 필요한 문맥을 제공함
//  */
// export const problemEvidenceRelationship = pgEnum(
//   "problem_evidence_relationship",
//   ["supports", "exemplifies", "contradicts", "contextualizes"],
// );
//
// /**
//  * 증거가 어떤 성격의 관찰인지 나타낸다.
//  *
//  * quote/paraphrase 같은 표현 형식과
//  * first-person/direct-report 같은 증거 성격을 혼합하지 않는다.
//  */
// export const problemEvidenceType = pgEnum("problem_evidence_type", [
//   "first_person_experience",
//   "direct_report",
//   "observed_behavior",
//   "operational_observation",
//   "third_party_claim",
//   "general_opinion",
// ]);
//
// /**
//  * 증거가 DB에 어떤 형태로 보존되었는지 나타낸다.
//  *
//  * 증거의 신뢰 성격과는 별개의 개념이다.
//  */
// export const problemEvidenceRepresentation = pgEnum(
//   "problem_evidence_representation",
//   ["quote", "paraphrase", "structured_extraction"],
// );

/* =========================================================
   RLS Helper: Admin only
   ========================================================= */
const isAdmin = sql`exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)`;

/* =========================================================
   1) collection_runs (수집 실행 이력)
   ========================================================= */
export const collectionRuns = pgTable(
  "collection_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    source: observationSource("source").notNull(),
    keywords: text("keywords").array().notNull(),
    content_type: text("content_type").notNull().default("all"),
    requested_limit: integer("requested_limit").notNull(),
    sort_mode: text("sort_mode").notNull().default("relevance"),
    time_range: text("time_range").notNull().default("all"),
    status: collectionRunStatus("status").notNull().default("pending"),
    fetched_count: integer("fetched_count").notNull().default(0),
    post_fetched_count: integer("post_fetched_count").notNull().default(0),
    comment_fetched_count: integer("comment_fetched_count")
      .notNull()
      .default(0),
    matched_count: integer("matched_count").notNull().default(0),
    filtered_by_date_count: integer("filtered_by_date_count")
      .notNull()
      .default(0),
    inserted_count: integer("inserted_count").notNull().default(0),
    duplicate_count: integer("duplicate_count").notNull().default(0),
    failed_count: integer("failed_count").notNull().default(0),
    title_only_count: integer("title_only_count").notNull().default(0),
    substantive_body_count: integer("substantive_body_count")
      .notNull()
      .default(0),
    high_priority_count: integer("high_priority_count").notNull().default(0),
    keyword_stats: jsonb("keyword_stats"),
    content_type_stats: jsonb("content_type_stats"),
    /**
     * UI에서 선택한 관찰 대상·문제 신호 스냅샷.
     * 예: { domains: [{ id, label }], signals: [{ id, label }] }
     */
    observation_strategy: jsonb("observation_strategy"),
    error_message: text("error_message"),
    started_at: timestamp("started_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    finished_at: timestamp("finished_at", { withTimezone: true }),
    duration_ms: integer("duration_ms"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    intelligence_number: integer("intelligence_number").notNull().default(0),
  },
  (table) => [
    index("idx_collection_runs_started_at").on(table.started_at),
    index("idx_collection_runs_source_status").on(table.source, table.status),

    pgPolicy("cr_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("cr_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("cr_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("cr_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/* =========================================================
   2) observations (정규화된 외부 콘텐츠)
   ========================================================= */
export const observations = pgTable(
  "observations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    source: observationSource("source").notNull(),
    external_id: text("external_id").notNull(),
    external_parent_id: text("external_parent_id"),
    external_story_id: text("external_story_id"),
    parent_observation_id: uuid("parent_observation_id"),
    content_type: observationContentType("content_type").notNull(),
    title: text("title"),
    body: text("body").notNull(),
    author: text("author"),
    community: text("community"),
    source_url: text("source_url").notNull(),
    external_content_url: text("external_content_url"),
    discussion_url: text("discussion_url"),
    score: integer("score"),
    comment_count: integer("comment_count"),
    hn_type: text("hn_type"),
    content_quality: text("content_quality"),
    has_substantive_body: boolean("has_substantive_body"),
    observation_priority: text("observation_priority"),
    priority_reasons: text("priority_reasons").array(),
    matched_keywords: text("matched_keywords").array().notNull().default([]),
    published_at: timestamp("published_at", { withTimezone: true }),
    fetched_at: timestamp("fetched_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    content_hash: text("content_hash").notNull(),
    raw_payload: jsonb("raw_payload"),
    collection_run_id: uuid("collection_run_id").references(
      () => collectionRuns.id,
      { onDelete: "set null" },
    ),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("observations_source_external_id_unique").on(
      table.source,
      table.external_id,
    ),
    index("idx_observations_source_content_hash").on(
      table.source,
      table.content_hash,
    ),
    index("idx_observations_published_at").on(table.published_at),
    index("idx_observations_created_at").on(table.created_at),
    index("idx_observations_collection_run_id").on(table.collection_run_id),
    index("idx_observations_external_story_id").on(table.external_story_id),
    index("idx_observations_source_content_type").on(
      table.source,
      table.content_type,
    ),
    index("idx_observations_observation_priority").on(
      table.observation_priority,
    ),

    pgPolicy("obs_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("obs_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("obs_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("obs_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/* =========================================================
   3) collection_presets (저장한 수집 조건)
   ========================================================= */
export const collectionPresets = pgTable(
  "collection_presets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    source: observationSource("source").notNull(),
    keywords: text("keywords").array().notNull().default([]),
    content_type: text("content_type").notNull().default("all"),
    sort_mode: text("sort_mode").notNull().default("relevance"),
    time_range: text("time_range").notNull().default("all"),
    requested_limit: integer("requested_limit").notNull().default(50),
    /**
     * 관찰 대상·문제 신호 스냅샷.
     * 예: { domains: [{ id, label }], signals: [{ id, label }] }
     */
    observation_strategy: jsonb("observation_strategy"),
    last_used_at: timestamp("last_used_at", { withTimezone: true }),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_collection_presets_updated_at").on(table.updated_at),
    index("idx_collection_presets_last_used_at").on(table.last_used_at),

    pgPolicy("cp_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("cp_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("cp_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("cp_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

// /* =========================================================
//    4) observation_analyses (Observation 단위 LLM/규칙 분석)
//    ========================================================= */
// export const observationAnalyses = pgTable(
//   "observation_analyses",
//   {
//     id: uuid("id").defaultRandom().primaryKey(),
//     observation_id: uuid("observation_id")
//       .notNull()
//       .references(() => observations.id, { onDelete: "cascade" }),
//     disposition: observationAnalysisDisposition("disposition").notNull(),
//     /** PROBLEM_SIGNALS id 등 — 예: ["time-waste", "tool-friction"] */
//     signal_types: text("signal_types").array().notNull().default([]),
//     summary: text("summary").notNull(),
//     confidence: numeric("confidence", { precision: 5, scale: 4 }).notNull(),
//     evidence_strength: evidenceStrength("evidence_strength").notNull(),
//     extracted_data: jsonb("extracted_data"),
//     model: text("model").notNull(),
//     prompt_version: text("prompt_version").notNull(),
//     analyzed_at: timestamp("analyzed_at", { withTimezone: true })
//       .defaultNow()
//       .notNull(),
//   },
//   (table) => [
//     index("idx_observation_analyses_observation_id").on(table.observation_id),
//     index("idx_observation_analyses_disposition").on(table.disposition),
//     index("idx_observation_analyses_analyzed_at").on(table.analyzed_at),
//     index("idx_observation_analyses_evidence_strength").on(
//       table.evidence_strength,
//     ),
//
//     pgPolicy("oa_select", {
//       for: "select",
//       to: authenticatedRole,
//       using: isAdmin,
//     }),
//     pgPolicy("oa_insert", {
//       for: "insert",
//       to: authenticatedRole,
//       withCheck: isAdmin,
//     }),
//     pgPolicy("oa_update", {
//       for: "update",
//       to: authenticatedRole,
//       using: isAdmin,
//       withCheck: isAdmin,
//     }),
//     pgPolicy("oa_delete", {
//       for: "delete",
//       to: authenticatedRole,
//       using: isAdmin,
//     }),
//   ],
// );
//
// /* =========================================================
//    5) problems (여러 Observation에서 집계된 문제)
//    ========================================================= */
// export const problems = pgTable(
//   "problems",
//   {
//     id: uuid("id").defaultRandom().primaryKey(),
//     title: text("title").notNull(),
//     description: text("description").notNull(),
//     /** 영향을 받는 사용자/세그먼트 설명 */
//     affected_users: text("affected_users"),
//     /** 문제가 나타나는 맥락 (도메인·상황 등) */
//     context: text("context"),
//     root_cause_hypotheses: text("root_cause_hypotheses")
//       .array()
//       .notNull()
//       .default([]),
//     first_seen_at: timestamp("first_seen_at", { withTimezone: true }).notNull(),
//     last_seen_at: timestamp("last_seen_at", { withTimezone: true }).notNull(),
//     evidence_count: integer("evidence_count").notNull().default(0),
//     source_count: integer("source_count").notNull().default(0),
//     status: problemStatus("status").notNull().default("candidate"),
//     confidence: numeric("confidence", { precision: 5, scale: 4 }).notNull(),
//   },
//   (table) => [
//     index("idx_problems_status").on(table.status),
//     index("idx_problems_last_seen_at").on(table.last_seen_at),
//     index("idx_problems_first_seen_at").on(table.first_seen_at),
//     index("idx_problems_confidence").on(table.confidence),
//
//     pgPolicy("prob_select", {
//       for: "select",
//       to: authenticatedRole,
//       using: isAdmin,
//     }),
//     pgPolicy("prob_insert", {
//       for: "insert",
//       to: authenticatedRole,
//       withCheck: isAdmin,
//     }),
//     pgPolicy("prob_update", {
//       for: "update",
//       to: authenticatedRole,
//       using: isAdmin,
//       withCheck: isAdmin,
//     }),
//     pgPolicy("prob_delete", {
//       for: "delete",
//       to: authenticatedRole,
//       using: isAdmin,
//     }),
//   ],
// );
//
// /* =========================================================
//    6) problem_evidence (Problem ↔ Observation 증거 링크)
//    ========================================================= */
// export const problemEvidence = pgTable(
//   "problem_evidence",
//   {
//     id: uuid("id").defaultRandom().primaryKey(),
//     problem_id: uuid("problem_id")
//       .notNull()
//       .references(() => problems.id, { onDelete: "cascade" }),
//     observation_id: uuid("observation_id")
//       .notNull()
//       .references(() => observations.id, { onDelete: "cascade" }),
//     observation_analysis_id: uuid("observation_analysis_id").references(
//       () => observationAnalyses.id,
//       { onDelete: "set null" },
//     ),
//     relationship: problemEvidenceRelationship("relationship").notNull(),
//     relevance_score: numeric("relevance_score", {
//       precision: 5,
//       scale: 4,
//     }).notNull(),
//     evidence_type: problemEvidenceType("evidence_type").notNull(),
//     created_at: timestamp("created_at", { withTimezone: true })
//       .defaultNow()
//       .notNull(),
//   },
//   (table) => [
//     uniqueIndex("problem_evidence_problem_observation_unique").on(
//       table.problem_id,
//       table.observation_id,
//     ),
//     index("idx_problem_evidence_problem_id").on(table.problem_id),
//     index("idx_problem_evidence_observation_id").on(table.observation_id),
//     index("idx_problem_evidence_analysis_id").on(
//       table.observation_analysis_id,
//     ),
//     index("idx_problem_evidence_relationship").on(table.relationship),
//
//     pgPolicy("pe_select", {
//       for: "select",
//       to: authenticatedRole,
//       using: isAdmin,
//     }),
//     pgPolicy("pe_insert", {
//       for: "insert",
//       to: authenticatedRole,
//       withCheck: isAdmin,
//     }),
//     pgPolicy("pe_update", {
//       for: "update",
//       to: authenticatedRole,
//       using: isAdmin,
//       withCheck: isAdmin,
//     }),
//     pgPolicy("pe_delete", {
//       for: "delete",
//       to: authenticatedRole,
//       using: isAdmin,
//     }),
//   ],
// );


/* =========================================================
   observation_insight_reports
   복수 Observation을 분석한 단순 MVP 결과
   ========================================================= */

   export const observationInsightReports = pgTable(
    "observation_insight_reports",
    {
      id: uuid("id").defaultRandom().primaryKey(),
  
      /**
       * 분석 대상 collection_runs.
       *
       * MVP에서는 빠른 구현을 위해 UUID 배열로 저장한다.
       * 실제 Collection Run 데이터는 기존 collection_runs 테이블에 존재한다.
       */
      collection_run_ids: uuid("collection_run_ids")
        .array()
        .notNull()
        .default([]),
  
      /**
       * 실제 분석에 포함된 Observation ID.
       *
       * 나중에 어떤 원문을 이용해 결과가 만들어졌는지 추적하기 위한 값.
       */
      observation_ids: uuid("observation_ids")
        .array()
        .notNull()
        .default([]),
  
      /**
       * 유용하지 않은 데이터를 제외한 전체 분석 요약.
       */
      summary: text("summary").notNull(),
  
      /**
       * 여러 Observation을 연결해서 발견한 의미 있는 흐름.
       *
       * 예:
       * [
       *   {
       *     "title": "...",
       *     "summary": "...",
       *     "observation_ids": ["..."]
       *   }
       * ]
       */
      stories: jsonb("stories")
        .$type<
          Array<{
            title: string;
            summary: string;
            observation_ids: string[];
          }>
        >()
        .notNull()
        .default([]),
  
      /**
       * 분석 과정에서 발견한 문제.
       *
       * 아직 장기 Problem DB로 정규화하지 않는다.
       */
      problems: jsonb("problems")
        .$type<
          Array<{
            title: string;
            description: string;
            observation_ids: string[];
          }>
        >()
        .notNull()
        .default([]),
  
      /**
       * 발견된 문제를 서비스로 발전시킨 간단한 예시.
       *
       * 사업성 검증이나 MVP 명세가 아니라
       * 창업자의 사고를 돕는 가벼운 아이디어다.
       */
      service_ideas: jsonb("service_ideas")
        .$type<
          Array<{
            title: string;
            description: string;
            related_problem: string | null;
          }>
        >()
        .notNull()
        .default([]),
  
      /**
       * 제외된 Observation 수.
       * 어떤 항목을 왜 제외했는지까지는 MVP에서 저장하지 않는다.
       */
      excluded_observation_count: integer("excluded_observation_count")
        .notNull()
        .default(0),
  
      /**
       * Agent 응답 원본.
       *
       * 출력 구조를 변경하거나 프롬프트를 개선할 때
       * 기존 결과를 다시 검토하기 위한 안전장치.
       */
      raw_output: jsonb("raw_output"),
  
      model: text("model").notNull(),
      prompt_version: text("prompt_version").notNull(),
  
      created_at: timestamp("created_at", {
        withTimezone: true,
      })
        .defaultNow()
        .notNull(),
    },
    (table) => [
      index("idx_observation_insight_reports_created_at").on(
        table.created_at,
      ),
  
      pgPolicy("oir_select", {
        for: "select",
        to: authenticatedRole,
        using: isAdmin,
      }),
      pgPolicy("oir_insert", {
        for: "insert",
        to: authenticatedRole,
        withCheck: isAdmin,
      }),
      pgPolicy("oir_update", {
        for: "update",
        to: authenticatedRole,
        using: isAdmin,
        withCheck: isAdmin,
      }),
      pgPolicy("oir_delete", {
        for: "delete",
        to: authenticatedRole,
        using: isAdmin,
      }),
    ],
  );