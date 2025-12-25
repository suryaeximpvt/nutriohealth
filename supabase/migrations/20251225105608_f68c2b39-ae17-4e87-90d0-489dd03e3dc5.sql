-- Add gender and age columns to profiles for onboarding
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS age integer;