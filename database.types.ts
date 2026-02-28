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
      final_reports: {
        Row: {
          category: Database["public"]["Enums"]["category"] | null
          created_at: string
          html_body: string | null
          id: string
          md_body: string
          metadata: Json | null
          region: Database["public"]["Enums"]["region"] | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["category"] | null
          created_at?: string
          html_body?: string | null
          id?: string
          md_body: string
          metadata?: Json | null
          region?: Database["public"]["Enums"]["region"] | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["category"] | null
          created_at?: string
          html_body?: string | null
          id?: string
          md_body?: string
          metadata?: Json | null
          region?: Database["public"]["Enums"]["region"] | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      item_contents: {
        Row: {
          category_reason: string | null
          confidence: number | null
          cost_usd: number | null
          created_at: string
          id: string
          input_hash: string | null
          item_id: string
          latency_ms: number | null
          md_summary: string | null
          metadata: Json | null
          model_info: Json | null
          prompt_id: string | null
          source_text: string | null
          summary: string | null
          tag_reason: Json | null
          tokens_in: number | null
          tokens_out: number | null
        }
        Insert: {
          category_reason?: string | null
          confidence?: number | null
          cost_usd?: number | null
          created_at?: string
          id?: string
          input_hash?: string | null
          item_id: string
          latency_ms?: number | null
          md_summary?: string | null
          metadata?: Json | null
          model_info?: Json | null
          prompt_id?: string | null
          source_text?: string | null
          summary?: string | null
          tag_reason?: Json | null
          tokens_in?: number | null
          tokens_out?: number | null
        }
        Update: {
          category_reason?: string | null
          confidence?: number | null
          cost_usd?: number | null
          created_at?: string
          id?: string
          input_hash?: string | null
          item_id?: string
          latency_ms?: number | null
          md_summary?: string | null
          metadata?: Json | null
          model_info?: Json | null
          prompt_id?: string | null
          source_text?: string | null
          summary?: string | null
          tag_reason?: Json | null
          tokens_in?: number | null
          tokens_out?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "item_contents_item_id_market_memory_items_id_fk"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "market_memory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_contents_prompt_id_prompt_templates_id_fk"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompt_templates"
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
          model: string | null
        }
        Insert: {
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string
          embedding: string
          id?: string
          item_id: string
          model?: string | null
        }
        Update: {
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          embedding?: string
          id?: string
          item_id?: string
          model?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "item_embeddings_item_id_market_memory_items_id_fk"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "market_memory_items"
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
            foreignKeyName: "item_tags_item_id_market_memory_items_id_fk"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "market_memory_items"
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
          category: Database["public"]["Enums"]["category"] | null
          created_at: string
          detail: string | null
          executed_date: string | null
          executed_id: string | null
          id: string
          input_date: string | null
          job_code: string | null
          notes: string | null
          ocr_job_id: string | null
          raw_log_link: string | null
          region: Database["public"]["Enums"]["region"] | null
          status: Database["public"]["Enums"]["item_status"]
          tags: string[] | null
          topic: string | null
          updated_at: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["category"] | null
          created_at?: string
          detail?: string | null
          executed_date?: string | null
          executed_id?: string | null
          id?: string
          input_date?: string | null
          job_code?: string | null
          notes?: string | null
          ocr_job_id?: string | null
          raw_log_link?: string | null
          region?: Database["public"]["Enums"]["region"] | null
          status?: Database["public"]["Enums"]["item_status"]
          tags?: string[] | null
          topic?: string | null
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["category"] | null
          created_at?: string
          detail?: string | null
          executed_date?: string | null
          executed_id?: string | null
          id?: string
          input_date?: string | null
          job_code?: string | null
          notes?: string | null
          ocr_job_id?: string | null
          raw_log_link?: string | null
          region?: Database["public"]["Enums"]["region"] | null
          status?: Database["public"]["Enums"]["item_status"]
          tags?: string[] | null
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
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
          purpose: string
          updated_at: string
        }
        Insert: {
          active_prompt_id: string
          purpose: string
          updated_at?: string
        }
        Update: {
          active_prompt_id?: string
          purpose?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompt_releases_active_prompt_id_prompt_templates_id_fk"
            columns: ["active_prompt_id"]
            isOneToOne: false
            referencedRelation: "prompt_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      prompt_templates: {
        Row: {
          created_at: string
          default_model: string | null
          default_params: Json | null
          id: string
          name: string
          output_schema: Json | null
          purpose: string
          status: Database["public"]["Enums"]["prompt_status"]
          template: string
          version: number
        }
        Insert: {
          created_at?: string
          default_model?: string | null
          default_params?: Json | null
          id?: string
          name: string
          output_schema?: Json | null
          purpose: string
          status: Database["public"]["Enums"]["prompt_status"]
          template: string
          version: number
        }
        Update: {
          created_at?: string
          default_model?: string | null
          default_params?: Json | null
          id?: string
          name?: string
          output_schema?: Json | null
          purpose?: string
          status?: Database["public"]["Enums"]["prompt_status"]
          template?: string
          version?: number
        }
        Relationships: []
      }
      report_embeddings: {
        Row: {
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          embedding: string
          id: string
          model: string | null
          report_id: string
        }
        Insert: {
          content_type: Database["public"]["Enums"]["content_type"]
          created_at?: string
          embedding: string
          id?: string
          model?: string | null
          report_id: string
        }
        Update: {
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          embedding?: string
          id?: string
          model?: string | null
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_embeddings_report_id_final_reports_id_fk"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "final_reports"
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
          report_id: string
        }
        Insert: {
          created_at?: string
          item_id: string
          note?: string | null
          ord?: number | null
          report_id: string
        }
        Update: {
          created_at?: string
          item_id?: string
          note?: string | null
          ord?: number | null
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_items_item_id_market_memory_items_id_fk"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "market_memory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_items_report_id_final_reports_id_fk"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "final_reports"
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      category:
        | "foundation"
        | "issue"
        | "research"
        | "market"
        | "trend"
        | "deep_dive"
        | "column"
        | "narrative_analysis"
        | "watchlist"
      content_type: "summary" | "md_summary" | "source_text"
      item_status: "ready" | "running" | "done" | "failed"
      ocr_job_status: "queued" | "running" | "success" | "failed" | "partial"
      prompt_status: "draft" | "active" | "deprecated"
      region: "us" | "kr" | "jp" | "eu" | "cn" | "global"
      tag_source: "ai" | "manual"
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
      category: [
        "foundation",
        "issue",
        "research",
        "market",
        "trend",
        "deep_dive",
        "column",
        "narrative_analysis",
        "watchlist",
      ],
      content_type: ["summary", "md_summary", "source_text"],
      item_status: ["ready", "running", "done", "failed"],
      ocr_job_status: ["queued", "running", "success", "failed", "partial"],
      prompt_status: ["draft", "active", "deprecated"],
      region: ["us", "kr", "jp", "eu", "cn", "global"],
      tag_source: ["ai", "manual"],
    },
  },
} as const
