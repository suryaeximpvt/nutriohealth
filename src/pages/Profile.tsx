import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings, ChevronRight, Target, TrendingUp, Award, User, Heart, LogOut, Crown, Sparkles } from "lucide-react";
import { BottomNav } from "@/components/BottomNav";
import { NotificationSettings } from "@/components/NotificationSettings";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";
import { usePremium } from "@/hooks/usePremium";
import { PremiumModal } from "@/components/PremiumModal";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: dataLoading } = useUserData();
  const { isPremium, getAISuggestionsRemaining } = usePremium();
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);

  const userName = profile?.full_name || "User";
  const email = user?.email || "";
  const firstLetter = userName.charAt(0).toUpperCase();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (authLoading || (user && dataLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container max-w-lg mx-auto px-4 pt-4">
        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center text-2xl font-bold text-primary-foreground">
                {firstLetter}
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-foreground">{userName}</h1>
                <p className="text-primary-foreground/70 text-sm">{email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Crown className="w-4 h-4 text-nutrio-amber" />
                  {isPremium ? (
                    <span className="text-primary-foreground text-xs font-medium bg-primary-foreground/20 px-2 py-0.5 rounded-full">
                      Premium Member
                    </span>
                  ) : (
                    <button 
                      onClick={() => setPremiumModalOpen(true)}
                      className="text-primary-foreground text-xs font-medium bg-primary-foreground/20 px-2 py-0.5 rounded-full hover:bg-primary-foreground/30 transition-colors flex items-center gap-1"
                    >
                      Free Plan
                      <Sparkles className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>

          <div className="flex justify-around text-center">
            <div>
              <p className="text-2xl font-bold text-primary-foreground">1</p>
              <p className="text-primary-foreground/70 text-xs">Days Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-foreground">0</p>
              <p className="text-primary-foreground/70 text-xs">Goals Met</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-foreground">1</p>
              <p className="text-primary-foreground/70 text-xs">Streak</p>
            </div>
          </div>
        </motion.div>

        {/* Your Plan Card */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => toast.info("Plan settings coming soon!")}
          className="w-full bg-card rounded-2xl p-4 shadow-card flex items-center gap-4 mb-6"
        >
          <div className="w-12 h-12 rounded-xl bg-nutrio-amber/10 flex items-center justify-center">
            <Target className="w-6 h-6 text-nutrio-amber" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-semibold text-foreground">Your Plan</h3>
            <p className="text-sm text-muted-foreground">
              {profile?.calorie_target || 2000} kcal/day • 10,000 steps
            </p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </motion.button>

        {/* Goals & Progress Section */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <h2 className="font-bold text-foreground mb-3">Goals & Progress</h2>
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            <button
              onClick={() => toast.info("Goals coming soon!")}
              className="w-full p-4 flex items-center gap-4 border-b border-border"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-foreground">My Goals</h3>
                <p className="text-sm text-muted-foreground">Weight, nutrition & fitness</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => toast.info("Progress charts coming soon!")}
              className="w-full p-4 flex items-center gap-4 border-b border-border"
            >
              <div className="w-10 h-10 rounded-xl bg-nutrio-blue/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-nutrio-blue" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-foreground">Progress</h3>
                <p className="text-sm text-muted-foreground">View your journey</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => toast.info("Achievements coming soon!")}
              className="w-full p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-nutrio-amber/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-nutrio-amber" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-foreground">Achievements</h3>
                <p className="text-sm text-muted-foreground">Badges earned</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </motion.section>

        {/* Subscription Section */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="font-bold text-foreground mb-3">Subscription</h2>
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            {isPremium ? (
              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-nutrio-amber/20 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-nutrio-amber" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-foreground">Premium Plan</h3>
                  <p className="text-sm text-muted-foreground">Unlimited AI suggestions</p>
                </div>
                <span className="text-xs bg-nutrio-amber/20 text-nutrio-amber px-2 py-1 rounded-full font-medium">
                  Active
                </span>
              </div>
            ) : (
              <button
                onClick={() => setPremiumModalOpen(true)}
                className="w-full p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-foreground">Upgrade to Premium</h3>
                  <p className="text-sm text-muted-foreground">
                    {getAISuggestionsRemaining()} AI suggestions left today
                  </p>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <Sparkles className="w-4 h-4" />
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
            )}
          </div>
        </motion.section>

        {/* Notification Settings */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="mb-6"
        >
          <h2 className="font-bold text-foreground mb-3">Notifications</h2>
          <NotificationSettings />
        </motion.section>
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="font-bold text-foreground mb-3">Account</h2>
          <div className="bg-card rounded-2xl shadow-card overflow-hidden">
            <button
              onClick={() => toast.info("Personal info coming soon!")}
              className="w-full p-4 flex items-center gap-4 border-b border-border"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-foreground">Personal Info</h3>
                <p className="text-sm text-muted-foreground">Name, email, birthdate</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button
              onClick={() => navigate("/onboarding")}
              className="w-full p-4 flex items-center gap-4 border-b border-border"
            >
              <div className="w-10 h-10 rounded-xl bg-nutrio-coral/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-nutrio-coral" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-foreground">Health Profile</h3>
                <p className="text-sm text-muted-foreground">Medical conditions, allergies</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button
              onClick={handleSignOut}
              className="w-full p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium text-destructive">Sign Out</h3>
              </div>
            </button>
          </div>
        </motion.section>
      </div>

      <BottomNav />

      <PremiumModal
        isOpen={premiumModalOpen}
        onClose={() => setPremiumModalOpen(false)}
      />
    </div>
  );
};

export default Profile;