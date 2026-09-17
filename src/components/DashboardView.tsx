'use client';

import React from 'react';
import { ArrowRight, Play } from 'lucide-react';
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
            <div className="start-play-trigger" title="Start Workout">
              <div className="play-trigger-ring">
                <div className="play-trigger-core">
                  <Play size={18} fill="#09090b" strokeWidth={0} className="play-triangle" />
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

        <div className="activity-card-container">
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
                viewBox="0 0 400 40"
                preserveAspectRatio="none"
                className="wave-svg"
              >
                <path
                  d="M0,20 C60,35 140,10 220,24 C300,38 350,14 400,20 L400,40 L0,40 Z"
                  fill="rgba(255, 255, 255, 0.18)"
                />
                <path
                  d="M0,28 C80,18 160,34 240,20 C310,8 370,26 400,24 L400,40 L0,40 Z"
                  fill="rgba(255, 255, 255, 0.28)"
                />
              </svg>
            </div>
          </div>

          {/* Bottom: Exercise Breakdown List (Dark Mode) */}
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

      {/* Guaranteed Bottom Spacer between Today's Activity and Bottom Navigation Bar */}
      <div className="dashboard-bottom-spacer" />

      <style jsx>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 22px;
          padding: 24px 20px 0;
          background-color: var(--bg-primary, #08080a);
          color: var(--text-primary, #ffffff);
          min-height: 100%;
          font-family: var(--font-body);
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
          width: 58px;
          height: 58px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(45, 212, 191, 0.12);
          border: 1.5px solid rgba(45, 212, 191, 0.35);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .play-trigger-core {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2dd4bf 0%, #10b981 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(45, 212, 191, 0.45);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
        }

        .workout-progress-card:hover .play-trigger-ring {
          border-color: rgba(45, 212, 191, 0.7);
          background: rgba(45, 212, 191, 0.22);
          transform: scale(1.05);
        }

        .workout-progress-card:hover .play-trigger-core {
          transform: scale(1.08);
          box-shadow: 0 6px 22px rgba(45, 212, 191, 0.65);
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
          color: #ffffff;
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

        /* Top Rose Calorie Card */
        .calorie-rose-card {
          width: 100%;
          background: linear-gradient(180deg, #d34e68 0%, #b8324f 100%);
          border-radius: 20px;
          padding: 22px 16px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
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
          margin-bottom: 10px;
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
          color: #ffffff;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }

        .calorie-unit-label {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.88);
          font-weight: 500;
          margin-top: 3px;
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
          color: #ffffff;
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
          color: #ffffff;
        }

        .formula-multiplier {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary, #9a9aa2);
        }
      `}</style>
    </div>
  );
};
