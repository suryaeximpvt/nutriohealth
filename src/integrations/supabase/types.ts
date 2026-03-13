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
      charity_payments: {
        Row: {
          amount_gbp: number
          created_at: string
          failure_id: string
          id: string
          paid_at: string | null
          status: string
          stripe_payment_id: string | null
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          amount_gbp?: number
          created_at?: string
          failure_id: string
          id?: string
          paid_at?: string | null
          status?: string
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          amount_gbp?: number
          created_at?: string
          failure_id?: string
          id?: string
          paid_at?: string | null
          status?: string
          stripe_payment_id?: string | null
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "charity_payments_failure_id_fkey"
            columns: ["failure_id"]
            isOneToOne: false
            referencedRelation: "program_failures"
            referencedColumns: ["id"]
          },
        ]
      }
      cheat_meal_logs: {
        Row: {
          created_at: string
          enrollment_id: string
          id: string
          logged_at: string
          meal_type: string | null
          note: string | null
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          enrollment_id: string
          id?: string
          logged_at?: string
          meal_type?: string | null
          note?: string | null
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          enrollment_id?: string
          id?: string
          logged_at?: string
          meal_type?: string | null
          note?: string | null
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "cheat_meal_logs_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "strict_mode_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      excuse_logs: {
        Row: {
          created_at: string
          enrollment_id: string
          excuse_type: string
          id: string
          logged_at: string
          missed_meal_type: string | null
          note: string | null
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          enrollment_id: string
          excuse_type: string
          id?: string
          logged_at?: string
          missed_meal_type?: string | null
          note?: string | null
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          enrollment_id?: string
          excuse_type?: string
          id?: string
          logged_at?: string
          missed_meal_type?: string | null
          note?: string | null
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "excuse_logs_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "strict_mode_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      food_logs: {
        Row: {
          calories: number
          carbs: number | null
          created_at: string | null
          fat: number | null
          fibre: number | null
          food_name: string
          id: string
          logged_at: string
          meal_type: string
          protein: number | null
          quantity: number | null
          unit: string | null
          user_id: string
        }
        Insert: {
          calories?: number
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          fibre?: number | null
          food_name: string
          id?: string
          logged_at?: string
          meal_type: string
          protein?: number | null
          quantity?: number | null
          unit?: string | null
          user_id: string
        }
        Update: {
          calories?: number
          carbs?: number | null
          created_at?: string | null
          fat?: number | null
          fibre?: number | null
          food_name?: string
          id?: string
          logged_at?: string
          meal_type?: string
          protein?: number | null
          quantity?: number | null
          unit?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meal_photos: {
        Row: {
          ai_calories: number | null
          ai_carbs: number | null
          ai_fat: number | null
          ai_fibre: number | null
          ai_food_items: Json | null
          ai_portion_size: string | null
          ai_protein: number | null
          cooking_method: string | null
          created_at: string
          enrollment_id: string
          id: string
          is_restaurant: boolean | null
          logged_at: string
          meal_type: string
          photo_url: string
          used_oil_butter: boolean | null
          user_confirmed: boolean | null
          user_id: string
        }
        Insert: {
          ai_calories?: number | null
          ai_carbs?: number | null
          ai_fat?: number | null
          ai_fibre?: number | null
          ai_food_items?: Json | null
          ai_portion_size?: string | null
          ai_protein?: number | null
          cooking_method?: string | null
          created_at?: string
          enrollment_id: string
          id?: string
          is_restaurant?: boolean | null
          logged_at?: string
          meal_type: string
          photo_url: string
          used_oil_butter?: boolean | null
          user_confirmed?: boolean | null
          user_id: string
        }
        Update: {
          ai_calories?: number | null
          ai_carbs?: number | null
          ai_fat?: number | null
          ai_fibre?: number | null
          ai_food_items?: Json | null
          ai_portion_size?: string | null
          ai_protein?: number | null
          cooking_method?: string | null
          created_at?: string
          enrollment_id?: string
          id?: string
          is_restaurant?: boolean | null
          logged_at?: string
          meal_type?: string
          photo_url?: string
          used_oil_butter?: boolean | null
          user_confirmed?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_photos_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "strict_mode_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          allergies: string[] | null
          calorie_target: number | null
          carbs_target: number | null
          created_at: string | null
          diet_preference: string | null
          excluded_foods: string[] | null
          fat_target: number | null
          fibre_target: number | null
          full_name: string | null
          gender: string | null
          goal: string | null
          height_cm: number | null
          id: string
          protein_target: number | null
          updated_at: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          allergies?: string[] | null
          calorie_target?: number | null
          carbs_target?: number | null
          created_at?: string | null
          diet_preference?: string | null
          excluded_foods?: string[] | null
          fat_target?: number | null
          fibre_target?: number | null
          full_name?: string | null
          gender?: string | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          protein_target?: number | null
          updated_at?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          allergies?: string[] | null
          calorie_target?: number | null
          carbs_target?: number | null
          created_at?: string | null
          diet_preference?: string | null
          excluded_foods?: string[] | null
          fat_target?: number | null
          fibre_target?: number | null
          full_name?: string | null
          gender?: string | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          protein_target?: number | null
          updated_at?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      program_failures: {
        Row: {
          created_at: string
          donation_completed: boolean | null
          donation_required: boolean | null
          enrollment_id: string
          failed_at: string
          failure_details: Json | null
          failure_reason: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          donation_completed?: boolean | null
          donation_required?: boolean | null
          enrollment_id: string
          failed_at?: string
          failure_details?: Json | null
          failure_reason: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          donation_completed?: boolean | null
          donation_required?: boolean | null
          enrollment_id?: string
          failed_at?: string
          failure_details?: Json | null
          failure_reason?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_failures_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "strict_mode_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      strict_mode_enrollments: {
        Row: {
          completed_at: string | null
          created_at: string
          failed_at: string | null
          id: string
          started_at: string
          status: string
          target_date: string | null
          target_weight_kg: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          failed_at?: string | null
          id?: string
          started_at?: string
          status?: string
          target_date?: string | null
          target_weight_kg?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          failed_at?: string | null
          id?: string
          started_at?: string
          status?: string
          target_date?: string | null
          target_weight_kg?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          ai_suggestions_today: number
          created_at: string
          expires_at: string | null
          id: string
          last_suggestion_date: string | null
          plan: string
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_suggestions_today?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          last_suggestion_date?: string | null
          plan?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_suggestions_today?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          last_suggestion_date?: string | null
          plan?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      water_logs: {
        Row: {
          created_at: string | null
          glasses: number
          id: string
          logged_at: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          glasses?: number
          id?: string
          logged_at?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          glasses?: number
          id?: string
          logged_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weight_proofs: {
        Row: {
          ai_detected_weight: number | null
          created_at: string
          enrollment_id: string
          id: string
          logged_at: string
          photo_url: string
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          ai_detected_weight?: number | null
          created_at?: string
          enrollment_id: string
          id?: string
          logged_at?: string
          photo_url: string
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          ai_detected_weight?: number | null
          created_at?: string
          enrollment_id?: string
          id?: string
          logged_at?: string
          photo_url?: string
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weight_proofs_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "strict_mode_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          calories_burned: number
          created_at: string | null
          duration_minutes: number
          exercise_name: string
          exercise_type: string
          id: string
          intensity: string
          logged_at: string
          notes: string | null
          user_id: string
        }
        Insert: {
          calories_burned?: number
          created_at?: string | null
          duration_minutes?: number
          exercise_name: string
          exercise_type?: string
          id?: string
          intensity?: string
          logged_at?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          calories_burned?: number
          created_at?: string | null
          duration_minutes?: number
          exercise_name?: string
          exercise_type?: string
          id?: string
          intensity?: string
          logged_at?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workout_proofs: {
        Row: {
          calories_burned: number | null
          created_at: string
          duration_minutes: number | null
          enrollment_id: string
          id: string
          logged_at: string
          photo_url: string
          user_id: string
          verified: boolean | null
          workout_type: string | null
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string
          duration_minutes?: number | null
          enrollment_id: string
          id?: string
          logged_at?: string
          photo_url: string
          user_id: string
          verified?: boolean | null
          workout_type?: string | null
        }
        Update: {
          calories_burned?: number | null
          created_at?: string
          duration_minutes?: number | null
          enrollment_id?: string
          id?: string
          logged_at?: string
          photo_url?: string
          user_id?: string
          verified?: boolean | null
          workout_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_proofs_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "strict_mode_enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
