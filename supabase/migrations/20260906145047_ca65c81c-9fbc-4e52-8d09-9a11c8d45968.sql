CREATE TABLE public.health_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL,
  connected boolean NOT NULL DEFAULT false,
  last_synced_at timestamptz,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  provider_user_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_connections TO authenticated;
GRANT ALL ON public.health_connections TO service_role;
ALTER TABLE public.health_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own health connections"
ON public.health_connections FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL,
  metric_date date NOT NULL,
  steps integer,
  active_calories integer,
  resting_heart_rate integer,
  hrv_ms numeric,
  sleep_hours numeric,
  recovery_score integer,
  strain numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, source, metric_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_metrics TO authenticated;
GRANT ALL ON public.health_metrics TO service_role;
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own health metrics"
ON public.health_metrics FOR ALL TO authenticated
USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_health_connections_updated_at
BEFORE UPDATE ON public.health_connections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_metrics_updated_at
BEFORE UPDATE ON public.health_metrics
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();