import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Loader2, ArrowRight } from "lucide-react";
import { VellynLogo } from "@/components/VellynLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // The recovery link signs the user in with a short-lived session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Both passwords must match.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated. You're signed in.");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Could not update your password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center justify-center mb-6">
          <VellynLogo className="h-16 w-auto" />
        </div>

        <div className="text-center mb-7">
          <h1 className="text-3xl font-bold text-foreground mb-2">Choose a new password</h1>
          <p className="text-muted-foreground">
            {ready
              ? "Enter a new password for your account."
              : "Open this page from the link in your reset email to continue."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl bg-card p-5 shadow-soft border border-border/60"
        >
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 rounded-xl bg-background"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="pl-10 h-12 rounded-xl bg-background"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl shadow-card"
            size="lg"
            disabled={loading || !ready}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Update password
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => navigate("/auth")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to log in
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
