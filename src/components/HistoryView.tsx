'use client';

import React from 'react';
import { Calendar, Clock, Layers, Flame, Award, Dumbbell, Trash2 } from 'lucide-react';
import { WorkoutLog, UserProfile } from '@/types/workout';

interface HistoryViewProps {
  logs: WorkoutLog[];
  activeUser: UserProfile;
  onClearHistory: () => void;
  onGoToWorkouts: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  logs,
  activeUser,
  onClearHistory,
  onGoToWorkouts,
}) => {
  const userLogs = logs.filter((l) => !l.userId || l.userId === activeUser.id);
  const totalWorkouts = userLogs.length;
  const totalVolume = userLogs.reduce((acc, log) => acc + (log.totalVolumeKg || 0), 0);
  const totalMinutes = userLogs.reduce((acc, log) => acc + (log.durationMinutes || 0), 0);

  return (
    <div className="history-view animate-fade-in">
      {/* Header */}
      <header className="history-header">
        <div className="title-row">
          <span
            className="user-badge"
            style={{ backgroundColor: activeUser.avatarColor }}
          >
            {activeUser.initials}
          </span>
          <h1 className="history-title">{activeUser.name}&apos;s Activity</h1>
        </div>
        <p className="history-subtitle">Track your logged sessions, volume, and progress</p>
      </header>

      {/* Aggregate Stats */}
      <div className="stats-bar">
        <div className="stat-col">
          <span className="stat-number">{totalWorkouts}</span>
          <span className="stat-label">Workouts</span>
        </div>
        <div className="divider" />
        <div className="stat-col">
          <span className="stat-number">{Math.round(totalVolume)}</span>
          <span className="stat-label">Total kg</span>
        </div>
        <div className="divider" />
        <div className="stat-col">
          <span className="stat-number">{totalMinutes}</span>
          <span className="stat-label">Minutes</span>
        </div>
      </div>

      {/* Logs List */}
      <div className="logs-container">
        {userLogs.length === 0 ? (
          <div className="empty-state">
            <Calendar size={44} className="empty-icon" />
            <h2 className="empty-title">No Workouts Yet</h2>
            <p className="empty-subtext">
              Complete your daily workout to log sets, reps, and volume for {activeUser.name}.
            </p>
            <button className="btn-primary-pill start-btn" onClick={onGoToWorkouts}>
              <Dumbbell size={16} />
              <span>Go to Workouts</span>
            </button>
          </div>
        ) : (
          <div className="logs-list">
            {userLogs.map((log) => (
              <div key={log.id} className="log-card">
                <div className="log-top-row">
                  <div>
                    <h3 className="log-routine-name">{log.routineTitle}</h3>
                    <span className="log-date">{log.date}</span>
                  </div>
                  <div className="duration-pill">
                    <Clock size={12} />
                    <span>{log.durationMinutes}m</span>
                  </div>
                </div>

                <div className="metrics-row">
                  <div className="metric-chip">
                    <Layers size={13} />
                    <span>{log.totalSets} sets</span>
                  </div>
                  <div className="metric-chip">
                    <Flame size={13} className="text-orange" />
                    <span>{Math.round(log.totalVolumeKg)} kg volume</span>
                  </div>
                </div>

                {log.completedExercises && log.completedExercises.length > 0 && (
                  <div className="exercises-chips">
                    {log.completedExercises.map((ex, idx) => (
                      <span key={idx} className="exercise-chip">
                        {ex.name} ({ex.sets.length}s)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button className="clear-btn" onClick={onClearHistory}>
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .history-view {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 22px 20px 24px;
          color: #ffffff;
          overflow-y: auto;
        }

        .history-header {
          margin-bottom: 16px;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-badge {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 800;
          color: #ffffff;
        }

        .history-title {
          font-size: 1.65rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.02em;
        }

        .history-subtitle {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        .stats-bar {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 14px 20px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-md);
          margin-bottom: 18px;
        }

        .stat-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .stat-number {
          font-family: var(--font-display);
          font-size: 1.45rem;
          font-weight: 700;
          color: #ffffff;
        }

        .stat-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .divider {
          width: 1px;
          height: 26px;
          background: rgba(255, 255, 255, 0.1);
        }

        .logs-container {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          flex: 1;
          gap: 10px;
          padding: 40px 20px;
        }

        :global(.empty-icon) {
          color: var(--text-muted);
          opacity: 0.5;
          margin-bottom: 6px;
        }

        .empty-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #ffffff;
        }

        .empty-subtext {
          font-size: 0.86rem;
          color: var(--text-secondary);
          line-height: 1.45;
          max-width: 280px;
          margin-bottom: 14px;
        }

        .start-btn {
          font-size: 0.9rem;
          padding: 12px 24px;
          width: auto;
        }

        .logs-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .log-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: var(--radius-md);
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .log-top-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .log-routine-name {
          font-size: 1.02rem;
          font-weight: 700;
          color: #ffffff;
        }

        .log-date {
          font-size: 0.76rem;
          color: var(--text-muted);
        }

        .duration-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(255, 255, 255, 0.08);
          padding: 4px 9px;
          border-radius: var(--radius-pill);
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .metrics-row {
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 0.82rem;
        }

        .metric-chip {
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--text-secondary);
        }

        .text-orange {
          color: var(--accent-orange);
        }

        .exercises-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .exercise-chip {
          font-size: 0.72rem;
          padding: 2px 8px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 4px;
          color: var(--text-secondary);
        }

        .clear-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: var(--accent-red);
          font-size: 0.8rem;
          padding: 12px;
          border-radius: var(--radius-pill);
          background: rgba(255, 69, 58, 0.08);
          margin-top: 10px;
        }

        .clear-btn:hover {
          background: rgba(255, 69, 58, 0.16);
        }
      `}</style>
    </div>
  );
};
