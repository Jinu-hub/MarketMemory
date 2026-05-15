// schema.ts — Daily Market Memory (Section 2 SSOT)
// Drizzle ORM for PostgreSQL + pgPolicy (Supabase-compatible)
// RLS: Admin 전용 (profiles.is_admin = true) — admin/schema.ts 와 동일

import { desc, sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgPolicy,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";

import { itemContents, marketMemoryItems } from "~/features/admin/schema";

/* =========================================================
   RLS Helper: Admin only
   ========================================================= */
const isAdmin = sql`exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)`;

/* =========================================================
   daily_market_memories — 언어 비의존 기준 데이터
   ========================================================= */
export const dailyMarketMemories = pgTable(
  "daily_market_memories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    market_date: date("market_date").notNull(),
    market_scope: text("market_scope").notNull(),
    coverage_start_at: timestamp("coverage_start_at", { withTimezone: true }),
    coverage_end_at: timestamp("coverage_end_at", { withTimezone: true }),
    generation_timezone: text("generation_timezone")
      .notNull()
      .default("Asia/Tokyo"),
    status: text("status").notNull().default("draft"),
    generated_at: timestamp("generated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    finalized_at: timestamp("finalized_at", { withTimezone: true }),
    source_report_count: integer("source_report_count").notNull().default(0),
    core_lang_code: text("core_lang_code").notNull().default("en"),
    market_snapshot: jsonb("market_snapshot"),
    top_tags: jsonb("top_tags"),
    top_entities: jsonb("top_entities"),
    risk_signals: jsonb("risk_signals"),
    input_context: jsonb("input_context"),
    model_info: jsonb("model_info"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("dmm_one_final_per_date_scope")
      .on(table.market_date, table.market_scope)
      .where(sql`${table.status} = 'final'`),
    index("idx_dmm_scope_status_generated").on(
      table.market_scope,
      table.status,
      desc(table.generated_at),
    ),
    index("idx_dmm_market_date").on(desc(table.market_date)),

    pgPolicy("dmm_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("dmm_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("dmm_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("dmm_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/* =========================================================
   daily_market_memory_i18n — 언어별 표시 문장
   ========================================================= */
export const dailyMarketMemoryI18n = pgTable(
  "daily_market_memory_i18n",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    daily_market_memory_id: uuid("daily_market_memory_id")
      .notNull()
      .references(() => dailyMarketMemories.id, { onDelete: "cascade" }),
    lang_code: text("lang_code").notNull(),
    display_title: text("display_title"),
    display_subtitle: text("display_subtitle"),
    core_summary: text("core_summary"),
    top_themes: jsonb("top_themes"),
    market_mood_type: text("market_mood_type"),
    market_mood_label: text("market_mood_label"),
    market_mood_summary: text("market_mood_summary"),
    localization_status: text("localization_status").notNull().default("draft"),
    source_lang_code: text("source_lang_code"),
    model_info: jsonb("model_info"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("dmm_i18n_memory_lang_unique").on(
      table.daily_market_memory_id,
      table.lang_code,
    ),
    index("idx_dmm_i18n_memory_id").on(table.daily_market_memory_id),
    index("idx_dmm_i18n_lang_code").on(table.lang_code),

    pgPolicy("dmm_i18n_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("dmm_i18n_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("dmm_i18n_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("dmm_i18n_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/* =========================================================
   daily_market_memory_sources — 근거 리포트 추적
   ========================================================= */
export const dailyMarketMemorySources = pgTable(
  "daily_market_memory_sources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    daily_market_memory_id: uuid("daily_market_memory_id")
      .notNull()
      .references(() => dailyMarketMemories.id, { onDelete: "cascade" }),
    item_content_id: uuid("item_content_id")
      .notNull()
      .references(() => itemContents.id, { onDelete: "cascade" }),
    market_memory_item_id: uuid("market_memory_item_id").references(
      () => marketMemoryItems.id,
      { onDelete: "set null" },
    ),
    report_title_snapshot: text("report_title_snapshot"),
    report_type: text("report_type"),
    lang_code: text("lang_code"),
    source_weight: numeric("source_weight", { precision: 8, scale: 4 }),
    inclusion_reason: text("inclusion_reason"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("dms_memory_content_unique").on(
      table.daily_market_memory_id,
      table.item_content_id,
    ),
    index("idx_dms_memory_id").on(table.daily_market_memory_id),
    index("idx_dms_item_content_id").on(table.item_content_id),
    index("idx_dms_market_memory_item_id").on(table.market_memory_item_id),

    pgPolicy("dms_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("dms_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("dms_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("dms_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);
