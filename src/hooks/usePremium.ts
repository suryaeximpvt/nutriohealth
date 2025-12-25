import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

const FREE_DAILY_AI_LIMIT = 3;

interface Subscription {
  id: string;
  plan: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  ai_suggestions_today: number;
  last_suggestion_date: string | null;
  expires_at: string | null;
}

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

      if (error) {
        console.error('Error fetching subscription:', error);
        // Create subscription if doesn't exist
        if (error.code === 'PGRST116' || !data) {
          const { data: newSub, error: insertError } = await supabase
            .from('subscriptions')
            .insert({ user_id: user.id, plan: 'free', status: 'active' })
            .select()
            .single();

          if (!insertError && newSub) {
            setSubscription(newSub as Subscription);
          }
        }
      } else if (data) {
        setSubscription(data as Subscription);
      } else {
        // No subscription found, create one
        const { data: newSub, error: insertError } = await supabase
          .from('subscriptions')
          .insert({ user_id: user.id, plan: 'free', status: 'active' })
          .select()
          .single();

        if (!insertError && newSub) {
          setSubscription(newSub as Subscription);
        }
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

  const isPremium = subscription?.plan === 'premium' && subscription?.status === 'active';

  const getAISuggestionsRemaining = () => {
    if (isPremium) return Infinity;
    if (!subscription) return FREE_DAILY_AI_LIMIT;

    const today = new Date().toISOString().split('T')[0];
    const lastDate = subscription.last_suggestion_date;

    // Reset count if it's a new day
    if (lastDate !== today) {
      return FREE_DAILY_AI_LIMIT;
    }

    return Math.max(0, FREE_DAILY_AI_LIMIT - subscription.ai_suggestions_today);
  };

  const canUseAI = () => {
    if (isPremium) return true;
    return getAISuggestionsRemaining() > 0;
  };

  const incrementAIUsage = async () => {
    if (!user || !subscription || isPremium) return;

    const today = new Date().toISOString().split('T')[0];
    const lastDate = subscription.last_suggestion_date;

    let newCount = 1;
    if (lastDate === today) {
      newCount = subscription.ai_suggestions_today + 1;
    }

    const { error } = await supabase
      .from('subscriptions')
      .update({
        ai_suggestions_today: newCount,
        last_suggestion_date: today,
      })
      .eq('user_id', user.id);

    if (!error) {
      setSubscription(prev => prev ? {
        ...prev,
        ai_suggestions_today: newCount,
        last_suggestion_date: today,
      } : null);
    }
  };

  const upgradeToPremium = async () => {
    if (!user) return { error: 'Not authenticated' };

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    const { error } = await supabase
      .from('subscriptions')
      .update({
        plan: 'premium',
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq('user_id', user.id);

    if (!error) {
      setSubscription(prev => prev ? {
        ...prev,
        plan: 'premium',
        status: 'active',
      } : null);
    }

    return { error };
  };

  return {
    subscription,
    loading,
    isPremium,
    canUseAI,
    getAISuggestionsRemaining,
    incrementAIUsage,
    upgradeToPremium,
    refetch: fetchSubscription,
  };
};
