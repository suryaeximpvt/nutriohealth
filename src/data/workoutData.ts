// Workout data structure for gym-style categories

export interface Exercise {
  id: string;
  name: string;
  duration?: number; // seconds
  sets?: number;
  reps?: number;
  restTime: number; // seconds
  videoUrl?: string; // placeholder for video
  description: string;
  muscleGroup: string;
}

export interface Workout {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  duration: number; // minutes
  calories: number;
  exercises: Exercise[];
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  imageUrl?: string;
  description: string;
}

export interface WorkoutCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: {
    id: string;
    name: string;
    workouts: Workout[];
  }[];
}

// Sample exercises for different categories
const chestExercises: Exercise[] = [
  { id: 'chest-1', name: 'Push-ups', sets: 3, reps: 15, restTime: 45, description: 'Classic chest builder', muscleGroup: 'Chest' },
  { id: 'chest-2', name: 'Dumbbell Press', sets: 4, reps: 12, restTime: 60, description: 'Flat bench dumbbell press', muscleGroup: 'Chest' },
  { id: 'chest-3', name: 'Incline Press', sets: 3, reps: 12, restTime: 60, description: 'Upper chest focus', muscleGroup: 'Chest' },
  { id: 'chest-4', name: 'Cable Flyes', sets: 3, reps: 15, restTime: 45, description: 'Chest isolation movement', muscleGroup: 'Chest' },
  { id: 'chest-5', name: 'Diamond Push-ups', sets: 3, reps: 12, restTime: 45, description: 'Inner chest and triceps', muscleGroup: 'Chest' },
];

const backExercises: Exercise[] = [
  { id: 'back-1', name: 'Pull-ups', sets: 3, reps: 10, restTime: 60, description: 'Wide grip pull-ups', muscleGroup: 'Back' },
  { id: 'back-2', name: 'Bent Over Rows', sets: 4, reps: 12, restTime: 60, description: 'Barbell or dumbbell rows', muscleGroup: 'Back' },
  { id: 'back-3', name: 'Lat Pulldown', sets: 3, reps: 12, restTime: 45, description: 'Cable lat pulldown', muscleGroup: 'Back' },
  { id: 'back-4', name: 'Seated Row', sets: 3, reps: 12, restTime: 45, description: 'Cable seated row', muscleGroup: 'Back' },
  { id: 'back-5', name: 'Face Pulls', sets: 3, reps: 15, restTime: 30, description: 'Rear delt and upper back', muscleGroup: 'Back' },
];

const shoulderExercises: Exercise[] = [
  { id: 'shoulder-1', name: 'Overhead Press', sets: 4, reps: 10, restTime: 60, description: 'Standing or seated press', muscleGroup: 'Shoulders' },
  { id: 'shoulder-2', name: 'Lateral Raises', sets: 3, reps: 15, restTime: 45, description: 'Side delt isolation', muscleGroup: 'Shoulders' },
  { id: 'shoulder-3', name: 'Front Raises', sets: 3, reps: 12, restTime: 45, description: 'Front delt focus', muscleGroup: 'Shoulders' },
  { id: 'shoulder-4', name: 'Rear Delt Flyes', sets: 3, reps: 15, restTime: 45, description: 'Rear deltoid isolation', muscleGroup: 'Shoulders' },
  { id: 'shoulder-5', name: 'Arnold Press', sets: 3, reps: 12, restTime: 60, description: 'Rotational shoulder press', muscleGroup: 'Shoulders' },
];

const legExercises: Exercise[] = [
  { id: 'leg-1', name: 'Squats', sets: 4, reps: 12, restTime: 90, description: 'Barbell or bodyweight squats', muscleGroup: 'Legs' },
  { id: 'leg-2', name: 'Lunges', sets: 3, reps: 12, restTime: 60, description: 'Walking or stationary lunges', muscleGroup: 'Legs' },
  { id: 'leg-3', name: 'Leg Press', sets: 3, reps: 15, restTime: 60, description: 'Machine leg press', muscleGroup: 'Legs' },
  { id: 'leg-4', name: 'Romanian Deadlift', sets: 3, reps: 12, restTime: 60, description: 'Hamstring focus', muscleGroup: 'Legs' },
  { id: 'leg-5', name: 'Calf Raises', sets: 4, reps: 20, restTime: 30, description: 'Standing calf raises', muscleGroup: 'Legs' },
];

const armExercises: Exercise[] = [
  { id: 'arm-1', name: 'Bicep Curls', sets: 3, reps: 12, restTime: 45, description: 'Dumbbell or barbell curls', muscleGroup: 'Arms' },
  { id: 'arm-2', name: 'Tricep Dips', sets: 3, reps: 15, restTime: 45, description: 'Bench or parallel bar dips', muscleGroup: 'Arms' },
  { id: 'arm-3', name: 'Hammer Curls', sets: 3, reps: 12, restTime: 45, description: 'Neutral grip curls', muscleGroup: 'Arms' },
  { id: 'arm-4', name: 'Skull Crushers', sets: 3, reps: 12, restTime: 45, description: 'Lying tricep extensions', muscleGroup: 'Arms' },
  { id: 'arm-5', name: 'Preacher Curls', sets: 3, reps: 10, restTime: 45, description: 'Isolated bicep curls', muscleGroup: 'Arms' },
];

const coreExercises: Exercise[] = [
  { id: 'core-1', name: 'Plank', duration: 60, restTime: 30, description: 'Hold position', muscleGroup: 'Core' },
  { id: 'core-2', name: 'Crunches', sets: 3, reps: 20, restTime: 30, description: 'Basic abdominal crunch', muscleGroup: 'Core' },
  { id: 'core-3', name: 'Russian Twists', sets: 3, reps: 20, restTime: 30, description: 'Oblique rotation', muscleGroup: 'Core' },
  { id: 'core-4', name: 'Leg Raises', sets: 3, reps: 15, restTime: 30, description: 'Lower ab focus', muscleGroup: 'Core' },
  { id: 'core-5', name: 'Mountain Climbers', duration: 45, restTime: 30, description: 'Cardio core exercise', muscleGroup: 'Core' },
  { id: 'core-6', name: 'Dead Bug', sets: 3, reps: 12, restTime: 30, description: 'Core stability', muscleGroup: 'Core' },
];

const hiitExercises: Exercise[] = [
  { id: 'hiit-1', name: 'Burpees', duration: 45, restTime: 15, description: 'Full body explosive', muscleGroup: 'Full Body' },
  { id: 'hiit-2', name: 'Jump Squats', duration: 45, restTime: 15, description: 'Explosive leg power', muscleGroup: 'Legs' },
  { id: 'hiit-3', name: 'High Knees', duration: 45, restTime: 15, description: 'Cardio sprint', muscleGroup: 'Cardio' },
  { id: 'hiit-4', name: 'Box Jumps', duration: 45, restTime: 15, description: 'Plyometric power', muscleGroup: 'Legs' },
  { id: 'hiit-5', name: 'Battle Ropes', duration: 45, restTime: 15, description: 'Upper body cardio', muscleGroup: 'Arms' },
  { id: 'hiit-6', name: 'Kettlebell Swings', duration: 45, restTime: 15, description: 'Hip hinge power', muscleGroup: 'Full Body' },
];

const yogaExercises: Exercise[] = [
  { id: 'yoga-1', name: 'Downward Dog', duration: 60, restTime: 10, description: 'Full body stretch', muscleGroup: 'Full Body' },
  { id: 'yoga-2', name: 'Warrior I', duration: 45, restTime: 10, description: 'Hip flexor and leg strength', muscleGroup: 'Legs' },
  { id: 'yoga-3', name: 'Warrior II', duration: 45, restTime: 10, description: 'Hip opener and leg endurance', muscleGroup: 'Legs' },
  { id: 'yoga-4', name: 'Child\'s Pose', duration: 60, restTime: 10, description: 'Relaxation and back stretch', muscleGroup: 'Back' },
  { id: 'yoga-5', name: 'Cat-Cow Stretch', duration: 45, restTime: 10, description: 'Spine mobility', muscleGroup: 'Back' },
  { id: 'yoga-6', name: 'Pigeon Pose', duration: 60, restTime: 10, description: 'Deep hip stretch', muscleGroup: 'Hips' },
];

export const WORKOUT_CATEGORIES: WorkoutCategory[] = [
  {
    id: 'strength',
    name: 'Strength Training',
    icon: '💪',
    subcategories: [
      {
        id: 'chest',
        name: 'Chest',
        workouts: [
          {
            id: 'chest-power',
            name: 'Chest Power Builder',
            category: 'Strength Training',
            subcategory: 'Chest',
            duration: 40,
            calories: 280,
            exercises: chestExercises,
            level: 'Intermediate',
            description: 'Build a powerful chest with compound and isolation movements'
          },
          {
            id: 'chest-beginner',
            name: 'Chest Basics',
            category: 'Strength Training',
            subcategory: 'Chest',
            duration: 25,
            calories: 180,
            exercises: chestExercises.slice(0, 3),
            level: 'Beginner',
            description: 'Perfect for beginners learning chest exercises'
          }
        ]
      },
      {
        id: 'back',
        name: 'Back',
        workouts: [
          {
            id: 'back-strength',
            name: 'Back Attack',
            category: 'Strength Training',
            subcategory: 'Back',
            duration: 45,
            calories: 320,
            exercises: backExercises,
            level: 'Intermediate',
            description: 'Complete back workout for width and thickness'
          },
          {
            id: 'back-pull',
            name: 'Pull Power',
            category: 'Strength Training',
            subcategory: 'Back',
            duration: 35,
            calories: 250,
            exercises: backExercises.slice(0, 4),
            level: 'Advanced',
            description: 'Heavy pulling movements for back development'
          }
        ]
      },
      {
        id: 'shoulders',
        name: 'Shoulders',
        workouts: [
          {
            id: 'shoulder-sculpt',
            name: 'Shoulder Sculpt',
            category: 'Strength Training',
            subcategory: 'Shoulders',
            duration: 35,
            calories: 240,
            exercises: shoulderExercises,
            level: 'Intermediate',
            description: 'Build round, capped shoulders'
          }
        ]
      },
      {
        id: 'legs',
        name: 'Legs',
        workouts: [
          {
            id: 'leg-day',
            name: 'Leg Day Destroyer',
            category: 'Strength Training',
            subcategory: 'Legs',
            duration: 50,
            calories: 400,
            exercises: legExercises,
            level: 'Advanced',
            description: 'Complete lower body strength workout'
          },
          {
            id: 'leg-beginner',
            name: 'Leg Foundations',
            category: 'Strength Training',
            subcategory: 'Legs',
            duration: 30,
            calories: 220,
            exercises: legExercises.slice(0, 3),
            level: 'Beginner',
            description: 'Build a strong lower body foundation'
          }
        ]
      },
      {
        id: 'arms',
        name: 'Arms',
        workouts: [
          {
            id: 'arm-blast',
            name: 'Arm Blast',
            category: 'Strength Training',
            subcategory: 'Arms',
            duration: 30,
            calories: 200,
            exercises: armExercises,
            level: 'Intermediate',
            description: 'Pump up your biceps and triceps'
          }
        ]
      },
      {
        id: 'fullbody',
        name: 'Full Body',
        workouts: [
          {
            id: 'full-body-strength',
            name: 'Total Body Strength',
            category: 'Strength Training',
            subcategory: 'Full Body',
            duration: 55,
            calories: 450,
            exercises: [...chestExercises.slice(0, 2), ...backExercises.slice(0, 2), ...legExercises.slice(0, 2)],
            level: 'Intermediate',
            description: 'Hit every muscle group in one session'
          }
        ]
      }
    ]
  },
  {
    id: 'core',
    name: 'Core & Abs',
    icon: '🎯',
    subcategories: [
      {
        id: 'abs',
        name: 'Abs',
        workouts: [
          {
            id: 'abs-burner',
            name: '6-Pack Burner',
            category: 'Core & Abs',
            subcategory: 'Abs',
            duration: 20,
            calories: 150,
            exercises: coreExercises.slice(0, 4),
            level: 'Intermediate',
            description: 'Intense ab workout for definition'
          }
        ]
      },
      {
        id: 'core-stability',
        name: 'Core Stability',
        workouts: [
          {
            id: 'core-foundation',
            name: 'Core Foundation',
            category: 'Core & Abs',
            subcategory: 'Core Stability',
            duration: 25,
            calories: 120,
            exercises: coreExercises,
            level: 'Beginner',
            description: 'Build a stable, strong core'
          }
        ]
      },
      {
        id: 'lower-back',
        name: 'Lower Back',
        workouts: [
          {
            id: 'back-care',
            name: 'Back Care Routine',
            category: 'Core & Abs',
            subcategory: 'Lower Back',
            duration: 20,
            calories: 80,
            exercises: [coreExercises[0], coreExercises[5], yogaExercises[3], yogaExercises[4]],
            level: 'Beginner',
            description: 'Strengthen and protect your lower back'
          }
        ]
      }
    ]
  },
  {
    id: 'endurance',
    name: 'Endurance Training',
    icon: '🔥',
    subcategories: [
      {
        id: 'cardio',
        name: 'Cardio Endurance',
        workouts: [
          {
            id: 'cardio-blast',
            name: 'Cardio Blast',
            category: 'Endurance Training',
            subcategory: 'Cardio Endurance',
            duration: 30,
            calories: 350,
            exercises: hiitExercises.slice(0, 4),
            level: 'Intermediate',
            description: 'Boost your cardiovascular endurance'
          }
        ]
      },
      {
        id: 'hiit',
        name: 'HIIT',
        workouts: [
          {
            id: 'hiit-inferno',
            name: 'HIIT Inferno',
            category: 'Endurance Training',
            subcategory: 'HIIT',
            duration: 25,
            calories: 400,
            exercises: hiitExercises,
            level: 'Advanced',
            description: 'Maximum calorie burn in minimum time'
          },
          {
            id: 'hiit-beginner',
            name: 'HIIT Starter',
            category: 'Endurance Training',
            subcategory: 'HIIT',
            duration: 20,
            calories: 250,
            exercises: hiitExercises.slice(0, 4),
            level: 'Beginner',
            description: 'Introduction to high intensity training'
          }
        ]
      },
      {
        id: 'circuits',
        name: 'Conditioning Circuits',
        workouts: [
          {
            id: 'circuit-crusher',
            name: 'Circuit Crusher',
            category: 'Endurance Training',
            subcategory: 'Conditioning Circuits',
            duration: 35,
            calories: 380,
            exercises: [...hiitExercises.slice(0, 3), ...coreExercises.slice(0, 3)],
            level: 'Intermediate',
            description: 'Full body conditioning circuit'
          }
        ]
      }
    ]
  },
  {
    id: 'yoga',
    name: 'Yoga & Mobility',
    icon: '🧘',
    subcategories: [
      {
        id: 'yoga-flow',
        name: 'Yoga Flow',
        workouts: [
          {
            id: 'morning-flow',
            name: 'Morning Flow',
            category: 'Yoga & Mobility',
            subcategory: 'Yoga Flow',
            duration: 25,
            calories: 120,
            exercises: yogaExercises,
            level: 'Beginner',
            description: 'Energizing morning yoga sequence'
          },
          {
            id: 'power-yoga',
            name: 'Power Yoga',
            category: 'Yoga & Mobility',
            subcategory: 'Yoga Flow',
            duration: 40,
            calories: 200,
            exercises: yogaExercises,
            level: 'Intermediate',
            description: 'Strength-building yoga practice'
          }
        ]
      },
      {
        id: 'stretch',
        name: 'Stretch & Mobility',
        workouts: [
          {
            id: 'full-body-stretch',
            name: 'Full Body Stretch',
            category: 'Yoga & Mobility',
            subcategory: 'Stretch & Mobility',
            duration: 20,
            calories: 60,
            exercises: yogaExercises.slice(0, 4),
            level: 'Beginner',
            description: 'Release tension and improve flexibility'
          }
        ]
      },
      {
        id: 'recovery',
        name: 'Recovery Yoga',
        workouts: [
          {
            id: 'recovery-restore',
            name: 'Restore & Recover',
            category: 'Yoga & Mobility',
            subcategory: 'Recovery Yoga',
            duration: 30,
            calories: 80,
            exercises: [yogaExercises[3], yogaExercises[4], yogaExercises[5], yogaExercises[0]],
            level: 'Beginner',
            description: 'Gentle recovery session for rest days'
          }
        ]
      }
    ]
  }
];

// Helper to get all workouts flat
export const getAllWorkouts = (): Workout[] => {
  return WORKOUT_CATEGORIES.flatMap(cat => 
    cat.subcategories.flatMap(sub => sub.workouts)
  );
};

// Helper to get workout by ID
export const getWorkoutById = (id: string): Workout | undefined => {
  return getAllWorkouts().find(w => w.id === id);
};
