// schema.ts — Agent / Pipeline / Prompt 관리
// Drizzle ORM for PostgreSQL + pgPolicy (Supabase-compatible)
// RLS: Admin 전용 (profiles.is_admin = true) — admin/schema.ts 와 동일

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
   Database Enums
   ========================================================= */
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
  3-0) services (서비스 키 마스터 — 'shared' = 여러 서비스 공용)
  ========================================================= */
export const services = pgTable(
  "services",
  {
    service_key: text("service_key").primaryKey(),
    display_name: text("display_name"),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    pgPolicy("sv_select", {
      for: "select",
      to: authenticatedRole,
      using: isAdmin,
    }),
    pgPolicy("sv_insert", {
      for: "insert",
      to: authenticatedRole,
      withCheck: isAdmin,
    }),
    pgPolicy("sv_update", {
      for: "update",
      to: authenticatedRole,
      using: isAdmin,
      withCheck: isAdmin,
    }),
    pgPolicy("sv_delete", {
      for: "delete",
      to: authenticatedRole,
      using: isAdmin,
    }),
  ],
);

/* =========================================================
  3-1) pipelines (파이프라인 정의)
  ========================================================= */
export const pipelines = pgTable(
  "pipelines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pipeline_key: text("pipeline_key").notNull(),
    owner_service: text("owner_service")
      .notNull()
      .default("market_memory")
      .references(() => services.service_key),
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
    owner_service: text("owner_service")
      .notNull()
      .default("market_memory")
      .references(() => services.service_key),
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
  3-4) prompt_releases (서비스·환경별 active 버전 고정)
  ========================================================= */
export const promptReleases = pgTable(
  "prompt_releases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    agent_key: text("agent_key")
      .notNull()
      .references(() => agents.agent_key),
    service_key: text("service_key")
      .notNull()
      .default("market_memory")
      .references(() => services.service_key),
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
    uniqueIndex("prompt_releases_agent_service_env_unique").on(
      table.agent_key,
      table.service_key,
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
