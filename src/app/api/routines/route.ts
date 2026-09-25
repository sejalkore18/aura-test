import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WorkoutRoutineModel } from '@/models/WorkoutRoutine';
import { DEFAULT_ROUTINES } from '@/data/exercises';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const query: Record<string, unknown> = {};
    if (userId) {
      query.$or = [{ userId }, { userId: 'shared' }, { userId: { $exists: false } }];
    }

    let routines = await WorkoutRoutineModel.find(query).lean();

    // If the database has no routines yet, seed default templates to MongoDB
    if (routines.length === 0) {
      const defaultDocs = DEFAULT_ROUTINES.map((r) => ({ ...r, userId: 'shared' }));
      await WorkoutRoutineModel.insertMany(defaultDocs);
      routines = await WorkoutRoutineModel.find(query).lean();
    }

    return NextResponse.json({ success: true, routines });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (Array.isArray(body)) {
      const operations = body.map((routine) => ({
        updateOne: {
          filter: { id: routine.id },
          update: { $set: routine },
          upsert: true,
        },
      }));
      const result = await WorkoutRoutineModel.bulkWrite(operations);
      return NextResponse.json({
        success: true,
        count: result.upsertedCount + result.modifiedCount,
      });
    }

    const routine = body;
    if (!routine.id || !routine.title) {
      return NextResponse.json(
        { success: false, error: 'Missing routine id or title' },
        { status: 400 }
      );
    }

    const updated = await WorkoutRoutineModel.findOneAndUpdate(
      { id: routine.id },
      { $set: routine },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, routine: updated });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing routine id' }, { status: 400 });
    }

    await WorkoutRoutineModel.deleteOne({ id });
    return NextResponse.json({ success: true, message: 'Deleted routine successfully' });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
