'use client';

import React, { useState, useMemo } from 'react';
import { Clock, Layers, Dumbbell, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { WorkoutLog, UserProfile } from '@/types/workout';
import { CalendarStrip } from '@/components/CalendarStrip';
import '@/styles/HistoryView.css';

interface HistoryViewProps {
  logs: WorkoutLog[];
  activeUser: UserProfile;
  onClearHistory: () => void;
  onDeleteLog?: (logId: string) => void;
  onGoToWorkouts: () => void;
}

// Accent colors harmonized with DashboardView (Orange, Green, Violet)
const DASHBOARD_ACCENTS = {
  orange: '#ea580c', // Muted warm terracotta / orange from dashboard
  green: '#10b981',  // Emerald green from dashboard
  violet: '#8b5cf6', // Violet from dashboard
};

const getRoutineAccent = (title: string): string => {
  const lower = title.toLowerCase();
  if (lower.includes('chest') || lower.includes('push') || lower.includes('hiit') || lower.includes('leg') || lower.includes('squat') || lower.includes('lower')) {
    return DASHBOARD_ACCENTS.orange;
  }
  if (lower.includes('dip') || lower.includes('machine') || lower.includes('arm') || lower.includes('upper') || lower.includes('back')) {
    return DASHBOARD_ACCENTS.green;
  }
  return DASHBOARD_ACCENTS.violet;
};

const getChipDotColor = (idx: number): string => {
  const colors = [
    DASHBOARD_ACCENTS.orange,
    DASHBOARD_ACCENTS.green,
    DASHBOARD_ACCENTS.violet,
  ];
  return colors[idx % colors.length];
};

export const HistoryView: React.FC<HistoryViewProps> = ({
  logs,
  activeUser,
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

  const getLogIso = (log: WorkoutLog): string => {
    if (!log.createdAt) return '';
    try {
      const d = new Date(log.createdAt);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      }
    } catch {
      // ignore
    }
    return '';
  };

  const formatLogDisplayDate = (log: WorkoutLog): string => {
    if (!log.createdAt) return '';
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
    return '';
  };

  // Build a Set of dates that have workouts for the active user
  const workoutDates = useMemo(() => {
    const dates = new Set<string>();
    userLogs.forEach((log) => {
      const iso = getLogIso(log);
      if (iso) {
        dates.add(iso);
      }
    });
    return dates;
  }, [userLogs]);

  // Filter logs for the selected date (or all if selectedDate is null)
  const displayedLogs = useMemo(() => {
    if (!selectedDate) return userLogs;
    return userLogs.filter((log) => getLogIso(log) === selectedDate);
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

              const logSetsCount =
                log.completedExercises?.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0) || 0;

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
                          style={{ backgroundColor: getRoutineAccent(log.workoutTitle) }}
                        />
                        <div>
                          <h3 className="log-routine-name">{log.workoutTitle}</h3>
                          <span className="log-date">{formatLogDisplayDate(log)}</span>
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
                        <span>{logSetsCount} sets</span>
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
    </div>
  );
};
