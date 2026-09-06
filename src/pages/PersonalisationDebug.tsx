import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBehaviourProfile } from "@/hooks/useBehaviourProfile";
import { useLifestyleMode } from "@/hooks/useLifestyleMode";
import { Helmet } from "react-helmet-async";

interface EventRow {
  id: string;
  recommendation_type: string;
  event_type: string;
  meal_type: string | null;
  lifestyle_mode_context: string | null;
  event_timestamp: string;
  recommendation_content: { title?: string } | null;
}

interface FeedbackRow {
  id: string;
  rating: string;
  rejection_reason: string | null;
  recommendation_type: string | null;
  created_at: string;
}

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-border bg-card p-4">
    <h2 className="font-heading font-semibold text-foreground mb-2">{title}</h2>
    {children}
  </section>
);

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-border bg-background p-3">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="font-heading text-lg font-semibold text-foreground">{value}</p>
  </div>
);

const percent = (v?: number | null) => `${Math.round(((v ?? 0) as number) * 100)}%`;

const PersonalisationDebug = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { behaviour, context, loading, analyse } = useBehaviourProfile(true);
  const { activeMode } = useLifestyleMode();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth?next=/personalisation-debug");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [e, f] = await Promise.all([
        supabase
          .from("recommendation_events")
          .select("id,recommendation_type,event_type,meal_type,lifestyle_mode_context,event_timestamp,recommendation_content")
          .eq("user_id", user.id)
          .order("event_timestamp", { ascending: false })
          .limit(40),
        supabase
          .from("recommendation_feedback")
          .select("id,rating,rejection_reason,recommendation_type,created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      setEvents((e.data ?? []) as unknown as EventRow[]);
      setFeedback((f.data ?? []) as unknown as FeedbackRow[]);
    })();
  }, [user, loading]);

  const weekly = (behaviour?.weekly_behaviour ?? {}) as Record<string, unknown>;

  return (
    <div className="min-h-screen bg-background pb-16">
      <Helmet>
        <title>Personalisation engine — Nutrio developer view</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <button onClick={() => navigate(-1)} aria-label="Go back" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="font-heading font-semibold text-foreground leading-tight">Personalisation engine</h1>
          <p className="text-xs text-muted-foreground">Developer view — adaptive, rule-based (no ML model)</p>
        </div>
        <button
          onClick={() => void analyse()}
          aria-label="Recalculate"
          className="w-9 h-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </button>
      </header>

      <main className="p-4 space-y-4">
        <Panel title="Behaviour scores">
          <div className="grid grid-cols-2 gap-2">
            <Stat label="Acceptance rate" value={percent(behaviour?.recommendation_acceptance_rate)} />
            <Stat label="Follow rate" value={percent(behaviour?.recommendation_follow_rate)} />
            <Stat label="Meal logging" value={percent(behaviour?.meal_logging_consistency)} />
            <Stat label="Routine consistency" value={percent(behaviour?.routine_consistency)} />
            <Stat label="Protein consistency" value={percent(behaviour?.protein_target_consistency)} />
            <Stat label="Calorie consistency" value={percent(behaviour?.calorie_target_consistency)} />
          </div>
        </Panel>

        <Panel title="Context inputs">
          <dl className="text-sm space-y-1 text-muted-foreground">
            <div>Targets: {context?.targets?.calories ?? "—"} kcal / {context?.targets?.protein ?? "—"}g protein</div>
            <div>Today: {String(context?.today?.calories ?? "—")} kcal, {String(context?.today?.protein ?? "—")}g protein, water {String(context?.today?.glasses ?? "—")}/8</div>
            <div>Meals today: {String(context?.today?.meals ?? "—")}</div>
            <div>7-day avg: {String(context?.week?.avgCalories ?? "—")} kcal across {String(context?.week?.daysLogged ?? "—")} days (trend {String(context?.week?.calorieTrend ?? "—")})</div>
            <div>Previous week avg: {String(context?.week?.prevAvgCalories ?? "—")} kcal</div>
            <div>Weight: {context?.weightTrend ?? "—"}</div>
            <div>Non-negotiables: {context?.nonNegotiables || "none"}</div>
            <div>Lifestyle mode: {activeMode?.mode_key ?? context?.mode ?? "none"}</div>
          </dl>
        </Panel>

        <Panel title="Ranking">
          <p className="text-sm text-foreground mb-1">Ranked up</p>
          <p className="text-sm text-muted-foreground mb-3">{context?.ranking?.boost?.join(", ") || behaviour?.preferred_food_types?.join(", ") || "nothing yet"}</p>
          <p className="text-sm text-foreground mb-1">Ranked down</p>
          <p className="text-sm text-muted-foreground">{context?.ranking?.avoid?.join(", ") || behaviour?.rejected_food_types?.join(", ") || "nothing yet"}</p>
          <p className="text-sm text-foreground mt-3 mb-1">Common rejection reasons</p>
          <p className="text-sm text-muted-foreground">{behaviour?.common_rejection_reasons?.join(", ") || "none yet"}</p>
          <p className="text-sm text-foreground mt-3 mb-1">Preferred recommendation type</p>
          <p className="text-sm text-muted-foreground">{behaviour?.preferred_recommendation_type ?? "unknown"}</p>
        </Panel>

        <Panel title="Weekly behaviour summary">
          <ul className="text-sm text-muted-foreground space-y-1">
            {Object.entries(weekly).length === 0 && <li>No data yet.</li>}
            {Object.entries(weekly).map(([k, v]) => (
              <li key={k}>
                {k.replace(/_/g, " ")}: <span className="text-foreground">{String(v ?? "—")}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground mt-3">
            Lifestyle mode usage: {Object.entries(behaviour?.lifestyle_mode_usage ?? {}).map(([k, v]) => `${k} ×${v}`).join(", ") || "none"}
          </p>
        </Panel>

        <Panel title={`Recommendation events (${events.length})`}>
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {events.length === 0 && <p className="text-sm text-muted-foreground">No events recorded yet.</p>}
            {events.map((e) => (
              <div key={e.id} className="rounded-lg border border-border bg-background px-3 py-2 text-xs">
                <span className="font-semibold text-foreground">{e.event_type}</span>{" "}
                <span className="text-muted-foreground">
                  · {e.recommendation_type}
                  {e.meal_type ? ` · ${e.meal_type}` : ""}
                  {e.lifestyle_mode_context ? ` · ${e.lifestyle_mode_context}` : ""}
                </span>
                <div className="text-muted-foreground truncate">{e.recommendation_content?.title ?? ""}</div>
                <div className="text-muted-foreground">{new Date(e.event_timestamp).toLocaleString("en-GB")}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title={`Feedback (${feedback.length})`}>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {feedback.length === 0 && <p className="text-sm text-muted-foreground">No feedback yet.</p>}
            {feedback.map((f) => (
              <div key={f.id} className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{f.rating}</span>
                {f.rejection_reason ? ` · ${f.rejection_reason}` : ""} · {f.recommendation_type ?? "—"} ·{" "}
                {new Date(f.created_at).toLocaleString("en-GB")}
              </div>
            ))}
          </div>
        </Panel>
      </main>
    </div>
  );
};

export default PersonalisationDebug;
