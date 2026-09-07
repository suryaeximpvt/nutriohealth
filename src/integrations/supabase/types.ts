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
    PostgrestVersion: "14.5"
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
      food_behaviour_patterns: {
        Row: {
          computed_at: string
          confidence: number | null
          created_at: string
          detail: string | null
          id: string
          label: string
          pattern_key: string | null
          pattern_type: string
          payload: Json | null
          user_id: string
        }
        Insert: {
          computed_at?: string
          confidence?: number | null
          created_at?: string
          detail?: string | null
          id?: string
          label: string
          pattern_key?: string | null
          pattern_type: string
          payload?: Json | null
          user_id: string
        }
        Update: {
          computed_at?: string
          confidence?: number | null
          created_at?: string
          detail?: string | null
          id?: string
          label?: string
          pattern_key?: string | null
          pattern_type?: string
          payload?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      food_capture_items: {
        Row: {
          calories: number | null
          capture_id: string
          carbs: number | null
          created_at: string
          edited_by_user: boolean
          fat: number | null
          fibre: number | null
          food_category: string | null
          food_name: string
          id: string
          origin: string
          portion_size: string | null
          protein: number | null
          quantity: number | null
          removed_by_user: boolean
          unit: string | null
          user_id: string
        }
        Insert: {
          calories?: number | null
          capture_id: string
          carbs?: number | null
          created_at?: string
          edited_by_user?: boolean
          fat?: number | null
          fibre?: number | null
          food_category?: string | null
          food_name: string
          id?: string
          origin?: string
          portion_size?: string | null
          protein?: number | null
          quantity?: number | null
          removed_by_user?: boolean
          unit?: string | null
          user_id: string
        }
        Update: {
          calories?: number | null
          capture_id?: string
          carbs?: number | null
          created_at?: string
          edited_by_user?: boolean
          fat?: number | null
          fibre?: number | null
          food_category?: string | null
          food_name?: string
          id?: string
          origin?: string
          portion_size?: string | null
          protein?: number | null
          quantity?: number | null
          removed_by_user?: boolean
          unit?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "food_capture_items_capture_id_fkey"
            columns: ["capture_id"]
            isOneToOne: false
            referencedRelation: "food_captures"
            referencedColumns: ["id"]
          },
        ]
      }
      food_captures: {
        Row: {
          ai_confidence: number | null
          calories: number | null
          capture_date: string
          capture_time: string
          captured_at: string
          carbs: number | null
          confirmed_foods: Json | null
          created_at: string
          day_context: string | null
          day_of_week: number | null
          detected_foods: Json | null
          fat: number | null
          fibre: number | null
          food_name: string | null
          id: string
          location_context: string | null
          meal_type: string
          notes: string | null
          photo_path: string | null
          photo_url: string | null
          portion_size: string | null
          protein: number | null
          source: string
          updated_at: string
          user_confirmed: boolean
          user_edited: boolean
          user_id: string
        }
        Insert: {
          ai_confidence?: number | null
          calories?: number | null
          capture_date?: string
          capture_time?: string
          captured_at?: string
          carbs?: number | null
          confirmed_foods?: Json | null
          created_at?: string
          day_context?: string | null
          day_of_week?: number | null
          detected_foods?: Json | null
          fat?: number | null
          fibre?: number | null
          food_name?: string | null
          id?: string
          location_context?: string | null
          meal_type?: string
          notes?: string | null
          photo_path?: string | null
          photo_url?: string | null
          portion_size?: string | null
          protein?: number | null
          source?: string
          updated_at?: string
          user_confirmed?: boolean
          user_edited?: boolean
          user_id: string
        }
        Update: {
          ai_confidence?: number | null
          calories?: number | null
          capture_date?: string
          capture_time?: string
          captured_at?: string
          carbs?: number | null
          confirmed_foods?: Json | null
          created_at?: string
          day_context?: string | null
          day_of_week?: number | null
          detected_foods?: Json | null
          fat?: number | null
          fibre?: number | null
          food_name?: string | null
          id?: string
          location_context?: string | null
          meal_type?: string
          notes?: string | null
          photo_path?: string | null
          photo_url?: string | null
          portion_size?: string | null
          protein?: number | null
          source?: string
          updated_at?: string
          user_confirmed?: boolean
          user_edited?: boolean
          user_id?: string
        }
        Relationships: []
      }
      food_friction: {
        Row: {
          computed_at: string
          created_at: string
          evidence: Json | null
          friction_type: string
          id: string
          level: string
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          computed_at?: string
          created_at?: string
          evidence?: Json | null
          friction_type: string
          id?: string
          level?: string
          score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          computed_at?: string
          created_at?: string
          evidence?: Json | null
          friction_type?: string
          id?: string
          level?: string
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      food_reality_scores: {
        Row: {
          breakfast_score: number | null
          computed_at: string
          created_at: string
          dinner_score: number | null
          id: string
          lunch_score: number | null
          overall_score: number
          snack_score: number | null
          updated_at: string
          user_id: string
          weekday_score: number | null
          weekend_score: number | null
          window_days: number
        }
        Insert: {
          breakfast_score?: number | null
          computed_at?: string
          created_at?: string
          dinner_score?: number | null
          id?: string
          lunch_score?: number | null
          overall_score?: number
          snack_score?: number | null
          updated_at?: string
          user_id: string
          weekday_score?: number | null
          weekend_score?: number | null
          window_days?: number
        }
        Update: {
          breakfast_score?: number | null
          computed_at?: string
          created_at?: string
          dinner_score?: number | null
          id?: string
          lunch_score?: number | null
          overall_score?: number
          snack_score?: number | null
          updated_at?: string
          user_id?: string
          weekday_score?: number | null
          weekend_score?: number | null
          window_days?: number
        }
        Relationships: []
      }
      health_connections: {
        Row: {
          access_token: string | null
          connected: boolean
          created_at: string
          id: string
          last_synced_at: string | null
          provider: string
          provider_user_id: string | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          connected?: boolean
          created_at?: string
          id?: string
          last_synced_at?: string | null
          provider: string
          provider_user_id?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          connected?: boolean
          created_at?: string
          id?: string
          last_synced_at?: string | null
          provider?: string
          provider_user_id?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      health_metrics: {
        Row: {
          active_calories: number | null
          created_at: string
          hrv_ms: number | null
          id: string
          metric_date: string
          recovery_score: number | null
          resting_heart_rate: number | null
          sleep_hours: number | null
          source: string
          steps: number | null
          strain: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_calories?: number | null
          created_at?: string
          hrv_ms?: number | null
          id?: string
          metric_date: string
          recovery_score?: number | null
          resting_heart_rate?: number | null
          sleep_hours?: number | null
          source: string
          steps?: number | null
          strain?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_calories?: number | null
          created_at?: string
          hrv_ms?: number | null
          id?: string
          metric_date?: string
          recovery_score?: number | null
          resting_heart_rate?: number | null
          sleep_hours?: number | null
          source?: string
          steps?: number | null
          strain?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lifestyle_modes: {
        Row: {
          answers: Json | null
          created_at: string
          ends_on: string
          id: string
          mode_key: string
          starts_on: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json | null
          created_at?: string
          ends_on?: string
          id?: string
          mode_key: string
          starts_on?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json | null
          created_at?: string
          ends_on?: string
          id?: string
          mode_key?: string
          starts_on?: string
          status?: string
          updated_at?: string
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
      meal_status: {
        Row: {
          created_at: string
          id: string
          meal_type: string
          note: string | null
          reminder_sent_at: string | null
          responded_at: string | null
          status: string
          status_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          meal_type: string
          note?: string | null
          reminder_sent_at?: string | null
          responded_at?: string | null
          status?: string
          status_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          meal_type?: string
          note?: string | null
          reminder_sent_at?: string | null
          responded_at?: string | null
          status?: string
          status_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      missed_meal_events: {
        Row: {
          created_at: string
          event_date: string
          id: string
          meal_type: string
          note: string | null
          outcome: string
          prompted_at: string
          reason: string | null
          responded_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_date?: string
          id?: string
          meal_type: string
          note?: string | null
          outcome: string
          prompted_at?: string
          reason?: string | null
          responded_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_date?: string
          id?: string
          meal_type?: string
          note?: string | null
          outcome?: string
          prompted_at?: string
          reason?: string | null
          responded_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      non_negotiable_progress: {
        Row: {
          completed_on: string
          created_at: string
          id: string
          non_negotiable_id: string
          user_id: string
        }
        Insert: {
          completed_on?: string
          created_at?: string
          id?: string
          non_negotiable_id: string
          user_id: string
        }
        Update: {
          completed_on?: string
          created_at?: string
          id?: string
          non_negotiable_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "non_negotiable_progress_non_negotiable_id_fkey"
            columns: ["non_negotiable_id"]
            isOneToOne: false
            referencedRelation: "non_negotiables"
            referencedColumns: ["id"]
          },
        ]
      }
      non_negotiables: {
        Row: {
          active: boolean
          category: string | null
          created_at: string
          frequency_type: string
          id: string
          label: string
          target_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          created_at?: string
          frequency_type?: string
          id?: string
          label: string
          target_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          category?: string | null
          created_at?: string
          frequency_type?: string
          id?: string
          label?: string
          target_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          body: string | null
          category: string
          id: string
          priority: string
          responded: boolean | null
          sent_at: string
          title: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          category: string
          id?: string
          priority?: string
          responded?: boolean | null
          sent_at?: string
          title?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          category?: string
          id?: string
          priority?: string
          responded?: boolean | null
          sent_at?: string
          title?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          enabled: boolean
          hydration_reminders: boolean
          id: string
          intensity: string
          max_per_day: number
          meal_reminders: boolean
          non_negotiable_reminders: boolean
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          updated_at: string
          user_id: string
          weekly_review: boolean
          workout_reminders: boolean
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          hydration_reminders?: boolean
          id?: string
          intensity?: string
          max_per_day?: number
          meal_reminders?: boolean
          non_negotiable_reminders?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id: string
          weekly_review?: boolean
          workout_reminders?: boolean
        }
        Update: {
          created_at?: string
          enabled?: boolean
          hydration_reminders?: boolean
          id?: string
          intensity?: string
          max_per_day?: number
          meal_reminders?: boolean
          non_negotiable_reminders?: boolean
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          updated_at?: string
          user_id?: string
          weekly_review?: boolean
          workout_reminders?: boolean
        }
        Relationships: []
      }
      personalised_recommendations: {
        Row: {
          body: string | null
          created_at: string
          dismissed: boolean | null
          id: string
          kind: string
          payload: Json | null
          title: string
          user_id: string
          valid_for: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          dismissed?: boolean | null
          id?: string
          kind?: string
          payload?: Json | null
          title: string
          user_id: string
          valid_for?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          dismissed?: boolean | null
          id?: string
          kind?: string
          payload?: Json | null
          title?: string
          user_id?: string
          valid_for?: string
        }
        Relationships: []
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
      recommendation_events: {
        Row: {
          created_at: string
          event_timestamp: string
          event_type: string
          goal_context: string | null
          id: string
          lifestyle_mode_context: string | null
          meal_type: string | null
          recommendation_content: Json | null
          recommendation_id: string | null
          recommendation_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_timestamp?: string
          event_type: string
          goal_context?: string | null
          id?: string
          lifestyle_mode_context?: string | null
          meal_type?: string | null
          recommendation_content?: Json | null
          recommendation_id?: string | null
          recommendation_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_timestamp?: string
          event_type?: string
          goal_context?: string | null
          id?: string
          lifestyle_mode_context?: string | null
          meal_type?: string | null
          recommendation_content?: Json | null
          recommendation_id?: string | null
          recommendation_type?: string
          user_id?: string
        }
        Relationships: []
      }
      recommendation_feedback: {
        Row: {
          created_at: string
          id: string
          lifestyle_mode_context: string | null
          meal_type: string | null
          note: string | null
          rating: string
          recommendation_content: Json | null
          recommendation_id: string | null
          recommendation_type: string | null
          rejection_reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lifestyle_mode_context?: string | null
          meal_type?: string | null
          note?: string | null
          rating: string
          recommendation_content?: Json | null
          recommendation_id?: string | null
          recommendation_type?: string | null
          rejection_reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lifestyle_mode_context?: string | null
          meal_type?: string | null
          note?: string | null
          rating?: string
          recommendation_content?: Json | null
          recommendation_id?: string | null
          recommendation_type?: string | null
          rejection_reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      recommendation_outcomes: {
        Row: {
          answered_at: string | null
          asked_at: string | null
          context: Json | null
          created_at: string
          failure_reason: string | null
          id: string
          recommendation_content: Json | null
          recommendation_id: string | null
          recommendation_type: string
          successful: boolean | null
          tried: string | null
          updated_at: string
          user_feedback: string | null
          user_id: string
          viewed: boolean
        }
        Insert: {
          answered_at?: string | null
          asked_at?: string | null
          context?: Json | null
          created_at?: string
          failure_reason?: string | null
          id?: string
          recommendation_content?: Json | null
          recommendation_id?: string | null
          recommendation_type: string
          successful?: boolean | null
          tried?: string | null
          updated_at?: string
          user_feedback?: string | null
          user_id: string
          viewed?: boolean
        }
        Update: {
          answered_at?: string | null
          asked_at?: string | null
          context?: Json | null
          created_at?: string
          failure_reason?: string | null
          id?: string
          recommendation_content?: Json | null
          recommendation_id?: string | null
          recommendation_type?: string
          successful?: boolean | null
          tried?: string | null
          updated_at?: string
          user_feedback?: string | null
          user_id?: string
          viewed?: boolean
        }
        Relationships: []
      }
      routine_schedule: {
        Row: {
          breakfast_time: string | null
          created_at: string
          dinner_time: string | null
          id: string
          lunch_time: string | null
          meals_eaten: string[] | null
          sleep_time: string | null
          snack_times: string[] | null
          timing_variability: string | null
          updated_at: string
          user_id: string
          wake_time: string | null
          workout_time: string | null
        }
        Insert: {
          breakfast_time?: string | null
          created_at?: string
          dinner_time?: string | null
          id?: string
          lunch_time?: string | null
          meals_eaten?: string[] | null
          sleep_time?: string | null
          snack_times?: string[] | null
          timing_variability?: string | null
          updated_at?: string
          user_id: string
          wake_time?: string | null
          workout_time?: string | null
        }
        Update: {
          breakfast_time?: string | null
          created_at?: string
          dinner_time?: string | null
          id?: string
          lunch_time?: string | null
          meals_eaten?: string[] | null
          sleep_time?: string | null
          snack_times?: string[] | null
          timing_variability?: string | null
          updated_at?: string
          user_id?: string
          wake_time?: string | null
          workout_time?: string | null
        }
        Relationships: []
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
      user_behaviour_profile: {
        Row: {
          calorie_target_consistency: number | null
          common_rejection_reasons: string[] | null
          computed_at: string
          created_at: string
          id: string
          lifestyle_mode_usage: Json | null
          meal_logging_consistency: number | null
          preferred_food_types: string[] | null
          preferred_recommendation_type: string | null
          protein_target_consistency: number | null
          recommendation_acceptance_rate: number | null
          recommendation_follow_rate: number | null
          rejected_food_types: string[] | null
          routine_consistency: number | null
          updated_at: string
          user_id: string
          weekly_behaviour: Json | null
        }
        Insert: {
          calorie_target_consistency?: number | null
          common_rejection_reasons?: string[] | null
          computed_at?: string
          created_at?: string
          id?: string
          lifestyle_mode_usage?: Json | null
          meal_logging_consistency?: number | null
          preferred_food_types?: string[] | null
          preferred_recommendation_type?: string | null
          protein_target_consistency?: number | null
          recommendation_acceptance_rate?: number | null
          recommendation_follow_rate?: number | null
          rejected_food_types?: string[] | null
          routine_consistency?: number | null
          updated_at?: string
          user_id: string
          weekly_behaviour?: Json | null
        }
        Update: {
          calorie_target_consistency?: number | null
          common_rejection_reasons?: string[] | null
          computed_at?: string
          created_at?: string
          id?: string
          lifestyle_mode_usage?: Json | null
          meal_logging_consistency?: number | null
          preferred_food_types?: string[] | null
          preferred_recommendation_type?: string | null
          protein_target_consistency?: number | null
          recommendation_acceptance_rate?: number | null
          recommendation_follow_rate?: number | null
          rejected_food_types?: string[] | null
          routine_consistency?: number | null
          updated_at?: string
          user_id?: string
          weekly_behaviour?: Json | null
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          context: string
          created_at: string
          id: string
          message: string | null
          reference_id: string | null
          sentiment: string | null
          user_id: string
        }
        Insert: {
          context: string
          created_at?: string
          id?: string
          message?: string | null
          reference_id?: string | null
          sentiment?: string | null
          user_id: string
        }
        Update: {
          context?: string
          created_at?: string
          id?: string
          message?: string | null
          reference_id?: string | null
          sentiment?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_personalisation: {
        Row: {
          age_range: string | null
          avoided_foods: string[] | null
          challenges: string[] | null
          comfort_foods: string[] | null
          cooking_frequency: string | null
          cooking_time: string | null
          country: string | null
          created_at: string
          cultural_food_frequency: string | null
          daily_steps: number | null
          disliked_foods: string[] | null
          display_name: string | null
          eating_location: string | null
          eating_out_frequency: string | null
          favourite_foods: string[] | null
          food_cultures: string[] | null
          gender: string | null
          goal_importance: number | null
          goal_weight_kg: number | null
          id: string
          insight_frequency: string | null
          off_routine_times: string[] | null
          onboarding_completed: boolean | null
          primary_goal: string | null
          protein_confidence: number | null
          protein_sources: string[] | null
          residence_country: string | null
          secondary_goal: string | null
          success_definition: string[] | null
          support_style: string | null
          updated_at: string
          user_id: string
          wants_protein_help: boolean | null
          workout_frequency: string | null
          workout_time: string | null
          workout_types: string[] | null
        }
        Insert: {
          age_range?: string | null
          avoided_foods?: string[] | null
          challenges?: string[] | null
          comfort_foods?: string[] | null
          cooking_frequency?: string | null
          cooking_time?: string | null
          country?: string | null
          created_at?: string
          cultural_food_frequency?: string | null
          daily_steps?: number | null
          disliked_foods?: string[] | null
          display_name?: string | null
          eating_location?: string | null
          eating_out_frequency?: string | null
          favourite_foods?: string[] | null
          food_cultures?: string[] | null
          gender?: string | null
          goal_importance?: number | null
          goal_weight_kg?: number | null
          id?: string
          insight_frequency?: string | null
          off_routine_times?: string[] | null
          onboarding_completed?: boolean | null
          primary_goal?: string | null
          protein_confidence?: number | null
          protein_sources?: string[] | null
          residence_country?: string | null
          secondary_goal?: string | null
          success_definition?: string[] | null
          support_style?: string | null
          updated_at?: string
          user_id: string
          wants_protein_help?: boolean | null
          workout_frequency?: string | null
          workout_time?: string | null
          workout_types?: string[] | null
        }
        Update: {
          age_range?: string | null
          avoided_foods?: string[] | null
          challenges?: string[] | null
          comfort_foods?: string[] | null
          cooking_frequency?: string | null
          cooking_time?: string | null
          country?: string | null
          created_at?: string
          cultural_food_frequency?: string | null
          daily_steps?: number | null
          disliked_foods?: string[] | null
          display_name?: string | null
          eating_location?: string | null
          eating_out_frequency?: string | null
          favourite_foods?: string[] | null
          food_cultures?: string[] | null
          gender?: string | null
          goal_importance?: number | null
          goal_weight_kg?: number | null
          id?: string
          insight_frequency?: string | null
          off_routine_times?: string[] | null
          onboarding_completed?: boolean | null
          primary_goal?: string | null
          protein_confidence?: number | null
          protein_sources?: string[] | null
          residence_country?: string | null
          secondary_goal?: string | null
          success_definition?: string[] | null
          support_style?: string | null
          updated_at?: string
          user_id?: string
          wants_protein_help?: boolean | null
          workout_frequency?: string | null
          workout_time?: string | null
          workout_types?: string[] | null
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
      weekly_nutrition_summary: {
        Row: {
          avg_calories: number | null
          avg_protein: number | null
          calorie_target: number | null
          created_at: string
          days_logged: number | null
          id: string
          insight: Json | null
          meals_logged: number | null
          protein_target: number | null
          status: string | null
          total_calories: number | null
          updated_at: string
          user_id: string
          week_start: string
          weight_change_kg: number | null
          workouts_logged: number | null
        }
        Insert: {
          avg_calories?: number | null
          avg_protein?: number | null
          calorie_target?: number | null
          created_at?: string
          days_logged?: number | null
          id?: string
          insight?: Json | null
          meals_logged?: number | null
          protein_target?: number | null
          status?: string | null
          total_calories?: number | null
          updated_at?: string
          user_id: string
          week_start: string
          weight_change_kg?: number | null
          workouts_logged?: number | null
        }
        Update: {
          avg_calories?: number | null
          avg_protein?: number | null
          calorie_target?: number | null
          created_at?: string
          days_logged?: number | null
          id?: string
          insight?: Json | null
          meals_logged?: number | null
          protein_target?: number | null
          status?: string | null
          total_calories?: number | null
          updated_at?: string
          user_id?: string
          week_start?: string
          weight_change_kg?: number | null
          workouts_logged?: number | null
        }
        Relationships: []
      }
      weight_history: {
        Row: {
          created_at: string
          id: string
          recorded_on: string
          user_id: string
          weight_kg: number
        }
        Insert: {
          created_at?: string
          id?: string
          recorded_on?: string
          user_id: string
          weight_kg: number
        }
        Update: {
          created_at?: string
          id?: string
          recorded_on?: string
          user_id?: string
          weight_kg?: number
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
