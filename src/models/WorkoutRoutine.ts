import mongoose, { Schema, Document, Model } from 'mongoose';
import { DayKey } from '@/types/workout';

export interface IRoutineWorkoutSet {
  setNumber: number;
  targetReps: number;
  actualReps: number;
  weightKg: number;
  completed: boolean;
  completedAt?: string;
}

export interface IRoutineExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  targetWeightKg: number;
  sets: IRoutineWorkoutSet[];
}

export interface IWorkoutRoutine extends Document {
  id: string;
  userId?: 'sejal' | 'bhaumik' | 'shared';
  title: string;
  subtitle?: string;
  estimatedMinutes: number;
  estimatedCalories?: number;
  exercises: IRoutineExercise[];
  isCustom?: boolean;
  coverImage?: string;
  scheduledDays?: DayKey[];
  createdAt: Date;
  updatedAt: Date;
}

const RoutineWorkoutSetSchema = new Schema<IRoutineWorkoutSet>(
  {
    setNumber: { type: Number, required: true },
    targetReps: { type: Number, required: true },
    actualReps: { type: Number, required: true },
    weightKg: { type: Number, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: String },
  },
  { _id: false }
);

const RoutineExerciseSchema = new Schema<IRoutineExercise>(
  {
    exerciseId: { type: String, required: true },
    targetSets: { type: Number, required: true },
    targetReps: { type: Number, required: true },
    targetWeightKg: { type: Number, required: true },
    sets: [RoutineWorkoutSetSchema],
  },
  { _id: false }
);

const WorkoutRoutineSchema = new Schema<IWorkoutRoutine>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, enum: ['sejal', 'bhaumik', 'shared'], default: 'shared', index: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    estimatedMinutes: { type: Number, default: 25 },
    estimatedCalories: { type: Number },
    exercises: [RoutineExerciseSchema],
    isCustom: { type: Boolean, default: false },
    coverImage: { type: String },
    scheduledDays: [{ type: String, enum: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] }],
  },
  {
    timestamps: true,
    collection: 'workout_templates',
  }
);

export const WorkoutTemplateModel: Model<IWorkoutRoutine> =
  (mongoose.models.WorkoutTemplate as Model<IWorkoutRoutine>) ||
  mongoose.model<IWorkoutRoutine>('WorkoutTemplate', WorkoutRoutineSchema, 'workout_templates');

export const WorkoutRoutineModel: Model<IWorkoutRoutine> = WorkoutTemplateModel;

