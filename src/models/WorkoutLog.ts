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
  routineId: string;
  routineTitle: string;
  date: string;
  isoDate?: string;
  durationMinutes: number;
  totalSets: number;
  totalReps: number;
  totalVolumeKg: number;
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

const WorkoutLogSchema = new Schema<IWorkoutLog>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, enum: ['sejal', 'bhaumik'], required: true, index: true },
    routineId: { type: String, required: true },
    routineTitle: { type: String, required: true },
    date: { type: String, required: true },
    isoDate: { type: String, index: true },
    durationMinutes: { type: Number, default: 0 },
    totalSets: { type: Number, default: 0 },
    totalReps: { type: Number, default: 0 },
    totalVolumeKg: { type: Number, default: 0 },
    completedExercises: [CompletedExerciseSchema],
  },
  {
    timestamps: true,
    collection: 'workout_logs',
  }
);

export const WorkoutLogModel: Model<IWorkoutLog> =
  (mongoose.models.WorkoutLog as Model<IWorkoutLog>) ||
  mongoose.model<IWorkoutLog>('WorkoutLog', WorkoutLogSchema, 'workout_logs');

