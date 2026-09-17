'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Clock,
  Layers,
  ChevronDown,
  CheckCircle2,
  Circle,
  Info,
  Play,
  History,
  Plus,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { WorkoutRoutine, RoutineExercise, Exercise, UserProfile } from '@/types/workout';
import { getExerciseById, EXERCISE_LIBRARY } from '@/data/exercises';

interface WorkoutOverviewProps {
  routine: WorkoutRoutine;
  allRoutines: WorkoutRoutine[];
  onSelectRoutine: (routineId: string) => void;
  onStartWorkout: () => void;
  onSelectExerciseToStart: (exerciseIndex: number) => void;
  onOpenExerciseDetails: (exercise: Exercise) => void;
  onOpenHistory: () => void;
  onOpenAddExercise: () => void;
  onResetProgress: () => void;
  completedExerciseIds: string[];
  isSessionActive: boolean;
}

export const WorkoutOverview: React.FC<WorkoutOverviewProps> = ({
  routine,
  allRoutines,
  onSelectRoutine,
  onStartWorkout,
  onSelectExerciseToStart,
  onOpenExerciseDetails,
  onOpenHistory,
  onOpenAddExercise,
  onResetProgress,
  completedExerciseIds,
  isSessionActive,
}) => {
  const [showRoutineDropdown, setShowRoutineDropdown] = useState(false);

  const totalExercises = routine.exercises.length;
  const completedCount = completedExerciseIds.length;
  const isAllCompleted = totalExercises > 0 && completedCount === totalExercises;

  return (
    <div className="overview-view animate-fade-in">
      {/* Top Header Section */}
      <header className="header-section">
        {/* Routine Title with Switcher */}
        <div className="title-container">
          <button
            className="title-selector-btn"
            onClick={() => setShowRoutineDropdown(!showRoutineDropdown)}
            aria-expanded={showRoutineDropdown}
          >
            <h1 className="routine-title">{routine.title}</h1>
            <ChevronDown
              size={22}
              className={`chevron-icon ${showRoutineDropdown ? 'rotated' : ''}`}
            />
          </button>

          {/* Routine Dropdown Menu */}
          {showRoutineDropdown && (
            <div className="routine-dropdown-sheet animate-slide-up">
              <div className="dropdown-header">
                <span>Select Workout Routine</span>
                <button
                  className="close-dropdown-btn"
                  onClick={() => setShowRoutineDropdown(false)}
                >
                  ✕
                </button>
              </div>
              <div className="dropdown-list">
                {allRoutines.map((r) => {
                  const isSelected = r.id === routine.id;
                  return (
                    <button
                      key={r.id}
                      className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        onSelectRoutine(r.id);
                        setShowRoutineDropdown(false);
                      }}
                    >
                      <div className="item-text">
                        <span className="item-title">{r.title}</span>
                        <span className="item-meta">
                          {r.exercises.length} exercises · ~{r.estimatedMinutes} min
                        </span>
                      </div>
                      {isSelected && <CheckCircle2 size={18} className="text-green" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Stats Pill Badges */}
        <div className="stats-row">
          <div className="stat-pill">
            <Clock size={14} />
            <span>~{routine.estimatedMinutes} min</span>
          </div>
          <div className="stat-pill">
            <Layers size={14} />
            <span>{totalExercises} exercises</span>
          </div>
          {completedCount > 0 && (
            <div className="stat-pill progress-stat">
              <span className="dot-green" />
              <span>
                {completedCount}/{totalExercises} Done
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Exercise List */}
      <div className="exercise-list-container">
        <div className="exercise-list">
          {routine.exercises.map((item: RoutineExercise, index: number) => {
            const exercise = getExerciseById(item.exerciseId);
            if (!exercise) return null;

            const isCompleted = completedExerciseIds.includes(item.exerciseId);

            return (
              <div
                key={`${item.exerciseId}-${index}`}
                className={`exercise-card ${isCompleted ? 'is-completed' : ''}`}
              >
                {/* Thumbnail */}
                <div
                  className="thumbnail-wrapper"
                  onClick={() => onSelectExerciseToStart(index)}
                  title="Start this exercise"
                >
                  <Image
                    src={exercise.thumbnailUrl}
                    alt={exercise.name}
                    width={90}
                    height={64}
                    className="thumbnail-img"
                    unoptimized
                  />
                  <div className="play-overlay">
                    <Play size={16} fill="#ffffff" color="#ffffff" />
                  </div>
                </div>

                {/* Text Info */}
                <div
                  className="exercise-info"
                  onClick={() => onSelectExerciseToStart(index)}
                >
                  <div className="name-row">
                    <h2 className="exercise-name">{exercise.name}</h2>
                  </div>
                  <div className="exercise-meta">
                    <span>
                      {item.targetSets} sets · {item.targetReps} reps
                    </span>
                    {item.targetWeightKg > 0 && (
                      <span className="weight-tag">{item.targetWeightKg} kg</span>
                    )}
                  </div>
                </div>

                {/* Quick Actions: Info Guide & Checkmark */}
                <div className="exercise-actions">
                  <button
                    className="info-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenExerciseDetails(exercise);
                    }}
                    title="View exercise form guide & tips"
                  >
                    <Info size={18} />
                  </button>

                  <button
                    className="status-check-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectExerciseToStart(index);
                    }}
                    title={isCompleted ? 'Completed' : 'Tap to start'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={24} className="check-icon-active" />
                    ) : (
                      <Circle size={24} className="check-icon-idle" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Auxiliary Controls (Add Exercise, Reset) */}
        <div className="aux-buttons-row">
          <button className="aux-btn" onClick={onOpenAddExercise}>
            <Plus size={15} />
            <span>Add Exercise</span>
          </button>
          <button className="aux-btn" onClick={onOpenHistory}>
            <History size={15} />
            <span>History & Logs</span>
          </button>
          {completedCount > 0 && (
            <button className="aux-btn text-muted" onClick={onResetProgress}>
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Sticky Action Button (Matching Reference) */}
      <div className="bottom-action-container">
        <button
          className="btn-primary-pill start-workout-btn"
          onClick={onStartWorkout}
        >
          {isAllCompleted ? (
            <>
              <Sparkles size={18} />
              <span>Workout Completed · Redo</span>
            </>
          ) : isSessionActive ? (
            <>
              <Play size={18} fill="#09090b" />
              <span>Resume Workout</span>
            </>
          ) : (
            <span>Start Workout</span>
          )}
        </button>
      </div>

      <style jsx>{`
        .overview-view {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 18px 20px 24px;
          color: #ffffff;
          position: relative;
        }

        /* Header Section */
        .header-section {
          margin-bottom: 22px;
        }

        .title-container {
          position: relative;
          margin-bottom: 12px;
        }

        .title-selector-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          text-align: left;
          padding: 0;
          color: #ffffff;
        }

        .routine-title {
          font-size: 1.65rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #ffffff;
        }

        .chevron-icon {
          color: var(--text-secondary);
          transition: transform 0.2s ease;
        }

        .chevron-icon.rotated {
          transform: rotate(180deg);
        }

        /* Routine Dropdown Menu */
        .routine-dropdown-sheet {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #18181e;
          border: 1px solid var(--border-active);
          border-radius: var(--radius-md);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.85);
          z-index: 150;
          padding: 10px;
          max-height: 280px;
          overflow-y: auto;
        }

        .dropdown-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 10px 10px;
          border-bottom: 1px solid var(--border-subtle);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .close-dropdown-btn {
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .dropdown-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 6px;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          text-align: left;
          background: transparent;
        }

        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.07);
        }

        .dropdown-item.selected {
          background: rgba(255, 255, 255, 0.12);
        }

        .item-text {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .item-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #ffffff;
        }

        .item-meta {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .text-green {
          color: var(--accent-green);
        }

        /* Stats Row */
        .stats-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .progress-stat {
          border-color: rgba(48, 209, 88, 0.3);
          color: var(--accent-green);
        }

        .dot-green {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent-green);
          display: inline-block;
          box-shadow: 0 0 8px var(--accent-green);
        }

        /* Exercise List */
        .exercise-list-container {
          display: flex;
          flex-direction: column;
          margin-bottom: 16px;
        }

        .exercise-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .exercise-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 8px 10px 8px 8px;
          border-radius: 18px;
          background: rgba(20, 20, 24, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.2s ease;
        }

        .exercise-card:hover {
          background: rgba(30, 30, 36, 0.85);
          border-color: rgba(255, 255, 255, 0.12);
          transform: translateY(-1px);
        }

        .exercise-card.is-completed {
          opacity: 0.75;
          border-color: rgba(48, 209, 88, 0.2);
        }

        /* Thumbnail */
        .thumbnail-wrapper {
          position: relative;
          width: 90px;
          height: 64px;
          border-radius: 14px;
          overflow: hidden;
          background: #141418;
          flex-shrink: 0;
          cursor: pointer;
        }

        :global(.thumbnail-img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .thumbnail-wrapper:hover :global(.thumbnail-img) {
          transform: scale(1.05);
        }

        .play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .thumbnail-wrapper:hover .play-overlay {
          opacity: 1;
        }

        /* Exercise Info */
        .exercise-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          cursor: pointer;
        }

        .name-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .exercise-name {
          font-size: 1.02rem;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: -0.01em;
        }

        .exercise-meta {
          font-size: 0.84rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .weight-tag {
          font-size: 0.74rem;
          background: rgba(255, 255, 255, 0.08);
          padding: 2px 7px;
          border-radius: var(--radius-pill);
          color: #e4e4e7;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        /* Exercise Actions */
        .exercise-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .info-btn {
          color: var(--text-muted);
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .info-btn:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
        }

        .status-check-btn {
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .check-icon-idle {
          color: rgba(255, 255, 255, 0.2);
          transition: color 0.2s ease;
        }

        .check-icon-idle:hover {
          color: rgba(255, 255, 255, 0.6);
        }

        .check-icon-active {
          color: var(--accent-green);
          filter: drop-shadow(0 0 6px var(--accent-green-glow));
        }

        /* Auxiliary Buttons */
        .aux-buttons-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 18px;
          padding: 4px 0;
          flex-wrap: wrap;
        }

        .aux-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-pill);
          color: var(--text-secondary);
          font-size: 0.8rem;
          font-weight: 500;
        }

        .aux-btn:hover {
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
        }

        /* Bottom Action Button */
        .bottom-action-container {
          position: relative;
          margin-top: 24px;
          padding-bottom: 24px;
          z-index: 10;
        }

        .start-workout-btn {
          width: 100%;
        }
      `}</style>
    </div>
  );
};
