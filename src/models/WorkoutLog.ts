import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWorkoutLogSet {
  reps: number;
  weightKg: number;
}

export interface ICompletedExercise {
  name: string;
  sets: IWorkoutLogSet[];
}

export interface IWorkoutLog extends Document {
  id: string;
  userId: 'sejal' | 'bhaumik';
  workoutId: string;
  workoutTitle: string;
  durationMinutes: number;
  completedExercises: ICompletedExercise[];
  createdAt: Date;
  updatedAt: Date;
}

const SetSchema = new Schema<IWorkoutLogSet>(
  {
    reps: { type: Number, required: true },
    weightKg: { type: Number, required: true },
  },
  { _id: false }
);

const CompletedExerciseSchema = new Schema<ICompletedExercise>(
  {
    name: { type: String, required: true },
    sets: [SetSchema],
  },
  { _id: false }
);

export const WorkoutLogSchema = new Schema<IWorkoutLog>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, enum: ['sejal', 'bhaumik'], required: true, index: true },
    workoutId: { type: String, required: true },
    workoutTitle: { type: String, required: true },
    durationMinutes: { type: Number, default: 0 },
    completedExercises: [CompletedExerciseSchema],
  },
  {
    timestamps: true,
  }
);

// Sejal's workouts collection: sejal_logs
export const SejalLogModel: Model<IWorkoutLog> =
  (mongoose.models.SejalLog as Model<IWorkoutLog>) ||
  mongoose.model<IWorkoutLog>('SejalLog', WorkoutLogSchema, 'sejal_logs');

// Bhaumik's workouts collection: bhaumik_logs
export const BhaumikLogModel: Model<IWorkoutLog> =
  (mongoose.models.BhaumikLog as Model<IWorkoutLog>) ||
  mongoose.model<IWorkoutLog>('BhaumikLog', WorkoutLogSchema, 'bhaumik_logs');

// Default / fallback to user model
export const WorkoutLogModel: Model<IWorkoutLog> = SejalLogModel;

export function getUserWorkoutLogModel(userId?: string | null): Model<IWorkoutLog> {
  if (userId === 'bhaumik') return BhaumikLogModel;
  return SejalLogModel;
}
