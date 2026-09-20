'use client';

import React, { useState, useMemo } from 'react';
import { Clock, Layers, Dumbbell, Trash2, Moon, Calendar as CalendarIcon } from 'lucide-react';
import { WorkoutLog, UserProfile } from '@/types/workout';
import { CalendarStrip } from '@/components/CalendarStrip';

interface HistoryViewProps {
  logs: WorkoutLog[];
  activeUser: UserProfile;
  onClearHistory: () => void;
  onGoToWorkouts: () => void;
}

// Toned-down, sophisticated accent colors from DashboardView
const getRoutineAccent = (title: string): string => {
  const lower = title.toLowerCase();
  if (lower.includes('chest') || lower.includes('push') || lower.includes('hiit')) {
    return 'rgba(234, 88, 12, 0.65)'; // Muted warm terracotta (from dashboard)
  }
  if (lower.includes('dip') || lower.includes('machine') || lower.includes('arm') || lower.includes('upper')) {
    return 'rgba(20, 184, 166, 0.65)'; // Muted sage teal (from dashboard)
  }
  if (lower.includes('leg') || lower.includes('squat') || lower.includes('lower')) {
    return 'rgba(234, 88, 12, 0.65)'; // Muted warm terracotta (from dashboard)
  }
  return 'rgba(99, 102, 241, 0.65)'; // Muted slate indigo (from dashboard)
};

const getChipDotColor = (idx: number): string => {
  const colors = [
    'rgba(234, 88, 12, 0.65)',
    'rgba(20, 184, 166, 0.65)',
    'rgba(99, 102, 241, 0.65)',
  ];
  return colors[idx % colors.length];
};

export const HistoryView: React.FC<HistoryViewProps> = ({
  logs,
  activeUser,
  onClearHistory,
  onGoToWorkouts,
}) => {
  const userLogs = useMemo(() => {
    return logs.filter((l) => !l.userId || l.userId === activeUser.id);
  }, [logs, activeUser.id]);

  // Helper to format ISO YYYY-MM-DD
  const todayIso = useMemo(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Selected date defaults to today
  const [selectedDate, setSelectedDate] = useState<string | null>(todayIso);

  // Build a Set of dates that have workouts for the active user
  const workoutDates = useMemo(() => {
    const dates = new Set<string>();
    userLogs.forEach((log) => {
      if (log.isoDate) {
        dates.add(log.isoDate);
      } else {
        try {
          const d = new Date(log.date);
          if (!isNaN(d.getTime())) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            dates.add(`${y}-${m}-${day}`);
          }
        } catch {
          // ignore
        }
      }
    });
    return dates;
  }, [userLogs]);

  // Filter logs for the selected date (or all if selectedDate is null)
  const displayedLogs = useMemo(() => {
    if (!selectedDate) return userLogs;
    return userLogs.filter((log) => {
      if (log.isoDate) return log.isoDate === selectedDate;
      try {
        const d = new Date(log.date);
        if (!isNaN(d.getTime())) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}` === selectedDate;
        }
      } catch {
        // ignore
      }
      return false;
    });
  }, [userLogs, selectedDate]);

  // Aggregate Stats
  const totalWorkouts = userLogs.length;
  const totalMinutes = userLogs.reduce((acc, log) => acc + (log.durationMinutes || 0), 0);


  return (
    <div className="history-view animate-fade-in">
      {/* 1. Interactive Calendar Date Strip */}
      <CalendarStrip
        workoutDates={workoutDates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* 3. Aggregate Stats Bar */}
      <div className="stats-bar">
        <div className="stat-col">
          <span className="stat-number">{totalWorkouts}</span>
          <div className="stat-label-group">
            <span className="stat-accent-dot dot-teal" />
            <span className="stat-label">Workouts</span>
          </div>
        </div>
        <div className="divider" />
        <div className="stat-col">
          <span className="stat-number">{totalMinutes}</span>
          <div className="stat-label-group">
            <span className="stat-accent-dot dot-terracotta" />
            <span className="stat-label">Time</span>
          </div>
        </div>
      </div>

      {/* 4. Workout Logs Timeline */}
      <div className="logs-container">
        <div key={selectedDate || 'all'} className="logs-animated-content">
          {displayedLogs.length === 0 ? (
            selectedDate ? (
            /* Empty state for specific selected day: Rest Day */
            <div className="rest-day-card">
              <div className="rest-day-icon-circle">
                <Moon size={24} className="moon-icon" />
              </div>
              <h3 className="rest-day-title">Rest Day</h3>
              <p className="rest-day-subtext">
                No workouts were logged on this date.
              </p>
              <div className="rest-day-actions">
                <button
                  className="rest-action-secondary"
                  onClick={() => setSelectedDate(null)}
                >
                  View All History
                </button>
                <button className="rest-action-primary" onClick={onGoToWorkouts}>
                  <Dumbbell size={14} className="rest-dumbbell-icon" />
                  <span>Start Workout</span>
                </button>
              </div>
            </div>
          ) : (
            /* Global empty state when no workouts exist at all */
            <div className="empty-state">
              <CalendarIcon size={44} className="empty-icon" />
              <h2 className="empty-title">No Workouts Yet</h2>
              <p className="empty-subtext">
                Complete your daily workout to log sets, reps, and volume for {activeUser.name}.
              </p>
              <button className="btn-primary-pill start-btn" onClick={onGoToWorkouts}>
                <Dumbbell size={16} />
                <span>Go to Workouts</span>
              </button>
            </div>
          )
        ) : (
          /* List of workouts on selected date or all */
          <div className="logs-list">
            {displayedLogs.map((log) => (
              <div key={log.id} className="log-card">
                <div className="log-top-row">
                  <div className="log-title-group">
                    <span
                      className="routine-indicator-pill"
                      style={{ backgroundColor: getRoutineAccent(log.routineTitle) }}
                    />
                    <div>
                      <h3 className="log-routine-name">{log.routineTitle}</h3>
                      <span className="log-date">{log.date}</span>
                    </div>
                  </div>
                  <div className="duration-pill">
                    <Clock size={12} className="duration-clock-icon" />
                    <span>{log.durationMinutes}m</span>
                  </div>
                </div>

                <div className="metrics-row">
                  <div className="metric-chip">
                    <Layers size={13} className="metric-icon-cyan" />
                    <span>{log.totalSets} sets</span>
                  </div>
                </div>

                {log.completedExercises && log.completedExercises.length > 0 && (
                  <div className="exercises-chips">
                    {log.completedExercises.map((ex, idx) => (
                      <span key={idx} className="exercise-chip">
                        <span
                          className="exercise-chip-dot"
                          style={{ backgroundColor: getChipDotColor(idx) }}
                        />
                        {ex.name} ({ex.sets.length}s)
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {userLogs.length > 0 && (
              <button className="clear-btn" onClick={onClearHistory}>
                <Trash2 size={14} />
                <span>Clear History</span>
              </button>
            )}
          </div>
        )}
        </div>
      </div>

      <style jsx>{`
        .history-view {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 16px 20px 32px;
          background-color: var(--bg-primary, #08080a);
          color: var(--text-primary, #e4e4e7);
          min-height: 100%;
          font-family: var(--font-body);
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .history-view::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        /* 3. Aggregate Stats Bar */
        .stats-bar {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 16px 20px;
          background: rgba(22, 22, 28, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 26px;
          margin-bottom: 20px;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05);
        }

        .stat-col {
          flex: 1 1 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 4px;
        }

        .stat-label-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .stat-accent-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .dot-teal {
          background: rgba(20, 184, 166, 0.65);
        }

        .dot-terracotta {
          background: rgba(234, 88, 12, 0.65);
        }

        .stat-number {
          font-family: var(--font-display);
          font-size: 1.38rem;
          font-weight: 800;
          color: #e4e4e7;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .stat-label {
          font-size: 0.72rem;
          color: var(--text-secondary, #9a9aa2);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          font-weight: 600;
        }

        .divider {
          width: 1px;
          height: 28px;
          background: rgba(255, 255, 255, 0.1);
        }

        /* 4. Logs Timeline */
        .logs-container {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        @keyframes dateContentSlideFade {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .logs-animated-content {
          display: flex;
          flex-direction: column;
          flex: 1;
          animation: dateContentSlideFade 0.42s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }


        /* Rest Day Card (Selected day with 0 logs) */
        .rest-day-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 36px 20px 30px;
          background: rgba(22, 22, 28, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 26px;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05);
          gap: 10px;
        }

        .rest-day-icon-circle {
          width: 52px;
          height: 52px;
          border-radius: 18px;
          background: rgba(99, 102, 241, 0.12);
          border: 1px solid rgba(99, 102, 241, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #818cf8;
          margin-bottom: 2px;
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }

        :global(.moon-icon) {
          color: #818cf8;
        }

        :global(.rest-dumbbell-icon) {
          color: #0a84ff;
        }

        .rest-day-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
          color: #e4e4e7;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .rest-day-subtext {
          font-size: 0.84rem;
          color: var(--text-secondary, #9a9aa2);
          margin: 0;
          line-height: 1.4;
          max-width: 240px;
        }

        .rest-day-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
        }

        .rest-action-secondary {
          padding: 8px 16px;
          border-radius: 9999px;
          background: rgba(22, 22, 28, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #e4e4e7;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .rest-action-secondary:hover {
          background: rgba(30, 30, 38, 0.85);
          border-color: rgba(255, 255, 255, 0.18);
        }

        .rest-action-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          border-radius: 9999px;
          background: #e4e4e7;
          color: #09090b;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.18s ease;
          box-shadow: none;
        }

        .rest-action-primary:hover {
          background: #e4e4e7;
          transform: translateY(-1px);
          box-shadow: none;
        }

        /* General Empty State */
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
          color: var(--text-secondary, #9a9aa2);
          opacity: 0.5;
          margin-bottom: 6px;
        }

        .empty-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: #e4e4e7;
        }

        .empty-subtext {
          font-size: 0.86rem;
          color: var(--text-secondary, #9a9aa2);
          line-height: 1.45;
          max-width: 280px;
          margin-bottom: 14px;
        }

        .start-btn {
          font-size: 0.9rem;
          padding: 12px 24px;
          width: auto;
        }

        /* Logs List */
        .logs-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .log-card {
          background: rgba(22, 22, 28, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 26px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05);
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .log-card:hover {
          transform: translateY(-2px);
          background: rgba(30, 30, 38, 0.85);
          border-color: rgba(255, 255, 255, 0.18);
          box-shadow: 0 14px 34px -8px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.08);
        }

        .log-top-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .log-title-group {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          flex: 1;
        }

        .routine-indicator-pill {
          width: 3.5px;
          height: 22px;
          border-radius: 9999px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .log-routine-name {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 700;
          color: #e4e4e7;
          margin: 0;
          letter-spacing: -0.01em;
          line-height: 1.25;
        }

        .log-date {
          font-size: 0.76rem;
          color: var(--text-secondary, #9a9aa2);
          margin-top: 3px;
          display: block;
        }

        .duration-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 4px 10px;
          border-radius: 9999px;
          font-size: 0.76rem;
          font-weight: 600;
          color: #e4e4e7;
          flex-shrink: 0;
        }

        :global(.duration-clock-icon) {
          color: var(--text-secondary, #9a9aa2);
        }

        .metrics-row {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 0.82rem;
        }

        .metric-chip {
          display: flex;
          align-items: center;
          gap: 5px;
          color: var(--text-secondary, #9a9aa2);
          font-weight: 500;
        }

        :global(.metric-icon-cyan) {
          color: var(--text-secondary, #9a9aa2);
        }

        .text-orange {
          color: var(--accent-orange, #ff9f0a);
        }

        .exercises-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .exercise-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.74rem;
          font-weight: 500;
          padding: 4px 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          color: #d4d4d8;
        }

        .exercise-chip-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .clear-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: var(--accent-red, #ff453a);
          font-size: 0.82rem;
          font-weight: 600;
          padding: 12px;
          border-radius: 9999px;
          background: rgba(255, 69, 58, 0.08);
          border: 1px solid rgba(255, 69, 58, 0.15);
          margin-top: 10px;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .clear-btn:hover {
          background: rgba(255, 69, 58, 0.16);
        }
      `}</style>
    </div>
  );
};
