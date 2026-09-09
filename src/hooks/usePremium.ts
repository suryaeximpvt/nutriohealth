import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { getStripeEnvironment } from "@/lib/stripe";

const FREE_DAILY_AI_LIMIT = 3;

interface Subscription {
  id: string;
  plan: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  ai_suggestions_today: number;
  last_suggestion_date: string | null;
  expires_at: string | null;
  stripe_status: string | null;
  stripe_customer_id: string | null;
  trial_end: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
}

const isFuture = (value: string | null) => !!value && new Date(value) > new Date();

export const usePremium = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) console.error('Error fetching subscription:', error);

      if (data) {
        setSubscription(data as unknown as Subscription);
      } else {
        const { data: newSub, error: insertError } = await supabase
          .from('subscriptions')
          .insert({ user_id: user.id, plan: 'free', status: 'active' })
          .select()
          .single();

        if (!insertError && newSub) setSubscription(newSub as unknown as Subscription);
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`subscription-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'subscriptions', filter: `user_id=eq.${user.id}` },
        () => fetchSubscription(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchSubscription]);

  // Premium stays on for the whole paid period, including after cancelling
  // and while a failed payment is being retried.
  const stripeStatus = subscription?.stripe_status ?? null;
  const periodEnd = subscription?.current_period_end ?? subscription?.expires_at ?? null;

  const isPremium = !!subscription && (
    stripeStatus
      ? (
        (['active', 'trialing', 'past_due'].includes(stripeStatus) && (!periodEnd || isFuture(periodEnd)))
        || (stripeStatus === 'canceled' && isFuture(periodEnd))
      )
      : subscription.plan === 'premium' && subscription.status === 'active'
  );

  const isTrialing = stripeStatus === 'trialing' && isFuture(subscription?.trial_end ?? null);
  const cancelAtPeriodEnd = !!subscription?.cancel_at_period_end;
  const paymentIssue = stripeStatus === 'past_due' || stripeStatus === 'unpaid';

  const getAISuggestionsRemaining = () => {
    if (isPremium) return Infinity;
    if (!subscription) return FREE_DAILY_AI_LIMIT;

    const today = new Date().toISOString().split('T')[0];
    if (subscription.last_suggestion_date !== today) return FREE_DAILY_AI_LIMIT;

    return Math.max(0, FREE_DAILY_AI_LIMIT - subscription.ai_suggestions_today);
  };

  const canUseAI = () => isPremium || getAISuggestionsRemaining() > 0;

  const incrementAIUsage = async () => {
    if (!user || !subscription || isPremium) return;

    const today = new Date().toISOString().split('T')[0];
    const newCount = subscription.last_suggestion_date === today
      ? subscription.ai_suggestions_today + 1
      : 1;

    const { error } = await supabase
      .from('subscriptions')
      .update({ ai_suggestions_today: newCount, last_suggestion_date: today })
      .eq('user_id', user.id);

    if (!error) {
      setSubscription(prev => prev ? {
        ...prev,
        ai_suggestions_today: newCount,
        last_suggestion_date: today,
      } : null);
    }
  };

  // Opens the secure billing page where members can change their card,
  // see invoices, or cancel.
  const openBillingPortal = async (): Promise<{ error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          environment: getStripeEnvironment(),
          returnUrl: `${window.location.origin}/settings`,
        },
      });
      if (error || !data?.url) return { error: error?.message || 'Could not open billing' };
      window.open(data.url, '_blank', 'noopener');
      return {};
    } catch (e) {
      return { error: (e as Error).message };
    }
  };

  return {
    subscription,
    loading,
    isPremium,
    isTrialing,
    cancelAtPeriodEnd,
    paymentIssue,
    periodEnd,
    canUseAI,
    getAISuggestionsRemaining,
    incrementAIUsage,
    openBillingPortal,
    refetch: fetchSubscription,
  };
};
