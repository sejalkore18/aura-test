import { WorkoutLog, WorkoutRoutine } from '@/types/workout';

/**
 * Cloud Sync Service
 * Seamlessly syncs workout data between localStorage and MongoDB Atlas.
 * Works offline-first: UI always updates instantly; cloud requests run with fail-safe error handling.
 */

export async function checkDbStatus(): Promise<{
  connected: boolean;
  message?: string;
  needsCredentials?: boolean;
}> {
  try {
    const res = await fetch('/api/db-test', { cache: 'no-store' });
    const data = await res.json();
    return {
      connected: !!data.success,
      message: data.message || data.error,
      needsCredentials: data.needsCredentials,
    };
  } catch {
    return { connected: false, message: 'Network offline or unreachable' };
  }
}

export async function syncWorkoutLogToCloud(log: WorkoutLog): Promise<boolean> {
  try {
    const res = await fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('[SyncService] Failed to sync workout log to cloud:', err);
    return false;
  }
}

export async function syncBatchLogsToCloud(logs: WorkoutLog[]): Promise<boolean> {
  if (!logs.length) return true;
  try {
    const res = await fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logs),
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('[SyncService] Failed to batch sync workout logs to cloud:', err);
    return false;
  }
}

export async function fetchWorkoutLogsFromCloud(userId?: string): Promise<WorkoutLog[] | null> {
  try {
    const url = userId ? `/api/workouts?userId=${encodeURIComponent(userId)}` : '/api/workouts';
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    if (data.success && Array.isArray(data.logs)) {
      return data.logs as WorkoutLog[];
    }
    return null;
  } catch (err) {
    console.warn('[SyncService] Failed to fetch workout logs from cloud:', err);
    return null;
  }
}

export async function syncRoutinesToCloud(routines: WorkoutRoutine[]): Promise<boolean> {
  if (!routines.length) return true;
  try {
    const res = await fetch('/api/routines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(routines),
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('[SyncService] Failed to sync routines to cloud:', err);
    return false;
  }
}

export async function fetchRoutinesFromCloud(userId?: string): Promise<WorkoutRoutine[] | null> {
  try {
    const url = userId ? `/api/routines?userId=${encodeURIComponent(userId)}` : '/api/routines';
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    if (data.success && Array.isArray(data.routines)) {
      return data.routines as WorkoutRoutine[];
    }
    return null;
  } catch (err) {
    console.warn('[SyncService] Failed to fetch routines from cloud:', err);
    return null;
  }
}

export async function deleteWorkoutLogInCloud(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/workouts?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('[SyncService] Failed to delete workout log in cloud:', err);
    return false;
  }
}

export async function deleteRoutineInCloud(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/routines?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    return !!data.success;
  } catch (err) {
    console.warn('[SyncService] Failed to delete routine in cloud:', err);
    return false;
  }
}

