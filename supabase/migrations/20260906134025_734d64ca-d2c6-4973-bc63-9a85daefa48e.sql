-- 1. USER PERSONALISATION PROFILE
CREATE TABLE public.user_personalisation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  age_range text,
  gender text,
  country text,
  residence_country text,
  food_cultures text[] DEFAULT '{}',
  comfort_foods text[] DEFAULT '{}',
  favourite_foods text[] DEFAULT '{}',
  disliked_foods text[] DEFAULT '{}',
  avoided_foods text[] DEFAULT '{}',
  cultural_food_frequency text,
  primary_goal text,
  secondary_goal text,
  goal_importance integer DEFAULT 3,
  success_definition text[] DEFAULT '{}',
  goal_weight_kg numeric,
  workout_frequency text,
  workout_types text[] DEFAULT '{}',
  workout_time text,
  daily_steps integer,
  cooking_frequency text,
  cooking_time text,
  eating_location text,
  eating_out_frequency text,
  protein_sources text[] DEFAULT '{}',
  protein_confidence integer,
  wants_protein_help boolean DEFAULT false,
  challenges text[] DEFAULT '{}',
  off_routine_times text[] DEFAULT '{}',
  support_style text DEFAULT 'regular',
  insight_frequency text DEFAULT 'weekly',
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_personalisation TO authenticated;
GRANT ALL ON public.user_personalisation TO service_role;
ALTER TABLE public.user_personalisation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own personalisation" ON public.user_personalisation FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_user_personalisation_updated BEFORE UPDATE ON public.user_personalisation FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. ROUTINE SCHEDULE
CREATE TABLE public.routine_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  wake_time time,
  sleep_time time,
  breakfast_time time,
  lunch_time time,
  dinner_time time,
  snack_times text[] DEFAULT '{}',
  workout_time time,
  meals_eaten text[] DEFAULT '{breakfast,lunch,dinner}',
  timing_variability text DEFAULT 'sometimes',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.routine_schedule TO authenticated;
GRANT ALL ON public.routine_schedule TO service_role;
ALTER TABLE public.routine_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own routine" ON public.routine_schedule FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_routine_schedule_updated BEFORE UPDATE ON public.routine_schedule FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. LIFESTYLE MODES
CREATE TABLE public.lifestyle_modes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode_key text NOT NULL,
  answers jsonb DEFAULT '{}'::jsonb,
  starts_on date NOT NULL DEFAULT CURRENT_DATE,
  ends_on date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lifestyle_modes_user_status ON public.lifestyle_modes(user_id, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lifestyle_modes TO authenticated;
GRANT ALL ON public.lifestyle_modes TO service_role;
ALTER TABLE public.lifestyle_modes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own lifestyle modes" ON public.lifestyle_modes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_lifestyle_modes_updated BEFORE UPDATE ON public.lifestyle_modes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. NON-NEGOTIABLES
CREATE TABLE public.non_negotiables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL,
  category text DEFAULT 'food',
  frequency_type text NOT NULL DEFAULT 'weekly',
  target_count integer NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.non_negotiables TO authenticated;
GRANT ALL ON public.non_negotiables TO service_role;
ALTER TABLE public.non_negotiables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own non negotiables" ON public.non_negotiables FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_non_negotiables_updated BEFORE UPDATE ON public.non_negotiables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.non_negotiable_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  non_negotiable_id uuid NOT NULL REFERENCES public.non_negotiables(id) ON DELETE CASCADE,
  completed_on date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_nn_progress_unique ON public.non_negotiable_progress(non_negotiable_id, completed_on);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.non_negotiable_progress TO authenticated;
GRANT ALL ON public.non_negotiable_progress TO service_role;
ALTER TABLE public.non_negotiable_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own nn progress" ON public.non_negotiable_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. MEAL STATUS
CREATE TABLE public.meal_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type text NOT NULL,
  status text NOT NULL DEFAULT 'planned',
  status_date date NOT NULL DEFAULT CURRENT_DATE,
  responded_at timestamptz,
  reminder_sent_at timestamptz,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_meal_status_unique ON public.meal_status(user_id, meal_type, status_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_status TO authenticated;
GRANT ALL ON public.meal_status TO service_role;
ALTER TABLE public.meal_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own meal status" ON public.meal_status FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_meal_status_updated BEFORE UPDATE ON public.meal_status FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. WEEKLY SUMMARY
CREATE TABLE public.weekly_nutrition_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  total_calories integer DEFAULT 0,
  avg_calories integer DEFAULT 0,
  calorie_target integer DEFAULT 0,
  avg_protein numeric DEFAULT 0,
  protein_target integer DEFAULT 0,
  days_logged integer DEFAULT 0,
  meals_logged integer DEFAULT 0,
  workouts_logged integer DEFAULT 0,
  weight_change_kg numeric,
  status text DEFAULT 'green',
  insight jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_weekly_summary_unique ON public.weekly_nutrition_summary(user_id, week_start);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weekly_nutrition_summary TO authenticated;
GRANT ALL ON public.weekly_nutrition_summary TO service_role;
ALTER TABLE public.weekly_nutrition_summary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own weekly summary" ON public.weekly_nutrition_summary FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_weekly_summary_updated BEFORE UPDATE ON public.weekly_nutrition_summary FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. RECOMMENDATIONS
CREATE TABLE public.personalised_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'daily',
  title text NOT NULL,
  body text,
  payload jsonb DEFAULT '{}'::jsonb,
  valid_for date NOT NULL DEFAULT CURRENT_DATE,
  dismissed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_recs_user_date ON public.personalised_recommendations(user_id, valid_for);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.personalised_recommendations TO authenticated;
GRANT ALL ON public.personalised_recommendations TO service_role;
ALTER TABLE public.personalised_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own recommendations" ON public.personalised_recommendations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. NOTIFICATION PREFERENCES + LOGS
CREATE TABLE public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  intensity text NOT NULL DEFAULT 'regular',
  meal_reminders boolean NOT NULL DEFAULT true,
  workout_reminders boolean NOT NULL DEFAULT true,
  hydration_reminders boolean NOT NULL DEFAULT true,
  weekly_review boolean NOT NULL DEFAULT true,
  non_negotiable_reminders boolean NOT NULL DEFAULT true,
  quiet_hours_start time DEFAULT '22:00',
  quiet_hours_end time DEFAULT '07:00',
  max_per_day integer NOT NULL DEFAULT 6,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;
GRANT ALL ON public.notification_preferences TO service_role;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notification prefs" ON public.notification_preferences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_notification_prefs_updated BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  title text,
  body text,
  sent_at timestamptz NOT NULL DEFAULT now(),
  responded boolean DEFAULT false
);
CREATE INDEX idx_notification_logs_user_time ON public.notification_logs(user_id, sent_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_logs TO authenticated;
GRANT ALL ON public.notification_logs TO service_role;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notification logs" ON public.notification_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. WEIGHT HISTORY + FEEDBACK
CREATE TABLE public.weight_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg numeric NOT NULL,
  recorded_on date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_weight_history_unique ON public.weight_history(user_id, recorded_on);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.weight_history TO authenticated;
GRANT ALL ON public.weight_history TO service_role;
ALTER TABLE public.weight_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own weight history" ON public.weight_history FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context text NOT NULL,
  reference_id uuid,
  sentiment text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_feedback TO authenticated;
GRANT ALL ON public.user_feedback TO service_role;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own feedback" ON public.user_feedback FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);