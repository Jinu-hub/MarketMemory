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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      ocr_job_status: "queued" | "running" | "success" | "failed" | "partial"
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
      ocr_job_status: ["queued", "running", "success", "failed", "partial"],
    },
  },
} as const
