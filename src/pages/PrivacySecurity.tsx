import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Shield,
  FileText,
  Loader2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Seo } from "@/components/Seo";
import { useAuth } from "@/hooks/useAuth";
import { useConsent } from "@/hooks/useConsent";
import { supabase } from "@/integrations/supabase/client";
import { PRIVACY_CONTACT_EMAIL } from "@/lib/legal";
import { toast } from "sonner";

interface DeletionRequest {
  id: string;
  status: string;
  requested_at: string;
  completed_at: string | null;
}

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : "—";

const PrivacySecurity = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { consent, loading, withdrawHealthConsent, grantHealthConsent } = useConsent();

  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<0 | 1>(0);
  const [confirmText, setConfirmText] = useState("");
  const [requests, setRequests] = useState<DeletionRequest[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("data_deletion_requests")
      .select("id, status, requested_at, completed_at")
      .eq("user_id", user.id)
      .order("requested_at", { ascending: false })
      .then(({ data }) => setRequests((data as DeletionRequest[]) ?? []));
  }, [user]);

  const handleWithdraw = async () => {
    setBusy(true);
    try {
      await withdrawHealthConsent();
      toast.success("Consent withdrawn. Personalisation using health-adjacent data has stopped.");
    } catch {
      toast.error("Could not update your consent. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleGrant = async () => {
    setBusy(true);
    try {
      await grantHealthConsent();
      toast.success("Consent recorded.");
    } catch {
      toast.error("Could not update your consent. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitDeletionRequest = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("data_deletion_requests")
        .insert({ user_id: user.id, status: "requested" })
        .select("id, status, requested_at, completed_at")
        .single();
      if (error) throw error;
      setRequests((prev) => [data as DeletionRequest, ...prev]);
      setStep(0);
      setConfirmText("");
      toast.success("Deletion request recorded. This is a request, not a completed deletion.");
    } catch {
      toast.error("Could not record your request. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return null;

  const granted = Boolean(consent?.health_consent_granted);
  const openRequest = requests.find((r) => r.status !== "completed");

  return (
    <div className="min-h-screen bg-background pb-16">
      <Seo
        title="Privacy & Security | Vellyn"
        description="Manage your consent, review your privacy settings and request deletion of your Vellyn data."
        path="/settings/privacy"
      />
      <div className="container max-w-lg mx-auto px-4 pt-4 space-y-5">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Privacy &amp; Security</h1>
        </div>

        {/* Consent status */}
        <section className="bg-card rounded-2xl p-5 shadow-card border border-border/60 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Your consent</h2>
              <p className="text-sm text-muted-foreground">
                Health-adjacent data used for nutrition personalisation
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-muted/50 p-4 space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {granted ? (
                <CheckCircle2 className="w-4 h-4 text-primary" aria-hidden />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground" aria-hidden />
              )}
              <span className="font-medium text-foreground">
                {granted ? "Consent given" : "Consent not active"}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-y-1 text-muted-foreground">
              <dt>Consent version</dt>
              <dd className="text-right text-foreground">{consent?.health_consent_version ?? "—"}</dd>
              <dt>Given on</dt>
              <dd className="text-right text-foreground">{formatDate(consent?.health_consent_granted_at)}</dd>
              <dt>Withdrawn on</dt>
              <dd className="text-right text-foreground">{formatDate(consent?.health_consent_withdrawn_at)}</dd>
              <dt>Declined on</dt>
              <dd className="text-right text-foreground">{formatDate(consent?.health_consent_declined_at)}</dd>
              <dt>18+ confirmed</dt>
              <dd className="text-right text-foreground">{formatDate(consent?.adult_confirmed_at)}</dd>
              <dt>Terms version</dt>
              <dd className="text-right text-foreground">{consent?.terms_version ?? "—"}</dd>
              <dt>Privacy Notice version</dt>
              <dd className="text-right text-foreground">{consent?.privacy_version ?? "—"}</dd>
            </dl>
          </div>

          <p className="text-sm text-muted-foreground">
            You can withdraw this consent at any time. Withdrawal does not affect processing that
            already took place. If you withdraw it, Vellyn stops using your health-adjacent data
            for personalised guidance; your account, logs and history stay available to you.
          </p>

          {granted ? (
            <Button variant="outline" className="w-full" onClick={handleWithdraw} disabled={busy}>
              {busy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Withdraw consent
            </Button>
          ) : (
            <Button className="w-full" onClick={handleGrant} disabled={busy}>
              {busy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Give consent
            </Button>
          )}
        </section>

        {/* Documents */}
        <section className="bg-card rounded-2xl shadow-card border border-border/60 overflow-hidden">
          <Link to="/privacy" className="w-full p-4 flex items-center gap-4 border-b border-border">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <Shield className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="flex-1 text-left font-medium text-foreground">Privacy Notice</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
          <Link to="/terms" className="w-full p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="flex-1 text-left font-medium text-foreground">Terms of Use</span>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
        </section>

        {/* Data retention */}
        <section className="bg-card rounded-2xl p-5 shadow-card border border-border/60 space-y-2">
          <h2 className="font-semibold text-foreground">How long we keep your data</h2>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>Your data is kept while your account is active so your history works.</li>
            <li>
              Deletion requests are actioned by our team, normally within 30 days. There is no
              automatic purge yet, so a request is logged first and completed afterwards.
            </li>
            <li>
              Encrypted backups held by our infrastructure provider may keep copies for a limited
              period (typically up to 30 days) before being overwritten.
            </li>
            <li>Payment records may be retained longer where UK tax law requires it.</li>
          </ul>
        </section>

        {/* Deletion */}
        <section className="bg-card rounded-2xl p-5 shadow-card border border-border/60 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Request account &amp; data deletion</h2>
              <p className="text-sm text-muted-foreground">Two steps, so it cannot happen by accident</p>
            </div>
          </div>

          {openRequest ? (
            <div className="rounded-xl bg-muted/50 p-4 text-sm space-y-1">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <AlertTriangle className="w-4 h-4 text-amber-500" aria-hidden />
                Deletion request recorded
              </div>
              <p className="text-muted-foreground">
                Requested {formatDate(openRequest.requested_at)}. Status: {openRequest.status}. This
                is a request, not a completed deletion — your data is still stored until the
                request has been actioned. We will confirm by email when it is done.
              </p>
            </div>
          ) : step === 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                This records a request to delete your account and associated data. Deletion is
                carried out by our team rather than instantly in the app, so your data remains
                stored until the request is actioned.
              </p>
              <Button variant="outline" className="w-full" onClick={() => setStep(1)}>
                Start deletion request
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                To confirm, type <strong className="text-foreground">DELETE</strong> below. This
                cannot be undone once actioned.
              </p>
              <div className="space-y-1">
                <Label htmlFor="confirm-delete">Confirmation</Label>
                <Input
                  id="confirm-delete"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  className="flex-1"
                  onClick={() => {
                    setStep(0);
                    setConfirmText("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={confirmText.trim().toUpperCase() !== "DELETE" || busy}
                  onClick={submitDeletionRequest}
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  Submit request
                </Button>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            You can also email{" "}
            <a className="text-primary underline" href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>
              {PRIVACY_CONTACT_EMAIL}
            </a>{" "}
            for access, correction or portability requests.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacySecurity;
