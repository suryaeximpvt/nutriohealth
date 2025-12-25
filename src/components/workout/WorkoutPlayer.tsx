import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, SkipForward, RotateCcw, Volume2, VolumeX, Check } from "lucide-react";
import { Workout, Exercise } from "@/data/workoutData";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface WorkoutPlayerProps {
  workout: Workout;
  onClose: () => void;
  onComplete: () => void;
}

type Phase = 'countdown' | 'exercise' | 'rest' | 'complete';

export const WorkoutPlayer = ({ workout, onClose, onComplete }: WorkoutPlayerProps) => {
  const { user } = useAuth();
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('countdown');
  const [timeRemaining, setTimeRemaining] = useState(5); // 5 second countdown to start
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  
  const currentExercise = workout.exercises[currentExerciseIndex];
  const totalExercises = workout.exercises.length;
  const progress = ((currentExerciseIndex) / totalExercises) * 100;

  const getExerciseDuration = (exercise: Exercise) => {
    if (exercise.duration) return exercise.duration;
    // Estimate based on sets and reps (roughly 3 seconds per rep)
    return (exercise.sets || 1) * (exercise.reps || 10) * 3;
  };

  const handleNextExercise = useCallback(() => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setCurrentSet(1);
      setPhase('rest');
      setTimeRemaining(currentExercise.restTime);
    } else {
      setPhase('complete');
    }
  }, [currentExerciseIndex, totalExercises, currentExercise?.restTime]);

  const handleCompleteWorkout = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase.from('workout_logs').insert({
        user_id: user.id,
        exercise_name: workout.name,
        exercise_type: workout.category,
        duration_minutes: Math.round(totalTimeElapsed / 60),
        calories_burned: workout.calories,
        intensity: workout.level.toLowerCase(),
        logged_at: new Date().toISOString().split('T')[0]
      });

      if (error) throw error;
      toast.success('Workout completed! Great job! 💪');
      onComplete();
    } catch (error) {
      console.error('Error logging workout:', error);
      toast.error('Failed to save workout');
    }
  };

  useEffect(() => {
    if (isPaused || phase === 'complete') return;

    const timer = setInterval(() => {
      setTotalTimeElapsed(prev => prev + 1);
      
      setTimeRemaining(prev => {
        if (prev <= 1) {
          if (phase === 'countdown') {
            setPhase('exercise');
            return getExerciseDuration(currentExercise);
          } else if (phase === 'exercise') {
            if (currentExercise.sets && currentSet < currentExercise.sets) {
              setCurrentSet(s => s + 1);
              setPhase('rest');
              return currentExercise.restTime;
            } else {
              handleNextExercise();
              return 0;
            }
          } else if (phase === 'rest') {
            setPhase('exercise');
            return getExerciseDuration(currentExercise);
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, phase, currentExercise, currentSet, handleNextExercise]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const skipExercise = () => {
    handleNextExercise();
  };

  const restartExercise = () => {
    setCurrentSet(1);
    setPhase('exercise');
    setTimeRemaining(getExerciseDuration(currentExercise));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
          <X className="w-6 h-6 text-foreground" />
        </button>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Exercise {currentExerciseIndex + 1} of {totalExercises}</p>
          <p className="font-semibold text-foreground">{workout.name}</p>
        </div>
        <button onClick={() => setIsMuted(!isMuted)} className="p-2 rounded-full hover:bg-muted transition-colors">
          {isMuted ? <VolumeX className="w-6 h-6 text-foreground" /> : <Volume2 className="w-6 h-6 text-foreground" />}
        </button>
      </div>

      {/* Progress bar */}
      <Progress value={progress} className="h-1 rounded-none" />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {phase === 'countdown' && (
            <motion.div
              key="countdown"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center"
            >
              <p className="text-xl text-muted-foreground mb-4">Get Ready!</p>
              <div className="w-40 h-40 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <span className="text-7xl font-bold text-primary">{timeRemaining}</span>
              </div>
              <p className="text-lg font-medium text-foreground">First up: {currentExercise.name}</p>
            </motion.div>
          )}

          {phase === 'exercise' && (
            <motion.div
              key="exercise"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="text-center w-full max-w-md"
            >
              {/* Video placeholder */}
              <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-2xl mb-6 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-6xl"
                >
                  🏋️
                </motion.div>
                <div className="absolute bottom-4 left-4 right-4 text-white text-left">
                  <p className="text-sm opacity-80">Demo video</p>
                  <p className="font-semibold">{currentExercise.name}</p>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-2">{currentExercise.name}</h2>
              <p className="text-muted-foreground mb-4">{currentExercise.description}</p>

              {currentExercise.sets && (
                <p className="text-lg font-medium text-primary mb-4">
                  Set {currentSet} of {currentExercise.sets} • {currentExercise.reps} reps
                </p>
              )}

              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl font-bold text-primary">{formatTime(timeRemaining)}</span>
              </div>
            </motion.div>
          )}

          {phase === 'rest' && (
            <motion.div
              key="rest"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center"
            >
              <p className="text-xl text-muted-foreground mb-4">Rest Time</p>
              <div className="w-40 h-40 rounded-full bg-nutrio-blue/10 flex items-center justify-center mb-6">
                <span className="text-5xl font-bold text-nutrio-blue">{formatTime(timeRemaining)}</span>
              </div>
              <p className="text-lg font-medium text-foreground">
                Next: {workout.exercises[currentExerciseIndex + 1]?.name || 'Workout Complete!'}
              </p>
            </motion.div>
          )}

          {phase === 'complete' && (
            <motion.div
              key="complete"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-12 h-12 text-primary-foreground" />
              </motion.div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Workout Complete!</h2>
              <p className="text-muted-foreground mb-2">Amazing work! 💪</p>
              <div className="flex justify-center gap-6 mt-6 mb-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{formatTime(totalTimeElapsed)}</p>
                  <p className="text-sm text-muted-foreground">Duration</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-nutrio-coral">{workout.calories}</p>
                  <p className="text-sm text-muted-foreground">Calories</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-nutrio-blue">{totalExercises}</p>
                  <p className="text-sm text-muted-foreground">Exercises</p>
                </div>
              </div>
              <button
                onClick={handleCompleteWorkout}
                className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-xl transition-colors"
              >
                Save & Finish
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      {phase !== 'complete' && (
        <div className="p-6 border-t border-border">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={restartExercise}
              className="w-14 h-14 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <RotateCcw className="w-6 h-6 text-foreground" />
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="w-20 h-20 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              {isPaused ? (
                <Play className="w-10 h-10 text-primary-foreground ml-1" />
              ) : (
                <Pause className="w-10 h-10 text-primary-foreground" />
              )}
            </button>
            <button
              onClick={skipExercise}
              className="w-14 h-14 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <SkipForward className="w-6 h-6 text-foreground" />
            </button>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-3">
            {isPaused ? 'Paused' : 'Tap to pause'}
          </p>
        </div>
      )}
    </motion.div>
  );
};
