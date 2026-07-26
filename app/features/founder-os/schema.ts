// schema.ts — Founder OS / Observation Collector v0.1
// Drizzle ORM for PostgreSQL + pgPolicy helpers (Supabase-compatible)
// 외부 소스(Hacker News 등)에서 수집한 관찰 데이터와 수집 실행 이력을 저장한다.
// RLS: Admin 전용 (profiles.is_admin = true)
import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
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
