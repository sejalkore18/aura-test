'use client';

import React, { useState, useMemo } from 'react';
import { UserProfile, WorkoutLog } from '@/types/workout';
import { Award, Flame, Dumbbell, Layers, CalendarCheck, CheckCircle2 } from 'lucide-react';
import '@/styles/ProfileView.css';

interface ProfileViewProps {
  activeUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (userId: 'sejal' | 'bhaumik') => void;
  logs: WorkoutLog[];
  onClearUserHistory?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  activeUser,
  allUsers,
  onSwitchUser,
  logs,
}) => {
  const userLogs = logs.filter((l) => !l.userId || l.userId === activeUser.id);
  const totalWorkouts = userLogs.length;
  const totalVolume = userLogs.reduce((acc, log) => {
    const vol =
      log.completedExercises?.reduce(
        (exAcc, ex) =>
          exAcc +
          (ex.sets?.reduce(
            (sAcc, s) => sAcc + (s.reps || 0) * (s.weightKg > 0 ? s.weightKg : 0),
            0
          ) || 0),
        0
      ) || 0;
    return acc + vol;
  }, 0);
  const totalCalories = userLogs.reduce((acc, log) => {
    let workloadBurn = 0;
    let totalSetsCount = 0;

    (log.completedExercises || []).forEach((ex) => {
      (ex.sets || []).forEach((set) => {
        totalSetsCount++;
        const reps = Math.max(0, set.reps || 0);
        const weight = Math.max(0, set.weightKg || 0);

        if (weight > 0) {
          workloadBurn += reps * (0.8 + weight * 0.015);
        } else {
          workloadBurn += reps * 1.0;
        }
      });
    });

    if (totalSetsCount === 0) {
      const estSets = (log.completedExercises?.length || 4) * 3;
      workloadBurn = estSets * 15;
    }

    return acc + workloadBurn;
  }, 0);

  // Attendance filter state
  const [attendanceFilter, setAttendanceFilter] = useState<'this_month' | 'past_month' | 'lifetime'>('this_month');

  // Overall lifetime unique attendance days
  const lifetimeAttendanceDays = useMemo(() => {
    return new Set(
      userLogs
        .filter((log) => log.createdAt || log.updatedAt)
        .map((log) => {
          const d = new Date(log.createdAt || log.updatedAt!);
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
    ).size;
  }, [userLogs]);

  // Calendar dates reference for filtering
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const pastMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const pastMonthYear = pastMonthDate.getFullYear();
  const pastMonth = pastMonthDate.getMonth();

  // Filter logs for attendance section
  const filteredLogs = useMemo(() => {
    return userLogs.filter((log) => {
      const rawDate = log.createdAt || log.updatedAt;
      if (!rawDate) return false;
      const d = new Date(rawDate);
      if (isNaN(d.getTime())) return false;

      if (attendanceFilter === 'this_month') {
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      }
      if (attendanceFilter === 'past_month') {
        return d.getFullYear() === pastMonthYear && d.getMonth() === pastMonth;
      }
      return true;
    });
  }, [userLogs, attendanceFilter, currentYear, currentMonth, pastMonthYear, pastMonth]);

  // Unique attended dates list sorted descending
  const attendedDatesList = useMemo(() => {
    const datesMap = new Map<string, Date>();
    filteredLogs.forEach((log) => {
      const rawDate = log.createdAt || log.updatedAt;
      if (rawDate) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          if (!datesMap.has(key)) {
            datesMap.set(key, d);
          }
        }
      }
    });
    return Array.from(datesMap.values()).sort((a, b) => b.getTime() - a.getTime());
  }, [filteredLogs]);

  const filterDaysCount = attendedDatesList.length;
  const filterWorkoutsCount = filteredLogs.length;
  const filterVolume = filteredLogs.reduce((acc, log) => {
    return (
      acc +
      (log.completedExercises?.reduce(
        (exAcc, ex) =>
          exAcc +
          (ex.sets?.reduce(
            (sAcc, s) => sAcc + (s.reps || 0) * (s.weightKg > 0 ? s.weightKg : 0),
            0
          ) || 0),
        0
      ) || 0)
    );
  }, 0);

  // 4 days per week target consistency calculation
  const TARGET_DAYS_PER_WEEK = 4;

  const consistencyPercentage = useMemo(() => {
    if (filterDaysCount === 0) return 0;

    let targetDays = 1;

    if (attendanceFilter === 'this_month') {
      const daysElapsed = Math.max(1, now.getDate());
      const weeksElapsed = daysElapsed / 7;
      targetDays = Math.max(1, weeksElapsed * TARGET_DAYS_PER_WEEK);
    } else if (attendanceFilter === 'past_month') {
      const daysInPastMonth = new Date(pastMonthYear, pastMonth + 1, 0).getDate();
      const weeksInPastMonth = daysInPastMonth / 7;
      targetDays = Math.max(1, weeksInPastMonth * TARGET_DAYS_PER_WEEK);
    } else {
      const firstLogTime =
        userLogs.length > 0
          ? Math.min(
              ...userLogs.map((l) =>
                new Date(l.createdAt || l.updatedAt || Date.now()).getTime()
              )
            )
          : Date.now();
      const msDiff = Math.max(Date.now() - firstLogTime, 7 * 24 * 60 * 60 * 1000);
      const lifetimeWeeks = msDiff / (7 * 24 * 60 * 60 * 1000);
      targetDays = Math.max(1, lifetimeWeeks * TARGET_DAYS_PER_WEEK);
    }

    return Math.min(100, Math.round((filterDaysCount / targetDays) * 100));
  }, [filterDaysCount, attendanceFilter, now, pastMonthYear, pastMonth, userLogs]);

  const formatDateTag = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="profile-view animate-fade-in">
      {/* Profile Header Card */}
      <div className="profile-card">
        <div
          className="large-avatar"
          style={{
            backgroundColor: activeUser.avatarColor,
            boxShadow: `0 0 24px ${activeUser.avatarColor}66`,
          }}
        >
          {activeUser.initials}
        </div>

        <h1 className="user-display-name">{activeUser.name}</h1>

        {/* Profile Switcher Pills */}
        <div className="profile-switcher-pill">
          <span className="switcher-label">Active Profile:</span>
          <div className="switcher-buttons">
            {allUsers.map((user) => {
              const isActive = user.id === activeUser.id;
              return (
                <button
                  key={user.id}
                  className={`switch-user-btn ${isActive ? 'active' : ''}`}
                  onClick={() => onSwitchUser(user.id)}
                >
                  <span
                    className="mini-dot"
                    style={{ backgroundColor: user.avatarColor }}
                  />
                  <span>{user.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lifetime Stats Section */}
      <section className="stats-section">
        <h2 className="section-title">
          <span>Lifetime Performance</span>
        </h2>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Layers size={18} />
            </div>
            <span className="stat-number">{totalWorkouts}</span>
            <span className="stat-label">Workouts</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Dumbbell size={18} />
            </div>
            <span className="stat-number">{Math.round(totalVolume).toLocaleString('en-US')}</span>
            <span className="stat-label">kgs Lifted</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">
              <Flame size={18}/>
            </div>
            <span className="stat-number">{Math.round(totalCalories).toLocaleString('en-US')}</span>
            <span className="stat-label">Calories Burnt</span>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap">
              <CalendarCheck size={18} />
            </div>
            <span className="stat-number">{lifetimeAttendanceDays}</span>
            <span className="stat-label">Attendance</span>
          </div>
        </div>
      </section>

      {/* Section Divider */}
      <div className="profile-section-divider" />

      {/* Attendance & Consistency Section with Filters */}
      <section className="attendance-section">
        <div className="attendance-header">
          <h2 className="section-title">
            <span>Attendance</span>
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="attendance-filters">
          <button
            type="button"
            className={`attendance-filter-btn ${attendanceFilter === 'this_month' ? 'active' : ''}`}
            onClick={() => setAttendanceFilter('this_month')}
          >
            This Month
          </button>
          <button
            type="button"
            className={`attendance-filter-btn ${attendanceFilter === 'past_month' ? 'active' : ''}`}
            onClick={() => setAttendanceFilter('past_month')}
          >
            Past Month
          </button>
          <button
            type="button"
            className={`attendance-filter-btn ${attendanceFilter === 'lifetime' ? 'active' : ''}`}
            onClick={() => setAttendanceFilter('lifetime')}
          >
            Lifetime
          </button>
        </div>

        {/* Attendance Summary Card */}
        <div className="attendance-card">
          <div className="attendance-hero">
            <div className="attendance-metric">
              <span className="attendance-count">{filterDaysCount}</span>
              <span className="attendance-unit">
                {filterDaysCount === 1 ? 'Day Attended' : 'Days Attended'}
              </span>
            </div>
            <div className="attendance-meta-badge">
              <span className="meta-badge-text">
                {attendanceFilter === 'this_month'
                  ? now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : attendanceFilter === 'past_month'
                  ? pastMonthDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                  : 'All Time'}
              </span>
            </div>
          </div>

          <div className="attendance-stats-row">
            <div className="attendance-stat-item">
              <span className="attendance-stat-val">{filterWorkoutsCount}</span>
              <span className="attendance-stat-sub">Workouts</span>
            </div>
            <div className="attendance-stat-divider" />
            <div className="attendance-stat-item">
              <span className="attendance-stat-val">
                {Math.round(filterVolume).toLocaleString('en-US')}
              </span>
              <span className="attendance-stat-sub">kgs Lifted</span>
            </div>
            <div className="attendance-stat-divider" />
            <div className="attendance-stat-item">
              <span className="attendance-stat-val">{consistencyPercentage}%</span>
              <span className="attendance-stat-sub">Consistency</span>
            </div>
          </div>

          {/* Attended Dates Cloud */}
          <div className="attendance-dates-section">
            <span className="attendance-dates-label">Attended Dates</span>
            {attendedDatesList.length > 0 ? (
              <div className="attendance-dates-cloud">
                {attendedDatesList.map((d, i) => (
                  <span key={i} className="attendance-date-pill">
                    <CheckCircle2 size={12} className="text-green" />
                    {formatDateTag(d)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="attendance-empty-msg">No workout check-ins recorded for this period.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
