import { WorkoutLog } from '@/types/workout';

export const INITIAL_WORKOUT_LOGS: WorkoutLog[] = [
  // Bhaumik's logs
  {
    id: 'log_bhaumik_1',
    userId: 'bhaumik',
    routineId: 'machine_dips',
    routineTitle: "Machine & Dips Day",
    date: 'Sep 17, 2026',
    isoDate: '2026-09-17',
    durationMinutes: 32,
    totalSets: 9,
    totalReps: 58,
    totalVolumeKg: 1850,
    completedExercises: [
      {
        name: 'Parallel Bar Dips',
        sets: [
          { reps: 12, weightKg: 0 },
          { reps: 10, weightKg: 0 },
          { reps: 8, weightKg: 0 },
        ],
      },
      {
        name: 'Incline Machine Press',
        sets: [
          { reps: 10, weightKg: 60 },
          { reps: 10, weightKg: 65 },
          { reps: 8, weightKg: 70 },
        ],
      },
      {
        name: 'Cable Tricep Pushdown',
        sets: [
          { reps: 12, weightKg: 25 },
          { reps: 10, weightKg: 30 },
          { reps: 8, weightKg: 35 },
        ],
      },
    ],
  },
  {
    id: 'log_bhaumik_2',
    userId: 'bhaumik',
    routineId: 'back_strength',
    routineTitle: "Back & Strength Day",
    date: 'Sep 15, 2026',
    isoDate: '2026-09-15',
    durationMinutes: 38,
    totalSets: 10,
    totalReps: 72,
    totalVolumeKg: 2400,
    completedExercises: [
      {
        name: 'Wide-Grip Pull-Up',
        sets: [
          { reps: 10, weightKg: 0 },
          { reps: 8, weightKg: 0 },
          { reps: 7, weightKg: 0 },
        ],
      },
      {
        name: 'Barbell Bent-Over Row',
        sets: [
          { reps: 10, weightKg: 60 },
          { reps: 10, weightKg: 65 },
          { reps: 8, weightKg: 70 },
        ],
      },
      {
        name: 'Dumbbell Hammer Curl',
        sets: [
          { reps: 12, weightKg: 16 },
          { reps: 10, weightKg: 18 },
          { reps: 10, weightKg: 18 },
        ],
      },
    ],
  },
  {
    id: 'log_bhaumik_3',
    userId: 'bhaumik',
    routineId: 'chest_triceps',
    routineTitle: "Chest & Triceps Day",
    date: 'Sep 14, 2026',
    isoDate: '2026-09-14',
    durationMinutes: 30,
    totalSets: 9,
    totalReps: 60,
    totalVolumeKg: 2100,
    completedExercises: [
      {
        name: 'Push-ups',
        sets: [
          { reps: 15, weightKg: 0 },
          { reps: 15, weightKg: 0 },
          { reps: 12, weightKg: 0 },
        ],
      },
      {
        name: 'Barbell Bench Press',
        sets: [
          { reps: 8, weightKg: 70 },
          { reps: 8, weightKg: 75 },
          { reps: 6, weightKg: 80 },
        ],
      },
    ],
  },
  {
    id: 'log_bhaumik_4',
    userId: 'bhaumik',
    routineId: 'legs_core',
    routineTitle: "Legs & Core Blaster",
    date: 'Sep 12, 2026',
    isoDate: '2026-09-12',
    durationMinutes: 42,
    totalSets: 12,
    totalReps: 84,
    totalVolumeKg: 2800,
    completedExercises: [
      {
        name: 'Barbell Back Squat',
        sets: [
          { reps: 10, weightKg: 80 },
          { reps: 8, weightKg: 90 },
          { reps: 6, weightKg: 100 },
        ],
      },
      {
        name: 'Standing Calf Raise',
        sets: [
          { reps: 15, weightKg: 40 },
          { reps: 15, weightKg: 50 },
          { reps: 15, weightKg: 50 },
        ],
      },
    ],
  },

  // Sejal's logs
  {
    id: 'log_sejal_1',
    userId: 'sejal',
    routineId: 'lower_body',
    routineTitle: "Lower Body Burn",
    date: 'Sep 15, 2026',
    isoDate: '2026-09-15',
    durationMinutes: 35,
    totalSets: 10,
    totalReps: 90,
    totalVolumeKg: 1600,
    completedExercises: [
      {
        name: 'Barbell Back Squat',
        sets: [
          { reps: 12, weightKg: 40 },
          { reps: 10, weightKg: 45 },
          { reps: 10, weightKg: 50 },
        ],
      },
      {
        name: 'Dumbbell Walking Lunge',
        sets: [
          { reps: 12, weightKg: 12 },
          { reps: 12, weightKg: 12 },
          { reps: 10, weightKg: 14 },
        ],
      },
    ],
  },
  {
    id: 'log_sejal_2',
    userId: 'sejal',
    routineId: 'core_mobility',
    routineTitle: "Core & Mobility",
    date: 'Sep 14, 2026',
    isoDate: '2026-09-14',
    durationMinutes: 25,
    totalSets: 8,
    totalReps: 80,
    totalVolumeKg: 950,
    completedExercises: [
      {
        name: 'Plank',
        sets: [
          { reps: 60, weightKg: 0 },
          { reps: 60, weightKg: 0 },
        ],
      },
      {
        name: 'Hanging Leg Raise',
        sets: [
          { reps: 12, weightKg: 0 },
          { reps: 10, weightKg: 0 },
          { reps: 10, weightKg: 0 },
        ],
      },
    ],
  },
  {
    id: 'log_sejal_3',
    userId: 'sejal',
    routineId: 'upper_body',
    routineTitle: "Upper Body Sculpt",
    date: 'Sep 12, 2026',
    isoDate: '2026-09-12',
    durationMinutes: 30,
    totalSets: 9,
    totalReps: 70,
    totalVolumeKg: 1400,
    completedExercises: [
      {
        name: 'Push-ups',
        sets: [
          { reps: 12, weightKg: 0 },
          { reps: 10, weightKg: 0 },
          { reps: 10, weightKg: 0 },
        ],
      },
      {
        name: 'Dumbbell Shoulder Press',
        sets: [
          { reps: 10, weightKg: 12 },
          { reps: 10, weightKg: 14 },
          { reps: 8, weightKg: 14 },
        ],
      },
    ],
  },
];
