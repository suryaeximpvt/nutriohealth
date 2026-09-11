import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { NutrioLogo } from "@/components/NutrioLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import authArt from "@/assets/auth-art.jpg";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const nextParam = new URLSearchParams(window.location.search).get("next");
  const nextPath = nextParam && /^\/(?!\/)/.test(nextParam) ? nextParam : "/";

  useEffect(() => {
    const goNext = () => {
      if (nextPath === "/") navigate("/");
      else window.location.href = nextPath;
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        goNext();
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        goNext();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, nextPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        toast.success("Account created! You're now logged in.");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered. Please log in instead.");
      } else if (error.message.includes("Invalid login credentials")) {
        toast.error("Invalid email or password. Please try again.");
      } else {
        toast.error(error.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <NutrioLogo className="h-20 w-auto" />
        </div>

        {/* Illustration */}
        <div className="mb-6 rounded-3xl bg-primary/5 border border-border overflow-hidden">
          <img
            src={authArt}
            alt="Healthy bowl of greens, avocado, berries, water and a dumbbell"
            width={1024}
            height={640}
            className="w-full h-40 object-contain"
          />
        </div>


        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {isLogin
              ? "Nutrio — AI Nutrition and Fitness Tracking"
              : "Join Nutrio — AI Nutrition and Fitness Tracking"}
          </h1>
          <p className="text-muted-foreground">
            {isLogin
              ? "Log in to continue your nutrition journey"
              : "Start eating better without changing your life"}
          </p>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Alex Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isLogin ? "Log in" : "Create account"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </motion.form>

        {/* Toggle */}
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Log in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;