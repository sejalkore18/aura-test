import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  const start = Date.now();
  try {
    const mongooseInstance = await connectToDatabase();
    const readyState = mongooseInstance.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const stateMap = ['disconnected', 'connected', 'connecting', 'disconnecting'];

    const db = mongooseInstance.connection.db;
    let pingResult = null;
    if (db) {
      pingResult = await db.admin().ping();
    }

    const duration = Date.now() - start;

    return NextResponse.json({
      success: true,
      status: stateMap[readyState] || readyState,
      database: mongooseInstance.connection.name,
      host: mongooseInstance.connection.host,
      latencyMs: duration,
      ping: pingResult,
      message: 'Successfully connected to MongoDB Atlas!',
    });
  } catch (error: unknown) {
    const err = error as Error;
    const duration = Date.now() - start;
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Unknown database connection error',
        latencyMs: duration,
        needsCredentials:
          !process.env.MONGODB_URI || process.env.MONGODB_URI.includes('<db_username>'),
      },
      { status: 500 }
    );
  }
}
