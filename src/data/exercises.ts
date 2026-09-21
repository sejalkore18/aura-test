import { Exercise, WorkoutRoutine } from '@/types/workout';
export { EXERCISE_LIBRARY } from '@/data/exerciseLibrary';
import { EXERCISE_LIBRARY } from '@/data/exerciseLibrary';


export const DEFAULT_ROUTINES: WorkoutRoutine[] = [
  {
    id: 'upper-body',
    title: 'Upper Body',
    subtitle: 'Chest, Triceps, Shoulders & Push power',
    coverImage: '/workouts/upper-body.jpg',
    estimatedMinutes: 25,
    estimatedCalories: 100,
    exercises: [
      {
        exerciseId: 'push-ups',
        targetSets: 3,
        targetReps: 10,
        targetWeightKg: 0,
        sets: [
          { setNumber: 1, targetReps: 10, actualReps: 10, weightKg: 0, completed: false },
          { setNumber: 2, targetReps: 10, actualReps: 10, weightKg: 0, completed: false },
          { setNumber: 3, targetReps: 10, actualReps: 10, weightKg: 0, completed: false }
        ]
      },
      {
        exerciseId: 'tricep-dips',
        targetSets: 3,
        targetReps: 8,
        targetWeightKg: 0,
        sets: [
          { setNumber: 1, targetReps: 8, actualReps: 8, weightKg: 0, completed: false },
          { setNumber: 2, targetReps: 8, actualReps: 8, weightKg: 0, completed: false },
          { setNumber: 3, targetReps: 8, actualReps: 8, weightKg: 0, completed: false }
        ]
      },
      {
        exerciseId: 'bench-press',
        targetSets: 3,
        targetReps: 12,
        targetWeightKg: 60,
        sets: [
          { setNumber: 1, targetReps: 12, actualReps: 12, weightKg: 60, completed: false },
          { setNumber: 2, targetReps: 12, actualReps: 12, weightKg: 60, completed: false },
          { setNumber: 3, targetReps: 12, actualReps: 12, weightKg: 60, completed: false }
        ]
      }
    ]
  },
  {
    id: 'lower-body',
    title: 'Lower Body',
    subtitle: 'Quads, Hamstrings, Glutes & Core power',
    coverImage: '/workouts/lower-body.jpg',
    estimatedMinutes: 35,
    estimatedCalories: 140,
    exercises: [
      {
        exerciseId: 'barbell-squat',
        targetSets: 4,
        targetReps: 10,
        targetWeightKg: 70,
        sets: [
          { setNumber: 1, targetReps: 10, actualReps: 10, weightKg: 70, completed: false },
          { setNumber: 2, targetReps: 10, actualReps: 10, weightKg: 70, completed: false },
          { setNumber: 3, targetReps: 10, actualReps: 10, weightKg: 70, completed: false },
          { setNumber: 4, targetReps: 10, actualReps: 10, weightKg: 70, completed: false }
        ]
      },
      {
        exerciseId: 'barbell-deadlift',
        targetSets: 3,
        targetReps: 8,
        targetWeightKg: 80,
        sets: [
          { setNumber: 1, targetReps: 8, actualReps: 8, weightKg: 80, completed: false },
          { setNumber: 2, targetReps: 8, actualReps: 8, weightKg: 80, completed: false },
          { setNumber: 3, targetReps: 8, actualReps: 8, weightKg: 80, completed: false }
        ]
      }
    ]
  },
  {
    id: 'back-strength',
    title: 'Back & Strength',
    subtitle: 'Compound pulling, Lats & Posterior chain',
    coverImage: '/workouts/full-body.jpg',
    estimatedMinutes: 30,
    estimatedCalories: 120,
    exercises: [
      {
        exerciseId: 'pull-ups',
        targetSets: 3,
        targetReps: 8,
        targetWeightKg: 0,
        sets: [
          { setNumber: 1, targetReps: 8, actualReps: 8, weightKg: 0, completed: false },
          { setNumber: 2, targetReps: 8, actualReps: 8, weightKg: 0, completed: false },
          { setNumber: 3, targetReps: 8, actualReps: 8, weightKg: 0, completed: false }
        ]
      },
      {
        exerciseId: 'barbell-deadlift',
        targetSets: 3,
        targetReps: 6,
        targetWeightKg: 90,
        sets: [
          { setNumber: 1, targetReps: 6, actualReps: 6, weightKg: 90, completed: false },
          { setNumber: 2, targetReps: 6, actualReps: 6, weightKg: 90, completed: false },
          { setNumber: 3, targetReps: 6, actualReps: 6, weightKg: 90, completed: false }
        ]
      }
    ]
  }
];

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISE_LIBRARY.find((ex) => ex.id === id);
}

export function getRoutineCoverImage(routine: WorkoutRoutine): string {
  // 1. Primary rule: use the first exercise's image
  if (routine.exercises && routine.exercises.length > 0) {
    const firstExId = routine.exercises[0].exerciseId;
    const firstEx = getExerciseById(firstExId);
    if (firstEx?.thumbnailUrl) {
      return firstEx.thumbnailUrl;
    }
  }

  // 2. Fallbacks if routine has no exercises yet
  if (routine.coverImage) return routine.coverImage;
  const text = `${routine.id} ${routine.title} ${routine.subtitle || ''}`.toLowerCase();
  if (text.includes('lower') || text.includes('leg') || text.includes('squat')) {
    return '/workouts/lower-body.jpg';
  }
  if (text.includes('upper') || text.includes('chest') || text.includes('push') || text.includes('arm') || text.includes('dip') || text.includes('bench')) {
    return '/workouts/upper-body.jpg';
  }
  return '/workouts/full-body.jpg';
}
