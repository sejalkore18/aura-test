'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, Activity, Check } from 'lucide-react';
import { UserProfile, WorkoutRoutine, WorkoutLog, Exercise } from '@/types/workout';
import { getExerciseById, EXERCISE_LIBRARY } from '@/data/exercises';
import '@/styles/DashboardView.css';

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
  onSwitchUser,
  currentRoutine,
  isRestDay = false,
  isSessionActive,
  completedExerciseIds,
  workoutLogs,
  onOpenExerciseDetails,
  onGoToWorkoutTab,
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

  const todayLogs = userLogs.filter((log) => {
    if (log.createdAt) {
      try {
        const parsed = new Date(log.createdAt);
        if (!isNaN(parsed.getTime())) {
          return (
            parsed.getFullYear() === now.getFullYear() &&
            parsed.getMonth() === now.getMonth() &&
            parsed.getDate() === now.getDate()
          );
        }
      } catch {
        // ignore
      }
    }
    return false;
  });

  const isWorkoutCompletedToday = todayLogs.length > 0;

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
      // Calculate realistic calories burned purely from exercise workload (sets, reps, weight)
      // Time expenditure is removed so calories directly reflect physical work done
      let workloadBurn = 0;
      let totalSetsCount = 0;

      (log.completedExercises || []).forEach((ex) => {
        (ex.sets || []).forEach((set) => {
          totalSetsCount++;
          const reps = Math.max(0, set.reps || 0);
          const weight = Math.max(0, set.weightKg || 0);

          if (weight > 0) {
            // External weight work: 0.8 kcal base per rep + (reps * weightKg * 0.015) kcal
            workloadBurn += reps * (0.8 + weight * 0.015);
          } else {
            // Bodyweight exercise work: 1.0 kcal per rep
            workloadBurn += reps * 1.0;
          }
        });
      });

      // Fallback if sets were not detailed: estimate based on standard sets (~15 kcal per set)
      if (totalSetsCount === 0) {
        const estSets = (log.completedExercises?.length || 4) * 3;
        workloadBurn = estSets * 15;
      }

      todayCaloriesBurned += Math.round(workloadBurn);

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
        const setsCount = typeof rEx.sets === 'number' ? rEx.sets : rEx.targetSets || 3;
        const reps = rEx.targetReps || matchedEx?.defaultReps || 10;
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
    let plannedRoutineCal = 0;
    currentRoutine.exercises.forEach((ex) => {
      const setsCount = typeof ex.sets === 'number' ? ex.sets : ex.targetSets || 3;
      const reps = ex.targetReps || 10;
      const weight = ex.targetWeightKg || 0;
      if (weight > 0) {
        plannedRoutineCal += setsCount * reps * (0.8 + weight * 0.015);
      } else {
        plannedRoutineCal += setsCount * reps * 1.0;
      }
    });

    const baseRoutineCal =
      currentRoutine.estimatedCalories || Math.round(plannedRoutineCal || 200);
    todayCaloriesBurned = Math.round(
      (completedExerciseIds.length / totalRoutineEx) * baseRoutineCal
    );
  }

  const hasActivityToday = dynamicActivityItems.length > 0 || todayLogs.length > 0;

  // Format calories nicely with standard thousands separator (e.g. 380, 1,350)
  const formattedCalories =
    todayCaloriesBurned > 0
      ? todayCaloriesBurned.toLocaleString('en-US')
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
        className={`workout-progress-card ${isExiting ? 'card-fade-out' : 'animate-card-fade'} ${
          isWorkoutInProgress
            ? ''
            : isWorkoutCompletedToday
            ? 'workout-progress-card--completed'
            : isRestDay
            ? 'workout-progress-card--rest'
            : ''
        }`}
        key={`workout-${activeUser.id}`}
        onClick={onGoToWorkoutTab}
        role="button"
        tabIndex={0}
        aria-label={
          isWorkoutInProgress
            ? "Workout in progress"
            : isWorkoutCompletedToday
            ? "Workout completed for today"
            : isRestDay
            ? "Rest day - view workouts"
            : "View workout page"
        }
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onGoToWorkoutTab();
          }
        }}
      >
        <div className="progress-card-content">
          <div className="progress-text-block">
            <h2 className="progress-title">Today&apos;s Workout</h2>
            <p className="progress-subtitle">
              {isWorkoutInProgress
                ? isAllCompleted
                  ? 'All exercises completed! 🎉'
                  : `${exercisesLeft} exercise${exercisesLeft === 1 ? '' : 's'} left`
                : isWorkoutCompletedToday
                ? 'Workout completed for today! 🎉'
                : isRestDay
                ? 'Rest & recover 🛋️'
                : `${currentRoutine.title} · ~${currentRoutine.estimatedMinutes} min`}
            </p>
          </div>

          {isWorkoutInProgress ? (
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
          ) : isWorkoutCompletedToday ? (
            <div className="completed-badge" aria-hidden="true">
              <Check size={20} strokeWidth={2.8} />
            </div>
          ) : isRestDay ? (
            <div className="rest-day-icon" aria-hidden="true">
              🌙
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
              <p className="no-activity-subtitle">Complete today&apos;s routine to track your activity and calories</p>
            </div>
          </div>
        )}
      </section>

      {/* Guaranteed Bottom Spacer between Today's Activity and Bottom Navigation Bar */}
      <div className="dashboard-bottom-spacer" />
      </div>
    </div>
  );
};
