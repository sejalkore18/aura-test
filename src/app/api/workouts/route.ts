import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WorkoutLogModel } from '@/models/WorkoutLog';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const query: Record<string, unknown> = {};
    if (userId && (userId === 'sejal' || userId === 'bhaumik')) {
      query.userId = userId;
    }

    const logs = await WorkoutLogModel.find(query)
      .sort({ createdAt: -1, date: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, logs });
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

    // Check if it's a batch sync or a single log
    if (Array.isArray(body)) {
      const operations = body.map((log) => ({
        updateOne: {
          filter: { id: log.id },
          update: { $set: log },
          upsert: true,
        },
      }));
      const result = await WorkoutLogModel.bulkWrite(operations);
      return NextResponse.json({ success: true, count: result.upsertedCount + result.modifiedCount });
    }

    const log = body;
    if (!log.id || !log.userId) {
      return NextResponse.json(
        { success: false, error: 'Missing log id or userId' },
        { status: 400 }
      );
    }

    const updated = await WorkoutLogModel.findOneAndUpdate(
      { id: log.id },
      { $set: log },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, log: updated });
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
      return NextResponse.json({ success: false, error: 'Missing log id' }, { status: 400 });
    }

    await WorkoutLogModel.deleteOne({ id });
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
