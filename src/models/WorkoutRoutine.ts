import mongoose, { Schema, Document, Model } from 'mongoose';
import { DayKey } from '@/types/workout';

export interface IRoutineExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  targetWeightKg: number;
  sets: number;
}

export interface IWorkoutRoutine extends Document {
  id: string;
  userId?: 'sejal' | 'bhaumik';
  title: string;
  estimatedMinutes: number;
  estimatedCalories?: number;
  exercises: IRoutineExercise[];
  coverImage?: string;
  scheduledDays?: DayKey[];
  createdAt: Date;
  updatedAt: Date;
}

const RoutineExerciseSchema = new Schema<IRoutineExercise>(
  {
    exerciseId: { type: String, required: true },
    targetSets: { type: Number, required: true },
    targetReps: { type: Number, required: true },
    targetWeightKg: { type: Number, required: true },
    sets: { type: Number, required: true },
  },
  { _id: false }
);

const WorkoutRoutineSchema = new Schema<IWorkoutRoutine>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, enum: ['sejal', 'bhaumik'], required: true, index: true },
    title: { type: String, required: true },
    estimatedMinutes: { type: Number, default: 25 },
    estimatedCalories: { type: Number },
    exercises: [RoutineExerciseSchema],
    coverImage: { type: String },
    scheduledDays: [{ type: String, enum: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] }],
  },
  {
    timestamps: true,
    collection: 'workout_templates',
  }
);

if (mongoose.models.WorkoutTemplate) {
  delete (mongoose.models as Record<string, unknown>).WorkoutTemplate;
}
if (mongoose.models.WorkoutRoutine) {
  delete (mongoose.models as Record<string, unknown>).WorkoutRoutine;
}

export const WorkoutTemplateModel: Model<IWorkoutRoutine> =
  mongoose.model<IWorkoutRoutine>('WorkoutTemplate', WorkoutRoutineSchema, 'workout_templates');

export const WorkoutRoutineModel: Model<IWorkoutRoutine> = WorkoutTemplateModel;

