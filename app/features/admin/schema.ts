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
  "review",
  "watchlist",
]);

/**
 * 매크로 지역·시장 권역 (국가 코드/이름은 `countries` text[]).
 * 광역 레이블은 서로 겹칠 수 있음 (예: EMEA ⊃ EUROPE, MENA ⊃ GCC).
 */
export const region = pgEnum("region", [
  "AFRICA",
  "AMERICAS",
  "ANZ",
  "APAC",
  "ASIA",
  "BENELUX",
  "CARIBBEAN",
  "CEE",
  "CENTRAL_AMERICA",
  "CENTRAL_ASIA",
  "DACH",
  "EAST_ASIA",
  "EASTERN_EUROPE",
  "EMEA",
  "EUROPE",
  "GCC",
  "GLOBAL",
  "LATAM",
  "MENA",
  "MIDDLE_EAST",
  "NORTH_AFRICA",
  "NORTH_AMERICA",
  "NORDICS",
  "OCEANIA",
  "SEA",
  "SOUTH_ASIA",
  "SUB_SAHARAN_AFRICA",
  "UK_AND_IRELAND",
  "UNKNOWN",
  "WESTERN_EUROPE",
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
  "archived",
]);

export const pipelineStatus = pgEnum("pipeline_status", [
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

export const reportType = pgEnum("report_type", [
  "digest-report",
  "full-report",
  "analysis-report",
  "thesis-report",
  "briefing-report",
  "baseline-report",
  "review",
  "other",
]);

export const apiMode = pgEnum("api_mode", [
  "responses",
  "streaming"
]);

export const targetType = pgEnum("target_type", [
  "agent",
  "pipeline",
  "prompt_template",
]);

/* =========================================================
   RLS Helper: Admin only
   ========================================================= */
const isAdmin = sql`exists (select 1 from profiles where profile_id = auth.uid() and is_admin = true)`;

/* =========================================================
  3-1) pipelines (파이프라인 정의)
  ========================================================= */
export const pipelines = pgTable(
  "pipelines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pipeline_key: text("pipeline_key").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: pipelineStatus("status").notNull(),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("pipelines_pipeline_key_unique").on(table.pipeline_key),
    index("idx_pipelines_status").on(table.status),

    pgPolicy("pl_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("pl_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("pl_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("pl_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/* =========================================================
  3-1.1) agents (에이전트 키 마스터 — pipeline_steps / prompt_templates / prompt_releases FK)
  ========================================================= */
  export const agents = pgTable(
    "agents",
    {
      agent_key: text("agent_key").primaryKey(),
      display_name: text("display_name"),
      created_at: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    },
    (table) => [
      pgPolicy("ag_select", {
        for: "select",
        to: authenticatedRole,
        using: isAdmin,
      }),
      pgPolicy("ag_insert", {
        for: "insert",
        to: authenticatedRole,
        withCheck: isAdmin,
      }),
      pgPolicy("ag_update", {
        for: "update",
        to: authenticatedRole,
        using: isAdmin,
        withCheck: isAdmin,
      }),
      pgPolicy("ag_delete", {
        for: "delete",
        to: authenticatedRole,
        using: isAdmin,
      }),
    ],
  );

/* =========================================================
  3-2) pipeline_steps (파이프라인 실행 순서 정의)
  ========================================================= */
export const pipelineSteps = pgTable(
  "pipeline_steps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pipeline_key: text("pipeline_key")
      .notNull()
      .references(() => pipelines.pipeline_key),
    step: integer("step").notNull(),
    target_type: targetType("target_type").notNull().default("agent"),
    target_key: text("target_key")
      .notNull(),
    is_required: boolean("is_required").notNull().default(true),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("pipeline_steps_pipeline_key_step_unique").on(
      table.pipeline_key,
      table.step,
    ),
    uniqueIndex("pipeline_steps_pipeline_key_target_key_unique").on(
      table.pipeline_key,
      table.target_key,
    ),
    index("idx_pipeline_steps_pipeline_key_step").on(table.pipeline_key, table.step),
    index("idx_pipeline_steps_target_key").on(table.target_key),

    pgPolicy("ps_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("ps_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("ps_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("ps_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/* =========================================================
  3-3) prompt_templates (프롬프트 템플릿/버전 관리)
  ========================================================= */
export const promptTemplates = pgTable(
  "prompt_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    agent_key: text("agent_key")
      .notNull()
      .references(() => agents.agent_key),
    name: text("name").notNull(),
    version: integer("version").notNull(),
    status: promptStatus("status").notNull(),
    template: text("template").notNull(),
    temperature: numeric("temperature", { precision: 5, scale: 4 }),
    api_mode: apiMode("api_mode").default("responses"),
    input_schema: jsonb("input_schema"),
    output_schema: jsonb("output_schema"),
    default_provider: text("default_provider"),
    default_model: text("default_model"),
    default_params: jsonb("default_params"),
    changelog: text("changelog"),
    is_backward_compatible: boolean("is_backward_compatible")
      .notNull()
      .default(true),
    created_by: text("created_by"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("prompt_templates_agent_version_unique").on(
      table.agent_key,
      table.version,
    ),
    index("idx_prompt_templates_agent_version").on(
      table.agent_key,
      table.version,
    ),
    index("idx_prompt_templates_status").on(table.status),
    index("idx_prompt_templates_agent_key_status").on(
      table.agent_key,
      table.status,
    ),

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
  3-4) prompt_releases (목적별 active 버전 고정)
  ========================================================= */
export const promptReleases = pgTable(
  "prompt_releases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    agent_key: text("agent_key")
      .notNull()
      .references(() => agents.agent_key),
    environment: text("environment").notNull(),
    active_prompt_id: uuid("active_prompt_id")
      .notNull()
      .references(() => promptTemplates.id),
    release_note: text("release_note"),
    released_by: text("released_by"),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("prompt_releases_agent_env_unique").on(
      table.agent_key,
      table.environment,
    ),

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
  3-5) market_memory_items (원천 Item: “정체성/판단” 저장)
  ========================================================= */
export const marketMemoryItems = pgTable(
  "market_memory_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    job_code: text("job_code").notNull(),
    input_date: date("input_date"),
    source_lang: text("source_lang"),
    topic: text("topic"),
    detail: text("detail"),
    notes: text("notes"),
    status: itemStatus("status").notNull().default("ready"),
    current_content_id: uuid("current_content_id"),
    normalized_document_id: uuid("normalized_document_id").references(
      () => normalizedDocuments.id,
      { onDelete: "set null" },
    ),
    ocr_job_id: uuid("ocr_job_id").references(() => ocrJobs.id, { onDelete: "set null" }),
    raw_log_link: text("raw_log_link"),
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
    index("idx_items_input_date").on(desc(table.input_date)),
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
  3-6) item_contents (생성 결과/추출물: “설명/산출물” 저장)
  ========================================================= */
export const itemContents = pgTable(
  "item_contents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    market_memory_item_id: uuid("market_memory_item_id")
      .notNull()
      .references(() => marketMemoryItems.id, { onDelete: "set null" }),
    lang_code: text("lang_code").notNull().default("ko"),
    is_active: boolean("is_active").notNull().default(true),
    is_public: boolean("is_public").notNull().default(false),
    report_type: reportType("report_type"),
    title: text("title"),
    input_date: date("input_date"),
    summary: text("summary"),
    summary_meta: jsonb("summary_meta"),
    content: text("content"),
    content_sns: text("content_sns"),
    tags: text("tags").array(),
    metadata: jsonb("metadata"),
    category: text("category"),
    regions: region("regions").array(),
    countries: text("countries").array(),
    pipeline_info: jsonb("pipeline_info"),
    confidence: jsonb("confidence"),
    input_hash: text("input_hash"),
    tracking: jsonb("tracking"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_item_contents_item_id_created_at").on(
      table.market_memory_item_id,
      desc(table.created_at),
    ),
    index("idx_item_contents_input_date").on(desc(table.input_date)),
    index("idx_item_contents_category").on(table.category),
    index("idx_item_contents_lang_code").on(table.lang_code),
    index("idx_item_contents_regions_gin").using("gin", table.regions),
    index("idx_item_contents_countries_gin").using("gin", table.countries),
    index("idx_item_contents_tags_gin").using("gin", table.tags),
    index("idx_item_contents_metadata_gin").using("gin", table.metadata),
    index("idx_item_contents_summary_meta_gin").using("gin", table.summary_meta),
    uniqueIndex("item_contents_one_active_per_item")
      .on(table.market_memory_item_id)
      .where(sql`${table.is_active} = true`),

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
  3-7) tags (태그 사전: 정규화)
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
  3-8) item_tags (Item ↔ Tag N:M)
  ========================================================= */
export const itemTags = pgTable(
  "item_tags",
  {
    item_id: uuid("item_id")
      .notNull()
      .references(() => itemContents.id, { onDelete: "cascade" }),
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
  3-9) reports (레포트 저장)
  ========================================================= */
export const reports = pgTable(
  "reports",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    lang_code: text("lang_code").notNull().default("en"),
    md_body: text("md_body").notNull(),
    html_body: text("html_body"),
    summary: text("summary"),
    summary_meta: jsonb("summary_meta"),
    content_sns: text("content_sns"),
    category: category("category"),
    regions: region("regions").array(),
    countries: text("countries").array(),
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
    index("idx_reports_created_at").on(desc(table.created_at)),
    index("idx_reports_lang_code").on(table.lang_code),
    index("idx_reports_regions_gin").using("gin", table.regions),
    index("idx_reports_countries_gin").using("gin", table.countries),
    index("idx_reports_tags_gin").using("gin", table.tags),
    index("idx_reports_metadata_gin").using("gin", table.metadata),
    index("idx_reports_summary_meta_gin").using("gin", table.summary_meta),

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
  3-10) report_items (Report ↔ Item N:M)
  ========================================================= */
export const reportItems = pgTable(
  "report_items",
  {
    report_id: uuid("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    item_id: uuid("item_id")
      .notNull()
      .references(() => itemContents.id, { onDelete: "cascade" }),
    refer_report_id: uuid("refer_report_id").references(() => reports.id, {
      onDelete: "set null",
    }),
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
  3-11) item_embeddings (item 단위 벡터)
  ========================================================= */
export const itemEmbeddings = pgTable(
  "item_embeddings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    item_id: uuid("item_id")
      .notNull()
      .references(() => itemContents.id, { onDelete: "cascade" }),
    lang_code: text("lang_code").notNull().default("en"),
    content_type: contentType("content_type").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    model: text("model"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  () => [
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
  3-12) report_embeddings (Report 벡터)
  ========================================================= */
export const reportEmbeddings = pgTable(
  "report_embeddings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    report_id: uuid("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    lang_code: text("lang_code").notNull().default("en"),
    content_type: contentType("content_type").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    model: text("model"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  () => [
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
   3-13) structured_metric_facts (구조화된 메트릭 팩트)
   ========================================================= */
   export const structuredMetricFacts = pgTable(
    "structured_metric_facts",
    {
      id: uuid("id").defaultRandom().primaryKey(),
      source_item_id: uuid("source_item_id").references(
        () => itemContents.id,
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

/*
 * =========================================================
 * 4. File Processing
 * =========================================================
 */

/* =========================================================
   4-1) OCR Jobs (문서 1건 = 1 job, job_code PK)
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
    4-2) OCR Job Pages (페이지별 OCR 결과, job_code FK)
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
    4-3) normalized_documents — 정규화(클린업/구조화)된 최종 텍스트 저장
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

/*
 * =========================================================
 * 5. Multi-language Processing
 * =========================================================
 */

/* =========================================================
5-1) item_content_cores (EN Core 저장)
========================================================= */
export const itemContentCores = pgTable(
  "item_content_cores",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    item_content_id: uuid("item_content_id")
      .notNull()
      .references(() => itemContents.id, { onDelete: "cascade" }),
    core_lang: text("core_lang").notNull().default("en"),
    core_type: text("core_type").notNull(),
    core_data: jsonb("core_data").notNull(),
    pipeline_info: jsonb("pipeline_info"),
    input_hash: text("input_hash"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_item_content_cores_item_content_id").on(table.item_content_id),
    index("idx_item_content_cores_core_lang").on(table.core_lang),
    index("idx_item_content_cores_core_type").on(table.core_type),
    index("idx_item_content_cores_created_at").on(desc(table.created_at)),

    pgPolicy("icc_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("icc_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("icc_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("icc_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);
  
/* =========================================================
  5-2) item_content_i18n (콘텐츠 다언어 결과)
  ========================================================= */
export const itemContentI18n = pgTable(
  "item_content_i18n",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    item_content_id: uuid("item_content_id")
      .notNull()
      .references(() => itemContents.id, { onDelete: "cascade" }),
    core_id: uuid("core_id").references(() => itemContentCores.id, {
      onDelete: "set null",
    }),
    lang_code: text("lang_code").notNull(),
    title: text("title"),
    summary: text("summary"),
    content: text("content"),
    is_public: boolean("is_public").notNull().default(false),
    status: text("status"),
    pipeline_info: jsonb("pipeline_info"),
    input_hash: text("input_hash"),
    tracking: jsonb("tracking"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_item_content_i18n_item_content_id").on(table.item_content_id),
    index("idx_item_content_i18n_core_id").on(table.core_id),
    index("idx_item_content_i18n_lang_code").on(table.lang_code),
    index("idx_item_content_i18n_created_at").on(desc(table.created_at)),
    index("idx_item_content_i18n_is_public").on(table.is_public),
    index("idx_item_content_i18n_status").on(table.status),

    pgPolicy("ici_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("ici_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("ici_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("ici_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/* =========================================================
5-3) reports_i18n (리포트 다언어 결과)
========================================================= */
export const reportsI18n = pgTable(
  "reports_i18n",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    report_id: uuid("report_id")
      .notNull()
      .references(() => reports.id, { onDelete: "cascade" }),
    lang_code: text("lang_code").notNull(),
    title: text("title").notNull(),
    summary_short: text("summary_short"),
    content_md: text("content_md").notNull(),
    html_body: text("html_body"),
    is_public: boolean("is_public").notNull().default(false),
    status: text("status"),
    pipeline_info: jsonb("pipeline_info"),
    input_hash: text("input_hash"),
    tracking: jsonb("tracking"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("uq_reports_i18n_report_lang").on(table.report_id, table.lang_code),
    index("idx_reports_i18n_report_id").on(table.report_id),
    index("idx_reports_i18n_lang_code").on(table.lang_code),
    index("idx_reports_i18n_created_at").on(desc(table.created_at)),
    index("idx_reports_i18n_is_public").on(table.is_public),
    index("idx_reports_i18n_status").on(table.status),

    pgPolicy("ri18n_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("ri18n_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("ri18n_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("ri18n_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/*
 * =========================================================
 * 9. Other Tables
 * =========================================================
 */

/* =========================================================
   9-1) vector_documents (임의 텍스트 벡터 저장)
   ========================================================= */
export const vectorDocuments = pgTable(
  "vector_documents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    content: text("content"),
    metadata: jsonb("metadata"),
    embedding: vector("embedding", { dimensions: 1536 }),
  },
  () => [
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


