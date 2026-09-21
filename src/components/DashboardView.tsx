'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ArrowRight, Play, Activity } from 'lucide-react';
import { UserProfile, WorkoutRoutine, WorkoutLog, Exercise } from '@/types/workout';
import { getExerciseById, EXERCISE_LIBRARY, DEFAULT_ROUTINES } from '@/data/exercises';

// Helper to simplify targeted muscles into clean, friendly lowercase terms matching design
const formatMusclesForDisplay = (ex?: Exercise, fallbackName?: string): string => {
  if (ex) {
    const rawList = [...(ex.primaryMuscles || []), ...(ex.secondaryMuscles || [])];
    const cleanList: string[] = [];

    rawList.forEach((m) => {
      const s = m.replace(/\s*\(.*?\)/g, '').trim().toLowerCase();
      let friendly = s;
      if (s.includes('pectoralis') || s.includes('chest')) friendly = 'chest';
      else if (s.includes('deltoid') || s.includes('shoulder')) friendly = 'shoulders';
      else if (s.includes('tricep')) friendly = 'triceps';
      else if (s.includes('bicep')) friendly = 'biceps';
      else if (s.includes('quad')) friendly = 'thighs';
      else if (s.includes('glute')) friendly = 'glutes';
      else if (s.includes('hamstring')) friendly = 'hamstrings';
      else if (s.includes('gastrocnemius') || s.includes('soleus') || s.includes('calf')) friendly = 'calves';
      else if (s.includes('latissimus') || s.includes('lats') || s.includes('back')) friendly = 'lats';
      else if (s.includes('trapezius') || s.includes('traps')) friendly = 'traps';
      else if (s.includes('core') || s.includes('abdom') || s.includes('abs')) friendly = 'core';
      else if (s.includes('leg')) friendly = 'legs';

      if (!cleanList.includes(friendly)) {
        cleanList.push(friendly);
      }
    });

    if (cleanList.length > 0) {
      return cleanList.slice(0, 3).join(', ');
    }

    if (ex.category) {
      return ex.category;
    }
  }

  const lower = (fallbackName || '').toLowerCase();
  if (lower.includes('push-up') || lower.includes('press') || lower.includes('bench')) {
    return 'biceps, triceps, shoulders';
  }
  if (lower.includes('squat')) {
    return 'calves, legs, thighs';
  }
  if (lower.includes('lunge')) {
    return 'calves, hamstrings, glutes';
  }
  if (lower.includes('pull-up') || lower.includes('row') || lower.includes('deadlift')) {
    return 'back, lats, biceps';
  }
  if (lower.includes('dip')) {
    return 'triceps, shoulders, chest';
  }
  if (lower.includes('curl')) {
    return 'biceps, forearms';
  }

  return 'full body, core';
};

const findExerciseByNameOrId = (nameOrId: string): Exercise | undefined => {
  const norm = nameOrId.toLowerCase().trim();
  let found = EXERCISE_LIBRARY.find((e) => e.id.toLowerCase() === norm);
  if (found) return found;

  found = EXERCISE_LIBRARY.find((e) => e.name.toLowerCase() === norm);
  if (found) return found;

  const slug = norm.replace(/\s+/g, '-');
  found = EXERCISE_LIBRARY.find((e) => e.id.toLowerCase() === slug);
  if (found) return found;

  found = EXERCISE_LIBRARY.find(
    (e) => e.name.toLowerCase().includes(norm) || norm.includes(e.name.toLowerCase())
  );
  return found;
};

const ACCENT_COLORS = [
  '#ea580c', // Muted warm terracotta / orange
  '#0d9488', // Sage teal / cyan
  '#6366f1', // Slate indigo / purple
  '#ec4899', // Crimson rose
  '#3b82f6', // Electric blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
];

interface DashboardViewProps {
  activeUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (userId: 'sejal' | 'bhaumik') => void;
  currentRoutine: WorkoutRoutine;
  isRestDay?: boolean;
  isSessionActive: boolean;
  completedExerciseIds: string[];
  workoutLogs: WorkoutLog[];
  onStartWorkout: () => void;
  onSelectExercise: (exerciseIndex: number) => void;
  onOpenExerciseDetails: (exercise: Exercise) => void;
  onGoToWorkoutTab: () => void;
  onGoToHistoryTab: () => void;
  onRefresh?: () => Promise<void> | void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeUser,
  allUsers,
  onSwitchUser,
  currentRoutine,
  isRestDay = false,
  isSessionActive,
  completedExerciseIds,
  workoutLogs,
  onStartWorkout,
  onSelectExercise,
  onOpenExerciseDetails,
  onGoToWorkoutTab,
  onGoToHistoryTab,
  onRefresh,
}) => {
  // Pull to refresh state
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [refreshSuccess, setRefreshSuccess] = useState<boolean>(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const pullDistanceRef = React.useRef<number>(0);
  const isRefreshingRef = React.useRef<boolean>(false);
  const onRefreshRef = React.useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const PULL_THRESHOLD = 60;
  const MAX_PULL = 88;

  const handleTriggerRefresh = React.useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    setRefreshSuccess(false);

    try {
      if (onRefreshRef.current) {
        await onRefreshRef.current();
      } else {
        setTimeout(() => {
          window.location.reload();
        }, 350);
      }
    } catch {
      window.location.reload();
    }
  }, []);

  // Multi-input gesture listeners (Trackpad Wheel, Mobile Touch, Mouse Drag)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const scrollParent = (el.closest('.tab-scroll-viewport') as HTMLElement | null) || el;

    let touchStartY = 0;
    let isTouchActive = false;
    let wheelTimeout: NodeJS.Timeout | null = null;

    // 1. TOUCH (Mobile devices & devtools touch emulation)
    const onTouchStart = (e: TouchEvent) => {
      if (isRefreshingRef.current) return;
      if (scrollParent.scrollTop > 2) return;
      touchStartY = e.touches[0].clientY;
      isTouchActive = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isTouchActive || isRefreshingRef.current) return;
      if (scrollParent.scrollTop > 2) {
        if (pullDistanceRef.current > 0) {
          pullDistanceRef.current = 0;
          setPullDistance(0);
        }
        return;
      }

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchStartY;

      if (deltaY > 0) {
        if (e.cancelable) e.preventDefault();
        const damped = Math.min(MAX_PULL, deltaY * 0.45);
        pullDistanceRef.current = damped;
        setPullDistance(damped);
        setIsPulling(true);
      } else {
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    };

    const onTouchEnd = () => {
      if (!isTouchActive || isRefreshingRef.current) return;
      isTouchActive = false;
      setIsPulling(false);
      if (pullDistanceRef.current >= PULL_THRESHOLD) {
        pullDistanceRef.current = 54;
        setPullDistance(54);
        handleTriggerRefresh();
      } else {
        pullDistanceRef.current = 0;
        setPullDistance(0);
      }
    };

    // 2. TRACKPAD & MOUSE WHEEL (Two-finger swipe down on Mac)
    const onWheel = (e: WheelEvent) => {
      if (isRefreshingRef.current) return;
      if (scrollParent.scrollTop <= 0) {
        if (e.deltaY < 0 || pullDistanceRef.current > 0) {
          if (e.cancelable) e.preventDefault();
          const change = -e.deltaY * 0.4;
          const next = Math.max(0, Math.min(MAX_PULL, pullDistanceRef.current + change));
          pullDistanceRef.current = next;
          setPullDistance(next);
          setIsPulling(true);

          if (wheelTimeout) clearTimeout(wheelTimeout);
          wheelTimeout = setTimeout(() => {
            setIsPulling(false);
            if (pullDistanceRef.current >= PULL_THRESHOLD) {
              pullDistanceRef.current = 54;
              setPullDistance(54);
              handleTriggerRefresh();
            } else {
              pullDistanceRef.current = 0;
              setPullDistance(0);
            }
          }, 180);
        }
      }
    };

    // 3. MOUSE DRAG (Desktop testing)
    const onMouseDown = (e: MouseEvent) => {
      if (isRefreshingRef.current || e.button !== 0) return;
      if (scrollParent.scrollTop > 2) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('button') || target?.closest('a') || target?.closest('input')) {
        return;
      }
      const startY = e.clientY;
      let isDragging = false;

      const onMouseMove = (me: MouseEvent) => {
        if (scrollParent.scrollTop > 2) {
          pullDistanceRef.current = 0;
          setPullDistance(0);
          return;
        }
        const deltaY = me.clientY - startY;
        if (deltaY > 4) {
          isDragging = true;
          me.preventDefault();
          const damped = Math.min(MAX_PULL, deltaY * 0.45);
          pullDistanceRef.current = damped;
          setPullDistance(damped);
          setIsPulling(true);
        } else if (isDragging) {
          pullDistanceRef.current = 0;
          setPullDistance(0);
        }
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        if (!isDragging) return;
        setIsPulling(false);
        if (pullDistanceRef.current >= PULL_THRESHOLD) {
          pullDistanceRef.current = 54;
          setPullDistance(54);
          handleTriggerRefresh();
        } else {
          pullDistanceRef.current = 0;
          setPullDistance(0);
        }
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    scrollParent.addEventListener('touchstart', onTouchStart, { passive: false });
    scrollParent.addEventListener('touchmove', onTouchMove, { passive: false });
    scrollParent.addEventListener('touchend', onTouchEnd);
    scrollParent.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('mousedown', onMouseDown);

    return () => {
      scrollParent.removeEventListener('touchstart', onTouchStart);
      scrollParent.removeEventListener('touchmove', onTouchMove);
      scrollParent.removeEventListener('touchend', onTouchEnd);
      scrollParent.removeEventListener('wheel', onWheel);
      el.removeEventListener('mousedown', onMouseDown);
      if (wheelTimeout) clearTimeout(wheelTimeout);
    };
  }, [handleTriggerRefresh]);

  // User switch animation state
  const [isSwitching, setIsSwitching] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  const handleToggleUser = () => {
    if (isSwitching) return;
    setIsSwitching(true);
    setIsExiting(true);

    const nextUser = activeUser.id === 'sejal' ? 'bhaumik' : 'sejal';

    // Phase 1: Soft dissolve out current state (220ms)
    setTimeout(() => {
      onSwitchUser(nextUser);
      setIsExiting(false);
    }, 220);

    // Phase 2: Complete bloom and settled transition (900ms)
    setTimeout(() => {
      setIsSwitching(false);
    }, 900);
  };

  // Calculate exercises remaining in today's routine
  const totalExercises = currentRoutine?.exercises?.length || 0;
  const completedCount = completedExerciseIds.length;
  const exercisesLeft = Math.max(0, totalExercises - completedCount);
  const isWorkoutInProgress = isSessionActive || completedCount > 0;
  const isAllCompleted = totalExercises > 0 && completedCount === totalExercises;
  const calculatedPercent =
    totalExercises > 0
      ? Math.round((completedCount / totalExercises) * 100)
      : 0;

  // Filter logs for active athlete
  const userLogs = workoutLogs.filter((log) => log.userId === activeUser.id);

  // Robust check for workouts completed today
  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayDateStr = now.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const todayLogs = userLogs.filter((log) => {
    if (log.isoDate && log.isoDate === todayIso) return true;
    if (log.date === todayDateStr) return true;
    if (log.date) {
      const parsed = new Date(log.date);
      if (!isNaN(parsed.getTime())) {
        return (
          parsed.getFullYear() === now.getFullYear() &&
          parsed.getMonth() === now.getMonth() &&
          parsed.getDate() === now.getDate()
        );
      }
    }
    return false;
  });

  // Dynamic activity items and calories calculation for workout done today
  interface TodayActivityExercise {
    id: string;
    name: string;
    muscles: string;
    reps: number;
    sets: number;
    accentColor: string;
    matchedEx?: Exercise;
  }

  const dynamicActivityItems: TodayActivityExercise[] = [];
  let todayCaloriesBurned = 0;

  if (todayLogs.length > 0) {
    // 1. From completed workout(s) logged today
    todayLogs.forEach((log) => {
      // Calculate realistic calories burned for this completed workout
      const matchedRoutine = [currentRoutine, ...DEFAULT_ROUTINES].find(
        (r) => r.id === log.routineId || r.title?.toLowerCase() === log.routineTitle?.toLowerCase()
      );
      if (matchedRoutine?.estimatedCalories) {
        todayCaloriesBurned += matchedRoutine.estimatedCalories;
      } else {
        const dur = log.durationMinutes || 25;
        const reps = log.totalReps || 45;
        todayCaloriesBurned += Math.round(dur * 8.5 + reps * 0.4);
      }

      // Collect all completed exercises with actual sets & reps
      (log.completedExercises || []).forEach((ce, idx) => {
        const matchedEx = findExerciseByNameOrId(ce.name);
        const setsCount = ce.sets?.length || 1;
        const avgReps =
          setsCount > 0
            ? Math.round(ce.sets.reduce((sum, s) => sum + (s.reps || 0), 0) / setsCount)
            : 10;
        const muscles = formatMusclesForDisplay(matchedEx, ce.name);
        const colorIdx = dynamicActivityItems.length % ACCENT_COLORS.length;

        dynamicActivityItems.push({
          id: matchedEx?.id || `today-ce-${idx}`,
          name: ce.name,
          muscles,
          reps: avgReps,
          sets: setsCount,
          accentColor: ACCENT_COLORS[colorIdx],
          matchedEx,
        });
      });
    });
  } else if (completedExerciseIds.length > 0) {
    // 2. From active workout session completed exercises today
    currentRoutine.exercises
      .filter((e) => completedExerciseIds.includes(e.exerciseId))
      .forEach((rEx, idx) => {
        const matchedEx = getExerciseById(rEx.exerciseId) || findExerciseByNameOrId(rEx.exerciseId);
        const exName = matchedEx?.name || rEx.exerciseId;
        const completedSets = rEx.sets?.filter((s) => s.completed) || [];
        const setsCount = completedSets.length > 0 ? completedSets.length : rEx.targetSets || 3;
        const reps =
          completedSets.length > 0
            ? Math.round(
                completedSets.reduce(
                  (sum, s) => sum + (s.actualReps || s.targetReps),
                  0
                ) / completedSets.length
              )
            : rEx.targetReps || matchedEx?.defaultReps || 10;
        const muscles = formatMusclesForDisplay(matchedEx, exName);
        const colorIdx = idx % ACCENT_COLORS.length;

        dynamicActivityItems.push({
          id: rEx.exerciseId,
          name: exName,
          muscles,
          reps,
          sets: setsCount,
          accentColor: ACCENT_COLORS[colorIdx],
          matchedEx,
        });
      });

    const totalRoutineEx = currentRoutine.exercises?.length || 1;
    const baseRoutineCal = currentRoutine.estimatedCalories || 280;
    todayCaloriesBurned = Math.round(
      (completedExerciseIds.length / totalRoutineEx) * baseRoutineCal
    );
  }

  const hasActivityToday = dynamicActivityItems.length > 0 || todayLogs.length > 0;

  // Format calories nicely (e.g. 380, or 1.350 / 1,350 if >= 1000)
  const formattedCalories =
    todayCaloriesBurned >= 1000
      ? (todayCaloriesBurned / 1000).toFixed(3)
      : todayCaloriesBurned > 0
      ? String(todayCaloriesBurned)
      : '0';

  // Helper for circular SVG progress rings with mathematically centered percentage text
  const renderProgressRing = (
    percent: number,
    size = 58,
    strokeWidth = 5,
    strokeColor = '#2dd4bf',
    trackColor = 'rgba(255, 255, 255, 0.12)',
    textColor = '#e4e4e7',
    progressStrokeWidth?: number
  ) => {
    const activeProgressStroke = progressStrokeWidth ?? strokeWidth;
    const maxStroke = Math.max(strokeWidth, activeProgressStroke);
    const radius = (size - maxStroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;
    const fontSize = size < 50 ? '0.72rem' : '0.86rem';

    return (
      <div
        className="progress-ring-wrapper"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="progress-ring-svg"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={activeProgressStroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="progress-ring-circle"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="central"
            fill={textColor}
            style={{
              fontSize,
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
            }}
          >
            {percent}%
          </text>
        </svg>
      </div>
    );
  };

  return (
    <div
      className="dashboard-container"
      ref={containerRef}
      style={{ userSelect: isPulling ? 'none' : 'auto' }}
    >
      {/* Pull To Refresh Indicator Banner (Home Screen Only) */}
      <div
        className={`pull-refresh-banner ${isRefreshing ? 'refreshing' : ''} ${refreshSuccess ? 'success' : ''}`}
        style={{
          opacity: isRefreshing ? 1 : Math.min(1, pullDistance / 24),
          transform: `translateY(${isRefreshing ? 6 : Math.min(pullDistance - 48, 8)}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
        }}
        aria-hidden={pullDistance === 0 && !isRefreshing}
      >
        <div className="pull-refresh-inner">
          <div className={`pull-emblem-badge ${isRefreshing ? 'spin-glow' : ''}`}>
            <div className="pull-logo-box">
              <Image
                src="/logo-cosmic.png"
                alt="Aura"
                width={18}
                height={18}
                priority
                className="pull-logo-img"
              />
            </div>
          </div>

          <span className="pull-status-label">
            {refreshSuccess
              ? 'Synced'
              : isRefreshing
              ? 'Syncing Aura...'
              : pullDistance >= PULL_THRESHOLD
              ? 'Release to refresh'
              : 'Pull to refresh'}
          </span>
        </div>
      </div>

      {/* Dashboard Body Content - Translates smoothly on pull without altering flex gaps */}
      <div
        className="dashboard-scrollable-content"
        style={{
          transform: `translateY(${isRefreshing ? 54 : pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >

      {/* 1. Header Greeting Bar (Dark Mode) */}
      <header className="dashboard-header">
        <div className="user-greeting-group">
          {/* User Profile Avatar with quick switch indicator */}
          {/* User Profile Avatar with quick switch indicator */}
          <button
            className={`avatar-btn ${isSwitching ? 'switching' : ''}`}
            onClick={handleToggleUser}
            title={`Active: ${activeUser.name}. Click to switch athlete.`}
            aria-label={`Switch profile from ${activeUser.name}`}
          >
            <div className="brand-logo-avatar">
              <Image
                src="/logo-cosmic.png"
                alt="Aura Logo"
                width={34}
                height={34}
                priority
                className="logo-img"
              />
            </div>
          </button>

          <div className="greeting-text-block">
            <span className="welcome-subtitle">WELCOME,</span>
            <div className="athlete-name-row" key={activeUser.id}>
              <h1 className={`athlete-name ${isExiting ? 'fade-out' : 'animate-user-in'}`}>{activeUser.name} !</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 2. "Workout Progress" Banner Card (Deep Charcoal Hero Card) */}
      <section
        className={`workout-progress-card ${isExiting ? 'card-fade-out' : 'animate-card-fade'} ${isRestDay && !isWorkoutInProgress ? 'workout-progress-card--rest' : ''}`}
        key={`workout-${activeUser.id}`}
        onClick={isRestDay && !isWorkoutInProgress ? undefined : onStartWorkout}
        role={isRestDay && !isWorkoutInProgress ? undefined : 'button'}
        tabIndex={isRestDay && !isWorkoutInProgress ? undefined : 0}
        aria-label={isRestDay && !isWorkoutInProgress ? "Rest day" : "Start or view today's workout"}
      >
        <div className="progress-card-content">
          <div className="progress-text-block">
            <h2 className="progress-title">Today&apos;s Workout</h2>
            <p className="progress-subtitle">
              {isRestDay && !isWorkoutInProgress
                ? 'Rest & recover 🛋️'
                : isWorkoutInProgress
                ? isAllCompleted
                  ? 'All exercises completed! 🎉'
                  : `${exercisesLeft} exercise${exercisesLeft === 1 ? '' : 's'} left`
                : `${currentRoutine.title} · ~${currentRoutine.estimatedMinutes} min`}
            </p>
          </div>

          {isRestDay && !isWorkoutInProgress ? (
            <div className="rest-day-icon" aria-hidden="true">
              🌙
            </div>
          ) : isWorkoutInProgress ? (
            <div className="progress-ring-box">
              {renderProgressRing(
                calculatedPercent,
                64,
                6,
                '#34d399',
                'rgba(255, 255, 255, 0.12)',
                '#e4e4e7',
                8
              )}
            </div>
          ) : (
            <div className="start-play-trigger" title="Start Workout">
              <div className="play-trigger-ring">
                <div className="play-trigger-core">
                  <Play size={16} fill="#03172e" strokeWidth={0} className="play-triangle" />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. "Today's Activity" Section (Dark Glass Card) */}
      <section className="todays-activity-section">
        <div className="section-header-row">
          <h2 className="section-heading">Today&apos;s Activity</h2>
        </div>

        {hasActivityToday ? (
          <div className={`activity-card-container ${isExiting ? 'card-fade-out' : 'animate-card-fade-stagger'}`} key={`activity-${activeUser.id}`}>
            {/* Top: Rose-Crimson Full-Width Calorie Card with Overhead Lifter & Waves */}
            <div className="calorie-rose-card">
              {/* Top Weightlifter Icon in Translucent Glass Circle */}
              <div className="weightlifter-glass-circle">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="lifter-svg"
                >
                  {/* Barbell overhead */}
                  <path
                    d="M4 4H20M4 3V5M20 3V5"
                    stroke="#e4e4e7"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* Lifter head */}
                  <circle cx="12" cy="7.5" r="2" fill="#e4e4e7" />
                  {/* Lifter arms holding barbell */}
                  <path
                    d="M6 5L9.5 9.5L12 11.5L14.5 9.5L18 5"
                    stroke="#e4e4e7"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Lifter torso & legs */}
                  <path
                    d="M12 11.5V16M12 16L9.5 20M12 16L14.5 20"
                    stroke="#e4e4e7"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Middle: Calorie Value & Subtitle */}
              <div className="calorie-meta-group">
                <span className="calorie-number">{formattedCalories}</span>
                <span className="calorie-unit-label">Calories</span>
              </div>

              {/* Bottom Liquid Wave Overlay */}
              <div className="wave-decoration-box">
                <svg
                  viewBox="0 0 400 40"
                  preserveAspectRatio="none"
                  className="wave-svg"
                >
                  <path
                    d="M0,20 C60,35 140,10 220,24 C300,38 350,14 400,20 L400,40 L0,40 Z"
                    fill="rgba(255, 255, 255, 0.04)"
                  />
                  <path
                    d="M0,28 C80,18 160,34 240,20 C310,8 370,26 400,24 L400,40 L0,40 Z"
                    fill="rgba(255, 255, 255, 0.08)"
                  />
                </svg>
              </div>
            </div>

            {/* Bottom: Exercise Breakdown List (Dark Mode) */}
            <div className="exercises-list-column">
              {dynamicActivityItems.map((item, index) => {
                const matchedEx =
                  item.matchedEx ||
                  getExerciseById(item.id) ||
                  findExerciseByNameOrId(item.name);

                return (
                  <div
                    key={`${item.id}-${index}`}
                    className="activity-exercise-row"
                    onClick={() => {
                      if (matchedEx) {
                        onOpenExerciseDetails(matchedEx);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    title={`View ${item.name} details`}
                  >
                    {/* Vertical Colored Indicator Pill */}
                    <div
                      className="exercise-indicator-pill"
                      style={{ backgroundColor: item.accentColor }}
                    />

                    {/* Exercise Title & Targeted Muscle Groups */}
                    <div className="exercise-text-meta">
                      <span className="exercise-row-name">{item.name}</span>
                      <span className="exercise-row-muscles">{item.muscles}</span>
                    </div>

                    {/* Target Reps and Sets Badge: e.g. 15 x3 */}
                    <div className="exercise-reps-formula">
                      <span className="formula-reps">{item.reps}</span>
                      <span className="formula-multiplier">x{item.sets}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className={`no-activity-card ${isExiting ? 'card-fade-out' : 'animate-card-fade-stagger'}`} key={`no-activity-${activeUser.id}`}>
            <div className="no-activity-icon-bubble">
              <Activity size={28} strokeWidth={2.2} className="no-activity-icon" />
            </div>
            <div className="no-activity-text-content">
              <h3 className="no-activity-title">No workout completed today</h3>
              <p className="no-activity-subtitle">Complete today&apos;s routine to track your activity and calories</p>
            </div>
            <button className="no-activity-start-btn" onClick={onStartWorkout}>
              Start Workout
            </button>
          </div>
        )}
      </section>

      {/* Guaranteed Bottom Spacer between Today's Activity and Bottom Navigation Bar */}
      <div className="dashboard-bottom-spacer" />
      </div>

      <style jsx>{`
        /* Pull-To-Refresh Indicator Styles */
        .dashboard-container {
          position: relative;
          display: flex;
          flex-direction: column;
          background-color: var(--bg-primary, #08080a);
          color: var(--text-primary, #e4e4e7);
          min-height: 100%;
          font-family: var(--font-body);
        }

        .pull-refresh-banner {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          z-index: 30;
          box-sizing: border-box;
        }

        .pull-refresh-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          height: 100%;
          padding: 0 16px;
        }

        .pull-emblem-badge {
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pull-emblem-badge.spin-glow {
          animation: cosmicSpin 1.1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .pull-progress-ring {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .ring-bg {
          stroke: rgba(255, 255, 255, 0.08);
        }

        .ring-bar {
          stroke-linecap: round;
          transition: stroke-dashoffset 0.08s ease-out;
        }

        .pull-logo-box {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
        }

        :global(.pull-logo-img) {
          filter: none;
        }

        .pull-status-label {
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #94a3b8;
          transition: color 0.2s ease;
        }

        .pull-refresh-banner.refreshing .pull-status-label {
          color: #94a3b8;
        }

        .pull-refresh-banner.success .pull-status-label {
          color: #94a3b8;
        }

        @keyframes cosmicSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .dashboard-scrollable-content {
          display: flex;
          flex-direction: column;
          gap: 22px;
          padding: 24px 20px 0;
          width: 100%;
          will-change: transform;
        }

        .dashboard-bottom-spacer {
          height: 24px;
          flex-shrink: 0;
          width: 100%;
        }

        /* 1. Header Styling (Dark Mode) */
        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 4px 4px;
          position: relative;
        }

        .user-greeting-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          cursor: pointer;
        }

        .brand-logo-avatar {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s ease;
          will-change: transform, filter;
        }

        .avatar-btn:hover .brand-logo-avatar {
          filter: brightness(1.15);
        }

        .avatar-btn:active .brand-logo-avatar {
          transform: scale(0.92);
          transition: transform 0.12s ease;
        }

        /* Tactile Breathing Bloom instead of 360 Spin */
        .avatar-btn.switching .brand-logo-avatar {
          animation: logoBloom 0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes logoBloom {
          0% {
            transform: scale(1);
            filter: brightness(1);
          }
          30% {
            transform: scale(0.88);
            filter: brightness(1.15);
          }
          65% {
            transform: scale(1.08);
            filter: brightness(1.2);
          }
          100% {
            transform: scale(1);
            filter: brightness(1);
          }
        }

        .athlete-name-row {
          display: flex;
          align-items: center;
        }

        .athlete-name.fade-out {
          opacity: 0;
          transform: translateY(6px);
          filter: blur(4px);
          transition: all 0.22s cubic-bezier(0.4, 0, 1, 1);
        }

        .animate-user-in {
          animation: userSlideIn 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity, filter;
        }

        @keyframes userSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.96);
            filter: blur(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .card-fade-out {
          opacity: 0.35;
          transform: scale(0.985);
          filter: blur(2px);
          transition: all 0.22s cubic-bezier(0.4, 0, 1, 1);
        }

        .animate-card-fade {
          animation: cardFadeIn 0.75s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: transform, opacity;
        }

        .animate-card-fade-stagger {
          animation: cardFadeIn 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.08s both;
          will-change: transform, opacity;
        }

        @keyframes cardFadeIn {
          0% {
            opacity: 0.2;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        :global(.logo-img) {
          width: 34px;
          height: 34px;
          object-fit: contain;
        }

        .greeting-text-block {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }

        .welcome-subtitle {
          font-size: 0.76rem;
          color: var(--text-secondary, #9a9aa2);
          font-weight: 500;
          letter-spacing: -0.01em;
        }

        .athlete-name-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .athlete-name {
          font-family: var(--font-display);
          font-size: 1.18rem;
          font-weight: 800;
          color: #e4e4e7;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .rock-emoji {
          font-size: 1.05rem;
          transform: rotate(-5deg);
          display: inline-block;
        }

        /* 2. Workout Progress Card (Dark Glass Hero Card matching Activity Container) */
        .workout-progress-card {
          background: rgba(22, 22, 28, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 26px;
          padding: 22px 24px;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05);
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(255, 255, 255, 0.09);
        }

        .workout-progress-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 34px -8px rgba(0, 0, 0, 0.7), 0 0 1px 1px rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.18);
          background: rgba(30, 30, 38, 0.85);
        }

        .workout-progress-card:active {
          transform: scale(0.985);
        }

        .workout-progress-card--rest {
          cursor: default;
          background: rgba(18, 18, 26, 0.75);
          border-color: rgba(99, 102, 241, 0.18);
          box-shadow: 0 8px 24px -10px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(99, 102, 241, 0.08);
        }

        .workout-progress-card--rest:hover {
          transform: none;
          box-shadow: 0 8px 24px -10px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(99, 102, 241, 0.1);
          background: rgba(18, 18, 26, 0.75);
          border-color: rgba(99, 102, 241, 0.2);
        }

        .workout-progress-card--rest .progress-title {
          color: #a5b4fc;
        }

        .workout-progress-card--rest .progress-subtitle {
          color: #6b7280;
        }

        .rest-day-icon {
          font-size: 2rem;
          line-height: 1;
          opacity: 0.7;
          flex-shrink: 0;
        }

        .progress-card-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .progress-text-block {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 0;
          flex: 1;
        }

        .progress-title {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          color: #e4e4e7;
          margin: 0;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }

        .progress-subtitle {
          font-size: 0.86rem;
          color: var(--text-secondary, #9a9aa2);
          font-weight: 500;
          margin: 0;
          line-height: 1.35;
        }

        .progress-ring-box {
          flex-shrink: 0;
        }

        .start-play-trigger {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 64px;
          height: 64px;
        }

        .play-trigger-ring {
          position: relative;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(10, 132, 255, 0.1);
          border: 1.5px solid rgba(10, 132, 255, 0.32);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .play-trigger-core {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #0a84ff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
        }

        .workout-progress-card:hover .play-trigger-ring {
          border-color: rgba(10, 132, 255, 0.5);
          background: rgba(10, 132, 255, 0.18);
          transform: scale(1.05);
        }

        .workout-progress-card:hover .play-trigger-core {
          transform: scale(1.06);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
        }

        .workout-progress-card:active .play-trigger-core {
          transform: scale(0.95);
        }

        .play-triangle {
          margin-left: 2px;
        }

        /* Circular Progress Ring (Centered Mathematically via SVG text) */
        .progress-ring-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .progress-ring-svg {
          display: block;
        }

        .progress-ring-circle {
          transition: stroke-dashoffset 0.6s ease;
        }

        /* 3. Today's Activity Section */
        .todays-activity-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 14px;
        }

        .section-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2px;
        }

        .section-heading {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 700;
          color: #e4e4e7;
          margin: 0;
          letter-spacing: -0.01em;
        }

        /* Main Activity Container Card (Dark Glass) */
        .activity-card-container {
          background: rgba(22, 22, 28, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 26px;
          padding: 16px;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.09);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* Top Calorie Card (Sleek Obsidian Charcoal Glass) */
        .calorie-rose-card {
          width: 100%;
          background: linear-gradient(180deg, #1e1e24 0%, #131317 100%);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          padding: 22px 16px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 28px -6px rgba(0, 0, 0, 0.65), 0 0 1px 1px rgba(255, 255, 255, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.1);
        }

        .weightlifter-glass-circle {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.16);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
          margin-bottom: 10px;
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.12);
        }

        .calorie-meta-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          z-index: 2;
          margin-bottom: 6px;
        }

        .calorie-number {
          font-family: var(--font-display);
          font-size: 1.85rem;
          font-weight: 800;
          color: #e4e4e7;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }

        .calorie-unit-label {
          font-size: 0.82rem;
          color: rgba(255, 255, 255, 0.72);
          font-weight: 500;
          margin-top: 3px;
          letter-spacing: 0.02em;
        }

        .wave-decoration-box {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40px;
          pointer-events: none;
          overflow: hidden;
        }

        .wave-svg {
          width: 100%;
          height: 100%;
        }

        /* Bottom Exercises Column */
        .exercises-list-column {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .activity-exercise-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 10px;
          border-radius: 14px;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .activity-exercise-row:hover {
          background-color: rgba(255, 255, 255, 0.07);
        }

        .exercise-indicator-pill {
          width: 5px;
          height: 20px;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .exercise-text-meta {
          flex: 1;
          display: flex;
          flex-direction: column;
          line-height: 1.3;
        }

        .exercise-row-name {
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 700;
          color: #e4e4e7;
          letter-spacing: -0.01em;
        }

        .exercise-row-muscles {
          font-size: 0.76rem;
          color: var(--text-secondary, #9a9aa2);
          font-weight: 500;
        }

        .exercise-reps-formula {
          display: flex;
          align-items: baseline;
          gap: 2px;
          flex-shrink: 0;
        }

        .formula-reps {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 800;
          color: #e4e4e7;
        }

        .formula-multiplier {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary, #9a9aa2);
        }

        /* Empty State: No Activity Today */
        .no-activity-card {
          background: rgba(22, 22, 28, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 26px;
          padding: 34px 20px 28px;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.09);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 14px;
        }

        .no-activity-icon-bubble {
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e4e4e7;
          margin-bottom: 2px;
        }

        .no-activity-text-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
          align-items: center;
        }

        .no-activity-title {
          font-family: var(--font-body);
          font-size: 0.86rem;
          font-weight: 500;
          color: var(--text-secondary, #9a9aa2);
          margin: 0;
          line-height: 1.35;
        }

        .no-activity-subtitle {
          font-size: 0.82rem;
          color: var(--text-secondary, #9a9aa2);
          max-width: 270px;
          margin: 0;
          line-height: 1.45;
        }

        .no-activity-start-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 18px;
          border-radius: 9999px;
          background: #e4e4e7;
          color: #09090b;
          font-size: 0.82rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.18s ease;
          box-shadow: none;
          margin-top: 4px;
        }

        .no-activity-start-btn:hover {
          background: #e4e4e7;
          transform: translateY(-1px);
          box-shadow: none;
        }

        .no-activity-start-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
};
