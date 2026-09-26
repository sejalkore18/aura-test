'use client';

import React from 'react';
import { X, Calendar, Clock, Layers, Flame, Trash2 } from 'lucide-react';
import { WorkoutLog, UserProfile } from '@/types/workout';
import '@/styles/HistoryDrawer.css';

interface HistoryDrawerProps {
  logs: WorkoutLog[];
  activeUser: UserProfile;
  onClose: () => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  logs,
  activeUser,
  onClose,
  onClearHistory,
}) => {
  const userLogs = logs.filter((l) => !l.userId || l.userId === activeUser.id);
  const totalWorkouts = userLogs.length;

  const getLogVolume = (log: WorkoutLog) =>
    log.completedExercises?.reduce(
      (acc, ex) =>
        acc +
        (ex.sets?.reduce(
          (sAcc, s) => sAcc + (s.reps || 0) * (s.weightKg > 0 ? s.weightKg : 0),
          0
        ) || 0),
      0
    ) || 0;

  const getLogSets = (log: WorkoutLog) =>
    log.completedExercises?.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0) || 0;

  const formatLogDate = (log: WorkoutLog) => {
    if (log.createdAt) {
      try {
        const d = new Date(log.createdAt);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
        }
      } catch {
        // ignore
      }
    }
    return '';
  };

  const totalVolume = userLogs.reduce((acc, log) => acc + getLogVolume(log), 0);
  const totalMinutes = userLogs.reduce((acc, log) => acc + (log.durationMinutes || 0), 0);

  return (
    <div className="drawer-backdrop animate-fade-in" onClick={onClose}>
      <div className="drawer-panel animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div className="header-title-group">
            <span
              className="user-badge"
              style={{ backgroundColor: activeUser.avatarColor }}
            >
              {activeUser.initials}
            </span>
            <h2 className="header-title">{activeUser.name}&apos;s History & PRs</h2>
          </div>
          <button className="close-btn" onClick={onClose} title="Close History">
            <X size={20} />
          </button>
        </div>

        {/* Aggregate Stats */}
        <div className="stats-summary-bar">
          <div className="summary-stat">
            <span className="stat-number">{totalWorkouts}</span>
            <span className="stat-caption">Workouts</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-stat">
            <span className="stat-number">{Math.round(totalVolume)}</span>
            <span className="stat-caption">Total kg</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-stat">
            <span className="stat-number">{totalMinutes}</span>
            <span className="stat-caption">Total Mins</span>
          </div>
        </div>

        {/* Logs List */}
        <div className="logs-container">
          {userLogs.length === 0 ? (
            <div className="empty-state">
              <Calendar size={38} className="empty-icon" />
              <p className="empty-text">No workouts logged for {activeUser.name} yet.</p>
              <span className="empty-subtext">
                Start your first workout and your sets, reps, and volume will appear here!
              </span>
            </div>
          ) : (
            <div className="logs-list">
              {userLogs.map((log) => (
                <div key={log.id} className="log-card">
                  <div className="log-card-header">
                    <div>
                      <h3 className="log-title">{log.workoutTitle}</h3>
                      <span className="log-date">{formatLogDate(log)}</span>
                    </div>
                    <div className="log-duration-pill">
                      <Clock size={12} />
                      <span>{log.durationMinutes}m</span>
                    </div>
                  </div>

                  <div className="log-metrics-row">
                    <div className="metric-item">
                      <Layers size={13} />
                      <span>{getLogSets(log)} sets</span>
                    </div>
                    <div className="metric-item">
                      <Flame size={13} />
                      <span>{Math.round(getLogVolume(log))} kg lifted</span>
                    </div>
                  </div>

                  {log.completedExercises && log.completedExercises.length > 0 && (
                    <div className="log-exercises-tags">
                      {log.completedExercises.map((ex, idx) => (
                        <span key={idx} className="ex-tag">
                          {ex.name} ({ex.sets.length}s)
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {logs.length > 0 && (
          <div className="drawer-footer">
            <button className="clear-history-btn" onClick={onClearHistory}>
              <Trash2 size={14} />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
