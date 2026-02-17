// schema.ts — MarketMemory Admin v0.1
// Drizzle ORM for PostgreSQL + pgPolicy helpers (Supabase-compatible)
// DB設計 v0.1 に基づく: Item/Content/Embedding/Report の SSOT 管理
// RLS: Admin 専用 (profiles.is_admin = true のユーザーのみ)

import { sql } from "drizzle-orm";
import {
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgPolicy,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  vector,
} from "drizzle-orm/pg-core";
import { authenticatedRole } from "drizzle-orm/supabase";

/* =========================================================
   Database Enums
   ========================================================= */
export const itemStatus = pgEnum("item_status", [
  "ready",
  "running",
  "done",
  "failed",
]);

export const category = pgEnum("category", [
  "foundation",
  "issue",
  "research",
  "market",
  "trend",
  "deep_dive",
  "column",
  "narrative_analysis",
  "watchlist",
]);

export const region = pgEnum("region", [
  "us",
  "kr",
  "jp",
  "eu",
  "cn",
  "global",
]);

export const contentType = pgEnum("content_type", [
  "summary",
  "md_summary",
  "source_text",
]);

export const promptStatus = pgEnum("prompt_status", [
  "draft",
  "active",
  "deprecated",
]);

export const tagSource = pgEnum("tag_source", ["ai", "manual"]);

/* =========================================================
   RLS Helper: Admin only
   ========================================================= */
const isAdmin = sql`exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)`;

/* =========================================================
   3-1) market_memory_items (원천 Item)
   ========================================================= */
export const marketMemoryItems = pgTable(
  "market_memory_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    input_date: date("input_date"),
    topic: text("topic"),
    detail: text("detail"),
    source_links: jsonb("source_links"),
    raw_log_link: text("raw_log_link"),
    notes: text("notes"),
    status: itemStatus("status").notNull().default("ready"),
    category: category("category"),
    region: region("region"),
    tags: text("tags").array(),
    executed_date: timestamp("executed_date", { withTimezone: true }),
    executed_id: text("executed_id"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_items_status").on(table.status),
    index("idx_items_input_date").on(table.input_date),
    index("idx_items_category").on(table.category),
    index("idx_items_tags_gin").using("gin", table.tags),
    index("idx_items_executed_id").on(table.executed_id),

    pgPolicy("mmi_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("mmi_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("mmi_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("mmi_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/* =========================================================
   3-2) item_contents (생성 결과/추출물)
   ========================================================= */
export const promptTemplates = pgTable(
  "prompt_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    purpose: text("purpose").notNull(),
    status: promptStatus("status").notNull(),
    version: integer("version").notNull(),
    template: text("template").notNull(),
    output_schema: jsonb("output_schema"),
    default_model: text("default_model"),
    default_params: jsonb("default_params"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_prompt_templates_purpose_version").on(
      table.purpose,
      table.version,
    ),
    index("idx_prompt_templates_status").on(table.status),

    pgPolicy("pt_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("pt_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("pt_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("pt_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

export const itemContents = pgTable(
  "item_contents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    item_id: uuid("item_id")
      .notNull()
      .references(() => marketMemoryItems.id, { onDelete: "cascade" }),
    source_text: text("source_text"),
    md_summary: text("md_summary"),
    summary: text("summary"),
    metadata: jsonb("metadata"),
    category_reason: text("category_reason"),
    tag_reason: jsonb("tag_reason"),
    confidence: numeric("confidence", { precision: 5, scale: 4 }),
    model_info: jsonb("model_info"),
    prompt_id: uuid("prompt_id").references(() => promptTemplates.id),
    input_hash: text("input_hash"),
    tokens_in: integer("tokens_in"),
    tokens_out: integer("tokens_out"),
    cost_usd: numeric("cost_usd", { precision: 12, scale: 6 }),
    latency_ms: integer("latency_ms"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_item_contents_item_id_created_at").on(
      table.item_id,
      table.created_at,
    ),
    index("idx_item_contents_prompt_id").on(table.prompt_id),

    pgPolicy("ic_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("ic_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("ic_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("ic_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/* =========================================================
   3-3) item_embeddings (item 단위 벡터)
   ========================================================= */
export const itemEmbeddings = pgTable(
  "item_embeddings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    item_id: uuid("item_id")
      .notNull()
      .references(() => marketMemoryItems.id, { onDelete: "cascade" }),
    content_type: contentType("content_type").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    model: text("model"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    pgPolicy("ie_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("ie_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("ie_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("ie_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/* =========================================================
   3-4) tags (태그 사전)
   ========================================================= */
export const tags = pgTable(
  "tags",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    display_name: text("display_name"),
    type: text("type"),
    aliases: text("aliases").array(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("idx_tags_slug_unique").on(table.slug),
    index("idx_tags_aliases_gin").using("gin", table.aliases),

    pgPolicy("t_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("t_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("t_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("t_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/* =========================================================
   3-5) item_tags (Item ↔ Tag N:M)
   ========================================================= */
export const itemTags = pgTable(
  "item_tags",
  {
    item_id: uuid("item_id")
      .notNull()
      .references(() => marketMemoryItems.id, { onDelete: "cascade" }),
    tag_id: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
    source: tagSource("source").notNull(),
    confidence: numeric("confidence", { precision: 5, scale: 4 }),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.item_id, table.tag_id] }),

    pgPolicy("it_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("it_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("it_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("it_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/* =========================================================
   3-6) prompt_templates は上で定義済み
   3-7) prompt_releases (목적별 active 버전 고정)
   ========================================================= */
export const promptReleases = pgTable(
  "prompt_releases",
  {
    purpose: text("purpose").primaryKey(),
    active_prompt_id: uuid("active_prompt_id")
      .notNull()
      .references(() => promptTemplates.id),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    pgPolicy("pr_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("pr_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("pr_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("pr_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/* =========================================================
   3-8) final_reports (최종 레포트 저장)
   ========================================================= */
export const finalReports = pgTable(
  "final_reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    md_body: text("md_body").notNull(),
    html_body: text("html_body"),
    summary: text("summary"),
    category: category("category"),
    region: region("region"),
    tags: text("tags").array(),
    metadata: jsonb("metadata"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_reports_created_at").on(table.created_at),
    index("idx_reports_tags_gin").using("gin", table.tags),

    pgPolicy("fr_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("fr_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("fr_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("fr_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/* =========================================================
   3-9) report_items (Report ↔ Item N:M)
   ========================================================= */
export const reportItems = pgTable(
  "report_items",
  {
    report_id: uuid("report_id")
      .notNull()
      .references(() => finalReports.id, { onDelete: "cascade" }),
    item_id: uuid("item_id")
      .notNull()
      .references(() => marketMemoryItems.id, { onDelete: "cascade" }),
    ord: integer("ord"),
    note: text("note"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.report_id, table.item_id] }),

    pgPolicy("ri_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("ri_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("ri_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("ri_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/* =========================================================
   3-10) report_embeddings (Report 벡터)
   ========================================================= */
export const reportEmbeddings = pgTable(
  "report_embeddings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    report_id: uuid("report_id")
      .notNull()
      .references(() => finalReports.id, { onDelete: "cascade" }),
    content_type: contentType("content_type").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    model: text("model"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    pgPolicy("re_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("re_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("re_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("re_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);
