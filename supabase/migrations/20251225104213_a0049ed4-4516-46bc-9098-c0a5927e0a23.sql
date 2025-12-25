-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  calorie_target INTEGER DEFAULT 2000,
  protein_target INTEGER DEFAULT 120,
  carbs_target INTEGER DEFAULT 250,
  fat_target INTEGER DEFAULT 65,
  fibre_target INTEGER DEFAULT 30,
  activity_level TEXT DEFAULT 'moderate',
  diet_preference TEXT DEFAULT 'none',
  allergies TEXT[],
  excluded_foods TEXT[],
  weight_kg NUMERIC(5,2),
  height_cm INTEGER,
  goal TEXT DEFAULT 'maintain',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create food_logs table for logging meals
CREATE TABLE public.food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snacks', 'dinner')),
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein NUMERIC(6,2) DEFAULT 0,
  carbs NUMERIC(6,2) DEFAULT 0,
  fat NUMERIC(6,2) DEFAULT 0,
  fibre NUMERIC(6,2) DEFAULT 0,
  quantity NUMERIC(6,2) DEFAULT 1,
  unit TEXT DEFAULT 'serving',
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create water_logs table
CREATE TABLE public.water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  glasses INTEGER NOT NULL DEFAULT 1,
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- RLS policies for food_logs
CREATE POLICY "Users can view own food logs"
ON public.food_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food logs"
ON public.food_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food logs"
ON public.food_logs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food logs"
ON public.food_logs FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for water_logs
CREATE POLICY "Users can view own water logs"
ON public.water_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water logs"
ON public.water_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own water logs"
ON public.water_logs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own water logs"
ON public.water_logs FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();