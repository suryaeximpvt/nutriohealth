
-- Storage bucket for photos (meal, workout, weight proofs)
INSERT INTO storage.buckets (id, name, public) VALUES ('strict-mode-photos', 'strict-mode-photos', false);

-- Strict Mode Enrollments
CREATE TABLE public.strict_mode_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'failed', 'completed', 'paused')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  failed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  target_weight_kg NUMERIC,
  target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Meal Photos (replaces manual food logging in strict mode)
CREATE TABLE public.meal_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.strict_mode_enrollments(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snacks')),
  photo_url TEXT NOT NULL,
  ai_food_items JSONB,
  ai_calories INTEGER,
  ai_protein NUMERIC,
  ai_carbs NUMERIC,
  ai_fat NUMERIC,
  ai_fibre NUMERIC,
  ai_portion_size TEXT,
  cooking_method TEXT,
  used_oil_butter BOOLEAN,
  is_restaurant BOOLEAN,
  user_confirmed BOOLEAN DEFAULT false,
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workout Proofs
CREATE TABLE public.workout_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.strict_mode_enrollments(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  calories_burned INTEGER,
  duration_minutes INTEGER,
  workout_type TEXT,
  verified BOOLEAN DEFAULT false,
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Weight Proofs (daily scale photo)
CREATE TABLE public.weight_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.strict_mode_enrollments(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  weight_kg NUMERIC,
  ai_detected_weight NUMERIC,
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, logged_at)
);

-- Excuse Logs (emergency/busy misses)
CREATE TABLE public.excuse_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.strict_mode_enrollments(id) ON DELETE CASCADE,
  excuse_type TEXT NOT NULL CHECK (excuse_type IN ('emergency', 'busy_work')),
  missed_meal_type TEXT,
  note TEXT,
  week_start DATE NOT NULL,
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cheat Meal Logs
CREATE TABLE public.cheat_meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.strict_mode_enrollments(id) ON DELETE CASCADE,
  meal_type TEXT,
  note TEXT,
  week_start DATE NOT NULL,
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Program Failures
CREATE TABLE public.program_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES public.strict_mode_enrollments(id) ON DELETE CASCADE,
  failure_reason TEXT NOT NULL,
  failure_details JSONB,
  failed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  donation_required BOOLEAN DEFAULT true,
  donation_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Charity Payments
CREATE TABLE public.charity_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  failure_id UUID NOT NULL REFERENCES public.program_failures(id) ON DELETE CASCADE,
  amount_gbp NUMERIC NOT NULL DEFAULT 5.00,
  stripe_payment_id TEXT,
  stripe_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS: Enable on all tables
ALTER TABLE public.strict_mode_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excuse_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cheat_meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charity_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for strict_mode_enrollments
CREATE POLICY "Users can view own enrollments" ON public.strict_mode_enrollments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own enrollments" ON public.strict_mode_enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own enrollments" ON public.strict_mode_enrollments FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for meal_photos
CREATE POLICY "Users can view own meal photos" ON public.meal_photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meal photos" ON public.meal_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own meal photos" ON public.meal_photos FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for workout_proofs
CREATE POLICY "Users can view own workout proofs" ON public.workout_proofs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout proofs" ON public.workout_proofs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for weight_proofs
CREATE POLICY "Users can view own weight proofs" ON public.weight_proofs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weight proofs" ON public.weight_proofs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for excuse_logs
CREATE POLICY "Users can view own excuse logs" ON public.excuse_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own excuse logs" ON public.excuse_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for cheat_meal_logs
CREATE POLICY "Users can view own cheat meal logs" ON public.cheat_meal_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cheat meal logs" ON public.cheat_meal_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for program_failures
CREATE POLICY "Users can view own failures" ON public.program_failures FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own failures" ON public.program_failures FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own failures" ON public.program_failures FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for charity_payments
CREATE POLICY "Users can view own payments" ON public.charity_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.charity_payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own payments" ON public.charity_payments FOR UPDATE USING (auth.uid() = user_id);

-- Storage RLS for strict-mode-photos bucket
CREATE POLICY "Users can upload own photos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'strict-mode-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own photos" ON storage.objects FOR SELECT USING (bucket_id = 'strict-mode-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Updated_at trigger for enrollments
CREATE TRIGGER update_strict_mode_enrollments_updated_at
  BEFORE UPDATE ON public.strict_mode_enrollments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
