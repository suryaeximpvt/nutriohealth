CREATE TABLE public.user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  adult_confirmed_at timestamptz,
  terms_version text,
  terms_accepted_at timestamptz,
  privacy_version text,
  privacy_accepted_at timestamptz,
  health_consent_granted boolean NOT NULL DEFAULT false,
  health_consent_version text,
  health_consent_granted_at timestamptz,
  health_consent_withdrawn_at timestamptz,
  health_consent_declined_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.user_consents TO authenticated;
GRANT ALL ON public.user_consents TO service_role;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own consent" ON public.user_consents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own consent" ON public.user_consents FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own consent" ON public.user_consents FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_user_consents_updated BEFORE UPDATE ON public.user_consents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.consent_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type text NOT NULL,
  action text NOT NULL,
  version text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.consent_events TO authenticated;
GRANT ALL ON public.consent_events TO service_role;
ALTER TABLE public.consent_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own consent events" ON public.consent_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own consent events" ON public.consent_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_consent_events_user ON public.consent_events(user_id, occurred_at DESC);

CREATE TABLE public.data_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'requested',
  reason text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.data_deletion_requests TO authenticated;
GRANT ALL ON public.data_deletion_requests TO service_role;
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own deletion requests" ON public.data_deletion_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own deletion requests" ON public.data_deletion_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_deletion_requests_user ON public.data_deletion_requests(user_id, requested_at DESC);