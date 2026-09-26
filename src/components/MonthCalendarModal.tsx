'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import '@/styles/MonthCalendarModal.css';

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
    </div>,
    portalTarget
  );
};
