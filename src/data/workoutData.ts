// Workout data structure for gym-style categories

export interface Exercise {
  id: string;
  name: string;
  duration?: number; // seconds
  sets?: number;
  reps?: number;
  restTime: number; // seconds
  demoUrl: string; // Exercise demo GIF/video URL
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

// Exercise demo GIFs from free sources (using placeholder animation service)
// These are looping animated demos for each exercise type
const DEMO_GIFS = {
  // Chest
  pushups: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHB5ZnFyNXhxaWJyYzN6d2V4MWRuNHJiYnRtcnN4YWppb2FqOGxzaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/UoLt6Tm8wlSnWGfSFs/giphy.gif',
  dumbbellPress: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzU2ZDkyMjJiYTFkMGM4OTg3YzE4MWQyYjA0NjE3NTc0ZDJkOWY0ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ckMk3RKUK2GDjBJXlA/giphy.gif',
  inclinePress: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzI5NmI4M2JiODRmMTEzMGE5ZjNlMjBkYjE4ZTNlZGFhZTJhZjM4NiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKIPq5Zzm5iI0nIis/giphy.gif',
  cableFlyes: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWJiNnh3M2hwbGN6Zjc3aGlwYmttcXBoZ3FuaXl0YWY4ZnF2bWxqZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TAmC3cqvWJk4M/giphy.gif',
  diamondPushups: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd3lqNGV0ZHN3ZDl1NXlhbHNqbTl0ZmVqcWxrZGt4OXV6NnVsMGxkNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l2YWu3dpHpGMY4lry/giphy.gif',
  
  // Back
  pullups: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGc2ZHQ2c2V3OGlhZXNscGF0cWt5aXhkMXRxZ2J5cnU1ZGgzMXVnaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT0xeE3Q9UkXxBfHi0/giphy.gif',
  bentOverRows: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnBrYzFhNHQ2eGcwZnA4a2d3MmJnMmNlaGptaWdlNGc0dDBvcjZ6cSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0Iyqe1L0wR7YOHI4/giphy.gif',
  latPulldown: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWRqcjN2cGE2OGJhNGw5c2x6NnFoNGptaG9qbnJ3eDM1MmZnNTV1aSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKIP7P16RI3HG7yU0/giphy.gif',
  seatedRow: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYnZ3cTd5YjV5dnFvNWc5NHBmdDFhYXFlcDEzdmFjcDVwY2tzbnVzZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26vIfT24AegmFtNL2/giphy.gif',
  facePulls: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHZ3ajR4Y2Fya3F2dGN2NHNpMnZ4ODZpYjR2dmZuNzl5d2k1YXZ3aSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/oBWxa4E1sEJZ7OVYLh/giphy.gif',
  
  // Shoulders
  overheadPress: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNnV4d2V5ZmJmemR5NjBtMXE3cXRvMWpkM3d6b2o1cHdjbnN0eGExdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKGvKKd3OWK0qR2/giphy.gif',
  lateralRaises: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjZ1aDBjNndwMnhyMnhuem9zczBuOWJmejcwd3djc3NrZzRrdGJjbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l2YWmUdFj1fFrdoR2/giphy.gif',
  frontRaises: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2JvZ2V1YWJxeTZpcGVudGl1dHFkNGl5aTc5czRveHVlazVvM2g0cCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26ufbiyNzMOCPByRW/giphy.gif',
  rearDeltFlyes: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmt4OXVpZWNtYXBhOGJpZmxjNDdqZGZhNXVsc29nM2FoaGdjdnlyZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKIPvIBNH6O6lKm2I/giphy.gif',
  arnoldPress: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYXFkNXN0dXgyc3V0cDNvOXZyZjQ5c3JqMm1tMnJ4enp1cGIyMGZ5ZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT9DgEWvDr9PYJO5Co/giphy.gif',
  
  // Legs
  squats: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjNjZjg4ZjkzMzRhODY3OGQ4ZjY4ZjNmYjIxMDEwMDk5OGRhYWFkMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1qfKN8Dt0CRdCRxz9q/giphy.gif',
  lunges: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHltOWpwMjJ2YXNjNGI1aGZnYjF6MmRzYnYyNXQ0ZXp4Y2xoYnV1ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0Iy1HHTGpzQUmMxO/giphy.gif',
  legPress: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2lqMHZzcjRvNnhtczJ3ZjRxaXdtNGRlMzQ5MXNvczd4YnR1cG5sdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT9DggJY6rIGnxzCzC/giphy.gif',
  romanianDeadlift: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXBxbDFrdWdqMmlzNnFiOG45bWp0NmF0dGRibGhha3gzZm1sN3B3bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKIPvdN8JSBE1eDKM/giphy.gif',
  calfRaises: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGhiamZhMGloMW5sdHBmZDFuejQxMWlkb2g4MTJ4N2FzODFyOTdsdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l2YWn7Y1GFLOZUAMI/giphy.gif',
  
  // Arms
  bicepCurls: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcjh6OWRjdmN0dHZhb2Z5ZGc1bG41M2JhNDJmM3N2OTd6bTNyM3c0diZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3og0IQJCIpjG4sNIgU/giphy.gif',
  tricepDips: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmwxZ2ttZ3EzbG1wN3d0eTltcTlqbnEzY2Zybm1jb3RuMnBzNGV4ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l2QE6LOWpKFNONaY8/giphy.gif',
  hammerCurls: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2p1cGc3ZGp4czYxYmI3aWZhbDgzM3RhbGR4eHRoMm5iZ3E5dmIxZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKIPb6F0lIrlk9v2M/giphy.gif',
  skullCrushers: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHZxcGRyeWw5cHFqd3RyY3o5bjFyMmZ0aGo4dHhmemxidHV1eDBmZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26u4lv0qAMTNQSbeg/giphy.gif',
  preacherCurls: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzRzNW1rY2RnajloNWc1MjlqN2lwdXY5bzJqZWY3bWdsNXZjaDN5aiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT0xeLbREuN4WVDWQ8/giphy.gif',
  
  // Core
  plank: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExazN1NHNwcHZqd3RiaGN6bTJhZWlsZHMzMjRlMnl0Y2RxcTJqcGhrcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/woZKC9l2wFvbRhZRWG/giphy.gif',
  crunches: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGR5MHBiYzBmcW1pYjdxbjQ0cmVvaGRvaDZmYm55a3g0c2RkYnNnMSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKwOQ0XHM9cEeuk/giphy.gif',
  russianTwists: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTd6Y3QycGthNDNxOGRrbzFmc2Rmbmh1aGF4N3M5MGFoZGlzMnhpbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l4FGy5QyXecVRpqpO/giphy.gif',
  legRaises: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjNjNm5hNmU5MnFyMGJtY3FrMnBobGNqbTBpNGNndDdwZ2dicnA5bCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlKvVFMIuU3lfGg/giphy.gif',
  mountainClimbers: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHlsbXg3N2k2eml6Y21xenYzZXU3NXhjM2dicm13b25seDl0anA0dCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kZn5IAOvWxXZNGHoFb/giphy.gif',
  deadBug: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdXA0aHpzcDI1MjhvaWZxdmxzeTNrczFvcnI0eXNoNWc3bjIzNHJqNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0MYIUbtWTc8uD4Zy/giphy.gif',
  
  // HIIT
  burpees: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjRqZnk5eDVtOHQ1ejQ0Nnd2OWd6ZGp3YmRiM2sybGI0ajNtN3F0ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/23hPPMRgPxbNBlPQe3/giphy.gif',
  jumpSquats: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGIzbTlmeDhtamxvNmNyajRkaG0xZHBlc2IweHN5dTQzN2xsNXFqbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKBPXAPlR3djJn2/giphy.gif',
  highKnees: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExczRmbHJkNjliZnB5cjd0eDhnc2Z1eHFnMDF5dWlxN3ljcjliNGpkYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oriOaFPxZMMjx6Gn6/giphy.gif',
  boxJumps: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2dwMGFydTljdnozc2R3ejk3Z2R3NmRqYTV4OXN0bGUzaGM5NnN3aSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlQoLbUqz7u6bao/giphy.gif',
  battleRopes: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmR1cW9kcGVqczlmcmFsaXB5dXJpbG9lOHg5dHJ0MjMyNmN5c2VwayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xUySTMqWTa3xO0HMjK/giphy.gif',
  kettlebellSwings: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3c5YmtlMGpkY2lxaGg5c3g0cnU3MXE3dWI1dDg5NnQ5MWdpOWxjZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT0xeN3plAoq47gqyc/giphy.gif',
  
  // Yoga
  downwardDog: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWg0NmZ0bXBodjMyOG5jdWttZ2Y0dGo3OXdmZGxhd2gxeDk5NDRnYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3oKIPdQOX3WZ4w2v2E/giphy.gif',
  warrior1: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWNjd3VzMm9yeGM0aWhyMWZmYmswdXo0ODJ3c3RlNGd0dTVybnhvcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT9DguVmGp57xAq5iM/giphy.gif',
  warrior2: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExczBsYnJyemZoM3c5cW1qcHQ5Z3pzMW9pczQ4cnVxMnVtMGY5OGJlayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKsTnOLEq2LdkWc/giphy.gif',
  childsPose: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHBtZ3pucXk2YWw3bHZzejNxcjNkb2c0a25jNWVweWthNjB2ajd0YiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26ufgguKhJV8MpzTW/giphy.gif',
  catCow: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2g5ZTVmcjZqNWlncm1nYXgyaDhxYmJmNDlxcWppcGZxaW5jeTN1biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3ohhwxDTaWCHMINxVm/giphy.gif',
  pigeonPose: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNXB6eGpuOXN0NTdqbjl4a2t6Yzg2dWYyb2R0OXFpNmRnZm1qbTVkZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l2JehN3gDQ3f2KmJO/giphy.gif',
};

// Sample exercises for different categories
const chestExercises: Exercise[] = [
  { id: 'chest-1', name: 'Push-ups', sets: 3, reps: 15, restTime: 45, demoUrl: DEMO_GIFS.pushups, description: 'Classic chest builder', muscleGroup: 'Chest' },
  { id: 'chest-2', name: 'Dumbbell Press', sets: 4, reps: 12, restTime: 60, demoUrl: DEMO_GIFS.dumbbellPress, description: 'Flat bench dumbbell press', muscleGroup: 'Chest' },
  { id: 'chest-3', name: 'Incline Press', sets: 3, reps: 12, restTime: 60, demoUrl: DEMO_GIFS.inclinePress, description: 'Upper chest focus', muscleGroup: 'Chest' },
  { id: 'chest-4', name: 'Cable Flyes', sets: 3, reps: 15, restTime: 45, demoUrl: DEMO_GIFS.cableFlyes, description: 'Chest isolation movement', muscleGroup: 'Chest' },
  { id: 'chest-5', name: 'Diamond Push-ups', sets: 3, reps: 12, restTime: 45, demoUrl: DEMO_GIFS.diamondPushups, description: 'Inner chest and triceps', muscleGroup: 'Chest' },
];

const backExercises: Exercise[] = [
  { id: 'back-1', name: 'Pull-ups', sets: 3, reps: 10, restTime: 60, demoUrl: DEMO_GIFS.pullups, description: 'Wide grip pull-ups', muscleGroup: 'Back' },
  { id: 'back-2', name: 'Bent Over Rows', sets: 4, reps: 12, restTime: 60, demoUrl: DEMO_GIFS.bentOverRows, description: 'Barbell or dumbbell rows', muscleGroup: 'Back' },
  { id: 'back-3', name: 'Lat Pulldown', sets: 3, reps: 12, restTime: 45, demoUrl: DEMO_GIFS.latPulldown, description: 'Cable lat pulldown', muscleGroup: 'Back' },
  { id: 'back-4', name: 'Seated Row', sets: 3, reps: 12, restTime: 45, demoUrl: DEMO_GIFS.seatedRow, description: 'Cable seated row', muscleGroup: 'Back' },
  { id: 'back-5', name: 'Face Pulls', sets: 3, reps: 15, restTime: 30, demoUrl: DEMO_GIFS.facePulls, description: 'Rear delt and upper back', muscleGroup: 'Back' },
];

const shoulderExercises: Exercise[] = [
  { id: 'shoulder-1', name: 'Overhead Press', sets: 4, reps: 10, restTime: 60, demoUrl: DEMO_GIFS.overheadPress, description: 'Standing or seated press', muscleGroup: 'Shoulders' },
  { id: 'shoulder-2', name: 'Lateral Raises', sets: 3, reps: 15, restTime: 45, demoUrl: DEMO_GIFS.lateralRaises, description: 'Side delt isolation', muscleGroup: 'Shoulders' },
  { id: 'shoulder-3', name: 'Front Raises', sets: 3, reps: 12, restTime: 45, demoUrl: DEMO_GIFS.frontRaises, description: 'Front delt focus', muscleGroup: 'Shoulders' },
  { id: 'shoulder-4', name: 'Rear Delt Flyes', sets: 3, reps: 15, restTime: 45, demoUrl: DEMO_GIFS.rearDeltFlyes, description: 'Rear deltoid isolation', muscleGroup: 'Shoulders' },
  { id: 'shoulder-5', name: 'Arnold Press', sets: 3, reps: 12, restTime: 60, demoUrl: DEMO_GIFS.arnoldPress, description: 'Rotational shoulder press', muscleGroup: 'Shoulders' },
];

const legExercises: Exercise[] = [
  { id: 'leg-1', name: 'Squats', sets: 4, reps: 12, restTime: 90, demoUrl: DEMO_GIFS.squats, description: 'Barbell or bodyweight squats', muscleGroup: 'Legs' },
  { id: 'leg-2', name: 'Lunges', sets: 3, reps: 12, restTime: 60, demoUrl: DEMO_GIFS.lunges, description: 'Walking or stationary lunges', muscleGroup: 'Legs' },
  { id: 'leg-3', name: 'Leg Press', sets: 3, reps: 15, restTime: 60, demoUrl: DEMO_GIFS.legPress, description: 'Machine leg press', muscleGroup: 'Legs' },
  { id: 'leg-4', name: 'Romanian Deadlift', sets: 3, reps: 12, restTime: 60, demoUrl: DEMO_GIFS.romanianDeadlift, description: 'Hamstring focus', muscleGroup: 'Legs' },
  { id: 'leg-5', name: 'Calf Raises', sets: 4, reps: 20, restTime: 30, demoUrl: DEMO_GIFS.calfRaises, description: 'Standing calf raises', muscleGroup: 'Legs' },
];

const armExercises: Exercise[] = [
  { id: 'arm-1', name: 'Bicep Curls', sets: 3, reps: 12, restTime: 45, demoUrl: DEMO_GIFS.bicepCurls, description: 'Dumbbell or barbell curls', muscleGroup: 'Arms' },
  { id: 'arm-2', name: 'Tricep Dips', sets: 3, reps: 15, restTime: 45, demoUrl: DEMO_GIFS.tricepDips, description: 'Bench or parallel bar dips', muscleGroup: 'Arms' },
  { id: 'arm-3', name: 'Hammer Curls', sets: 3, reps: 12, restTime: 45, demoUrl: DEMO_GIFS.hammerCurls, description: 'Neutral grip curls', muscleGroup: 'Arms' },
  { id: 'arm-4', name: 'Skull Crushers', sets: 3, reps: 12, restTime: 45, demoUrl: DEMO_GIFS.skullCrushers, description: 'Lying tricep extensions', muscleGroup: 'Arms' },
  { id: 'arm-5', name: 'Preacher Curls', sets: 3, reps: 10, restTime: 45, demoUrl: DEMO_GIFS.preacherCurls, description: 'Isolated bicep curls', muscleGroup: 'Arms' },
];

const coreExercises: Exercise[] = [
  { id: 'core-1', name: 'Plank', duration: 60, restTime: 30, demoUrl: DEMO_GIFS.plank, description: 'Hold position', muscleGroup: 'Core' },
  { id: 'core-2', name: 'Crunches', sets: 3, reps: 20, restTime: 30, demoUrl: DEMO_GIFS.crunches, description: 'Basic abdominal crunch', muscleGroup: 'Core' },
  { id: 'core-3', name: 'Russian Twists', sets: 3, reps: 20, restTime: 30, demoUrl: DEMO_GIFS.russianTwists, description: 'Oblique rotation', muscleGroup: 'Core' },
  { id: 'core-4', name: 'Leg Raises', sets: 3, reps: 15, restTime: 30, demoUrl: DEMO_GIFS.legRaises, description: 'Lower ab focus', muscleGroup: 'Core' },
  { id: 'core-5', name: 'Mountain Climbers', duration: 45, restTime: 30, demoUrl: DEMO_GIFS.mountainClimbers, description: 'Cardio core exercise', muscleGroup: 'Core' },
  { id: 'core-6', name: 'Dead Bug', sets: 3, reps: 12, restTime: 30, demoUrl: DEMO_GIFS.deadBug, description: 'Core stability', muscleGroup: 'Core' },
];

const hiitExercises: Exercise[] = [
  { id: 'hiit-1', name: 'Burpees', duration: 45, restTime: 15, demoUrl: DEMO_GIFS.burpees, description: 'Full body explosive', muscleGroup: 'Full Body' },
  { id: 'hiit-2', name: 'Jump Squats', duration: 45, restTime: 15, demoUrl: DEMO_GIFS.jumpSquats, description: 'Explosive leg power', muscleGroup: 'Legs' },
  { id: 'hiit-3', name: 'High Knees', duration: 45, restTime: 15, demoUrl: DEMO_GIFS.highKnees, description: 'Cardio sprint', muscleGroup: 'Cardio' },
  { id: 'hiit-4', name: 'Box Jumps', duration: 45, restTime: 15, demoUrl: DEMO_GIFS.boxJumps, description: 'Plyometric power', muscleGroup: 'Legs' },
  { id: 'hiit-5', name: 'Battle Ropes', duration: 45, restTime: 15, demoUrl: DEMO_GIFS.battleRopes, description: 'Upper body cardio', muscleGroup: 'Arms' },
  { id: 'hiit-6', name: 'Kettlebell Swings', duration: 45, restTime: 15, demoUrl: DEMO_GIFS.kettlebellSwings, description: 'Hip hinge power', muscleGroup: 'Full Body' },
];

const yogaExercises: Exercise[] = [
  { id: 'yoga-1', name: 'Downward Dog', duration: 60, restTime: 10, demoUrl: DEMO_GIFS.downwardDog, description: 'Full body stretch', muscleGroup: 'Full Body' },
  { id: 'yoga-2', name: 'Warrior I', duration: 45, restTime: 10, demoUrl: DEMO_GIFS.warrior1, description: 'Hip flexor and leg strength', muscleGroup: 'Legs' },
  { id: 'yoga-3', name: 'Warrior II', duration: 45, restTime: 10, demoUrl: DEMO_GIFS.warrior2, description: 'Hip opener and leg endurance', muscleGroup: 'Legs' },
  { id: 'yoga-4', name: 'Child\'s Pose', duration: 60, restTime: 10, demoUrl: DEMO_GIFS.childsPose, description: 'Relaxation and back stretch', muscleGroup: 'Back' },
  { id: 'yoga-5', name: 'Cat-Cow Stretch', duration: 45, restTime: 10, demoUrl: DEMO_GIFS.catCow, description: 'Spine mobility', muscleGroup: 'Back' },
  { id: 'yoga-6', name: 'Pigeon Pose', duration: 60, restTime: 10, demoUrl: DEMO_GIFS.pigeonPose, description: 'Deep hip stretch', muscleGroup: 'Hips' },
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
