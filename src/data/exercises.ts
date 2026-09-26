import { Exercise, WorkoutRoutine } from '@/types/workout';
import { EXERCISE_LIBRARY } from '@/data/exerciseLibrary';
export { EXERCISE_LIBRARY } from '@/data/exerciseLibrary';

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
  return routine.coverImage || EXERCISE_LIBRARY[0]?.thumbnailUrl || '';
}
