// schema.ts — Market Memory Representation & Market Signal Layer (v0.1)
// Drizzle ORM for PostgreSQL + pgPolicy (Supabase-compatible)
//
// Core(item_contents, daily_market_memories 등)와 분리된 파생 표현·Signal 저장 레이어.
// target_type + target_id 로 polymorphic 참조 — DB FK 없이 논리적 연결.
//
// RLS: SELECT 공개, INSERT/UPDATE/DELETE Admin 전용 (profiles.is_admin = true)

import { desc, sql } from "drizzle-orm";
import {
  date,
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

/** Representation / Signal 공통 — 원본 DB 객체 종류 (admin.targetType 과 별개) */
export const contentTargetType = pgEnum("content_target_type", [
  "analysis-report",
  "thesis-report",
  "timeline-report",
  "briefing-report",
  "daily-market-memory",
]);

/**
 * 원본 콘텐츠의 비즈니스적 종류.
 * MVP: global_market_issues — 향후 daily/weekly/monthly market memory 등 확장.
 */
export const marketMemoryContentType = pgEnum("market_memory_content_type", [
  "global-market-issues",
  "daily-market-issues",
  "report-summary",
  "weekly-market-issues",
  "weekly-ai-issues",
  "daily-market-memory",
  "weekly-market-memory",
  "monthly-market-memory",
]);

/** Brief Representation 종류 — MVP: today_30s (UI: "Today in 30 Seconds") */
export const briefType = pgEnum("brief_type", [
  "today_30s",
  "short_summary",
  "key_points",
  "executive_summary",
]);

/** Audio Representation 종류 — MVP: market_talk */
export const audioType = pgEnum("audio_type", [
  "market_talk",
  "brief_30s",
  "read_aloud",
  "deep_dive",
]);

export const contentBriefStatus = pgEnum("content_brief_status", [
  "draft",
  "final",
]);

export const contentAudioStatus = pgEnum("content_audio_status", [
  "script_ready",
  "generated",
  "failed",
]);

/** Signal 집계 범위 — MVP: content_type + global_market_issues */
export const marketSignalScopeType = pgEnum("market_signal_scope_type", [
  "content_type",
  "global",
]);

export const marketSignalPeriodType = pgEnum("market_signal_period_type", [
  "daily",
  "weekly",
  "monthly",
]);

export const marketSignalSnapshotStatus = pgEnum("market_signal_snapshot_status", [
  "draft",
  "final",
]);

/** Signal 대상 종류 — tag / entity / theme 등 */
export const marketSignalType = pgEnum("market_signal_type", [
  "tag",
  "entity",
  "theme",
  "industry",
  "company",
  "person",
  "asset",
  "region",
  "country",
  "indicator",
  "technology",
  "institution",
  "product",
]);

export const marketSignalTrendType = pgEnum("market_signal_trend_type", [
  "rising",
  "falling",
  "new",
  "stable",
]);

/* =========================================================
   RLS Helper
   ========================================================= */
const isAdmin = sql`exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)`;

/* =========================================================
   content_briefs — 짧은 텍스트 Representation (e.g. Today in 30 Seconds)
   ========================================================= */
export const contentBriefs = pgTable(
  "content_briefs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    target_type: contentTargetType("target_type").notNull(),
    /** item_report → item_contents.id, daily_market_memory → daily_market_memories.id */
    target_id: uuid("target_id").notNull(),
    content_type: marketMemoryContentType("content_type").notNull(),
    brief_type: briefType("brief_type").notNull(),
    lang_code: text("lang_code").notNull(),
    title: text("title"),
    content: text("content").notNull(),
    status: contentBriefStatus("status").notNull().default("draft"),
    market_date: date("market_date"),
    model_info: jsonb("model_info"),
    metadata: jsonb("metadata"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("cb_target_brief_lang_unique").on(
      table.target_type,
      table.target_id,
      table.brief_type,
      table.lang_code,
    ),
    index("idx_cb_target").on(table.target_type, table.target_id),
    index("idx_cb_content_type_market_date").on(
      table.content_type,
      desc(table.market_date),
    ),
    index("idx_cb_brief_type_status").on(table.brief_type, table.status),
    index("idx_cb_lang_code").on(table.lang_code),

    pgPolicy("cb_select", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
    pgPolicy("cb_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("cb_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("cb_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/* =========================================================
   content_audio — Audio Representation (e.g. Market Talk)
   ========================================================= */
export const contentAudio = pgTable(
  "content_audio",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    target_type: contentTargetType("target_type").notNull(),
    target_id: uuid("target_id").notNull(),
    content_type: marketMemoryContentType("content_type").notNull(),
    audio_type: audioType("audio_type").notNull(),
    lang_code: text("lang_code").notNull(),
    title: text("title"),
    script: text("script"),
    duration_seconds: integer("duration_seconds"),
    storage_provider: text("storage_provider"),
    storage_key: text("storage_key"),
    status: contentAudioStatus("status").notNull().default("script_ready"),
    market_date: date("market_date"),
    model_info: jsonb("model_info"),
    metadata: jsonb("metadata"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("ca_target_audio_lang_unique").on(
      table.target_type,
      table.target_id,
      table.audio_type,
      table.lang_code,
    ),
    index("idx_ca_target").on(table.target_type, table.target_id),
    index("idx_ca_content_type_market_date").on(
      table.content_type,
      desc(table.market_date),
    ),
    index("idx_ca_audio_type_status").on(table.audio_type, table.status),
    index("idx_ca_lang_code").on(table.lang_code),

    pgPolicy("ca_select", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
    pgPolicy("ca_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("ca_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("ca_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/* =========================================================
   market_signal_snapshots — 범위·기간별 Signal 집계 단위
   ========================================================= */
export const marketSignalSnapshots = pgTable(
  "market_signal_snapshots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    scope_type: marketSignalScopeType("scope_type").notNull(),
    /** content_type scope → e.g. global_market_issues; global scope → null */
    scope_key: text("scope_key"),
    period_type: marketSignalPeriodType("period_type").notNull(),
    /** e.g. 2026-W34, 2026-08 */
    period_key: text("period_key").notNull(),
    period_start: date("period_start").notNull(),
    period_end: date("period_end").notNull(),
    source_count: integer("source_count").notNull().default(0),
    status: marketSignalSnapshotStatus("status").notNull().default("draft"),
    generated_at: timestamp("generated_at", { withTimezone: true }),
    model_info: jsonb("model_info"),
    metadata: jsonb("metadata"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("mss_scope_period_unique").on(
      table.scope_type,
      table.scope_key,
      table.period_type,
      table.period_key,
    ),
    uniqueIndex("mss_one_final_per_scope_period")
      .on(table.scope_type, table.scope_key, table.period_type, table.period_key)
      .where(sql`${table.status} = 'final'`),
    index("idx_mss_scope_status").on(table.scope_type, table.scope_key, table.status),
    index("idx_mss_period").on(table.period_type, desc(table.period_key)),
    index("idx_mss_period_range").on(table.period_start, table.period_end),

    pgPolicy("mss_select", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
    pgPolicy("mss_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("mss_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("mss_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/* =========================================================
   market_signal_items — Snapshot 내 개별 Signal
   ========================================================= */
export const marketSignalItems = pgTable(
  "market_signal_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    snapshot_id: uuid("snapshot_id")
      .notNull()
      .references(() => marketSignalSnapshots.id, { onDelete: "cascade" }),
    signal_type: marketSignalType("signal_type").notNull(),
    signal_key: text("signal_key").notNull(),
    display_name: text("display_name").notNull(),
    rank: integer("rank"),
    current_count: integer("current_count"),
    previous_count: integer("previous_count"),
    change_rate: numeric("change_rate", { precision: 10, scale: 4 }),
    trend_type: marketSignalTrendType("trend_type"),
    signal_strength: numeric("signal_strength", { precision: 10, scale: 4 }),
    metadata: jsonb("metadata"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("msi_snapshot_signal_unique").on(
      table.snapshot_id,
      table.signal_type,
      table.signal_key,
    ),
    index("idx_msi_snapshot_rank").on(table.snapshot_id, table.rank),
    index("idx_msi_signal_type_key").on(table.signal_type, table.signal_key),
    index("idx_msi_trend_type").on(table.trend_type),

    pgPolicy("msi_select", {
      for: "select",
      to: authenticatedRole,
      using: sql`true`,
    }),
    pgPolicy("msi_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("msi_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("msi_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);
