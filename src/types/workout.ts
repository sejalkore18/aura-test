export interface Exercise {
  id: string;
  name: string;
  category: 'chest' | 'triceps' | 'back' | 'biceps' | 'legs' | 'shoulders' | 'core' | 'fullbody';
  videoUrl: string;
  thumbnailUrl: string;
  defaultSets: number;
  defaultReps: number;
  defaultWeightKg?: number;
  equipment: string;
  proTip: string;
  howTo: string[];
  primaryMuscles: string[];
  secondaryMuscles: string[];
  variations?: string[];
}

export interface WorkoutSet {
  setNumber: number;
  targetReps: number;
  actualReps: number;
  weightKg: number;
  completed: boolean;
  completedAt?: string;
}

export interface RoutineExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  targetWeightKg: number;
  sets: WorkoutSet[];
}

export interface WorkoutRoutine {
  id: string;
  title: string;
  subtitle?: string;
  estimatedMinutes: number;
  exercises: RoutineExercise[];
  isCustom?: boolean;
}

export interface ActiveSession {
  routineId: string;
  routineTitle: string;
  startedAt: string;
  currentExerciseIndex: number;
  currentSetIndex: number;
  exerciseProgress: Record<string, WorkoutSet[]>; // exerciseId -> sets
  isResting: boolean;
  restTimeRemaining: number;
  restDurationTotal: number;
}

export interface UserProfile {
  id: 'sejal' | 'bhaumik';
  name: string;
  avatarColor: string;
  initials: string;
  weightUnit: 'kg' | 'lbs';
}

export const USER_PROFILES: UserProfile[] = [
  {
    id: 'sejal',
    name: 'Sejal',
    avatarColor: '#ff2d55',
    initials: 'S',
    weightUnit: 'kg',
  },
  {
    id: 'bhaumik',
    name: 'Bhaumik',
    avatarColor: '#0a84ff',
    initials: 'B',
    weightUnit: 'kg',
  },
];

export interface WorkoutLog {
  id: string;
  userId: 'sejal' | 'bhaumik';
  routineId: string;
  routineTitle: string;
  date: string;
  durationMinutes: number;
  totalSets: number;
  totalReps: number;
  totalVolumeKg: number;
  completedExercises: {
    name: string;
    sets: { reps: number; weightKg: number }[];
  }[];
}
