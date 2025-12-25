import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, Pause, SkipForward, RotateCcw, Volume2, VolumeX, Check, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [imageLoaded, setImageLoaded] = useState(false);
  
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
      setImageLoaded(false);
    } else {
      setPhase('complete');
    }
  }, [currentExerciseIndex, totalExercises, currentExercise?.restTime]);

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      setCurrentSet(1);
      setPhase('exercise');
      setTimeRemaining(getExerciseDuration(workout.exercises[currentExerciseIndex - 1]));
      setImageLoaded(false);
    }
  };

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

  // Preload next exercise image
  useEffect(() => {
    if (currentExerciseIndex < totalExercises - 1) {
      const nextExercise = workout.exercises[currentExerciseIndex + 1];
      const img = new Image();
      img.src = nextExercise.demoUrl;
    }
  }, [currentExerciseIndex, workout.exercises, totalExercises]);

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
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
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
              <motion.div 
                className="w-40 h-40 rounded-full bg-primary/10 flex items-center justify-center mb-6"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <span className="text-7xl font-bold text-primary">{timeRemaining}</span>
              </motion.div>
              <p className="text-lg font-medium text-foreground mb-2">First up:</p>
              <p className="text-xl font-bold text-primary">{currentExercise.name}</p>
              
              {/* Preview of first exercise */}
              <div className="mt-4 w-48 h-48 mx-auto rounded-xl overflow-hidden bg-muted">
                <img 
                  src={currentExercise.demoUrl} 
                  alt={currentExercise.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          )}

          {phase === 'exercise' && (
            <motion.div
              key={`exercise-${currentExerciseIndex}`}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              className="text-center w-full max-w-md"
            >
              {/* Video/GIF demo */}
              <div className="relative aspect-square max-h-[300px] bg-gradient-to-br from-muted to-muted/50 rounded-2xl mb-4 overflow-hidden shadow-lg">
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                    />
                  </div>
                )}
                <motion.img 
                  src={currentExercise.demoUrl} 
                  alt={currentExercise.name}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                  animate={{ scale: isPaused ? 1 : [1, 1.02, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
                
                {/* Overlay with exercise info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                  <p className="text-white font-bold text-lg">{currentExercise.name}</p>
                  <p className="text-white/80 text-sm">{currentExercise.muscleGroup}</p>
                </div>

                {/* Navigation arrows */}
                <button
                  onClick={handlePreviousExercise}
                  disabled={currentExerciseIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center disabled:opacity-30 hover:bg-black/60 transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={skipExercise}
                  disabled={currentExerciseIndex === totalExercises - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 flex items-center justify-center disabled:opacity-30 hover:bg-black/60 transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>

                {/* Paused overlay */}
                {isPaused && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center"
                  >
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <Pause className="w-12 h-12 text-white" />
                    </div>
                  </motion.div>
                )}
              </div>

              <p className="text-muted-foreground mb-2">{currentExercise.description}</p>

              {currentExercise.sets ? (
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="bg-primary/10 rounded-xl px-4 py-2">
                    <p className="text-sm text-muted-foreground">Set</p>
                    <p className="text-xl font-bold text-primary">{currentSet} / {currentExercise.sets}</p>
                  </div>
                  <div className="bg-muted rounded-xl px-4 py-2">
                    <p className="text-sm text-muted-foreground">Reps</p>
                    <p className="text-xl font-bold text-foreground">{currentExercise.reps}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-primary/10 rounded-xl px-4 py-2 inline-block mb-4">
                  <p className="text-sm text-muted-foreground">Hold for</p>
                  <p className="text-xl font-bold text-primary">{currentExercise.duration}s</p>
                </div>
              )}

              <motion.div 
                className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
                animate={!isPaused ? { scale: [1, 1.05, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <span className="text-3xl font-bold text-primary">{formatTime(timeRemaining)}</span>
              </motion.div>
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
              <motion.p 
                className="text-2xl font-bold text-nutrio-blue mb-2"
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                Rest Time
              </motion.p>
              <p className="text-muted-foreground mb-6">Catch your breath</p>
              
              <motion.div 
                className="w-40 h-40 rounded-full bg-nutrio-blue/10 flex items-center justify-center mb-6 mx-auto"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <span className="text-5xl font-bold text-nutrio-blue">{formatTime(timeRemaining)}</span>
              </motion.div>

              {/* Preview of next exercise */}
              {currentExerciseIndex < totalExercises - 1 && (
                <div className="bg-card rounded-2xl p-4 shadow-card max-w-xs mx-auto">
                  <p className="text-sm text-muted-foreground mb-2">Up Next</p>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                      <img 
                        src={workout.exercises[currentExerciseIndex + 1].demoUrl}
                        alt={workout.exercises[currentExerciseIndex + 1].name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-foreground">{workout.exercises[currentExerciseIndex + 1].name}</p>
                      <p className="text-sm text-muted-foreground">
                        {workout.exercises[currentExerciseIndex + 1].sets 
                          ? `${workout.exercises[currentExerciseIndex + 1].sets} sets × ${workout.exercises[currentExerciseIndex + 1].reps} reps`
                          : `${workout.exercises[currentExerciseIndex + 1].duration}s hold`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setPhase('exercise');
                  setTimeRemaining(getExerciseDuration(currentExercise));
                }}
                className="mt-4 text-primary font-medium hover:underline"
              >
                Skip Rest →
              </button>
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
                <motion.div 
                  className="text-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-2xl font-bold text-primary">{formatTime(totalTimeElapsed)}</p>
                  <p className="text-sm text-muted-foreground">Duration</p>
                </motion.div>
                <motion.div 
                  className="text-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-2xl font-bold text-nutrio-coral">{workout.calories}</p>
                  <p className="text-sm text-muted-foreground">Calories</p>
                </motion.div>
                <motion.div 
                  className="text-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-2xl font-bold text-nutrio-blue">{totalExercises}</p>
                  <p className="text-sm text-muted-foreground">Exercises</p>
                </motion.div>
              </div>
              
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={handleCompleteWorkout}
                className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-xl transition-colors"
              >
                Save & Finish
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Exercise dots indicator */}
      {phase !== 'complete' && (
        <div className="flex justify-center gap-1.5 pb-2">
          {workout.exercises.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index < currentExerciseIndex 
                  ? 'bg-primary' 
                  : index === currentExerciseIndex 
                    ? 'bg-primary w-4' 
                    : 'bg-muted'
              }`}
            />
          ))}
        </div>
      )}

      {/* Controls */}
      {phase !== 'complete' && (
        <div className="p-6 border-t border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={restartExercise}
              className="w-14 h-14 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
              <RotateCcw className="w-6 h-6 text-foreground" />
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="w-20 h-20 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors shadow-lg"
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
            {isPaused ? 'Paused - Tap to resume' : 'Tap to pause'}
          </p>
        </div>
      )}
    </motion.div>
  );
};
