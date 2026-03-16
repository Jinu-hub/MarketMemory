// schema.ts — MarketMemory Admin v0.1
// Drizzle ORM for PostgreSQL + pgPolicy helpers (Supabase-compatible)
// DB設計 v0.1 に基づく: Item/Content/Embedding/Report の SSOT 管理
// RLS: Admin 専用 (profiles.is_admin = true のユーザーのみ)

import { desc, sql } from "drizzle-orm";
import {
  boolean,
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
  "uk",
  "europe",
  "korea",
  "japan",
  "china",
  "taiwan",
  "hongkong",
  "indonesia",
  "singapore",
  "apac",
  "asia",
  "emea",
  "americas",
  "latam",
  "mena",
  "anz",
  "sea",
  "oceania",
  "africa",
  "middle_east",
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

export const ocrJobStatus = pgEnum("ocr_job_status", [
  "queued",
  "running",
  "success",
  "failed",
  "partial",
]);

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
    job_code: text("job_code"),
    input_date: date("input_date"),
    topic: text("topic"),
    detail: text("detail"),
    ocr_job_id: uuid("ocr_job_id").references(() => ocrJobs.id, { onDelete: "set null" }),
    normalized_document_id: uuid("normalized_document_id").references(() => normalizedDocuments.id, { onDelete: "set null" }),
    raw_log_link: text("raw_log_link"),
    notes: text("notes"),
    status: itemStatus("status").notNull().default("ready"),
    category: category("category"),
    regions: region("regions").array(),
    tags: text("tags").array(),
    source_lang: text("source_lang"),
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
    uniqueIndex("mmi_job_code_unique").on(table.job_code),
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
   3-1-1) OCR Jobs (문서 1건 = 1 job, job_code PK)
   ========================================================= */
   export const ocrJobs = pgTable(
    "ocr_jobs",
    {
      id: uuid("id").defaultRandom().primaryKey(),
      job_code: text("job_code").notNull(),
      source_type: text("source_type").notNull().default("pdf"),
      source_name: text("source_name").notNull(),
      source_url: text("source_url"),
      status: ocrJobStatus("status").notNull().default("queued"),
  
      page_total: integer("page_total"),
      merged_text_raw: text("merged_text_raw"),
      merged_text_clean: text("merged_text_clean"),
      extraction_notes: jsonb("extraction_notes"),
  
      last_error: text("last_error"),
      metadata: jsonb("metadata"),
  
      created_at: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
      updated_at: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    },
    (table) => [
      uniqueIndex("ocr_jobs_job_code_unique").on(table.job_code),
      index("idx_ocr_jobs_created_at").on(desc(table.created_at)),
  
      pgPolicy("oj_select", {
        for: "select",
        to: authenticatedRole,
        using: isAdmin,
      }),
      pgPolicy("oj_insert", {
        for: "insert",
        to: authenticatedRole,
        withCheck: isAdmin,
      }),
      pgPolicy("oj_update", {
        for: "update",
        to: authenticatedRole,
        using: isAdmin,
        withCheck: isAdmin,
      }),
      pgPolicy("oj_delete", {
        for: "delete",
        to: authenticatedRole,
        using: isAdmin,
      }),
    ],
  );
  
  /* =========================================================
    3-1-2) OCR Job Pages (페이지별 OCR 결과, job_code FK)
     ========================================================= */
  export const ocrJobPages = pgTable(
    "ocr_job_pages",
    {
      id: uuid("id").defaultRandom().primaryKey(),
      job_code: text("job_code").notNull(),
      page_no: integer("page_no").notNull(),
      file_name: text("file_name"),
      text: text("text"),
      error: text("error"),
  
      created_at: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    },
    (table) => [
      uniqueIndex("ocr_job_pages_unique").on(table.job_code, table.page_no),
      index("idx_ocr_job_pages_job_code_page_no").on(table.job_code, table.page_no),
      index("idx_ocr_job_pages_created_at").on(desc(table.created_at)),
  
      pgPolicy("ojp_select", {
        for: "select",
        to: authenticatedRole,
        using: isAdmin,
      }),
      pgPolicy("ojp_insert", {
        for: "insert",
        to: authenticatedRole,
        withCheck: isAdmin,
      }),
      pgPolicy("ojp_update", {
        for: "update",
        to: authenticatedRole,
        using: isAdmin,
        withCheck: isAdmin,
      }),
      pgPolicy("ojp_delete", {
        for: "delete",
        to: authenticatedRole,
        using: isAdmin,
      }),
    ],
  );

  /* =========================================================
    3-1-3) normalized_documents — 정규화(클린업/구조화)된 최종 텍스트 저장
     ========================================================= */
export const normalizedDocuments = pgTable(
  "normalized_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    job_code: text("job_code").notNull(),
    version: integer("version").notNull().default(1),
    file_name: text("file_name"),
    page_count: integer("page_count"),
    root_block_count: integer("root_block_count"),
    item_count: integer("item_count"),
    table_count: integer("table_count"),
    md_body: text("md_body").notNull(),
    warnings: text("warnings").array().default(sql`'{}'::text[]`),
    stats: jsonb("stats").default(sql`'{}'::jsonb`),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("normalized_documents_job_code_version_unique").on(
      table.job_code,
      table.version,
    ),
    index("idx_normalized_documents_job_code").on(table.job_code),
    index("idx_normalized_documents_created_at").on(desc(table.created_at)),

    pgPolicy("nd_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("nd_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("nd_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("nd_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/* =========================================================
   3-2-1) prompt_templates (프롬프트 템플릿/버전 관리)
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

/* =========================================================
   3-2-2) item_contents (생성 결과/추출물)
   ========================================================= */
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
    is_public: boolean("is_public").notNull().default(false),
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
    lang_type: text("lang_type").notNull().default("en"),
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
   3-8) reports (레포트 저장)
   ========================================================= */
export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    md_body: text("md_body").notNull(),
    html_body: text("html_body"),
    summary: text("summary"),
    category: category("category"),
    regions: region("regions").array(),
    tags: text("tags").array(),
    metadata: jsonb("metadata"),
    is_public: boolean("is_public").notNull().default(true),
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
    id: uuid("id").defaultRandom().primaryKey(),
    report_id: uuid("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    item_id: uuid("item_id")
      .references(() => marketMemoryItems.id, { onDelete: "set null" }),
    refer_report_id: uuid("refer_report_id")
      .references(() => reports.id, { onDelete: "set null" }),
    ord: integer("ord"),
    note: text("note"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("report_items_report_id_item_id_unique").on(
      table.report_id,
      table.item_id,
    ),

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
      .references(() => reports.id, { onDelete: "cascade" }),
    content_type: contentType("content_type").notNull(),
    lang_type: text("lang_type").notNull().default("en"),
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

/* =========================================================
   3-11) vector_documents (임의 텍스트 벡터 저장)
   ========================================================= */
export const vectorDocuments = pgTable(
  "vector_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    content: text("content"),
    metadata: jsonb("metadata"),
    embedding: vector("embedding", { dimensions: 1536 }),
  },
  (table) => [
    pgPolicy("vd_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("vd_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("vd_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("vd_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/* =========================================================
   3-12) structured_metric_facts (구조화된 메트릭 팩트)
   ========================================================= */
export const structuredMetricFacts = pgTable(
  "structured_metric_facts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    source_item_id: uuid("source_item_id").references(
      () => marketMemoryItems.id,
      { onDelete: "set null" },
    ),
    date_value: date("date_value"),
    metric_key: text("metric_key"),
    metric_data: jsonb("metric_data"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_structured_metric_facts_source_item_id").on(
      table.source_item_id,
    ),
    index("idx_structured_metric_facts_date_value").on(table.date_value),
    index("idx_structured_metric_facts_metric_key").on(table.metric_key),

    pgPolicy("smf_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("smf_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("smf_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("smf_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);
