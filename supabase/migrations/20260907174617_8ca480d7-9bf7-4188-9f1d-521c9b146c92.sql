-- FOOD CAPTURES ---------------------------------------------------------
CREATE TABLE public.food_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_path text,
  photo_url text,
  meal_type text NOT NULL DEFAULT 'snack',
  captured_at timestamptz NOT NULL DEFAULT now(),
  capture_date date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  capture_time time NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::time,
  day_of_week smallint,
  food_name text,
  detected_foods jsonb DEFAULT '[]'::jsonb,
  confirmed_foods jsonb DEFAULT '[]'::jsonb,
  portion_size text DEFAULT 'medium',
  calories integer,
  protein numeric,
  carbs numeric,
  fat numeric,
  fibre numeric,
  location_context text,
  day_context text,
  notes text,
  ai_confidence numeric,
  user_confirmed boolean NOT NULL DEFAULT false,
  user_edited boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'camera',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.food_captures TO authenticated;
GRANT ALL ON public.food_captures TO service_role;
ALTER TABLE public.food_captures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own food captures" ON public.food_captures FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_food_captures_user_date ON public.food_captures(user_id, capture_date DESC);
CREATE TRIGGER trg_food_captures_updated BEFORE UPDATE ON public.food_captures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ITEMS INSIDE A CAPTURE -------------------------------------------------
CREATE TABLE public.food_capture_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  capture_id uuid NOT NULL REFERENCES public.food_captures(id) ON DELETE CASCADE,
  food_name text NOT NULL,
  food_category text,
  portion_size text DEFAULT 'medium',
  quantity numeric,
  unit text,
  calories integer,
  protein numeric,
  carbs numeric,
  fat numeric,
  fibre numeric,
  origin text NOT NULL DEFAULT 'ai',
  removed_by_user boolean NOT NULL DEFAULT false,
  edited_by_user boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.food_capture_items TO authenticated;
GRANT ALL ON public.food_capture_items TO service_role;
ALTER TABLE public.food_capture_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own capture items" ON public.food_capture_items FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_capture_items_capture ON public.food_capture_items(capture_id);

-- MISSING MEAL EVENTS ----------------------------------------------------
CREATE TABLE public.missed_meal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type text NOT NULL,
  event_date date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  outcome text NOT NULL,
  reason text,
  note text,
  prompted_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.missed_meal_events TO authenticated;
GRANT ALL ON public.missed_meal_events TO service_role;
ALTER TABLE public.missed_meal_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own missed meal events" ON public.missed_meal_events FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE UNIQUE INDEX idx_missed_meal_unique ON public.missed_meal_events(user_id, meal_type, event_date);

-- FOOD BEHAVIOUR PATTERNS (phase 2) --------------------------------------
CREATE TABLE public.food_behaviour_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pattern_type text NOT NULL,
  pattern_key text,
  label text NOT NULL,
  detail text,
  confidence numeric,
  payload jsonb DEFAULT '{}'::jsonb,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.food_behaviour_patterns TO authenticated;
GRANT ALL ON public.food_behaviour_patterns TO service_role;
ALTER TABLE public.food_behaviour_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own behaviour patterns" ON public.food_behaviour_patterns FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- FOOD REALITY SCORE (phase 2) -------------------------------------------
CREATE TABLE public.food_reality_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score integer NOT NULL DEFAULT 0,
  breakfast_score integer DEFAULT 0,
  lunch_score integer DEFAULT 0,
  dinner_score integer DEFAULT 0,
  snack_score integer DEFAULT 0,
  weekday_score integer DEFAULT 0,
  weekend_score integer DEFAULT 0,
  window_days integer NOT NULL DEFAULT 14,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.food_reality_scores TO authenticated;
GRANT ALL ON public.food_reality_scores TO service_role;
ALTER TABLE public.food_reality_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reality score" ON public.food_reality_scores FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE UNIQUE INDEX idx_reality_score_user ON public.food_reality_scores(user_id);
CREATE TRIGGER trg_reality_score_updated BEFORE UPDATE ON public.food_reality_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FOOD FRICTION (phase 3) ------------------------------------------------
CREATE TABLE public.food_friction (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friction_type text NOT NULL,
  level text NOT NULL DEFAULT 'low',
  score numeric NOT NULL DEFAULT 0,
  evidence jsonb DEFAULT '{}'::jsonb,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.food_friction TO authenticated;
GRANT ALL ON public.food_friction TO service_role;
ALTER TABLE public.food_friction ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own friction" ON public.food_friction FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE UNIQUE INDEX idx_friction_user_type ON public.food_friction(user_id, friction_type);
CREATE TRIGGER trg_friction_updated BEFORE UPDATE ON public.food_friction
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RECOMMENDATION OUTCOMES (phase 3) --------------------------------------
CREATE TABLE public.recommendation_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation_id text,
  recommendation_type text NOT NULL,
  recommendation_content jsonb DEFAULT '{}'::jsonb,
  context jsonb DEFAULT '{}'::jsonb,
  viewed boolean NOT NULL DEFAULT false,
  tried text,
  successful boolean,
  failure_reason text,
  user_feedback text,
  asked_at timestamptz,
  answered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.recommendation_outcomes TO authenticated;
GRANT ALL ON public.recommendation_outcomes TO service_role;
ALTER TABLE public.recommendation_outcomes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rec outcomes" ON public.recommendation_outcomes FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_rec_outcomes_updated BEFORE UPDATE ON public.recommendation_outcomes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();