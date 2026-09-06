
CREATE TABLE public.recommendation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id text,
  recommendation_type text NOT NULL,
  recommendation_content jsonb,
  event_type text NOT NULL,
  event_timestamp timestamptz NOT NULL DEFAULT now(),
  meal_type text,
  goal_context text,
  lifestyle_mode_context text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.recommendation_events TO authenticated;
GRANT ALL ON public.recommendation_events TO service_role;
ALTER TABLE public.recommendation_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own recommendation events"
  ON public.recommendation_events FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_rec_events_user_time ON public.recommendation_events (user_id, event_timestamp DESC);
CREATE INDEX idx_rec_events_user_type ON public.recommendation_events (user_id, recommendation_type, event_type);

CREATE TABLE public.recommendation_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id text,
  recommendation_type text,
  recommendation_content jsonb,
  meal_type text,
  rating text NOT NULL,
  rejection_reason text,
  note text,
  lifestyle_mode_context text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.recommendation_feedback TO authenticated;
GRANT ALL ON public.recommendation_feedback TO service_role;
ALTER TABLE public.recommendation_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own recommendation feedback"
  ON public.recommendation_feedback FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_rec_feedback_user_time ON public.recommendation_feedback (user_id, created_at DESC);

CREATE TABLE public.user_behaviour_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_acceptance_rate numeric,
  recommendation_follow_rate numeric,
  meal_logging_consistency numeric,
  protein_target_consistency numeric,
  calorie_target_consistency numeric,
  routine_consistency numeric,
  preferred_recommendation_type text,
  preferred_food_types text[],
  rejected_food_types text[],
  common_rejection_reasons text[],
  lifestyle_mode_usage jsonb,
  weekly_behaviour jsonb,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_behaviour_profile TO authenticated;
GRANT ALL ON public.user_behaviour_profile TO service_role;
ALTER TABLE public.user_behaviour_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own behaviour profile"
  ON public.user_behaviour_profile FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_user_behaviour_profile_updated
  BEFORE UPDATE ON public.user_behaviour_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
