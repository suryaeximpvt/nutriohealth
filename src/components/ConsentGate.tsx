import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useConsent } from "@/hooks/useConsent";
import { HEALTH_CONSENT_SUMMARY } from "@/lib/legal";
import { toast } from "sonner";

const EXEMPT_PATHS = ["/auth", "/privacy", "/terms", "/.lovable/oauth/consent"];

/**
 * One-time prompt for signed-in users who have not yet recorded consent under
 * the current document versions. Existing users are never assumed to consent.
 */
export const ConsentGate = () => {
  const { pathname } = useLocation();
  const { needsPrompt, grantHealthConsent, declineHealthConsent } = useConsent();
  const [adult, setAdult] = useState(false);
  const [terms, setTerms] = useState(false);
  const [health, setHealth] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!needsPrompt || EXEMPT_PATHS.includes(pathname)) return null;

  const submit = async (withHealth: boolean) => {
    setBusy(true);
    try {
      if (withHealth) await grantHealthConsent();
      else await declineHealthConsent();
    } catch {
      toast.error("Could not save your choice. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open>
      <DialogContent
        className="max-w-md [&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <DialogTitle>Before we continue</DialogTitle>
          <DialogDescription>
            We've updated how we ask for permission. Please confirm the following to keep using
            Vellyn.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <label className="flex gap-3 items-start">
            <Checkbox checked={adult} onCheckedChange={(v) => setAdult(v === true)} className="mt-0.5" />
            <span className="text-foreground">I confirm I am 18 or over.</span>
          </label>

          <label className="flex gap-3 items-start">
            <Checkbox checked={terms} onCheckedChange={(v) => setTerms(v === true)} className="mt-0.5" />
            <span className="text-foreground">
              I agree to the{" "}
              <Link to="/terms" className="text-primary underline">
                Terms of Use
              </Link>{" "}
              and have read the{" "}
              <Link to="/privacy" className="text-primary underline">
                Privacy Notice
              </Link>
              .
            </span>
          </label>

          <div className="rounded-xl border border-border bg-muted/40 p-3 space-y-3">
            <label className="flex gap-3 items-start">
              <Checkbox checked={health} onCheckedChange={(v) => setHealth(v === true)} className="mt-0.5" />
              <span className="text-foreground">{HEALTH_CONSENT_SUMMARY}</span>
            </label>
            <p className="text-xs text-muted-foreground">
              This is a separate, optional consent from the Terms. You can withdraw it at any time
              in Settings → Privacy &amp; Security. If you decline, you keep your account and can
              still log food, but personalised health guidance is switched off.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            className="w-full"
            disabled={!adult || !terms || !health || busy}
            onClick={() => submit(true)}
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
            Agree and continue
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            disabled={!adult || !terms || busy}
            onClick={() => submit(false)}
          >
            Continue without health personalisation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
