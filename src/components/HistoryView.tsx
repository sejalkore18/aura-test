'use client';

import React, { useState, useMemo } from 'react';
import { Clock, Layers, Dumbbell, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { WorkoutLog, UserProfile } from '@/types/workout';
import { CalendarStrip } from '@/components/CalendarStrip';

interface HistoryViewProps {
  logs: WorkoutLog[];
  activeUser: UserProfile;
  onClearHistory: () => void;
  onDeleteLog?: (logId: string) => void;
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
  onDeleteLog,
  onGoToWorkouts,
}) => {
  // Swipe-to-delete state
  const [swipingId, setSwipingId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipingCardWidth, setSwipingCardWidth] = useState(360);
  const [isSwipingActive, setIsSwipingActive] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const swipeStartRef = React.useRef<{
    x: number;
    y: number;
    locked: 'h' | 'v' | null;
    startId: string;
    cardWidth: number;
  } | null>(null);

  // Swipe-to-delete trigger with smooth exit animation
  const handleTriggerDelete = (logId: string) => {
    setDeletingId(logId);
    setTimeout(() => {
      onDeleteLog?.(logId);
      setDeletingId(null);
      setSwipingId(null);
      setSwipeOffset(0);
    }, 240);
  };

  const handleSwipeStart = (
    logId: string,
    clientX: number,
    clientY: number,
    target: HTMLElement
  ): boolean => {
    if (target.closest('button, a, input')) {
      return false;
    }
    const cardWrapper = target.closest<HTMLElement>('.swipe-card-wrapper');
    const width = cardWrapper?.offsetWidth || 360;
    setSwipingCardWidth(width);

    swipeStartRef.current = {
      x: clientX,
      y: clientY,
      locked: null,
      startId: logId,
      cardWidth: width,
    };
    if (swipingId !== null && swipingId !== logId) {
      setSwipingId(null);
      setSwipeOffset(0);
    }
    return true;
  };

  const handleSwipeMove = (clientX: number, clientY: number) => {
    if (!swipeStartRef.current) return;
    const { x, y, startId, cardWidth } = swipeStartRef.current;
    const dx = clientX - x;
    const dy = clientY - y;

    if (swipeStartRef.current.locked === null) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        if (Math.abs(dx) > Math.abs(dy) + 2) {
          swipeStartRef.current.locked = 'h';
        } else {
          swipeStartRef.current.locked = 'v';
        }
      }
    }

    if (swipeStartRef.current.locked === 'h') {
      if (dx <= 0) {
        setSwipingId(startId);
        setIsSwipingActive(true);
        const maxSlide = -cardWidth;
        const clamped = dx < maxSlide ? maxSlide + (dx - maxSlide) * 0.2 : dx;
        setSwipeOffset(clamped);
      } else if (swipingId === startId) {
        setSwipeOffset(0);
      }
    }
  };

  const handleSwipeEnd = () => {
    if (!swipeStartRef.current) return;
    const { startId, locked, cardWidth } = swipeStartRef.current;
    setIsSwipingActive(false);

    if (locked === 'h' && swipingId === startId) {
      const deleteThreshold = cardWidth * 0.6;
      if (Math.abs(swipeOffset) >= deleteThreshold) {
        handleTriggerDelete(startId);
      } else {
        setSwipeOffset(0);
        setSwipingId(null);
      }
    }
    swipeStartRef.current = null;
  };

  const handleMouseDown = (logId: string, e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const shouldStart = handleSwipeStart(logId, e.clientX, e.clientY, e.target as HTMLElement);
    if (!shouldStart) return;

    const onMouseMove = (moveEvent: MouseEvent) => {
      handleSwipeMove(moveEvent.clientX, moveEvent.clientY);
    };

    const onMouseUp = () => {
      handleSwipeEnd();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTouchStart = (logId: string, e: React.TouchEvent<HTMLDivElement>) => {
    handleSwipeStart(logId, e.touches[0].clientX, e.touches[0].clientY, e.target as HTMLElement);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      handleSwipeMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    handleSwipeEnd();
  };

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

  // Aggregate Stats for the selected day (or all if no date is selected)
  const totalWorkouts = displayedLogs.length;
  const totalMinutes = displayedLogs.reduce((acc, log) => acc + (log.durationMinutes || 0), 0);


  return (
    <div className="history-view animate-fade-in">
      {/* 1. Interactive Calendar Date Strip */}
      <CalendarStrip
        workoutDates={workoutDates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* 3. Aggregate Stats Bar (hidden on rest day) */}
      {displayedLogs.length > 0 && (
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
      )}

      {/* 4. Workout Logs Timeline */}
      <div className="logs-container">
        <div key={selectedDate || 'all'} className="logs-animated-content">
          {displayedLogs.length === 0 ? (
            selectedDate ? null : (
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
          <div className="logs-list">
            {displayedLogs.map((log) => {
              const isSwipeActive =
                (swipingId === log.id && swipeOffset < 0) || deletingId === log.id;
              const deleteThreshold = swipingCardWidth > 0 ? swipingCardWidth * 0.6 : 200;
              const isPast60Percent =
                swipingId === log.id && Math.abs(swipeOffset) >= deleteThreshold;

              return (
                <div
                  key={log.id}
                  className={`swipe-card-wrapper ${deletingId === log.id ? 'is-deleting' : ''}`}
                >
                  {/* Swipe Delete Background Action */}
                  {isSwipeActive && (
                    <div
                      className={`swipe-delete-action ${isPast60Percent ? 'ready-delete' : ''}`}
                      onClick={() => handleTriggerDelete(log.id)}
                    >
                      <div className="swipe-delete-content">
                        <Trash2
                          size={20}
                          color="#9ca3af"
                          className={`swipe-trash-icon ${isPast60Percent ? 'ready' : ''}`}
                        />
                        <span className="swipe-delete-label">
                          {isPast60Percent ? 'Release to Delete' : 'Slide to Delete'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Foreground Log Card */}
                  <div
                    className={`log-card ${isSwipingActive && swipingId === log.id ? 'is-swiping' : ''}`}
                    style={{
                      transform:
                        deletingId === log.id
                          ? 'translateX(-100%)'
                          : swipingId === log.id
                          ? `translateX(${swipeOffset}px)`
                          : 'translateX(0)',
                      transition:
                        isSwipingActive && swipingId === log.id
                          ? 'none'
                          : 'transform 0.26s cubic-bezier(0.18, 1, 0.22, 1), opacity 0.24s ease',
                    }}
                    onMouseDown={(e) => handleMouseDown(log.id, e)}
                    onTouchStart={(e) => handleTouchStart(log.id, e)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onClick={() => {
                      if (swipingId === log.id && swipeOffset < 0) {
                        setSwipeOffset(0);
                        setSwipingId(null);
                      }
                    }}
                  >
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
                </div>
              );
            })}


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

        /* Logs List & Swipe to Delete */
        .logs-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .swipe-card-wrapper {
          position: relative;
          overflow: hidden;
          border-radius: 26px;
          max-height: 360px;
          opacity: 1;
          background: transparent;
          transition: max-height 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                      opacity 0.2s ease,
                      margin-bottom 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .swipe-card-wrapper.is-deleting {
          max-height: 0;
          opacity: 0;
          margin-bottom: -12px;
          pointer-events: none;
        }

        .swipe-delete-action {
          position: absolute;
          top: 0;
          bottom: 0;
          right: 0;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 24px;
          background: transparent;
          border-radius: 26px;
          z-index: 1;
          cursor: pointer;
          user-select: none;
          -webkit-user-select: none;
        }

        .swipe-delete-action.ready-delete {
          background: transparent;
        }

        .swipe-delete-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: #9ca3af;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          transition: transform 0.18s cubic-bezier(0.18, 1, 0.22, 1);
        }

        .swipe-delete-label {
          color: #9ca3af;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }

        .swipe-delete-action.ready-delete .swipe-delete-label {
          color: #9ca3af;
        }

        :global(.swipe-trash-icon) {
          color: #9ca3af !important;
          stroke: #9ca3af !important;
          transition: transform 0.18s cubic-bezier(0.18, 1, 0.22, 1);
        }

        :global(.swipe-trash-icon.ready) {
          transform: scale(1.24);
          color: #9ca3af !important;
          stroke: #9ca3af !important;
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
          position: relative;
          z-index: 2;
          touch-action: pan-y;
          user-select: none;
          -webkit-user-select: none;
          cursor: grab;
        }

        .log-card:active {
          cursor: grabbing;
        }

        .log-card:not(.is-swiping):hover {
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


      `}</style>
    </div>
  );
};
