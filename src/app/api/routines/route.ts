import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WorkoutRoutineModel } from '@/models/WorkoutRoutine';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const query: Record<string, unknown> = {};
    if (userId) {
      query.userId = userId;
    }

    const routines = await WorkoutRoutineModel.find(query).lean();
    return NextResponse.json({ success: true, routines });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

function sanitizeTemplateRoutine(routine: any) {
  return {
    ...routine,
    exercises: (routine.exercises || []).map((ex: any) => {
      const setCount =
        typeof ex.sets === 'number'
          ? ex.sets
          : Array.isArray(ex.sets)
          ? ex.sets.length
          : ex.targetSets || 3;
      return {
        exerciseId: ex.exerciseId,
        targetSets: ex.targetSets ?? setCount,
        targetReps: ex.targetReps ?? 10,
        targetWeightKg: ex.targetWeightKg ?? 0,
        sets: setCount,
      };
    }),
  };
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();

    if (Array.isArray(body)) {
      const operations = body.map((routine) => {
        const sanitized = sanitizeTemplateRoutine(routine);
        return {
          updateOne: {
            filter: { id: sanitized.id },
            update: { $set: sanitized, $unset: { subtitle: 1 as const, isCustom: 1 as const } },
            upsert: true,
          },
        };
      });
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

    const sanitized = sanitizeTemplateRoutine(routine);
    const updated = await WorkoutRoutineModel.findOneAndUpdate(
      { id: sanitized.id },
      { $set: sanitized, $unset: { subtitle: 1 as const, isCustom: 1 as const } },
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
