-- Add unique constraint on water_logs for upsert to work
ALTER TABLE public.water_logs ADD CONSTRAINT water_logs_user_date_unique UNIQUE (user_id, logged_at);