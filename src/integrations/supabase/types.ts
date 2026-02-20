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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      profile: {
        Row: {
          id: string
          email: string
          firstname: string
          lastname: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          firstname: string
          lastname: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          firstname?: string
          lastname?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          additional_notes: string | null
          age: number
          airport_transportation: string
          allergies_detail: string | null
          checked_in: boolean
          checked_in_at: string | null
          checked_in_by: string | null
          country_of_residence: string
          country_other: string | null
          created_at: string
          dietary_restrictions: string[] | null
          discord_joined: boolean
          email: string
          first_name: string
          id: string
          last_name: string
          level_of_study: string
          mlh_code_of_conduct: boolean
          mlh_event_logistics: boolean
          mlh_marketing: boolean
          other_accommodations: string | null
          parental_consent: boolean | null
          phone_number: string
          resume_url: string | null
          school: string
          school_other: string | null
          tshirt_size: string
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          age: number
          airport_transportation: string
          allergies_detail?: string | null
          checked_in?: boolean
          checked_in_at?: string | null
          checked_in_by?: string | null
          country_of_residence: string
          country_other?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          discord_joined?: boolean
          email: string
          first_name: string
          id?: string
          last_name: string
          level_of_study: string
          mlh_code_of_conduct?: boolean
          mlh_event_logistics?: boolean
          mlh_marketing?: boolean
          other_accommodations?: string | null
          parental_consent?: boolean | null
          phone_number: string
          resume_url?: string | null
          school: string
          school_other?: string | null
          tshirt_size: string
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          age?: number
          airport_transportation?: string
          allergies_detail?: string | null
          checked_in?: boolean
          checked_in_at?: string | null
          checked_in_by?: string | null
          country_of_residence?: string
          country_other?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          discord_joined?: boolean
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          level_of_study?: string
          mlh_code_of_conduct?: boolean
          mlh_event_logistics?: boolean
          mlh_marketing?: boolean
          other_accommodations?: string | null
          parental_consent?: boolean | null
          phone_number?: string
          resume_url?: string | null
          school?: string
          school_other?: string | null
          tshirt_size?: string
          updated_at?: string
        }
        Relationships: []
      }
      blogs: {
        Row: {
          id: string
          title: string
          cover_url: string | null
          content: string
          created_by: string
          archived: boolean
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          cover_url?: string | null
          content: string
          created_by: string
          archived?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          cover_url?: string | null
          content?: string
          created_by?: string
          archived?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      forms: {
        Row: {
          id: string
          title: string
          description: string
          cover_url: string | null
          status: "DRAFT" | "PUBLISHED" | "OVERDUE" | "ARCHIVED"
          deadline: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          cover_url?: string | null
          status?: "DRAFT" | "PUBLISHED" | "OVERDUE" | "ARCHIVED"
          deadline?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          cover_url?: string | null
          status?: "DRAFT" | "PUBLISHED" | "OVERDUE" | "ARCHIVED"
          deadline?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      form_fields: {
        Row: {
          id: string
          form_id: string
          position: number
          label: string
          field_type: "text" | "number" | "email" | "long_text"
          placeholder: string | null
          required: boolean
        }
        Insert: {
          id?: string
          form_id: string
          position?: number
          label: string
          field_type: "text" | "number" | "email" | "long_text"
          placeholder?: string | null
          required?: boolean
        }
        Update: {
          id?: string
          form_id?: string
          position?: number
          label?: string
          field_type?: "text" | "number" | "email" | "long_text"
          placeholder?: string | null
          required?: boolean
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          id: string
          form_id: string
          data: Json
          created_at: string
        }
        Insert: {
          id?: string
          form_id: string
          data?: Json
          created_at?: string
        }
        Update: {
          id?: string
          form_id?: string
          data?: Json
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_blog_view_count: {
        Args: { blog_id: string }
        Returns: undefined
      }
    }
    Enums: {
      form_status: "DRAFT" | "PUBLISHED" | "OVERDUE" | "ARCHIVED"
      form_field_type: "text" | "number" | "email" | "long_text"
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
      form_status: ["DRAFT", "PUBLISHED", "OVERDUE", "ARCHIVED"],
      form_field_type: ["text", "number", "email", "long_text"],
    },
  },
} as const
