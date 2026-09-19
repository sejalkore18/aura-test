'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarStripProps {
  workoutDates: Set<string>; // ISO strings: 'YYYY-MM-DD'
  selectedDate: string | null;
  onSelectDate: (dateStr: string | null) => void;
}

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  workoutDates,
  selectedDate,
  onSelectDate,
}) => {
  // Use today as initial reference
  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date());

  // Helper to format ISO YYYY-MM-DD
  const formatIso = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayIso = formatIso(new Date());

  // Compute 7 days centered around anchorDate or start of week
  const getWeekDays = (base: Date) => {
    const days: Date[] = [];
    // Start week from Sunday (or 3 days before anchor to center it)
    const currentDayOfWeek = base.getDay(); // 0 is Sun, 1 is Mon...
    const sunday = new Date(base);
    sunday.setDate(base.getDate() - currentDayOfWeek);

    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays(anchorDate);

  // Month & Year display based on the center of current week
  const centerDay = weekDays[3] || anchorDate;
  const monthName = MONTHS_FULL[centerDay.getMonth()];
  const yearNumber = centerDay.getFullYear();

  // Handlers for week navigation
  const handlePrevWeek = () => {
    const newAnchor = new Date(anchorDate);
    newAnchor.setDate(newAnchor.getDate() - 7);
    setAnchorDate(newAnchor);
  };

  const handleNextWeek = () => {
    const newAnchor = new Date(anchorDate);
    newAnchor.setDate(newAnchor.getDate() + 7);
    setAnchorDate(newAnchor);
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setAnchorDate(today);
    onSelectDate(todayIso);
  };

  return (
    <div className="calendar-strip-container">
      {/* 1. Header: Month Year Navigation (Takes full width) */}
      <div className="month-navigation-row">
        <button
          className="nav-arrow-btn"
          onClick={handlePrevWeek}
          aria-label="Previous week"
          title="Previous week"
        >
          <ChevronLeft size={19} />
        </button>

        <span className="month-title">
          {monthName} {yearNumber}
        </span>

        <button
          className="nav-arrow-btn"
          onClick={handleNextWeek}
          aria-label="Next week"
          title="Next week"
        >
          <ChevronRight size={19} />
        </button>
      </div>

      {/* 2. Horizontal Date Strip (Day Pills) */}
      <div key={formatIso(anchorDate)} className="days-strip-row">
        {weekDays.map((d) => {
          const iso = formatIso(d);
          const isSelected = selectedDate === iso;
          const isToday = iso === todayIso;
          const hasWorkout = workoutDates.has(iso);
          const dayName = DAYS_SHORT[d.getDay()];
          const dayNum = d.getDate();

          return (
            <div key={iso} className="day-col-wrapper">
              <button
                className={`day-pill ${isSelected ? 'selected' : ''} ${hasWorkout ? 'has-activity' : ''}`}
                onClick={() => {
                  // If clicked again when selected, toggle back to All
                  if (isSelected) {
                    onSelectDate(null);
                  } else {
                    onSelectDate(iso);
                  }
                }}
                title={`${dayName}, ${monthName} ${dayNum}${hasWorkout ? ' · Workout logged' : ''}`}
              >
                {isSelected ? (
                  /* Selected Pill Layout:
                     Top circular badge with Day Number,
                     Bottom with Day Name */
                  <div className="selected-pill-content">
                    <div className="selected-circle-badge">
                      <span className="badge-day-number">{dayNum}</span>
                    </div>
                    <span className="selected-day-name">{dayName}</span>
                  </div>
                ) : (
                  /* Normal Pill Layout:
                     Top: Day Name
                     Bottom: Day Number */
                  <div className="normal-pill-content">
                    <span className="normal-day-name">{dayName}</span>
                    <span className="normal-day-number">{dayNum}</span>
                  </div>
                )}
              </button>

              {/* Workout Indicator Dot shifted just below the oval container */}
              <div className="day-indicator-slot">
                {hasWorkout ? (
                  <span className="workout-indicator-dot" />
                ) : (
                  <span className="empty-dot-spacer" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Filter Action Pills (Shifted below Dates Container) */}
      <div className="filter-actions-row">
        <button
          className={`action-filter-pill ${selectedDate === null ? 'active' : ''}`}
          onClick={() => onSelectDate(null)}
          title="Show all workouts"
        >
          <span>All</span>
        </button>
        <button
          className={`action-filter-pill ${selectedDate === todayIso ? 'active' : ''}`}
          onClick={handleJumpToToday}
          title="Jump to today"
        >
          <CalendarIcon size={12} className={selectedDate === todayIso ? 'active-today-icon' : ''} />
          <span>Today</span>
        </button>
      </div>

      <style jsx>{`
        .calendar-strip-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 24px;
        }

        /* 1. Month Navigation Row (Takes full space) */
        .month-navigation-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 0 4px;
        }

        .nav-arrow-btn {
          background: transparent;
          border: none;
          color: #e4e4e7;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
          cursor: pointer;
          flex-shrink: 0;
          opacity: 0.85;
        }

        .nav-arrow-btn:hover {
          opacity: 1;
          transform: scale(1.15);
        }

        .nav-arrow-btn:active {
          transform: scale(0.9);
          opacity: 0.7;
        }

        .month-title {
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 700;
          color: #e4e4e7;
          letter-spacing: -0.01em;
          white-space: nowrap;
          text-align: center;
          flex: 1;
        }

        /* 2. Filter Actions Row (Shifted below Month) */
        .filter-actions-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          padding: 0 4px;
        }

        .action-filter-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 5px 12px;
          border-radius: 9999px;
          background: rgba(22, 22, 28, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          color: var(--text-secondary, #9a9aa2);
          font-size: 0.74rem;
          font-weight: 600;
          transition: all 0.2s ease;
          cursor: pointer;
          box-shadow: 0 4px 14px -4px rgba(0, 0, 0, 0.5);
        }

        .action-filter-pill:hover {
          color: #e4e4e7;
          background: rgba(30, 30, 38, 0.85);
          border-color: rgba(255, 255, 255, 0.18);
        }

        .action-filter-pill.active {
          background: #c8c8cc;
          color: #08080a;
          border-color: #e4e4e7;
          box-shadow: 0 4px 14px rgba(255, 255, 255, 0.2);
        }

        /* 3. Day Pills Row */
        @keyframes stripFadeSlide {
          from {
            opacity: 0.45;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .days-strip-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          width: 100%;
          animation: stripFadeSlide 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .day-col-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
          width: 100%;
        }

        .day-pill {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 64px;
          border-radius: 9999px;
          background: rgba(22, 22, 28, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
                      background 0.35s ease,
                      border-color 0.35s ease,
                      box-shadow 0.35s ease;
          padding: 2.5px;
          box-shadow: 0 4px 14px -4px rgba(0, 0, 0, 0.5);
          user-select: none;
        }

        .day-pill:hover {
          background: rgba(30, 30, 38, 0.85);
          border-color: rgba(255, 255, 255, 0.18);
          transform: translateY(-1px);
        }

        .day-pill:active {
          transform: scale(0.92);
          transition: transform 0.08s ease;
        }

        /* Normal (Unselected) State */
        @keyframes normalFadeIn {
          0% {
            opacity: 0;
            transform: scale(0.92);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .normal-pill-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          width: 100%;
          height: 100%;
          padding: 2px;
          animation: normalFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .normal-day-name {
          font-size: 0.7rem;
          color: var(--text-secondary, #9a9aa2);
          font-weight: 500;
          letter-spacing: -0.01em;
          line-height: 1;
        }

        .normal-day-number {
          font-family: var(--font-display);
          font-size: 1.02rem;
          font-weight: 700;
          color: #e4e4e7;
          line-height: 1;
        }

        /* Indicator Slot below the oval container */
        .day-indicator-slot {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 5px;
          width: 100%;
        }

        @keyframes dotGlowPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 6px rgba(52, 211, 153, 0.75);
          }
          50% {
            transform: scale(1.18);
            box-shadow: 0 0 10px rgba(52, 211, 153, 0.95);
          }
        }

        .workout-indicator-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #34d399; /* Mint teal workout indicator */
          box-shadow: 0 0 6px rgba(52, 211, 153, 0.75);
          animation: dotGlowPulse 2.8s ease-in-out infinite;
        }

        .empty-dot-spacer {
          width: 5px;
          height: 5px;
          visibility: hidden;
        }

        /* Selected State (Spring Pop Animation on Selection Switch) */
        .day-pill.selected {
          background: rgba(28, 28, 34, 0.95);
          border-color: rgba(255, 255, 255, 0.14);
          box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.7);
          transform: translateY(-1px);
        }

        .selected-pill-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          height: 100%;
          padding: 0 0 4px;
        }

        @keyframes badgePopIn {
          0% {
            transform: scale(0.65);
            opacity: 0;
          }
          60% {
            transform: scale(1.06);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .selected-circle-badge {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 50%;
          background: #e4e4e7;
          color: #08080a;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
          position: relative;
          animation: badgePopIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .badge-day-number {
          font-family: var(--font-display);
          font-size: 1.02rem;
          font-weight: 800;
          line-height: 1;
        }

        @keyframes dayLabelIn {
          0% {
            opacity: 0;
            transform: translateY(3px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .selected-day-name {
          font-size: 0.7rem;
          font-weight: 700;
          color: #e4e4e7;
          letter-spacing: -0.01em;
          margin-bottom: 1px;
          animation: dayLabelIn 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};
