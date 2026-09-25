import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import {
  SejalLogModel,
  BhaumikLogModel,
  getUserWorkoutLogModel,
} from '@/models/WorkoutLog';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (userId === 'sejal') {
      const logs = await SejalLogModel.find({})
        .sort({ createdAt: -1, date: -1 })
        .limit(limit)
        .lean();
      return NextResponse.json({ success: true, logs });
    }

    if (userId === 'bhaumik') {
      const logs = await BhaumikLogModel.find({})
        .sort({ createdAt: -1, date: -1 })
        .limit(limit)
        .lean();
      return NextResponse.json({ success: true, logs });
    }

    // If no specific userId, query both sejal_logs and bhaumik_logs and merge
    const [sejalLogs, bhaumikLogs] = await Promise.all([
      SejalLogModel.find({}).sort({ createdAt: -1, date: -1 }).limit(limit).lean(),
      BhaumikLogModel.find({}).sort({ createdAt: -1, date: -1 }).limit(limit).lean(),
    ]);

    const combined = [...sejalLogs, ...bhaumikLogs].sort((a, b) => {
      const timeA = new Date(a.date || (a as { createdAt?: Date }).createdAt || 0).getTime();
      const timeB = new Date(b.date || (b as { createdAt?: Date }).createdAt || 0).getTime();
      return timeB - timeA;
    });

    return NextResponse.json({ success: true, logs: combined.slice(0, limit) });
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
      const sejalOps = body
        .filter((l) => l.userId === 'sejal')
        .map((log) => ({
          updateOne: {
            filter: { id: log.id },
            update: { $set: log },
            upsert: true,
          },
        }));

      const bhaumikOps = body
        .filter((l) => l.userId === 'bhaumik')
        .map((log) => ({
          updateOne: {
            filter: { id: log.id },
            update: { $set: log },
            upsert: true,
          },
        }));

      await Promise.all([
        sejalOps.length ? SejalLogModel.bulkWrite(sejalOps) : null,
        bhaumikOps.length ? BhaumikLogModel.bulkWrite(bhaumikOps) : null,
      ]);

      return NextResponse.json({ success: true, count: body.length });
    }

    const log = body;
    if (!log.id || !log.userId) {
      return NextResponse.json(
        { success: false, error: 'Missing log id or userId' },
        { status: 400 }
      );
    }

    const userModel = getUserWorkoutLogModel(log.userId);
    const updated = await userModel.findOneAndUpdate(
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

    await Promise.all([
      SejalLogModel.deleteOne({ id }),
      BhaumikLogModel.deleteOne({ id }),
    ]);

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
