export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          agent_key: string
          created_at: string
          display_name: string | null
        }
        Insert: {
          agent_key: string
          created_at?: string
          display_name?: string | null
        }
        Update: {
          agent_key?: string
          created_at?: string
          display_name?: string | null
        }
        Relationships: []
      }
      item_content_cores: {
        Row: {
          core_data: Json
          core_lang: string
          core_type: string
          created_at: string
          id: string
          input_hash: string | null
          item_content_id: string
          pipeline_info: Json | null
          updated_at: string | null
        }
        Insert: {
          core_data: Json
          core_lang?: string
          core_type: string
          created_at?: string
          id?: string
          input_hash?: string | null
          item_content_id: string
          pipeline_info?: Json | null
          updated_at?: string | null
        }
        Update: {
          core_data?: Json
          core_lang?: string
          core_type?: string
          created_at?: string
          id?: string
          input_hash?: string | null
          item_content_id?: string
          pipeline_info?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_content_cores_item_content_id_item_contents_id_fk"
            columns: ["item_content_id"]
            isOneToOne: false
            referencedRelation: "item_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      item_content_i18n: {
        Row: {
          content: string | null
          core_id: string | null
          created_at: string
          id: string
          input_hash: string | null
          is_public: boolean
          item_content_id: string
          lang_code: string
          pipeline_info: Json | null
          status: string | null
          summary: string | null
          title: string | null
          tracking: Json | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          core_id?: string | null
          created_at?: string
          id?: string
          input_hash?: string | null
          is_public?: boolean
          item_content_id: string
          lang_code: string
          pipeline_info?: Json | null
          status?: string | null
          summary?: string | null
          title?: string | null
          tracking?: Json | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          core_id?: string | null
          created_at?: string
          id?: string
          input_hash?: string | null
          is_public?: boolean
          item_content_id?: string
          lang_code?: string
          pipeline_info?: Json | null
          status?: string | null
          summary?: string | null
          title?: string | null
          tracking?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_content_i18n_core_id_item_content_cores_id_fk"
            columns: ["core_id"]
            isOneToOne: false
            referencedRelation: "item_content_cores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_content_i18n_item_content_id_item_contents_id_fk"
            columns: ["item_content_id"]
            isOneToOne: false
            referencedRelation: "item_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      item_contents: {
        Row: {
          category: string | null
          confidence: Json | null
          content: string | null
          content_sns: string | null
          countries: string[] | null
          created_at: string
          id: string
          input_date: string | null
          input_hash: string | null
          is_active: boolean
          is_public: boolean
          lang_code: string
          market_memory_item_id: string
          metadata: Json | null
          pipeline_info: Json | null
          regions: Database["public"]["Enums"]["region"][] | null
          report_type: Database["public"]["Enums"]["report_type"] | null
          summary: string | null
          summary_meta: Json | null
          tags: string[] | null
          title: string | null
          tracking: Json | null
        }
        Insert: {
          category?: string | null
          confidence?: Json | null
          content?: string | null
          content_sns?: string | null
          countries?: string[] | null
          created_at?: string
          id?: string
          input_date?: string | null
          input_hash?: string | null
          is_active?: boolean
          is_public?: boolean
          lang_code?: string
          market_memory_item_id: string
          metadata?: Json | null
          pipeline_info?: Json | null
          regions?: Database["public"]["Enums"]["region"][] | null
          report_type?: Database["public"]["Enums"]["report_type"] | null
          summary?: string | null
          summary_meta?: Json | null
          tags?: string[] | null
          title?: string | null
          tracking?: Json | null
        }
        Update: {
          category?: string | null
          confidence?: Json | null
          content?: string | null
          content_sns?: string | null
          countries?: string[] | null
          created_at?: string
          id?: string
          input_date?: string | null
          input_hash?: string | null
          is_active?: boolean
          is_public?: boolean
          lang_code?: string
          market_memory_item_id?: string
          metadata?: Json | null
          pipeline_info?: Json | null
          regions?: Database["public"]["Enums"]["region"][] | null
          report_type?: Database["public"]["Enums"]["report_type"] | null
          summary?: string | null
          summary_meta?: Json | null
          tags?: string[] | null
          title?: string | null
          tracking?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "item_contents_market_memory_item_id_market_memory_items_id_fk"
            columns: ["market_memory_item_id"]
            isOneToOne: false
            referencedRelation: "market_memory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      item_embeddings: {
        Row: {
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          embedding: string
          id: string
          item_id: string
          lang_code: string
          model: string | null
        }
        Insert: {
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string
          embedding: string
          id?: string
          item_id: string
          lang_code?: string
          model?: string | null
        }
        Update: {
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          embedding?: string
          id?: string
          item_id?: string
          lang_code?: string
          model?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_embeddings_item_id_item_contents_id_fk"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "item_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      item_tags: {
        Row: {
          confidence: number | null
          created_at: string
          item_id: string
          source: Database["public"]["Enums"]["tag_source"]
          tag_id: string
          updated_at: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          item_id: string
          source: Database["public"]["Enums"]["tag_source"]
          tag_id: string
          updated_at?: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          item_id?: string
          source?: Database["public"]["Enums"]["tag_source"]
          tag_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_tags_item_id_item_contents_id_fk"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "item_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_tags_tag_id_tags_id_fk"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      market_memory_items: {
        Row: {
          created_at: string
          current_content_id: string | null
          detail: string | null
          executed_date: string | null
          executed_id: string | null
          id: string
          input_date: string | null
          job_code: string
          normalized_document_id: string | null
          notes: string | null
          ocr_job_id: string | null
          raw_log_link: string | null
          source_lang: string | null
          status: Database["public"]["Enums"]["item_status"]
          topic: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_content_id?: string | null
          detail?: string | null
          executed_date?: string | null
          executed_id?: string | null
          id?: string
          input_date?: string | null
          job_code: string
          normalized_document_id?: string | null
          notes?: string | null
          ocr_job_id?: string | null
          raw_log_link?: string | null
          source_lang?: string | null
          status?: Database["public"]["Enums"]["item_status"]
          topic?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_content_id?: string | null
          detail?: string | null
          executed_date?: string | null
          executed_id?: string | null
          id?: string
          input_date?: string | null
          job_code?: string
          normalized_document_id?: string | null
          notes?: string | null
          ocr_job_id?: string | null
          raw_log_link?: string | null
          source_lang?: string | null
          status?: Database["public"]["Enums"]["item_status"]
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "market_memory_items_normalized_document_id_normalized_documents"
            columns: ["normalized_document_id"]
            isOneToOne: false
            referencedRelation: "normalized_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "market_memory_items_ocr_job_id_ocr_jobs_id_fk"
            columns: ["ocr_job_id"]
            isOneToOne: false
            referencedRelation: "ocr_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      normalized_documents: {
        Row: {
          created_at: string
          file_name: string | null
          id: string
          item_count: number | null
          job_code: string
          md_body: string
          page_count: number | null
          root_block_count: number | null
          stats: Json | null
          table_count: number | null
          updated_at: string
          version: number
          warnings: string[] | null
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          id?: string
          item_count?: number | null
          job_code: string
          md_body: string
          page_count?: number | null
          root_block_count?: number | null
          stats?: Json | null
          table_count?: number | null
          updated_at?: string
          version?: number
          warnings?: string[] | null
        }
        Update: {
          created_at?: string
          file_name?: string | null
          id?: string
          item_count?: number | null
          job_code?: string
          md_body?: string
          page_count?: number | null
          root_block_count?: number | null
          stats?: Json | null
          table_count?: number | null
          updated_at?: string
          version?: number
          warnings?: string[] | null
        }
        Relationships: []
      }
      ocr_job_pages: {
        Row: {
          created_at: string
          error: string | null
          file_name: string | null
          id: string
          job_code: string
          page_no: number
          text: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          file_name?: string | null
          id?: string
          job_code: string
          page_no: number
          text?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          file_name?: string | null
          id?: string
          job_code?: string
          page_no?: number
          text?: string | null
        }
        Relationships: []
      }
      ocr_jobs: {
        Row: {
          created_at: string
          extraction_notes: Json | null
          id: string
          job_code: string
          last_error: string | null
          merged_text_clean: string | null
          merged_text_raw: string | null
          metadata: Json | null
          page_total: number | null
          source_name: string
          source_type: string
          source_url: string | null
          status: Database["public"]["Enums"]["ocr_job_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          extraction_notes?: Json | null
          id?: string
          job_code: string
          last_error?: string | null
          merged_text_clean?: string | null
          merged_text_raw?: string | null
          metadata?: Json | null
          page_total?: number | null
          source_name: string
          source_type?: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["ocr_job_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          extraction_notes?: Json | null
          id?: string
          job_code?: string
          last_error?: string | null
          merged_text_clean?: string | null
          merged_text_raw?: string | null
          metadata?: Json | null
          page_total?: number | null
          source_name?: string
          source_type?: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["ocr_job_status"]
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          approved_at: string
          created_at: string
          metadata: Json
          order_id: string
          order_name: string
          payment_id: number
          payment_key: string
          raw_data: Json
          receipt_url: string
          requested_at: string
          status: string
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          approved_at: string
          created_at?: string
          metadata: Json
          order_id: string
          order_name: string
          payment_id?: never
          payment_key: string
          raw_data: Json
          receipt_url: string
          requested_at: string
          status: string
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          approved_at?: string
          created_at?: string
          metadata?: Json
          order_id?: string
          order_name?: string
          payment_id?: never
          payment_key?: string
          raw_data?: Json
          receipt_url?: string
          requested_at?: string
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      pipeline_steps: {
        Row: {
          created_at: string
          id: string
          is_required: boolean
          pipeline_key: string
          step: number
          target_key: string
          target_type: Database["public"]["Enums"]["target_type"]
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean
          pipeline_key: string
          step: number
          target_key: string
          target_type?: Database["public"]["Enums"]["target_type"]
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean
          pipeline_key?: string
          step?: number
          target_key?: string
          target_type?: Database["public"]["Enums"]["target_type"]
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_steps_pipeline_key_fk"
            columns: ["pipeline_key"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["pipeline_key"]
          },
        ]
      }
      pipelines: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          pipeline_key: string
          status: Database["public"]["Enums"]["pipeline_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          pipeline_key: string
          status?: Database["public"]["Enums"]["pipeline_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          pipeline_key?: string
          status?: Database["public"]["Enums"]["pipeline_status"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          is_admin: boolean
          marketing_consent: boolean
          name: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          is_admin?: boolean
          marketing_consent?: boolean
          name: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          is_admin?: boolean
          marketing_consent?: boolean
          name?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      prompt_releases: {
        Row: {
          active_prompt_id: string
          agent_key: string
          environment: string
          id: string
          release_note: string | null
          released_by: string | null
          updated_at: string
        }
        Insert: {
          active_prompt_id: string
          agent_key: string
          environment: string
          id?: string
          release_note?: string | null
          released_by?: string | null
          updated_at?: string
        }
        Update: {
          active_prompt_id?: string
          agent_key?: string
          environment?: string
          id?: string
          release_note?: string | null
          released_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_releases_active_prompt_id_fk"
            columns: ["active_prompt_id"]
            isOneToOne: false
            referencedRelation: "prompt_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompt_releases_agent_key_agents_agent_key_fk"
            columns: ["agent_key"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["agent_key"]
          },
        ]
      }
      prompt_templates: {
        Row: {
          agent_key: string
          api_mode: Database["public"]["Enums"]["api_mode"] | null
          changelog: string | null
          created_at: string
          created_by: string | null
          default_model: string | null
          default_params: Json | null
          default_provider: string | null
          id: string
          input_schema: Json | null
          is_backward_compatible: boolean
          name: string
          output_schema: Json | null
          status: Database["public"]["Enums"]["prompt_status"]
          temperature: number | null
          template: string
          updated_at: string
          version: number
        }
        Insert: {
          agent_key: string
          api_mode?: Database["public"]["Enums"]["api_mode"] | null
          changelog?: string | null
          created_at?: string
          created_by?: string | null
          default_model?: string | null
          default_params?: Json | null
          default_provider?: string | null
          id?: string
          input_schema?: Json | null
          is_backward_compatible?: boolean
          name: string
          output_schema?: Json | null
          status?: Database["public"]["Enums"]["prompt_status"]
          temperature?: number | null
          template: string
          updated_at?: string
          version: number
        }
        Update: {
          agent_key?: string
          api_mode?: Database["public"]["Enums"]["api_mode"] | null
          changelog?: string | null
          created_at?: string
          created_by?: string | null
          default_model?: string | null
          default_params?: Json | null
          default_provider?: string | null
          id?: string
          input_schema?: Json | null
          is_backward_compatible?: boolean
          name?: string
          output_schema?: Json | null
          status?: Database["public"]["Enums"]["prompt_status"]
          temperature?: number | null
          template?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_templates_agent_key_agents_agent_key_fk"
            columns: ["agent_key"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["agent_key"]
          },
        ]
      }
      report_embeddings: {
        Row: {
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          embedding: string
          id: string
          lang_code: string
          model: string | null
          report_id: string
        }
        Insert: {
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string
          embedding: string
          id?: string
          lang_code?: string
          model?: string | null
          report_id: string
        }
        Update: {
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          embedding?: string
          id?: string
          lang_code?: string
          model?: string | null
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_embeddings_report_id_reports_id_fk"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      report_items: {
        Row: {
          created_at: string
          item_id: string
          note: string | null
          ord: number | null
          refer_report_id: string | null
          report_id: string
        }
        Insert: {
          created_at?: string
          item_id: string
          note?: string | null
          ord?: number | null
          refer_report_id?: string | null
          report_id: string
        }
        Update: {
          created_at?: string
          item_id?: string
          note?: string | null
          ord?: number | null
          refer_report_id?: string | null
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_items_item_id_item_contents_id_fk"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "item_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_items_refer_report_id_reports_id_fk"
            columns: ["refer_report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_items_report_id_reports_id_fk"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          category: Database["public"]["Enums"]["category"] | null
          content_sns: string | null
          countries: string[] | null
          created_at: string
          html_body: string | null
          id: string
          lang_code: string
          md_body: string
          metadata: Json | null
          regions: Database["public"]["Enums"]["region"][] | null
          summary: string | null
          summary_meta: Json | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["category"] | null
          content_sns?: string | null
          countries?: string[] | null
          created_at?: string
          html_body?: string | null
          id?: string
          lang_code?: string
          md_body: string
          metadata?: Json | null
          regions?: Database["public"]["Enums"]["region"][] | null
          summary?: string | null
          summary_meta?: Json | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["category"] | null
          content_sns?: string | null
          countries?: string[] | null
          created_at?: string
          html_body?: string | null
          id?: string
          lang_code?: string
          md_body?: string
          metadata?: Json | null
          regions?: Database["public"]["Enums"]["region"][] | null
          summary?: string | null
          summary_meta?: Json | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports_i18n: {
        Row: {
          content_md: string
          created_at: string
          html_body: string | null
          id: string
          input_hash: string | null
          is_public: boolean
          lang_code: string
          pipeline_info: Json | null
          report_id: string
          status: string | null
          summary_short: string | null
          title: string
          tracking: Json | null
          updated_at: string
        }
        Insert: {
          content_md: string
          created_at?: string
          html_body?: string | null
          id?: string
          input_hash?: string | null
          is_public?: boolean
          lang_code: string
          pipeline_info?: Json | null
          report_id: string
          status?: string | null
          summary_short?: string | null
          title: string
          tracking?: Json | null
          updated_at?: string
        }
        Update: {
          content_md?: string
          created_at?: string
          html_body?: string | null
          id?: string
          input_hash?: string | null
          is_public?: boolean
          lang_code?: string
          pipeline_info?: Json | null
          report_id?: string
          status?: string | null
          summary_short?: string | null
          title?: string
          tracking?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_i18n_report_id_reports_id_fk"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      structured_metric_facts: {
        Row: {
          created_at: string
          date_value: string | null
          id: string
          metric_data: Json | null
          metric_key: string | null
          source_item_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_value?: string | null
          id?: string
          metric_data?: Json | null
          metric_key?: string | null
          source_item_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_value?: string | null
          id?: string
          metric_data?: Json | null
          metric_key?: string | null
          source_item_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "structured_metric_facts_source_item_id_item_contents_id_fk"
            columns: ["source_item_id"]
            isOneToOne: false
            referencedRelation: "item_contents"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          aliases: string[] | null
          created_at: string
          display_name: string | null
          id: string
          slug: string
          type: string | null
        }
        Insert: {
          aliases?: string[] | null
          created_at?: string
          display_name?: string | null
          id?: string
          slug: string
          type?: string | null
        }
        Update: {
          aliases?: string[] | null
          created_at?: string
          display_name?: string | null
          id?: string
          slug?: string
          type?: string | null
        }
        Relationships: []
      }
      vector_documents: {
        Row: {
          content: string | null
          embedding: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          embedding?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      api_mode: "responses" | "streaming"
      category:
        | "foundation"
        | "issue"
        | "research"
        | "market"
        | "trend"
        | "deep_dive"
        | "column"
        | "narrative_analysis"
        | "review"
        | "watchlist"
      content_type: "summary" | "md_summary" | "source_text"
      item_status: "ready" | "running" | "done" | "failed"
      ocr_job_status: "queued" | "running" | "success" | "failed" | "partial"
      pipeline_status: "draft" | "active" | "deprecated"
      prompt_status: "draft" | "active" | "deprecated" | "archived"
      region:
        | "AFRICA"
        | "AMERICAS"
        | "ANZ"
        | "APAC"
        | "ASIA"
        | "BENELUX"
        | "CARIBBEAN"
        | "CEE"
        | "CENTRAL_AMERICA"
        | "CENTRAL_ASIA"
        | "DACH"
        | "EAST_ASIA"
        | "EASTERN_EUROPE"
        | "EMEA"
        | "EUROPE"
        | "GCC"
        | "GLOBAL"
        | "LATAM"
        | "MENA"
        | "MIDDLE_EAST"
        | "NORTH_AFRICA"
        | "NORTH_AMERICA"
        | "NORDICS"
        | "OCEANIA"
        | "SEA"
        | "SOUTH_ASIA"
        | "SUB_SAHARAN_AFRICA"
        | "UK_AND_IRELAND"
        | "UNKNOWN"
        | "WESTERN_EUROPE"
      report_type:
        | "digest-report"
        | "full-report"
        | "analysis-report"
        | "thesis-report"
        | "briefing-report"
        | "baseline-report"
        | "review"
        | "other"
      tag_source: "ai" | "manual"
      target_type: "agent" | "pipeline" | "prompt_template"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      api_mode: ["responses", "streaming"],
      category: [
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
      ],
      content_type: ["summary", "md_summary", "source_text"],
      item_status: ["ready", "running", "done", "failed"],
      ocr_job_status: ["queued", "running", "success", "failed", "partial"],
      pipeline_status: ["draft", "active", "deprecated"],
      prompt_status: ["draft", "active", "deprecated", "archived"],
      region: [
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
      ],
      report_type: [
        "digest-report",
        "full-report",
        "analysis-report",
        "thesis-report",
        "briefing-report",
        "baseline-report",
        "review",
        "other",
      ],
      tag_source: ["ai", "manual"],
      target_type: ["agent", "pipeline", "prompt_template"],
    },
  },
} as const
