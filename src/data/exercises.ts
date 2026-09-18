import { Exercise, WorkoutRoutine } from '@/types/workout';

export const EXERCISE_LIBRARY: Exercise[] = [
  {
    id: 'push-ups',
    name: 'Push-Ups',
    category: 'chest',
    videoUrl: 'https://app.fitnessai.com/exercises/06621201-Push-up-m-Chest.mp4',
    thumbnailUrl: 'https://cdn.prod.website-files.com/5c34b1d990599d5d94b3e8d8/5fd18f5184f960283e73b767_06621201-Push-up-m-Chest.jpeg',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 0,
    equipment: 'Bodyweight',
    proTip: 'Keep your core braced tightly like a plank to avoid sagging your hips. Flare elbows at a 45-degree angle from your torso.',
    howTo: [
      'Start in a high plank position with your hands slightly wider than shoulder-width apart.',
      'Maintain a rigid straight line from your heels through your hips and neck.',
      'Lower your chest until it is an inch or two above the ground, inhaling as you descend.',
      'Exhale and push through your palms and chest to return to the starting position.'
    ],
    primaryMuscles: ['Chest (Pectoralis Major)', 'Anterior Deltoid'],
    secondaryMuscles: ['Triceps Brachii', 'Core (Abs)', 'Serratus Anterior'],
    variations: ['Decline Push-Up', 'Incline Push-Up', 'Diamond Push-Up', 'Shoulder Tap Push-Up']
  },
  {
    id: 'tricep-dips',
    name: 'Tricep Dips',
    category: 'triceps',
    videoUrl: 'https://app.fitnessai.com/exercises/13991201-Bench-dip-on-floor-Upper-Arms.mp4',
    thumbnailUrl: 'https://cdn.prod.website-files.com/5c34b1d990599d5d94b3e8d8/5fd18f727af476ef2789052e_13991201-Bench-dip-on-floor-Upper-Arms.jpeg',
    defaultSets: 3,
    defaultReps: 8,
    defaultWeightKg: 0,
    equipment: 'Bench or Floor',
    proTip: 'Keep your back and hips close to the bench to minimize anterior shoulder strain and maximize tricep isolation.',
    howTo: [
      'Sit on the edge of a flat bench with your hands gripping the edge beside your hips.',
      'Slide your butt off the front of the bench with your legs extended in front of you.',
      'Lower your body by bending your elbows until your upper arms are roughly parallel with the floor.',
      'Press firmly through your palms to lockout your elbows, squeezing the triceps at the top.'
    ],
    primaryMuscles: ['Triceps Brachii'],
    secondaryMuscles: ['Anterior Deltoids', 'Pectoralis Minor', 'Upper Back Stabilizers'],
    variations: ['Parallel Bar Dips', 'Weighted Dips', 'Chair Dips']
  },
  {
    id: 'bench-press',
    name: 'Bench Press',
    category: 'chest',
    videoUrl: 'https://app.fitnessai.com/exercises/00251201-Barbell-Bench-Press-Chest.mp4',
    thumbnailUrl: 'https://cdn.prod.website-files.com/5c34b1d990599d5d94b3e8d8/5fd18fd80f109d4ddac82337_00251201-Barbell-Bench-Press-Chest.jpeg',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 60,
    equipment: 'Barbell & Flat Bench',
    proTip: 'Tuck your shoulder blades back and down into the bench to establish a solid foundation before unracking.',
    howTo: [
      'Lie flat on the bench with eyes directly below the barbell. Plant your feet flat on the floor.',
      'Grip the bar slightly wider than shoulder-width with a firm overhand grip.',
      'Unrack the bar and stabilize it directly over your chest with locked arms.',
      'Inhale and lower the bar in a controlled path to your mid-chest.',
      'Exhale and press the bar explosively back to starting position.'
    ],
    primaryMuscles: ['Pectoralis Major (Mid & Lower Chest)'],
    secondaryMuscles: ['Anterior Deltoids', 'Triceps Brachii'],
    variations: ['Incline Barbell Bench Press', 'Dumbbell Bench Press', 'Close Grip Bench Press']
  },
  {
    id: 'dumbbell-bench',
    name: 'Dumbbell Bench',
    category: 'chest',
    videoUrl: 'https://app.fitnessai.com/exercises/02891201-Dumbbell-Bench-Press-Chest.mp4',
    thumbnailUrl: 'https://cdn.prod.website-files.com/5c34b1d990599d5d94b3e8d8/5fd18fd4f64b2814996e0d0d_02891201-Dumbbell-Bench-Press-Chest.jpeg',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 20,
    equipment: 'Dumbbells & Flat Bench',
    proTip: 'If you want to emphasize your triceps more, tuck your elbows in. Leave them flared out to focus more on your chest.',
    howTo: [
      'Lie flat on the bench so that your head, upper back, lower back, and both feet are firmly pressed against the bench and ground at all points while holding two dumbbells at shoulder level with an overhand grip.',
      'Exhale and push both of your hands up and towards each other.',
      'Exhale as you squeeze your chest and push the dumbbells up until your arms are fully extended.',
      'Continue pushing until your arms are fully extended and just before the dumbbells meet.',
      'Inhale and return the dumbbells back down to the starting position.'
    ],
    primaryMuscles: ['Chest (Pectoralis Major)', 'Lower Chest', 'Upper Chest'],
    secondaryMuscles: ['Front Shoulder (Anterior Deltoids)', 'Triceps Brachii'],
    variations: ['Incline Dumbbell Press', 'Decline Dumbbell Bench Press', 'Close Grip Dumbbell Bench Press']
  },
  {
    id: 'dumbbell-flyes',
    name: 'Dumbbell Flyes',
    category: 'chest',
    videoUrl: 'https://app.fitnessai.com/exercises/03081201-Dumbbell-Fly-Chest.mp4',
    thumbnailUrl: 'https://cdn.prod.website-files.com/5c34b1d990599d5d94b3e8d8/5fd18fc81f86be4a4ead3b88_03081201-Dumbbell-Fly-Chest.jpeg',
    defaultSets: 3,
    defaultReps: 12,
    defaultWeightKg: 14,
    equipment: 'Dumbbells & Flat Bench',
    proTip: 'Maintain a soft 15-degree bend in your elbows throughout the entire movement. Imagine hugging a large tree at the peak contraction.',
    howTo: [
      'Lie on a flat bench holding dumbbells above your chest with palms facing each other.',
      'Inhale and slowly lower the dumbbells in a wide arc out to your sides until feeling a deep stretch across your chest.',
      'Keep your elbows slightly bent and stationary; avoid turning the fly into a press.',
      'Exhale and bring the dumbbells back together over your chest along the same arc.'
    ],
    primaryMuscles: ['Sternal Head (Pectoralis Major)'],
    secondaryMuscles: ['Anterior Deltoids', 'Biceps Brachii (stabilizing)'],
    variations: ['Incline Dumbbell Fly', 'Cable Chest Fly', 'Pec Deck Machine Fly']
  },
  {
    id: 'chest-press-machine',
    name: 'Chest Press Machine',
    category: 'chest',
    videoUrl: 'https://app.fitnessai.com/exercises/21951201-Lever-Chest-Press-VERSION-3-Chest+.mp4',
    thumbnailUrl: 'https://cdn.prod.website-files.com/5c34b1d990599d5d94b3e8d8/5fd18f8ed8285b5d1251e7c1_21951201-Lever-Chest-Press-VERSION-3-Chest%2B.jpeg',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 45,
    equipment: 'Chest Press Machine',
    proTip: 'Grip the handles further apart to emphasize your chest more, or closer together to emphasize your triceps more.',
    howTo: [
      'Sit on the machine with your feet firmly planted on the ground and head pressed against the backrest.',
      'Hold the handles with an overhand grip at mid-chest level.',
      'Exhale and press your arms forward until fully extended without hyperextending elbows.',
      'Inhale and bring your arms back slowly, returning to the starting position.'
    ],
    primaryMuscles: ['Upper Chest', 'Lower Chest (Pectoralis Major)'],
    secondaryMuscles: ['Front Shoulder (Anterior Deltoid)', 'Outer & Lower Tricep'],
    variations: ['Incline Chest Press Machine', 'Cable Chest Press', 'Barbell Bench Press']
  },
  {
    id: 'chest-dips',
    name: 'Chest Dips',
    category: 'chest',
    videoUrl: 'https://app.fitnessai.com/exercises/14301201-Chest-Dip-on-dip-pull-up-cage-Chest.mp4',
    thumbnailUrl: 'https://cdn.prod.website-files.com/5c34b1d990599d5d94b3e8d8/5fd18f7584f9607b3d73b79a_14301201-Chest-Dip-on-dip-pull-up-cage-Chest.jpeg',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 0,
    equipment: 'Dip Bars / Cage',
    proTip: 'Lean your torso forward roughly 30 degrees to shift the workload directly to the lower and outer chest fibers.',
    howTo: [
      'Grip the parallel dip bars and push yourself up to the top lockout position.',
      'Lean your chest slightly forward and bend your knees or cross ankles.',
      'Lower yourself until your upper arms are at a 90-degree angle with your forearms.',
      'Drive powerfully through your palms and chest back to the top.'
    ],
    primaryMuscles: ['Lower Chest (Pectoralis Major)', 'Triceps Brachii'],
    secondaryMuscles: ['Anterior Deltoids', 'Rhomboids'],
    variations: ['Weighted Chest Dips', 'Assisted Dip Machine']
  },
  {
    id: 'pull-ups',
    name: 'Wide Grip Pull-Up',
    category: 'back',
    videoUrl: 'https://app.fitnessai.com/exercises/14291201-Wide-Grip-Pull-Up-Back.mp4',
    thumbnailUrl: 'https://cdn.prod.website-files.com/5c34b1d990599d5d94b3e8d8/5fd18f74bc63e80f23ea4030_14291201-Wide-Grip-Pull-Up-Back.jpeg',
    defaultSets: 3,
    defaultReps: 8,
    defaultWeightKg: 0,
    equipment: 'Pull-Up Bar',
    proTip: 'Initiate the movement by retracting and depressing your scapulae before your arms begin to bend.',
    howTo: [
      'Grasp the pull-up bar with an overhand grip wider than shoulder-width.',
      'Hang with arms fully extended and engage your core.',
      'Pull your chest upward toward the bar, driving your elbows down toward your hips.',
      'Hold at the top with chin clearing the bar, then lower with control.'
    ],
    primaryMuscles: ['Latissimus Dorsi (Lats)', 'Teres Major'],
    secondaryMuscles: ['Biceps Brachii', 'Brachialis', 'Lower Trapezius'],
    variations: ['Chin-Ups', 'Lat Pulldown', 'Neutral Grip Pull-Up']
  },
  {
    id: 'barbell-squat',
    name: 'Barbell Back Squat',
    category: 'legs',
    videoUrl: 'https://app.fitnessai.com/exercises/00431201-Barbell-Full-Squat-Thighs.mp4',
    thumbnailUrl: 'https://cdn.prod.website-files.com/5c34b1d990599d5d94b3e8d8/5fd18fec290231f045154ec6_00431201-Barbell-Full-Squat-Thighs.jpeg',
    defaultSets: 3,
    defaultReps: 10,
    defaultWeightKg: 70,
    equipment: 'Barbell & Squat Rack',
    proTip: 'Drive your knees slightly outward in line with your toes and maintain equal foot pressure through heel and midfoot.',
    howTo: [
      'Position the bar across your upper back/traps. Step back from the rack with feet shoulder-width apart.',
      'Inhale deeply into your abdomen to create intra-abdominal pressure.',
      'Hinge at hips and bend knees, lowering until thighs are at least parallel to floor.',
      'Drive powerfully through your feet to return to the standing position.'
    ],
    primaryMuscles: ['Quadriceps', 'Gluteus Maximus'],
    secondaryMuscles: ['Hamstrings', 'Core', 'Erector Spinae'],
    variations: ['Front Squat', 'Goblet Squat', 'Leg Press']
  },
  {
    id: 'barbell-deadlift',
    name: 'Barbell Deadlift',
    category: 'back',
    videoUrl: 'https://app.fitnessai.com/exercises/00321201-Barbell-Deadlift-Hips.mp4',
    thumbnailUrl: 'https://cdn.prod.website-files.com/5c34b1d990599d5d94b3e8d8/5fd18fedaf5dcc9042266aaf_00321201-Barbell-Deadlift-Hips.jpeg',
    defaultSets: 3,
    defaultReps: 6,
    defaultWeightKg: 90,
    equipment: 'Barbell & Plates',
    proTip: 'Drag the bar along your shins and thighs in a straight vertical line to prevent lower back strain.',
    howTo: [
      'Stand with feet hip-width apart, midfoot under the barbell.',
      'Bend over and grip the bar just outside your knees with a double overhand grip.',
      'Lower your hips, pull your chest up, and pull the slack out of the barbell.',
      'Drive the floor away with your legs to lift the bar, locking out with glutes at the top.'
    ],
    primaryMuscles: ['Hamstrings', 'Gluteus Maximus', 'Erector Spinae'],
    secondaryMuscles: ['Latissimus Dorsi', 'Trapezius', 'Forearms/Grip'],
    variations: ['Romanian Deadlift', 'Sumo Deadlift', 'Trap Bar Deadlift']
  },
  {
    id: 'dumbbell-lunge',
    name: 'Walking Lunges',
    category: 'legs',
    videoUrl: 'https://app.fitnessai.com/exercises/03361201-Dumbbell-Lunge-Thighs.mp4',
    thumbnailUrl: 'https://cdn.prod.website-files.com/5c34b1d990599d5d94b3e8d8/5fd18fc2af5dcc447a266a2f_03361201-Dumbbell-Lunge-Thighs.jpeg',
    defaultSets: 3,
    defaultReps: 15,
    defaultWeightKg: 10,
    equipment: 'Dumbbells / Bodyweight',
    proTip: 'Keep your chest tall and avoid letting your front knee track excessively past your front toe.',
    howTo: [
      'Stand upright with dumbbells held at your sides or hands on hips.',
      'Take a large, controlled step forward with your right leg.',
      'Lower your hips until both knees are bent at roughly a 90-degree angle.',
      'Push through your front heel to stand up and step directly into the next lunge.'
    ],
    primaryMuscles: ['Quadriceps', 'Gluteus Maximus'],
    secondaryMuscles: ['Hamstrings', 'Calves', 'Core Stabilizers'],
    variations: ['Reverse Lunges', 'Static Split Squat', 'Barbell Walking Lunge']
  }
];

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
