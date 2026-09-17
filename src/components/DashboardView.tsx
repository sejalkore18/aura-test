'use client';

import React from 'react';
import { Pencil, ArrowRight, Play } from 'lucide-react';
import { UserProfile, WorkoutRoutine, WorkoutLog, Exercise } from '@/types/workout';
import { getExerciseById, EXERCISE_LIBRARY } from '@/data/exercises';

interface DashboardViewProps {
  activeUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (userId: 'sejal' | 'bhaumik') => void;
  currentRoutine: WorkoutRoutine;
  isSessionActive: boolean;
  completedExerciseIds: string[];
  workoutLogs: WorkoutLog[];
  onStartWorkout: () => void;
  onSelectExercise: (exerciseIndex: number) => void;
  onOpenExerciseDetails: (exercise: Exercise) => void;
  onGoToWorkoutTab: () => void;
  onGoToHistoryTab: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  activeUser,
  allUsers,
  onSwitchUser,
  currentRoutine,
  isSessionActive,
  completedExerciseIds,
  workoutLogs,
  onStartWorkout,
  onSelectExercise,
  onOpenExerciseDetails,
  onGoToWorkoutTab,
  onGoToHistoryTab,
}) => {
  // Calculate exercises remaining in today's routine
  const totalExercises = currentRoutine.exercises.length;
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
  const totalBurnedCalories = userLogs.reduce(
    (acc, log) => acc + log.durationMinutes * 9,
    1350
  );
  const totalVolumeLifted = userLogs.reduce(
    (acc, log) => acc + log.totalVolumeKg,
    10.7
  );

  // Today's Activity exercises mapped to visual cards matching reference design
  const activityItems = [
    {
      id: 'push-ups',
      name: 'Push-ups',
      muscles: 'biceps, triceps, shoulders',
      reps: 15,
      sets: 3,
      accentColor: '#f97316', // Vibrant orange
      routineIndex: 0,
    },
    {
      id: 'barbell-squat',
      name: 'Squads',
      muscles: 'calves, legs, thighs',
      reps: 25,
      sets: 3,
      accentColor: '#14b8a6', // Teal
      routineIndex: 1,
    },
    {
      id: 'dumbbell-lunge',
      name: 'Lunges',
      muscles: 'calves, hamstrings, glutes',
      reps: 15,
      sets: 3,
      accentColor: '#3b82f6', // Bright blue
      routineIndex: 2,
    },
  ];

  // Helper for circular SVG progress rings with mathematically centered percentage text
  const renderProgressRing = (
    percent: number,
    size = 58,
    strokeWidth = 5,
    strokeColor = '#2dd4bf',
    trackColor = 'rgba(255, 255, 255, 0.12)',
    textColor = '#ffffff',
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
    <div className="dashboard-container">
      {/* 1. Header Greeting Bar (Dark Mode) */}
      <header className="dashboard-header">
        <div className="user-greeting-group">
          {/* User Profile Avatar with quick switch indicator */}
          <button
            className="avatar-btn"
            onClick={() => {
              const nextUser = activeUser.id === 'sejal' ? 'bhaumik' : 'sejal';
              onSwitchUser(nextUser);
            }}
            title={`Active: ${activeUser.name}. Click to switch athlete.`}
            aria-label={`Switch profile from ${activeUser.name}`}
          >
            <div
              className="user-avatar-circle"
              style={{
                backgroundColor: activeUser.avatarColor,
                boxShadow: `0 4px 14px ${activeUser.avatarColor}55`,
              }}
            >
              {activeUser.initials}
            </div>
            <div className="avatar-switch-badge">⇄</div>
          </button>

          <div className="greeting-text-block">
            <span className="welcome-subtitle">WELCOME,</span>
            <div className="athlete-name-row">
              <h1 className="athlete-name">{activeUser.name} !</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 2. "Workout Progress" Banner Card (Deep Charcoal Hero Card) */}
      <section
        className="workout-progress-card"
        onClick={onStartWorkout}
        role="button"
        tabIndex={0}
        aria-label="Start or view today's workout"
      >
        <div className="progress-card-content">
          <div className="progress-text-block">
            <h2 className="progress-title">Today&apos;s Workout</h2>
            <p className="progress-subtitle">
              {isWorkoutInProgress
                ? isAllCompleted
                  ? 'All exercises completed! 🎉'
                  : `${exercisesLeft} exercise${exercisesLeft === 1 ? '' : 's'} left`
                : `${currentRoutine.title} · ~${currentRoutine.estimatedMinutes} min`}
            </p>
          </div>

          {isWorkoutInProgress ? (
            <div className="progress-ring-box">
              {renderProgressRing(
                calculatedPercent,
                64,
                6,
                '#2dd4bf',
                'rgba(255, 255, 255, 0.12)',
                '#ffffff',
                8.5
              )}
            </div>
          ) : (
            <div className="start-workout-cta">
              <span className="start-cta-text">Start Workout</span>
              <Play size={13} fill="currentColor" strokeWidth={0} />
            </div>
          )}
        </div>
      </section>

      {/* 3. "Today's Activity" Section (Dark Glass Card) */}
      <section className="todays-activity-section">
        <div className="section-header-row">
          <h2 className="section-heading">Today&apos;s Activity</h2>
          <button
            className="edit-routine-btn"
            onClick={onGoToWorkoutTab}
            aria-label="Edit today's routine"
          >
            <span>Edit</span>
            <Pencil size={13} className="edit-icon" />
          </button>
        </div>

        <div className="activity-card-container">
          {/* Left: Rose-Crimson Vertical Calorie Card with Overhead Lifter & Waves */}
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
                  stroke="#ffffff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                {/* Lifter head */}
                <circle cx="12" cy="7.5" r="2" fill="#ffffff" />
                {/* Lifter arms holding barbell */}
                <path
                  d="M6 5L9.5 9.5L12 11.5L14.5 9.5L18 5"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Lifter torso & legs */}
                <path
                  d="M12 11.5V16M12 16L9.5 20M12 16L14.5 20"
                  stroke="#ffffff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Middle: Calorie Value & Subtitle */}
            <div className="calorie-meta-group">
              <span className="calorie-number">1.350</span>
              <span className="calorie-unit-label">Calories</span>
            </div>

            {/* Bottom Liquid Wave Overlay */}
            <div className="wave-decoration-box">
              <svg
                viewBox="0 0 120 40"
                preserveAspectRatio="none"
                className="wave-svg"
              >
                <path
                  d="M0,20 C30,35 60,10 90,25 C105,32 115,22 120,20 L120,40 L0,40 Z"
                  fill="rgba(255, 255, 255, 0.18)"
                />
                <path
                  d="M0,28 C25,18 55,34 85,22 C102,15 112,28 120,25 L120,40 L0,40 Z"
                  fill="rgba(255, 255, 255, 0.28)"
                />
              </svg>
            </div>
          </div>

          {/* Right: Exercise Breakdown List (Dark Mode) */}
          <div className="exercises-list-column">
            {activityItems.map((item, index) => {
              const matchedEx =
                getExerciseById(item.id) ||
                EXERCISE_LIBRARY.find((e) =>
                  e.name.toLowerCase().includes(item.name.toLowerCase())
                ) ||
                EXERCISE_LIBRARY[index % EXERCISE_LIBRARY.length];

              return (
                <div
                  key={item.id}
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
      </section>

      {/* 4. "Overall Status" Section (Dark Glass Card) */}
      <section className="overall-status-section">
        <div className="section-header-row">
          <h2 className="section-heading">Overall Status</h2>
          <button
            className="see-more-btn"
            onClick={onGoToHistoryTab}
            aria-label="See more activity logs"
          >
            <span>See more</span>
            <ArrowRight size={14} className="arrow-icon" />
          </button>
        </div>

        <div className="status-metrics-card">
          {/* Row 1: Calories Loss */}
          <div className="status-metric-row">
            <div className="metric-icon-box flame-bg">
              <span className="metric-emoji" role="img" aria-label="flame">
                🔥
              </span>
            </div>

            <div className="metric-info-block">
              <span className="metric-label">Calories Loss</span>
              <div className="metric-value-line">
                <span className="metric-number">12.182 Kcal</span>
                <span className="metric-trend-badge">+2,8%</span>
              </div>
            </div>

            <div className="metric-ring-box">
              {renderProgressRing(
                37,
                44,
                3.8,
                '#14b8a6',
                'rgba(255, 255, 255, 0.12)',
                '#ffffff',
                5.5
              )}
            </div>
          </div>

          {/* Row 2: Weight Loss / Volume Lifted */}
          <div className="status-metric-row">
            <div className="metric-icon-box lifter-bg">
              <span className="metric-emoji" role="img" aria-label="weightlifter">
                🏋️
              </span>
            </div>

            <div className="metric-info-block">
              <span className="metric-label">Weight Loss</span>
              <div className="metric-value-line">
                <span className="metric-number">10.7 Kg</span>
                <span className="metric-trend-badge">+2,8%</span>
              </div>
            </div>

            <div className="metric-ring-box">
              {renderProgressRing(
                80,
                44,
                3.8,
                '#14b8a6',
                'rgba(255, 255, 255, 0.12)',
                '#ffffff',
                5.5
              )}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 22px;
          padding: 24px 20px 20px;
          background-color: var(--bg-primary, #08080a);
          color: var(--text-primary, #ffffff);
          min-height: 100%;
          font-family: var(--font-body);
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
          border-radius: 50%;
          cursor: pointer;
        }

        .user-avatar-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 800;
          font-size: 1.15rem;
          font-family: var(--font-display);
          border: 2px solid rgba(255, 255, 255, 0.2);
          transition: transform 0.2s ease;
        }

        .avatar-btn:hover .user-avatar-circle {
          transform: scale(1.05);
        }

        .avatar-switch-badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          background: #ffffff;
          color: #09090b;
          font-size: 0.62rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #08080a;
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
          color: #ffffff;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .rock-emoji {
          font-size: 1.05rem;
          transform: rotate(-5deg);
          display: inline-block;
        }

        /* 2. Workout Progress Card (Deep Dark Hero Card) */
        .workout-progress-card {
          background: #111417;
          border-radius: 24px;
          padding: 22px 24px;
          box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.6);
          cursor: pointer;
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(255, 255, 255, 0.09);
        }

        .workout-progress-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.7);
          border-color: rgba(255, 255, 255, 0.18);
          background: #161920;
        }

        .workout-progress-card:active {
          transform: scale(0.985);
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
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .progress-subtitle {
          font-size: 0.86rem;
          color: var(--text-secondary, #9a9aa2);
          font-weight: 500;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .progress-ring-box {
          flex-shrink: 0;
        }

        .start-workout-cta {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #ffffff;
          color: #09090b;
          padding: 10px 18px;
          border-radius: var(--radius-pill);
          font-family: var(--font-display);
          font-size: 0.86rem;
          font-weight: 700;
          box-shadow: 0 4px 16px rgba(255, 255, 255, 0.22);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          flex-shrink: 0;
        }

        .workout-progress-card:hover .start-workout-cta {
          background: #f4f4f5;
          transform: scale(1.04);
          box-shadow: 0 6px 22px rgba(255, 255, 255, 0.35);
        }

        .workout-progress-card:active .start-workout-cta {
          transform: scale(0.97);
        }

        .start-cta-text {
          letter-spacing: -0.01em;
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
          gap: 12px;
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
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .edit-routine-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary, #9a9aa2);
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 6px;
          border-radius: var(--radius-sm);
          transition: color 0.18s ease;
        }

        .edit-routine-btn:hover {
          color: #ffffff;
        }

        .edit-icon {
          color: inherit;
        }

        /* Main Activity Container Card (Dark Glass) */
        .activity-card-container {
          background: rgba(22, 22, 28, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 26px;
          padding: 14px;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.09);
          display: flex;
          gap: 14px;
          align-items: stretch;
        }

        /* Left Rose Card */
        .calorie-rose-card {
          width: 120px;
          flex-shrink: 0;
          background: linear-gradient(180deg, #d34e68 0%, #b8324f 100%);
          border-radius: 20px;
          padding: 18px 10px 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 24px -4px rgba(211, 78, 104, 0.4);
        }

        .weightlifter-glass-circle {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .calorie-meta-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-top: 10px;
          margin-bottom: 12px;
          z-index: 2;
        }

        .calorie-number {
          font-family: var(--font-display);
          font-size: 1.45rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }

        .calorie-unit-label {
          font-size: 0.78rem;
          color: rgba(255, 255, 255, 0.88);
          font-weight: 500;
          margin-top: 3px;
        }

        .wave-decoration-box {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 42px;
          pointer-events: none;
          overflow: hidden;
        }

        .wave-svg {
          width: 100%;
          height: 100%;
        }

        /* Right Exercises Column */
        .exercises-list-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          gap: 10px;
          padding: 4px 4px 4px 2px;
        }

        .activity-exercise-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 6px;
          border-radius: 12px;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }

        .activity-exercise-row:hover {
          background-color: rgba(255, 255, 255, 0.07);
        }

        .exercise-indicator-pill {
          width: 5px;
          height: 18px;
          border-radius: 4px;
          flex-shrink: 0;
        }

        .exercise-text-meta {
          flex: 1;
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }

        .exercise-row-name {
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: -0.01em;
        }

        .exercise-row-muscles {
          font-size: 0.72rem;
          color: var(--text-secondary, #9a9aa2);
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 130px;
        }

        .exercise-reps-formula {
          display: flex;
          align-items: baseline;
          gap: 2px;
          flex-shrink: 0;
        }

        .formula-reps {
          font-family: var(--font-display);
          font-size: 0.98rem;
          font-weight: 800;
          color: #ffffff;
        }

        .formula-multiplier {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-secondary, #9a9aa2);
        }

        /* 4. Overall Status Section (Dark Glass) */
        .overall-status-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .see-more-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary, #9a9aa2);
          background: none;
          border: none;
          cursor: pointer;
          transition: color 0.18s ease;
        }

        .see-more-btn:hover {
          color: #ffffff;
        }

        .arrow-icon {
          transition: transform 0.18s ease;
        }

        .see-more-btn:hover .arrow-icon {
          transform: translateX(2px);
        }

        .status-metrics-card {
          background: rgba(22, 22, 28, 0.75);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-radius: 26px;
          padding: 16px 18px;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.09);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .status-metric-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .metric-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .flame-bg {
          background: rgba(255, 159, 10, 0.14);
          border: 1px solid rgba(255, 159, 10, 0.25);
        }

        .lifter-bg {
          background: rgba(10, 132, 255, 0.12);
          border: 1px solid rgba(10, 132, 255, 0.22);
        }

        .metric-emoji {
          font-size: 1.45rem;
        }

        .metric-info-block {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .metric-label {
          font-size: 0.78rem;
          color: var(--text-secondary, #9a9aa2);
          font-weight: 500;
        }

        .metric-value-line {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .metric-number {
          font-family: var(--font-display);
          font-size: 1.08rem;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: -0.02em;
        }

        .metric-trend-badge {
          color: #30d158;
          font-size: 0.78rem;
          font-weight: 700;
          font-family: var(--font-display);
        }

        .metric-ring-box {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};
