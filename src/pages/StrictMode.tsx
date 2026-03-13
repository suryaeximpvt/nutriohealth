import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useStrictMode, ComplianceStatus, MealAnalysis } from "@/hooks/useStrictMode";
import { useUserData } from "@/hooks/useUserData";
import { Camera, Dumbbell, Scale, Utensils, AlertTriangle, CheckCircle2, XCircle, Clock, Trophy, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import AppHeader from "@/components/AppHeader";

const StrictMode = () => {
  const { user } = useAuth();
  const { profile } = useUserData();
  const { toast } = useToast();
  const {
    status,
    loading,
    analyzing,
    fetchStatus,
    enroll,
    logExcuse,
    logCheatMeal,
    triggerFailure,
    analyzeMealPhoto,
    uploadWorkoutProof,
    uploadWeightProof,
  } = useStrictMode();

  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [showMealUpload, setShowMealUpload] = useState(false);
  const [showWorkoutUpload, setShowWorkoutUpload] = useState(false);
  const [showWeightUpload, setShowWeightUpload] = useState(false);
  const [showMissedMealDialog, setShowMissedMealDialog] = useState(false);
  const [showFailureScreen, setShowFailureScreen] = useState(false);
  const [showAnalysisResult, setShowAnalysisResult] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MealAnalysis | null>(null);

  // Form states
  const [targetWeight, setTargetWeight] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("breakfast");
  const [caloriesBurned, setCaloriesBurned] = useState("");
  const [workoutDuration, setWorkoutDuration] = useState("");
  const [workoutType, setWorkoutType] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [excuseNote, setExcuseNote] = useState("");

  // Cooking context
  const [cookingMethod, setCookingMethod] = useState("");
  const [usedOilButter, setUsedOilButter] = useState<boolean | undefined>();
  const [isRestaurant, setIsRestaurant] = useState<boolean | undefined>();

  useEffect(() => {
    if (user) fetchStatus();
  }, [user, fetchStatus]);

  useEffect(() => {
    if (status?.enrollment?.status === "failed") {
      setShowFailureScreen(true);
    }
  }, [status]);

  const handleEnroll = async () => {
    try {
      await enroll(
        targetWeight ? parseFloat(targetWeight) : undefined,
        targetDate || undefined
      );
      setShowEnrollDialog(false);
      toast({ title: "Strict Mode Activated! 💪", description: "Your accountability journey starts now." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleMealUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !status?.enrollment) return;

    try {
      const analysis = await analyzeMealPhoto(file, selectedMealType, status.enrollment.id, {
        cooking_method: cookingMethod || undefined,
        used_oil_butter: usedOilButter,
        is_restaurant: isRestaurant,
      });
      setAnalysisResult(analysis);
      setShowMealUpload(false);
      setShowAnalysisResult(true);
      toast({ title: "Meal Analyzed! 📸", description: `${analysis.total_calories} calories detected` });
    } catch (err: any) {
      toast({ title: "Analysis Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleWorkoutUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadWorkoutProof(
        file,
        caloriesBurned ? parseInt(caloriesBurned) : undefined,
        workoutDuration ? parseInt(workoutDuration) : undefined,
        workoutType || undefined
      );
      setShowWorkoutUpload(false);
      toast({ title: "Workout Logged! 🏋️", description: "Great discipline!" });
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleWeightUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadWeightProof(file, weightKg ? parseFloat(weightKg) : undefined);
      setShowWeightUpload(false);
      toast({ title: "Weight Recorded! ⚖️" });
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleExcuse = async (type: "emergency" | "busy_work") => {
    try {
      const result = await logExcuse(type, selectedMealType, excuseNote);
      setShowMissedMealDialog(false);
      if (result.failed) {
        setShowFailureScreen(true);
      } else {
        toast({
          title: "Excuse Logged",
          description: `${result.remaining} emergency excuses remaining this week`,
        });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleCheatMeal = async () => {
    try {
      const result = await logCheatMeal(selectedMealType, excuseNote);
      setShowMissedMealDialog(false);
      if (result.failed) {
        setShowFailureScreen(true);
      } else {
        toast({ title: "Cheat Meal Logged", description: "No more cheat meals this week!" });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // Not enrolled view
  if (!loading && (!status || !status.enrolled)) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <AppHeader />
        <div className="p-4 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 pt-8">
            <div className="w-20 h-20 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <Trophy className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Strict Weight Loss Mode</h1>
            <p className="text-muted-foreground max-w-sm mx-auto">
              The most disciplined weight loss system. Daily photo evidence required for meals, workouts, and weigh-ins.
              No excuses.
            </p>
          </motion.div>

          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>📸 Photo-only meal logging — no manual entries</p>
              <p>🏋️ Daily workout proof required</p>
              <p>⚖️ Daily scale photo required</p>
              <p>🚨 Max 4 emergency excuses per week</p>
              <p>🍕 Max 1 cheat meal per week</p>
              <p>❌ Break the rules → program fails</p>
              <p>💷 £5 charity donation required to restart</p>
            </CardContent>
          </Card>

          <Button onClick={() => setShowEnrollDialog(true)} className="w-full" size="lg" variant="destructive">
            Start Strict Mode
          </Button>
        </div>

        {/* Enroll Dialog */}
        <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start Strict Weight Loss Program</DialogTitle>
              <DialogDescription>Set your goals. This cannot be undone without a £5 donation.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Target Weight (kg)</Label>
                <Input type="number" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} placeholder="e.g., 75" />
              </div>
              <div>
                <Label>Target Date</Label>
                <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEnrollDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleEnroll}>I Accept the Challenge</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <BottomNav />
      </div>
    );
  }

  // Failure screen
  if (showFailureScreen) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-6 max-w-sm">
          <div className="w-24 h-24 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
            <XCircle className="w-12 h-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-destructive">Program Failed</h1>
          <p className="text-muted-foreground">
            You have failed to complete the strict weight loss program.
          </p>
          <Card className="text-left">
            <CardContent className="pt-4 text-sm text-muted-foreground">
              To restart, you must donate £5 to a food charity. This keeps you accountable and helps others.
            </CardContent>
          </Card>
          <Button variant="destructive" size="lg" className="w-full">
            Donate £5 to Restart
          </Button>
          <Button variant="ghost" onClick={() => { setShowFailureScreen(false); window.location.href = "/"; }}>
            Return to Normal Mode
          </Button>
        </motion.div>
      </div>
    );
  }

  // Main dashboard
  const todayMeals = status?.today?.mealsLogged || [];
  const allMealTypes = ["breakfast", "lunch", "dinner", "snacks"];
  const missingMeals = allMealTypes.filter((m) => !todayMeals.includes(m));
  const todayCalories = status?.today?.mealPhotos?.reduce((sum: number, p: any) => sum + (p.ai_calories || 0), 0) || 0;
  const calorieTarget = profile?.calorie_target || 2000;

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />
      <div className="p-4 space-y-4">
        {/* Status Banner */}
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-xs">STRICT MODE</Badge>
              <span className="text-xs text-muted-foreground">Active</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Day {Math.ceil((Date.now() - new Date(status?.enrollment?.started_at).getTime()) / 86400000)}
            </div>
          </CardContent>
        </Card>

        {/* Calorie Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Today's Calories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayCalories} <span className="text-lg text-muted-foreground">/ {calorieTarget}</span></div>
            <Progress value={Math.min((todayCalories / calorieTarget) * 100, 100)} className="mt-2" />
          </CardContent>
        </Card>

        {/* Daily Checklist */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Daily Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Meals */}
            {allMealTypes.map((meal) => {
              const logged = todayMeals.includes(meal);
              return (
                <div key={meal} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {logged ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                    <span className="capitalize text-sm">{meal}</span>
                  </div>
                  {!logged && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedMealType(meal); setShowMealUpload(true); }}>
                        <Camera className="w-3 h-3 mr-1" /> Log
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setSelectedMealType(meal); setShowMissedMealDialog(true); }}>
                        Missed
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Workout */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center gap-2">
                {status?.today?.workoutCompleted ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                <span className="text-sm">Workout Proof</span>
              </div>
              {!status?.today?.workoutCompleted && (
                <Button size="sm" variant="outline" onClick={() => setShowWorkoutUpload(true)}>
                  <Dumbbell className="w-3 h-3 mr-1" /> Upload
                </Button>
              )}
            </div>

            {/* Weight */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {status?.today?.weightLogged ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-muted-foreground" />}
                <span className="text-sm">Weight Photo</span>
              </div>
              {!status?.today?.weightLogged && (
                <Button size="sm" variant="outline" onClick={() => setShowWeightUpload(true)}>
                  <Scale className="w-3 h-3 mr-1" /> Upload
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Limits */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weekly Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Emergency Excuses</span>
              <Badge variant={status?.week?.excusesRemaining === 0 ? "destructive" : "secondary"}>
                {status?.week?.excusesUsed || 0} / 4 used
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Cheat Meals</span>
              <Badge variant={status?.week?.cheatMealsRemaining === 0 ? "destructive" : "secondary"}>
                {status?.week?.cheatMealsUsed || 0} / 1 used
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Today's Meal Photos */}
        {status?.today?.mealPhotos && status.today.mealPhotos.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Today's Meals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {status.today.mealPhotos.map((photo: any) => (
                <div key={photo.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium capitalize">{photo.meal_type}</p>
                    <p className="text-xs text-muted-foreground">{photo.ai_calories} cal</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    P:{photo.ai_protein}g C:{photo.ai_carbs}g F:{photo.ai_fat}g
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Meal Upload Dialog */}
      <Dialog open={showMealUpload} onOpenChange={setShowMealUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">Log {selectedMealType}</DialogTitle>
            <DialogDescription>Take a photo of your meal. AI will analyze it.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Cooking Method</Label>
              <Select value={cookingMethod} onValueChange={setCookingMethod}>
                <SelectTrigger><SelectValue placeholder="How was it cooked?" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="grilled">Grilled</SelectItem>
                  <SelectItem value="boiled">Boiled</SelectItem>
                  <SelectItem value="fried">Fried</SelectItem>
                  <SelectItem value="baked">Baked</SelectItem>
                  <SelectItem value="steamed">Steamed</SelectItem>
                  <SelectItem value="raw">Raw</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-4">
              <Button
                size="sm"
                variant={usedOilButter === true ? "default" : "outline"}
                onClick={() => setUsedOilButter(true)}
              >
                Oil/Butter Used
              </Button>
              <Button
                size="sm"
                variant={usedOilButter === false ? "default" : "outline"}
                onClick={() => setUsedOilButter(false)}
              >
                No Oil/Butter
              </Button>
            </div>
            <div className="flex gap-4">
              <Button
                size="sm"
                variant={isRestaurant === true ? "default" : "outline"}
                onClick={() => setIsRestaurant(true)}
              >
                Restaurant
              </Button>
              <Button
                size="sm"
                variant={isRestaurant === false ? "default" : "outline"}
                onClick={() => setIsRestaurant(false)}
              >
                Homemade
              </Button>
            </div>
            <div>
              <Label>Meal Photo</Label>
              <Input type="file" accept="image/*" capture="environment" onChange={handleMealUpload} disabled={analyzing} />
              {analyzing && <p className="text-xs text-muted-foreground mt-1">Analyzing meal...</p>}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Workout Upload Dialog */}
      <Dialog open={showWorkoutUpload} onOpenChange={setShowWorkoutUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Workout Proof</DialogTitle>
            <DialogDescription>Photo of your gym session, treadmill, or fitness tracker.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Workout Type</Label>
              <Input value={workoutType} onChange={(e) => setWorkoutType(e.target.value)} placeholder="e.g., Running, Weights" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Calories Burned</Label>
                <Input type="number" value={caloriesBurned} onChange={(e) => setCaloriesBurned(e.target.value)} />
              </div>
              <div>
                <Label>Duration (min)</Label>
                <Input type="number" value={workoutDuration} onChange={(e) => setWorkoutDuration(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Photo Proof</Label>
              <Input type="file" accept="image/*" capture="environment" onChange={handleWorkoutUpload} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Weight Upload Dialog */}
      <Dialog open={showWeightUpload} onOpenChange={setShowWeightUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Weight Photo</DialogTitle>
            <DialogDescription>Take a photo of your scale showing today's weight.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Weight (kg)</Label>
              <Input type="number" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} placeholder="e.g., 82.5" />
            </div>
            <div>
              <Label>Scale Photo</Label>
              <Input type="file" accept="image/*" capture="environment" onChange={handleWeightUpload} />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Missed Meal Dialog */}
      <Dialog open={showMissedMealDialog} onOpenChange={setShowMissedMealDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Missed {selectedMealType}</DialogTitle>
            <DialogDescription>You must choose one of these options.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Optional note..."
              value={excuseNote}
              onChange={(e) => setExcuseNote(e.target.value)}
            />
            <Button
              className="w-full"
              variant="outline"
              onClick={() => handleExcuse("emergency")}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Emergency / Busy Work ({status?.week?.excusesRemaining || 0} left)
            </Button>
            <Button
              className="w-full"
              variant="destructive"
              onClick={handleCheatMeal}
            >
              <Utensils className="w-4 h-4 mr-2" />
              Cheat Meal ({status?.week?.cheatMealsRemaining || 0} left)
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Analysis Result Dialog */}
      <Dialog open={showAnalysisResult} onOpenChange={setShowAnalysisResult}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Meal Analysis</DialogTitle>
          </DialogHeader>
          {analysisResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="pt-3 text-center">
                    <p className="text-2xl font-bold">{analysisResult.total_calories}</p>
                    <p className="text-xs text-muted-foreground">Calories</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-3 text-center">
                    <p className="text-sm font-medium">{analysisResult.confidence}</p>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div><p className="font-bold">{analysisResult.protein_g}g</p><p className="text-muted-foreground">Protein</p></div>
                <div><p className="font-bold">{analysisResult.carbs_g}g</p><p className="text-muted-foreground">Carbs</p></div>
                <div><p className="font-bold">{analysisResult.fat_g}g</p><p className="text-muted-foreground">Fat</p></div>
                <div><p className="font-bold">{analysisResult.fibre_g}g</p><p className="text-muted-foreground">Fibre</p></div>
              </div>
              <div>
                <p className="text-sm font-medium">Detected Items:</p>
                <ul className="text-xs text-muted-foreground list-disc list-inside">
                  {analysisResult.food_items?.map((item, i) => (
                    <li key={i}>{item.name} (~{item.estimated_grams}g)</li>
                  ))}
                </ul>
              </div>
              {analysisResult.notes && (
                <p className="text-xs text-muted-foreground italic">{analysisResult.notes}</p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowAnalysisResult(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default StrictMode;
