'use client';

import React from 'react';
import { X, Calendar, Clock, Layers, Flame, Trash2, Award } from 'lucide-react';
import { WorkoutLog, UserProfile } from '@/types/workout';

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
  const totalVolume = userLogs.reduce((acc, log) => acc + (log.totalVolumeKg || 0), 0);
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
                      <h3 className="log-title">{log.routineTitle}</h3>
                      <span className="log-date">{log.date}</span>
                    </div>
                    <div className="log-duration-pill">
                      <Clock size={12} />
                      <span>{log.durationMinutes}m</span>
                    </div>
                  </div>

                  <div className="log-metrics-row">
                    <div className="metric-item">
                      <Layers size={13} />
                      <span>{log.totalSets} sets</span>
                    </div>
                    <div className="metric-item">
                      <Flame size={13} />
                      <span>{Math.round(log.totalVolumeKg)} kg lifted</span>
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

      <style jsx>{`
        .drawer-backdrop {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }

        .drawer-panel {
          width: 100%;
          max-width: 440px;
          height: 85vh;
          max-height: 750px;
          background: #141418;
          border-top: 1px solid var(--border-active);
          border-left: 1px solid var(--border-subtle);
          border-right: 1px solid var(--border-subtle);
          border-top-left-radius: 28px;
          border-top-right-radius: 28px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 -20px 50px rgba(0, 0, 0, 0.9);
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px;
          border-bottom: 1px solid var(--border-subtle);
        }

        .header-title-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .header-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #ffffff;
        }

        .user-badge {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 800;
          color: #ffffff;
        }

        .close-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: rgba(255, 255, 255, 0.16);
        }

        .stats-summary-bar {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 14px 20px;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid var(--border-subtle);
        }

        .summary-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }

        .stat-number {
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 700;
          color: #ffffff;
        }

        .stat-caption {
          font-size: 0.72rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .summary-divider {
          width: 1px;
          height: 24px;
          background: rgba(255, 255, 255, 0.1);
        }

        .logs-container {
          flex: 1;
          overflow-y: auto;
          padding: 16px 20px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          height: 100%;
          gap: 10px;
          padding: 40px 20px;
        }

        :global(.empty-icon) {
          color: var(--text-muted);
          opacity: 0.6;
        }

        .empty-text {
          font-size: 1.05rem;
          font-weight: 600;
          color: #ffffff;
        }

        .empty-subtext {
          font-size: 0.84rem;
          color: var(--text-muted);
          line-height: 1.4;
          max-width: 260px;
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

        .log-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .log-title {
          font-size: 0.98rem;
          font-weight: 700;
          color: #ffffff;
        }

        .log-date {
          font-size: 0.74rem;
          color: var(--text-muted);
        }

        .log-duration-pill {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(255, 255, 255, 0.08);
          padding: 3px 8px;
          border-radius: var(--radius-pill);
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        .log-metrics-row {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .metric-item {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .log-exercises-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 2px;
        }

        .ex-tag {
          font-size: 0.72rem;
          padding: 2px 7px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 4px;
          color: var(--text-secondary);
        }

        .drawer-footer {
          padding: 12px 20px;
          border-top: 1px solid var(--border-subtle);
          display: flex;
          justify-content: center;
        }

        .clear-history-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--accent-red);
          font-size: 0.8rem;
          padding: 8px 14px;
          border-radius: var(--radius-pill);
          background: rgba(255, 69, 58, 0.1);
        }

        .clear-history-btn:hover {
          background: rgba(255, 69, 58, 0.2);
        }
      `}</style>
    </div>
  );
};
