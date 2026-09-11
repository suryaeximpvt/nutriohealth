ALTER TABLE public.food_captures ADD COLUMN IF NOT EXISTS capture_method text NOT NULL DEFAULT 'photo';
ALTER TABLE public.food_captures ADD COLUMN IF NOT EXISTS estimated boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.capture_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_type text NOT NULL,
  meal_type text,
  prompt_date date NOT NULL DEFAULT CURRENT_DATE,
  offered_methods text[] NOT NULL DEFAULT '{}',
  response text,
  method_used text,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.capture_prompts TO authenticated;
GRANT ALL ON public.capture_prompts TO service_role;
ALTER TABLE public.capture_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own capture prompts" ON public.capture_prompts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_capture_prompts_updated BEFORE UPDATE ON public.capture_prompts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.ask_nutrio_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question text NOT NULL,
  location_context text,
  intent text,
  context_snapshot jsonb,
  response text,
  helpful boolean,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ask_nutrio_interactions TO authenticated;
GRANT ALL ON public.ask_nutrio_interactions TO service_role;
ALTER TABLE public.ask_nutrio_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ask nutrio interactions" ON public.ask_nutrio_interactions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.capture_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method text NOT NULL,
  offered_count integer NOT NULL DEFAULT 0,
  used_count integer NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, method)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.capture_preferences TO authenticated;
GRANT ALL ON public.capture_preferences TO service_role;
ALTER TABLE public.capture_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own capture preferences" ON public.capture_preferences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_capture_preferences_updated BEFORE UPDATE ON public.capture_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();