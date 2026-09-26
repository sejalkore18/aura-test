'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface MonthCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: Date;
  selectedDate: string | null;
  workoutDates: Set<string>;
  onSelectDate: (dateStr: string | null, dateObj?: Date) => void;
}

const MONTHS_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export const MonthCalendarModal: React.FC<MonthCalendarModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  selectedDate,
  workoutDates,
  onSelectDate,
}) => {
  const [viewDate, setViewDate] = useState<Date>(() => new Date(currentDate));
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  // Sync viewDate when currentDate changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setViewDate(new Date(currentDate));
    }
  }, [isOpen, currentDate]);

  // Set portal target based on viewport
  useEffect(() => {
    const updateTarget = () => {
      const isMobile = window.innerWidth <= 640;
      const target = isMobile ? document.body : (document.querySelector('.app-container') || document.body);
      setPortalTarget(target);
    };
    updateTarget();
    window.addEventListener('resize', updateTarget);
    return () => window.removeEventListener('resize', updateTarget);
  }, []);

  // Lock scroll & handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !portalTarget) return null;

  // Helper to format ISO YYYY-MM-DD
  const formatIso = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayIso = formatIso(new Date());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = MONTHS_FULL[month];

  // Month navigation handlers
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1));
  };

  const handleJumpToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    setViewDate(today);
    onSelectDate(todayIso, today);
    onClose();
  };

  // Build grid of days (Monday-first)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun, 1 is Mon...
  const leadingDaysCount = (firstDayIndex + 6) % 7; // Convert to Mon = 0, Sun = 6

  const prevMonthDaysCount = new Date(year, month, 0).getDate();

  interface CalendarDay {
    date: Date;
    dayNumber: number;
    iso: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    hasWorkout: boolean;
  }

  const calendarDays: CalendarDay[] = [];

  // Trailing days from previous month
  for (let i = leadingDaysCount - 1; i >= 0; i--) {
    const d = prevMonthDaysCount - i;
    const dateObj = new Date(year, month - 1, d);
    const iso = formatIso(dateObj);
    calendarDays.push({
      date: dateObj,
      dayNumber: d,
      iso,
      isCurrentMonth: false,
      isToday: iso === todayIso,
      isSelected: selectedDate === iso,
      hasWorkout: workoutDates.has(iso),
    });
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const iso = formatIso(dateObj);
    calendarDays.push({
      date: dateObj,
      dayNumber: d,
      iso,
      isCurrentMonth: true,
      isToday: iso === todayIso,
      isSelected: selectedDate === iso,
      hasWorkout: workoutDates.has(iso),
    });
  }

  // Leading days from next month to complete 35 or 42 cells
  const totalDaysSoFar = calendarDays.length;
  const targetCells = totalDaysSoFar > 35 ? 42 : 35;
  const trailingDaysCount = targetCells - totalDaysSoFar;

  for (let d = 1; d <= trailingDaysCount; d++) {
    const dateObj = new Date(year, month + 1, d);
    const iso = formatIso(dateObj);
    calendarDays.push({
      date: dateObj,
      dayNumber: d,
      iso,
      isCurrentMonth: false,
      isToday: iso === todayIso,
      isSelected: selectedDate === iso,
      hasWorkout: workoutDates.has(iso),
    });
  }

  return createPortal(
    <div
      className="calendar-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Monthly Calendar"
      style={{ position: portalTarget === document.body ? 'fixed' : 'absolute' }}
    >
      <div
        className="calendar-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Prev Arrow, Month Title, Next Arrow */}
        <div className="calendar-modal-header">
          <button
            type="button"
            className="cal-nav-btn"
            onClick={handlePrevMonth}
            aria-label="Previous month"
            title="Previous month"
          >
            <ChevronLeft size={20} />
          </button>

          <h2 className="cal-modal-title">
            {monthName} <span className="cal-modal-year">{year}</span>
          </h2>

          <button
            type="button"
            className="cal-nav-btn"
            onClick={handleNextMonth}
            aria-label="Next month"
            title="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Weekday Names Header Row (MON - SUN) */}
        <div className="calendar-weekdays-grid">
          {WEEKDAYS.map((day) => (
            <span key={day} className="cal-weekday-text">
              {day}
            </span>
          ))}
        </div>

        {/* Days of the Month Grid */}
        <div className="calendar-dates-grid">
          {calendarDays.map((cell) => {
            return (
              <button
                key={cell.iso}
                type="button"
                className={`cal-date-btn ${cell.isCurrentMonth ? 'current-month' : 'adjacent-month'} ${
                  cell.isSelected ? 'selected' : ''
                } ${cell.isToday && !cell.isSelected ? 'is-today' : ''} ${
                  cell.hasWorkout ? 'has-workout' : ''
                }`}
                onClick={() => {
                  onSelectDate(cell.iso, cell.date);
                  onClose();
                }}
                title={`${cell.iso}${cell.hasWorkout ? ' · Workout logged' : ''}`}
              >
                <span className="cal-date-number">{cell.dayNumber}</span>
                {cell.hasWorkout && (
                  <span className="cal-workout-dot" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action Footer */}
        <div className="calendar-modal-footer">
          <button
            type="button"
            className={`cal-footer-pill ${selectedDate === null ? 'active' : ''}`}
            onClick={() => {
              onSelectDate(null);
              onClose();
            }}
          >
            <span>All Workouts</span>
          </button>

          <button
            type="button"
            className={`cal-footer-pill cal-today-pill ${selectedDate === todayIso ? 'active' : ''}`}
            onClick={handleJumpToday}
          >
            <CalendarIcon size={13} />
            <span>Today</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .calendar-modal-backdrop {
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: calFadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes calFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes calScaleIn {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(6px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .calendar-modal-card {
          width: 100%;
          max-width: 350px;
          background: rgba(18, 18, 24, 0.96);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 26px;
          padding: 24px 20px 20px;
          box-shadow: 0 28px 60px -8px rgba(0, 0, 0, 0.85),
                      0 0 0 1px rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 16px;
          animation: calScaleIn 0.26s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          user-select: none;
        }

        /* 1. Header */
        .calendar-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2px;
        }

        .cal-nav-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          color: #e4e4e7;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .cal-nav-btn:hover {
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
          transform: scale(1.08);
        }

        .cal-nav-btn:active {
          transform: scale(0.92);
        }

        .cal-modal-title {
          font-family: var(--font-display);
          font-size: 1.18rem;
          font-weight: 700;
          color: #f4f4f5;
          letter-spacing: -0.015em;
          margin: 0;
          text-align: center;
        }

        .cal-modal-year {
          color: rgba(255, 255, 255, 0.55);
          font-weight: 500;
          font-size: 1.05rem;
          margin-left: 2px;
        }

        /* 2. Weekdays Header */
        .calendar-weekdays-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          padding: 0 2px;
        }

        .cal-weekday-text {
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: rgba(255, 255, 255, 0.42);
          text-transform: uppercase;
        }

        /* 3. Dates Grid */
        .calendar-dates-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          row-gap: 6px;
          column-gap: 4px;
        }

        .cal-date-btn {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 40px;
          border-radius: 12px;
          background: transparent;
          border: 1px solid transparent;
          color: #e4e4e7;
          font-family: var(--font-display);
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 0;
        }

        .cal-date-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          transform: scale(1.06);
        }

        .cal-date-btn:active {
          transform: scale(0.92);
        }

        /* Adjacent Month (Muted) */
        .cal-date-btn.adjacent-month {
          color: rgba(255, 255, 255, 0.22);
          font-weight: 500;
        }

        /* Days with logged workouts (soft tint like reference) */
        .cal-date-btn.has-workout:not(.selected) {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.08);
        }

        /* Workout Indicator Dot */
        .cal-workout-dot {
          position: absolute;
          bottom: 4px;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 5px rgba(52, 211, 153, 0.85);
        }

        /* Today indicator when not selected */
        .cal-date-btn.is-today:not(.selected) {
          border-color: rgba(255, 255, 255, 0.35);
        }

        /* Selected Day (Terracotta Squircle matching reference image) */
        .cal-date-btn.selected {
          background: #e05a38;
          color: #ffffff;
          font-weight: 700;
          border-color: transparent;
          box-shadow: 0 4px 14px rgba(224, 90, 56, 0.45);
          transform: scale(1.04);
        }

        .cal-date-btn.selected .cal-workout-dot {
          background: #ffffff;
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.9);
        }

        /* 4. Footer */
        .calendar-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 4px;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .cal-footer-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-secondary, #9a9aa2);
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cal-footer-pill:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.18);
        }

        .cal-footer-pill.active {
          background: #c8c8cc;
          color: #08080a;
          border-color: #e4e4e7;
          box-shadow: none;
        }

        .cal-today-pill {
          margin-left: auto;
        }
      `}</style>
    </div>,
    portalTarget
  );
};
