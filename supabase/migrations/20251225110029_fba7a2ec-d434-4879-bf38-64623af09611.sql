-- Create workout_logs table for exercise tracking
CREATE TABLE public.workout_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  calories_burned INTEGER NOT NULL DEFAULT 0,
  exercise_type TEXT NOT NULL DEFAULT 'cardio',
  intensity TEXT NOT NULL DEFAULT 'moderate',
  notes TEXT,
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own workout logs" 
ON public.workout_logs FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workout logs" 
ON public.workout_logs FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout logs" 
ON public.workout_logs FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workout logs" 
ON public.workout_logs FOR DELETE 
USING (auth.uid() = user_id);