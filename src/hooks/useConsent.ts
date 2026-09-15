import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  HEALTH_CONSENT_VERSION,
  PRIVACY_VERSION,
  TERMS_VERSION,
} from "@/lib/legal";

export interface ConsentRecord {
  user_id: string;
  adult_confirmed_at: string | null;
  terms_version: string | null;
  terms_accepted_at: string | null;
  privacy_version: string | null;
  privacy_accepted_at: string | null;
  health_consent_granted: boolean;
  health_consent_version: string | null;
  health_consent_granted_at: string | null;
  health_consent_withdrawn_at: string | null;
  health_consent_declined_at: string | null;
}

const logEvent = async (userId: string, action: string, version: string) => {
  await supabase.from("consent_events").insert({
    user_id: userId,
    consent_type: "health_personalisation",
    action,
    version,
  });
};

/**
 * Records the acceptance captured at sign-up (or at the one-time gate).
 * Never called for a user who has not actively ticked the boxes.
 */
export const recordInitialConsent = async (
  userId: string,
  healthConsent: boolean,
) => {
  const now = new Date().toISOString();
  const { error } = await supabase.from("user_consents").upsert(
    {
      user_id: userId,
      adult_confirmed_at: now,
      terms_version: TERMS_VERSION,
      terms_accepted_at: now,
      privacy_version: PRIVACY_VERSION,
      privacy_accepted_at: now,
      health_consent_granted: healthConsent,
      health_consent_version: HEALTH_CONSENT_VERSION,
      health_consent_granted_at: healthConsent ? now : null,
      health_consent_declined_at: healthConsent ? null : now,
      health_consent_withdrawn_at: null,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
  await logEvent(userId, healthConsent ? "granted" : "declined", HEALTH_CONSENT_VERSION);
};

export const useConsent = () => {
  const { user, loading: authLoading } = useAuth();
  const [consent, setConsent] = useState<ConsentRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setConsent(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("user_consents")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    setConsent((data as ConsentRecord) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    load();
  }, [authLoading, load]);

  const grantHealthConsent = useCallback(async () => {
    if (!user) return;
    await recordInitialConsent(user.id, true);
    await load();
  }, [user, load]);

  const declineHealthConsent = useCallback(async () => {
    if (!user) return;
    await recordInitialConsent(user.id, false);
    await load();
  }, [user, load]);

  const withdrawHealthConsent = useCallback(async () => {
    if (!user) return;
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("user_consents")
      .update({
        health_consent_granted: false,
        health_consent_withdrawn_at: now,
      })
      .eq("user_id", user.id);
    if (error) throw error;
    await logEvent(user.id, "withdrawn", consent?.health_consent_version ?? HEALTH_CONSENT_VERSION);
    await load();
  }, [user, consent, load]);

  // A prompt is needed when there is no record at all, or when the version the
  // user agreed to is older than the current one. Existing users are never
  // assumed to have consented.
  const needsPrompt = Boolean(
    user &&
      !loading &&
      (!consent ||
        !consent.adult_confirmed_at ||
        consent.terms_version !== TERMS_VERSION ||
        consent.privacy_version !== PRIVACY_VERSION ||
        (consent.health_consent_version !== HEALTH_CONSENT_VERSION &&
          !consent.health_consent_declined_at &&
          !consent.health_consent_withdrawn_at)),
  );

  return {
    consent,
    loading: loading || authLoading,
    needsPrompt,
    healthConsentGranted: Boolean(consent?.health_consent_granted),
    grantHealthConsent,
    declineHealthConsent,
    withdrawHealthConsent,
    reload: load,
  };
};

export const useHealthConsent = () => {
  const { healthConsentGranted, loading } = useConsent();
  return { healthConsentGranted, loading };
};
