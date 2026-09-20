'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Calendar as CalendarIcon } from 'lucide-react';

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
const WEEKDAYS_SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

// Helper to format ISO YYYY-MM-DD
const formatIso = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  workoutDates,
  selectedDate,
  onSelectDate,
}) => {
  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date());
  const [isMonthExpanded, setIsMonthExpanded] = useState<boolean>(false);
  // viewDate is used for the expanded month grid
  const [viewDate, setViewDate] = useState<Date>(() => new Date());

  const weekViewRef = useRef<HTMLDivElement>(null);
  const monthViewRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const updateHeight = () => {
      if (isMonthExpanded) {
        if (monthViewRef.current) {
          setContainerHeight(monthViewRef.current.offsetHeight);
        }
      } else {
        if (weekViewRef.current) {
          setContainerHeight(weekViewRef.current.offsetHeight);
        }
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [isMonthExpanded, viewDate, anchorDate]);

  const todayIso = formatIso(new Date());

  // Compute 7 days centered around anchorDate's week (Monday-start)
  const getWeekDays = (base: Date) => {
    const days: Date[] = [];
    const currentDayOfWeek = base.getDay(); // 0 is Sun, 1 is Mon... 6 is Sat
    const mondayOffset = (currentDayOfWeek + 6) % 7;
    const monday = new Date(base);
    monday.setDate(base.getDate() - mondayOffset);
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays(anchorDate);
  const centerDay = weekDays[3] || anchorDate;
  const monthName = MONTHS_FULL[centerDay.getMonth()];
  const yearNumber = centerDay.getFullYear();

  // Build month grid for the expanded view
  const buildMonthGrid = (vd: Date) => {
    const year = vd.getFullYear();
    const month = vd.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0=Sun
    const leadingDaysCount = (firstDayIndex + 6) % 7; // convert to Mon=0

    const prevMonthDaysCount = new Date(year, month, 0).getDate();

    const cells: Array<{
      date: Date;
      dayNumber: number;
      iso: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      hasWorkout: boolean;
    }> = [];

    for (let i = leadingDaysCount - 1; i >= 0; i--) {
      const d = prevMonthDaysCount - i;
      const dateObj = new Date(year, month - 1, d);
      cells.push({ date: dateObj, dayNumber: d, iso: formatIso(dateObj), isCurrentMonth: false, isToday: false, hasWorkout: workoutDates.has(formatIso(dateObj)) });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const iso = formatIso(dateObj);
      cells.push({ date: dateObj, dayNumber: d, iso, isCurrentMonth: true, isToday: iso === todayIso, hasWorkout: workoutDates.has(iso) });
    }
    const totalDaysSoFar = cells.length;
    const targetCells = totalDaysSoFar > 35 ? 42 : 35;
    for (let d = 1; d <= targetCells - totalDaysSoFar; d++) {
      const dateObj = new Date(year, month + 1, d);
      cells.push({ date: dateObj, dayNumber: d, iso: formatIso(dateObj), isCurrentMonth: false, isToday: false, hasWorkout: workoutDates.has(formatIso(dateObj)) });
    }
    return cells;
  };

  const monthGridCells = buildMonthGrid(viewDate);
  const expandedMonthName = MONTHS_FULL[viewDate.getMonth()];
  const expandedYear = viewDate.getFullYear();

  // Handlers
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

  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToggleMonth = () => {
    if (!isMonthExpanded) {
      // Sync expanded view to current week's month
      setViewDate(new Date(centerDay.getFullYear(), centerDay.getMonth(), 1));
    }
    setIsMonthExpanded(prev => !prev);
  };

  const handleSelectInGrid = (iso: string, dateObj: Date) => {
    if (selectedDate === iso) {
      onSelectDate(null);
    } else {
      onSelectDate(iso);
    }
    setAnchorDate(dateObj);
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setAnchorDate(today);
    setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
    onSelectDate(todayIso);
  };

  return (
    <div className="calendar-strip-container">
      {/* 1. Header: Month Year Navigation */}
      <div className="month-navigation-row">
        <button
          className="nav-arrow-btn"
          onClick={isMonthExpanded ? handlePrevMonth : handlePrevWeek}
          aria-label={isMonthExpanded ? 'Previous month' : 'Previous week'}
        >
          <ChevronLeft size={19} />
        </button>

        <button
          type="button"
          className="month-title-btn"
          onClick={handleToggleMonth}
          aria-label={`${isMonthExpanded ? 'Collapse' : 'Expand'} calendar for ${isMonthExpanded ? expandedMonthName : monthName} ${isMonthExpanded ? expandedYear : yearNumber}`}
        >
          <span className="month-title-text">
            {isMonthExpanded ? `${expandedMonthName} ${expandedYear}` : `${monthName} ${yearNumber}`}
          </span>
          <ChevronDown
            size={14}
            className={`month-title-chevron ${isMonthExpanded ? 'chevron-open' : ''}`}
          />
        </button>

        <button
          className="nav-arrow-btn"
          onClick={isMonthExpanded ? handleNextMonth : handleNextWeek}
          aria-label={isMonthExpanded ? 'Next month' : 'Next week'}
        >
          <ChevronRight size={19} />
        </button>
      </div>

      {/* 2. Calendar Dates Area (Weekdays + Date Viewport) */}
      <div className="calendar-dates-section">
        {/* Permanent Weekday Headers */}
        <div className="month-weekdays-header">
          {WEEKDAYS_SHORT.map((day) => (
            <span key={day} className="month-weekday-label">{day}</span>
          ))}
        </div>

        {/* Smooth Collapsible Viewport */}
        <div
          className="calendar-collapsible-viewport"
          style={{
            height: containerHeight !== undefined ? `${containerHeight}px` : undefined,
          }}
        >
          <div className="calendar-views-stack">
            {/* Week View Layer */}
            <div
              ref={weekViewRef}
              className={`calendar-view-layer ${!isMonthExpanded ? 'active' : 'inactive'}`}
              aria-hidden={isMonthExpanded}
            >
              <div key={formatIso(anchorDate)} className="week-dates-grid">
                {weekDays.map((d) => {
                  const iso = formatIso(d);
                  const isSelected = selectedDate === iso;
                  const hasWorkout = workoutDates.has(iso);
                  const isToday = iso === todayIso;
                  const isCurrentMonth = d.getMonth() === centerDay.getMonth();
                  const dayNum = d.getDate();

                  return (
                    <div key={iso} className="month-day-col">
                      <button
                        type="button"
                        tabIndex={!isMonthExpanded ? 0 : -1}
                        className={`month-date-btn
                          ${isCurrentMonth ? 'current-month' : 'adjacent-month'}
                          ${isSelected ? 'selected' : ''}
                          ${isToday && !isSelected ? 'is-today' : ''}
                          ${hasWorkout ? 'has-workout' : ''}
                        `}
                        onClick={() => {
                          if (isSelected) {
                            onSelectDate(null);
                          } else {
                            onSelectDate(iso);
                          }
                        }}
                        title={`${WEEKDAYS_SHORT[(d.getDay() + 6) % 7]}, ${MONTHS_FULL[d.getMonth()]} ${dayNum}${hasWorkout ? ' · Workout logged' : ''}`}
                      >
                        {isSelected ? (
                          <div className="month-selected-content">
                            <div className="month-selected-badge">
                              <span className="month-badge-number">{dayNum}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="month-date-number">{dayNum}</span>
                        )}
                      </button>

                      <div className="month-indicator-slot">
                        {hasWorkout ? (
                          <span className="month-workout-dot" />
                        ) : (
                          <span className="month-dot-spacer" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Expanded Month View Layer */}
            <div
              ref={monthViewRef}
              className={`calendar-view-layer ${isMonthExpanded ? 'active' : 'inactive'}`}
              aria-hidden={!isMonthExpanded}
            >
              <div key={`${viewDate.getFullYear()}-${viewDate.getMonth()}`} className="month-dates-grid">
                {monthGridCells.map((cell) => (
                  <div key={cell.iso} className="month-day-col">
                    <button
                      type="button"
                      tabIndex={isMonthExpanded ? 0 : -1}
                      className={`month-date-btn
                        ${cell.isCurrentMonth ? 'current-month' : 'adjacent-month'}
                        ${selectedDate === cell.iso ? 'selected' : ''}
                        ${cell.isToday && selectedDate !== cell.iso ? 'is-today' : ''}
                        ${cell.hasWorkout ? 'has-workout' : ''}
                      `}
                      onClick={() => handleSelectInGrid(cell.iso, cell.date)}
                      title={`${cell.iso}${cell.hasWorkout ? ' · Workout logged' : ''}`}
                    >
                      {selectedDate === cell.iso ? (
                        <div className="month-selected-content">
                          <div className="month-selected-badge">
                            <span className="month-badge-number">{cell.dayNumber}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="month-date-number">{cell.dayNumber}</span>
                      )}
                    </button>
                    <div className="month-indicator-slot">
                      {cell.hasWorkout
                        ? <span className="month-workout-dot" />
                        : <span className="month-dot-spacer" />
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter Action Pills */}
      <div className="filter-actions-row">
        <button
          className={`action-filter-pill ${selectedDate === null ? 'active' : ''}`}
          onClick={() => { onSelectDate(null); }}
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

        /* 1. Month Navigation Row */
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

        .month-title-btn {
          background: transparent;
          border: none;
          border-radius: 9999px;
          padding: 6px 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          color: #e4e4e7;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .month-title-btn:hover {
          background: transparent;
          color: #ffffff;
          transform: translateY(-1px);
        }

        .month-title-btn:active {
          transform: scale(0.96);
        }

        .month-title-text {
          font-family: var(--font-display);
          font-size: 0.94rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          white-space: nowrap;
        }

        .month-title-chevron {
          color: rgba(255, 255, 255, 0.5);
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s ease;
        }

        .month-title-chevron.chevron-open {
          transform: rotate(180deg);
          color: #ffffff;
        }

        .month-title-btn:hover .month-title-chevron {
          color: #ffffff;
        }

        /* 2. Filter Actions Row */
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
          box-shadow: none;
        }

        /* 3. Smooth Collapsible Viewport & View Layers */
        .calendar-collapsible-viewport {
          position: relative;
          overflow: hidden;
          width: 100%;
          transition: height 0.38s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: height;
        }

        .calendar-views-stack {
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: 1fr;
          width: 100%;
          align-items: start;
        }

        .calendar-view-layer {
          grid-area: 1 / 1;
          width: 100%;
          will-change: opacity, transform;
        }

        .calendar-view-layer.active {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
          visibility: visible;
          transition: opacity 0.32s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 0.38s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .calendar-view-layer.inactive {
          opacity: 0;
          transform: translateY(-8px) scale(0.97);
          pointer-events: none;
          visibility: hidden;
          transition: opacity 0.22s ease,
                      transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
                      visibility 0s 0.25s;
        }

        .calendar-dates-section {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }

        .month-weekdays-header {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          padding: 0 2px;
          margin: 0;
        }

        .month-weekday-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: rgba(255, 255, 255, 0.38);
          text-transform: uppercase;
          text-align: center;
        }

        .week-dates-grid,
        .month-dates-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          row-gap: 6px;
          column-gap: 4px;
        }

        .month-day-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .month-date-btn {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 9999px;
          background: rgba(22, 22, 28, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.09);
          color: #e4e4e7;
          font-family: var(--font-display);
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.25s ease,
                      border-color 0.25s ease,
                      transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 0;
          box-shadow: 0 4px 14px -4px rgba(0, 0, 0, 0.5);
        }

        .month-date-btn:hover {
          background: rgba(30, 30, 38, 0.85);
          border-color: rgba(255, 255, 255, 0.18);
          transform: translateY(-1px);
        }

        .month-date-btn:active {
          transform: scale(0.92);
        }

        .month-date-btn.adjacent-month {
          background: rgba(22, 22, 28, 0.35);
          border-color: rgba(255, 255, 255, 0.04);
          color: rgba(255, 255, 255, 0.22);
          font-weight: 500;
        }

        .month-date-btn.is-today:not(.selected) {
          border-color: rgba(255, 255, 255, 0.32);
        }

        .month-date-btn.selected {
          background: rgba(28, 28, 34, 0.95);
          border-color: rgba(255, 255, 255, 0.14);
          transform: translateY(-1px);
        }

        .month-selected-content {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          padding: 4px;
        }

        .month-selected-badge {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 50%;
          background: #e4e4e7;
          color: #08080a;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: badgePopIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .month-badge-number {
          font-family: var(--font-display);
          font-size: 0.82rem;
          font-weight: 800;
          line-height: 1;
        }

        .month-date-number {
          font-family: var(--font-display);
          font-size: 0.85rem;
          font-weight: 700;
          line-height: 1;
        }

        .month-indicator-slot {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 5px;
          width: 100%;
        }

        .month-workout-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 5px rgba(52, 211, 153, 0.7);
        }

        .month-dot-spacer {
          width: 4px;
          height: 4px;
          visibility: hidden;
        }
      `}</style>
    </div>
  );
};
