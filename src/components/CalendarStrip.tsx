'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import '@/styles/CalendarStrip.css';

interface CalendarStripProps {
  workoutDates: Set<string>; // ISO strings: 'YYYY-MM-DD'
  selectedDate: string | null;
  onSelectDate: (dateStr: string | null) => void;
}

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

  // Slide direction and real-time drag offset for interactive scrolling
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev' | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);

  const weekViewRef = useRef<HTMLDivElement>(null);
  const monthViewRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const isMonthExpandedRef = useRef(isMonthExpanded);
  const hasDraggedRef = useRef(false);
  const [containerHeight, setContainerHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    isMonthExpandedRef.current = isMonthExpanded;
  }, [isMonthExpanded]);

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
  const handlePrevWeek = useCallback(() => {
    setSlideDirection('prev');
    setAnchorDate(prev => {
      const newAnchor = new Date(prev);
      newAnchor.setDate(newAnchor.getDate() - 7);
      return newAnchor;
    });
  }, []);

  const handleNextWeek = useCallback(() => {
    setSlideDirection('next');
    setAnchorDate(prev => {
      const newAnchor = new Date(prev);
      newAnchor.setDate(newAnchor.getDate() + 7);
      return newAnchor;
    });
  }, []);

  const handlePrevMonth = useCallback(() => {
    setSlideDirection('prev');
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setSlideDirection('next');
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleExpandMonth = useCallback(() => {
    if (!isMonthExpandedRef.current) {
      setSlideDirection(null);
      setDragOffset(0);
      setViewDate(new Date(centerDay.getFullYear(), centerDay.getMonth(), 1));
      setIsMonthExpanded(true);
    }
  }, [centerDay]);

  const handleCollapseMonth = useCallback(() => {
    if (isMonthExpandedRef.current) {
      setSlideDirection(null);
      setDragOffset(0);
      setIsMonthExpanded(false);
    }
  }, []);

  const handleToggleMonth = () => {
    if (!isMonthExpanded) {
      handleExpandMonth();
    } else {
      handleCollapseMonth();
    }
  };

  const handleSelectInGrid = (iso: string, dateObj: Date) => {
    if (hasDraggedRef.current) return;
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

  const handleNextMonthRef = useRef(handleNextMonth);
  const handlePrevMonthRef = useRef(handlePrevMonth);
  const handleNextWeekRef = useRef(handleNextWeek);
  const handlePrevWeekRef = useRef(handlePrevWeek);
  const handleExpandMonthRef = useRef(handleExpandMonth);
  const handleCollapseMonthRef = useRef(handleCollapseMonth);

  useEffect(() => {
    handleNextMonthRef.current = handleNextMonth;
    handlePrevMonthRef.current = handlePrevMonth;
    handleNextWeekRef.current = handleNextWeek;
    handlePrevWeekRef.current = handlePrevWeek;
    handleExpandMonthRef.current = handleExpandMonth;
    handleCollapseMonthRef.current = handleCollapseMonth;
  });

  // Gestures for horizontal month navigation & vertical expand/collapse
  useEffect(() => {
    const el = calendarRef.current;
    if (!el) return;

    let wheelCooldown = false;
    let wheelTimer: NodeJS.Timeout | null = null;

    const onWheel = (e: WheelEvent) => {
      // 1. Horizontal scrolling -> change month / week (prioritized with low threshold)
      if (Math.abs(e.deltaX) >= 8) {
        e.preventDefault();
        if (wheelCooldown) return;
        wheelCooldown = true;
        if (wheelTimer) clearTimeout(wheelTimer);
        wheelTimer = setTimeout(() => {
          wheelCooldown = false;
        }, 280);

        if (e.deltaX > 0) {
          if (isMonthExpandedRef.current) {
            handleNextMonthRef.current();
          } else {
            handleNextWeekRef.current();
          }
        } else {
          if (isMonthExpandedRef.current) {
            handlePrevMonthRef.current();
          } else {
            handlePrevWeekRef.current();
          }
        }
        return;
      }

      // 2. Vertical scrolling on calendar section -> expand / collapse (requires low deltaX)
      if (Math.abs(e.deltaY) >= 20 && Math.abs(e.deltaX) < 8) {
        if (e.deltaY < 0 && !isMonthExpandedRef.current) {
          e.preventDefault();
          if (wheelCooldown) return;
          wheelCooldown = true;
          if (wheelTimer) clearTimeout(wheelTimer);
          wheelTimer = setTimeout(() => {
            wheelCooldown = false;
          }, 350);
          handleExpandMonthRef.current();
        } else if (e.deltaY > 0 && isMonthExpandedRef.current) {
          e.preventDefault();
          if (wheelCooldown) return;
          wheelCooldown = true;
          if (wheelTimer) clearTimeout(wheelTimer);
          wheelTimer = setTimeout(() => {
            wheelCooldown = false;
          }, 350);
          handleCollapseMonthRef.current();
        }
      }
    };

    // Touch swipe support for mobile
    let touchStartX: number | null = null;
    let touchStartY: number | null = null;
    let touchDeltaX = 0;
    let touchDeltaY = 0;
    let isTouchSwipingH = false;
    let isTouchSwipingV = false;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchDeltaX = 0;
      touchDeltaY = 0;
      isTouchSwipingH = false;
      isTouchSwipingV = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStartX === null || touchStartY === null) return;
      const dx = e.touches[0].clientX - touchStartX;
      const dy = e.touches[0].clientY - touchStartY;

      // Prevent PWA pull-to-refresh reload immediately when pulling down over calendar
      if (dy > 0 && e.cancelable) {
        e.preventDefault();
      }

      if (!isTouchSwipingH && !isTouchSwipingV) {
        if (Math.abs(dx) >= 6 && Math.abs(dx) > Math.abs(dy)) {
          isTouchSwipingH = true;
        } else if (Math.abs(dy) >= 6) {
          if ((dy > 0 && !isMonthExpandedRef.current) || (dy < 0 && isMonthExpandedRef.current)) {
            isTouchSwipingV = true;
          }
        }
      }

      if (isTouchSwipingH) {
        touchDeltaX = dx;
        setDragOffset(dx * 0.7); // smooth dragging resistance
        if (e.cancelable) {
          e.preventDefault();
        }
      } else if (isTouchSwipingV) {
        touchDeltaY = dy;
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    const onTouchEnd = () => {
      if (isTouchSwipingH) {
        const threshold = 25;
        if (touchDeltaX < -threshold) {
          if (isMonthExpandedRef.current) {
            handleNextMonthRef.current();
          } else {
            handleNextWeekRef.current();
          }
        } else if (touchDeltaX > threshold) {
          if (isMonthExpandedRef.current) {
            handlePrevMonthRef.current();
          } else {
            handlePrevWeekRef.current();
          }
        }
      } else if (isTouchSwipingV || Math.abs(touchDeltaY) >= 20) {
        const threshold = 20;
        if (touchDeltaY > threshold && !isMonthExpandedRef.current) {
          handleExpandMonthRef.current();
        } else if (touchDeltaY < -threshold && isMonthExpandedRef.current) {
          handleCollapseMonthRef.current();
        }
      }
      setDragOffset(0);
      touchStartX = null;
      touchStartY = null;
      touchDeltaX = 0;
      touchDeltaY = 0;
      isTouchSwipingH = false;
      isTouchSwipingV = false;
    };

    // Desktop pointer drag support
    let mouseStartX: number | null = null;
    let mouseStartY: number | null = null;
    let isMouseDown = false;

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      mouseStartX = e.clientX;
      mouseStartY = e.clientY;
      isMouseDown = true;
      hasDraggedRef.current = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown || mouseStartX === null || mouseStartY === null) return;
      const dx = e.clientX - mouseStartX;
      const dy = e.clientY - mouseStartY;

      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        hasDraggedRef.current = true;
      }
      if (Math.abs(dx) >= Math.abs(dy)) {
        setDragOffset(dx * 0.6);
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (isMouseDown && mouseStartX !== null && mouseStartY !== null) {
        const dx = e.clientX - mouseStartX;
        const dy = e.clientY - mouseStartY;

        if (Math.abs(dx) >= 20 && Math.abs(dx) >= Math.abs(dy)) {
          if (dx < 0) {
            if (isMonthExpandedRef.current) {
              handleNextMonthRef.current();
            } else {
              handleNextWeekRef.current();
            }
          } else {
            if (isMonthExpandedRef.current) {
              handlePrevMonthRef.current();
            } else {
              handlePrevWeekRef.current();
            }
          }
        } else if (Math.abs(dy) >= 25 && Math.abs(dx) < 15) {
          if (dy > 0 && !isMonthExpandedRef.current) {
            handleExpandMonthRef.current();
          } else if (dy < 0 && isMonthExpandedRef.current) {
            handleCollapseMonthRef.current();
          }
        }
      }
      setDragOffset(0);
      isMouseDown = false;
      mouseStartX = null;
      mouseStartY = null;
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 80);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (wheelTimer) clearTimeout(wheelTimer);
    };
  }, []);

  return (
    <div className="calendar-strip-container" ref={calendarRef}>
      {/* 1. Header: Month Year Navigation */}
      <div className="month-navigation-row">
        <button
          type="button"
          className="month-title-btn"
          onClick={handleToggleMonth}
          onMouseDown={(e) => e.stopPropagation()}
          aria-label={`${isMonthExpanded ? 'Collapse' : 'Expand'} calendar for ${isMonthExpanded ? expandedMonthName : monthName} ${isMonthExpanded ? expandedYear : yearNumber}`}
        >
          <span
            key={isMonthExpanded ? `${expandedMonthName}-${expandedYear}` : `${monthName}-${yearNumber}`}
            className="month-title-text"
          >
            {isMonthExpanded ? `${expandedMonthName} ${expandedYear}` : `${monthName} ${yearNumber}`}
          </span>
          <ChevronDown
            size={14}
            className={`month-title-chevron ${isMonthExpanded ? 'chevron-open' : ''}`}
          />
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
              <div
                key={formatIso(anchorDate)}
                className={`week-dates-grid ${slideDirection ? `slide-${slideDirection}` : ''}`}
                style={{
                  transform: dragOffset ? `translate3d(${dragOffset}px, 0, 0)` : undefined,
                  transition: dragOffset ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
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
                          if (hasDraggedRef.current) return;
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
              <div
                key={`${viewDate.getFullYear()}-${viewDate.getMonth()}`}
                className={`month-dates-grid ${slideDirection ? `slide-${slideDirection}` : ''}`}
                style={{
                  transform: dragOffset ? `translate3d(${dragOffset}px, 0, 0)` : undefined,
                  transition: dragOffset ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
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
                      onClick={() => {
                        if (hasDraggedRef.current) return;
                        handleSelectInGrid(cell.iso, cell.date);
                      }}
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
    </div>
  );
};
