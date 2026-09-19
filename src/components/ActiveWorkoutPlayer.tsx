'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  List,
  RotateCcw,
  SkipForward,
  Check,
  Plus,
  Minus,
  Info,
  Play,
  Pause,
  Timer,
  Dumbbell
} from 'lucide-react';
import { Exercise, WorkoutSet, WorkoutRoutine } from '@/types/workout';
import { getExerciseById } from '@/data/exercises';

interface ActiveWorkoutPlayerProps {
  exercise: Exercise;
  exerciseIndex: number;
  totalExercises: number;
  routine: WorkoutRoutine;
  sets: WorkoutSet[];
  currentSetIndex: number;
  onBackToOverview: () => void;
  onSetChange: (setIndex: number) => void;
  onUpdateSet: (setIndex: number, reps: number, weightKg: number) => void;
  onCompleteSet: (setIndex: number, reps: number, weightKg: number) => void;
  onPreviousSet: () => void;
  onSkipExercise: () => void;
  onOpenExerciseDetails: () => void;
  onSelectExercise: (index: number) => void;
  onOpenRestTimer: () => void;
}

export const ActiveWorkoutPlayer: React.FC<ActiveWorkoutPlayerProps> = ({
  exercise,
  exerciseIndex,
  totalExercises,
  routine,
  sets,
  currentSetIndex,
  onBackToOverview,
  onSetChange,
  onUpdateSet,
  onCompleteSet,
  onPreviousSet,
  onSkipExercise,
  onOpenExerciseDetails,
  onSelectExercise,
  onOpenRestTimer,
}) => {
  const currentSet = sets[currentSetIndex] || {
    setNumber: currentSetIndex + 1,
    targetReps: exercise.defaultReps,
    actualReps: exercise.defaultReps,
    weightKg: exercise.defaultWeightKg || 0,
    completed: false,
  };

  const [reps, setReps] = useState<number>(currentSet.actualReps || currentSet.targetReps);
  const [weightKg, setWeightKg] = useState<number>(currentSet.weightKg || 0);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(true);
  const [showPlaylistDrawer, setShowPlaylistDrawer] = useState<boolean>(false);
  const [isEditingWeight, setIsEditingWeight] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync state when currentSetIndex or exercise changes
  useEffect(() => {
    const set = sets[currentSetIndex];
    if (set) {
      setReps(set.actualReps);
      setWeightKg(set.weightKg);
    } else {
      setReps(exercise.defaultReps);
      setWeightKg(exercise.defaultWeightKg || 0);
    }
  }, [currentSetIndex, exercise, sets]);

  // Adjust reps
  const handleIncrementReps = () => {
    const newReps = reps + 1;
    setReps(newReps);
    onUpdateSet(currentSetIndex, newReps, weightKg);
  };

  const handleDecrementReps = () => {
    if (reps > 1) {
      const newReps = reps - 1;
      setReps(newReps);
      onUpdateSet(currentSetIndex, newReps, weightKg);
    }
  };

  // Adjust weight
  const handleIncrementWeight = (amount: number) => {
    const newWeight = Math.max(0, weightKg + amount);
    setWeightKg(newWeight);
    onUpdateSet(currentSetIndex, reps, newWeight);
  };

  // Complete current set
  const handleNextSet = () => {
    onCompleteSet(currentSetIndex, reps, weightKg);
  };

  // Toggle video play/pause
  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
        setIsVideoPlaying(false);
      } else {
        videoRef.current.play();
        setIsVideoPlaying(true);
      }
    }
  };

  const isLastSet = currentSetIndex === sets.length - 1;
  const isLastExercise = exerciseIndex === totalExercises - 1;

  return (
    <div className="player-view animate-fade-in">
      {/* Immersive Looping Exercise Video Background */}
      <div className="video-background-container" onClick={toggleVideoPlayback}>
        <video
          ref={videoRef}
          src={exercise.videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="exercise-video-bg"
        />

        {/* Video Vignette & Readable Gradient Overlay */}
        <div className="video-overlay" />

        {/* Video Play/Pause Indicator if paused */}
        {!isVideoPlaying && (
          <div className="video-paused-pill">
            <Pause size={14} />
            <span>Paused</span>
          </div>
        )}
      </div>

      {/* Quick Player Bar */}
      <header className="player-header">
        <div className="exercise-progress-badge">
          <span>Exercise {exerciseIndex + 1} of {totalExercises}</span>
        </div>

        <div className="header-right-actions">
          <button
            className="guide-pill-btn"
            onClick={onOpenExerciseDetails}
            title="Exercise Form Instructions"
          >
            <Info size={15} />
            <span>Form Guide</span>
          </button>
          <button
            className="header-icon-btn"
            onClick={() => setShowPlaylistDrawer(!showPlaylistDrawer)}
            title="Routine Playlist"
          >
            <List size={20} />
          </button>
        </div>
      </header>

      {/* Routine Playlist Drawer (if opened) */}
      {showPlaylistDrawer && (
        <div className="playlist-drawer animate-slide-up">
          <div className="drawer-header">
            <span>Exercises in {routine.title}</span>
            <button
              className="drawer-close-btn"
              onClick={() => setShowPlaylistDrawer(false)}
            >
              ✕
            </button>
          </div>
          <div className="drawer-list">
            {routine.exercises.map((item, idx) => {
              const isCurrent = idx === exerciseIndex;
              const exData = getExerciseById(item.exerciseId);
              const exName = exData?.name || item.exerciseId.replace(/-/g, ' ');
              return (
                <button
                  key={`${item.exerciseId}-${idx}`}
                  className={`drawer-item ${isCurrent ? 'current' : ''}`}
                  onClick={() => {
                    onSelectExercise(idx);
                    setShowPlaylistDrawer(false);
                  }}
                >
                  <span className="drawer-item-num">{idx + 1}</span>
                  <span className="drawer-item-name">{exName}</span>
                  <span className="drawer-item-sets">
                    {item.targetSets} sets
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Center Rep Counter Section (Matching Left Screen of Reference) */}
      <div className="center-content">
        {/* Weight Adjustment Badge */}
        <div className="weight-badge-container">
          {weightKg > 0 ? (
            <div className="weight-pill">
              <button
                className="weight-adjust-btn"
                onClick={() => handleIncrementWeight(-2.5)}
              >
                -
              </button>
              <div
                className="weight-display"
                onClick={() => setIsEditingWeight(!isEditingWeight)}
              >
                <Dumbbell size={14} />
                <span>{weightKg} kg</span>
              </div>
              <button
                className="weight-adjust-btn"
                onClick={() => handleIncrementWeight(2.5)}
              >
                +
              </button>
            </div>
          ) : (
            <div
              className="weight-pill bodyweight"
              onClick={() => handleIncrementWeight(10)}
              title="Tap to add weight"
            >
              <span>Bodyweight (BW)</span>
            </div>
          )}
        </div>

        {/* Large Prominent Rep Counter */}
        <div className="counter-container">
          <button
            className="rep-adjust-btn minus"
            onClick={handleDecrementReps}
            title="Decrease Reps"
          >
            <Minus size={28} />
          </button>

          <div className="reps-display">
            <span className="reps-number">{reps}</span>
            <span className="reps-label">Reps</span>
          </div>

          <button
            className="rep-adjust-btn plus"
            onClick={handleIncrementReps}
            title="Increase Reps"
          >
            <Plus size={28} />
          </button>
        </div>

        {/* Set Switcher Pills Bar (Matching Left Screen of Reference) */}
        <div className="set-pills-bar">
          {sets.map((set, idx) => {
            const isCompleted = set.completed;
            const isActive = idx === currentSetIndex;

            return (
              <button
                key={set.setNumber}
                className={`set-pill ${
                  isActive ? 'active' : isCompleted ? 'completed' : 'upcoming'
                }`}
                onClick={() => onSetChange(idx)}
                title={`Go to Set ${set.setNumber}`}
              >
                {isCompleted ? (
                  <Check size={18} strokeWidth={3} className="check-mark" />
                ) : (
                  <span>Set {set.setNumber}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Controls Bar (Matching Left Screen of Reference) */}
      <footer className="player-footer">
        {/* Reset / Previous Set (Left circle button) */}
        <button
          className="btn-circle footer-btn"
          onClick={onPreviousSet}
          title="Previous Set or Reset"
        >
          <RotateCcw size={22} />
        </button>

        {/* Next Set / Finish Primary Action (Center white pill button) */}
        <button
          className="btn-primary-pill next-set-btn"
          onClick={handleNextSet}
        >
          <span>
            {isLastSet && isLastExercise
              ? 'Complete Workout'
              : isLastSet
              ? 'Finish Exercise'
              : 'Next Set'}
          </span>
        </button>

        {/* Skip Exercise (Right circle button) */}
        <button
          className="btn-circle footer-btn"
          onClick={onSkipExercise}
          title="Skip to Next Exercise"
        >
          <SkipForward size={22} />
        </button>
      </footer>

      <style jsx>{`
        .player-view {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1;
          min-height: 100%;
          color: #e4e4e7;
          overflow: hidden;
          padding: 16px 20px 24px;
        }

        /* Immersive Video Background */
        .video-background-container {
          position: absolute;
          inset: 0;
          z-index: 1;
          overflow: hidden;
          background: #0a0a0d;
          cursor: pointer;
        }

        .exercise-video-bg {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.9) contrast(1.05);
        }

        /* Gradient & Vignette Overlay */
        .video-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.75) 0%,
            rgba(0, 0, 0, 0.2) 30%,
            rgba(0, 0, 0, 0.4) 60%,
            rgba(0, 0, 0, 0.92) 90%,
            #000000 100%
          );
          pointer-events: none;
        }

        .video-paused-pill {
          position: absolute;
          top: 70px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(0, 0, 0, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-pill);
          font-size: 0.8rem;
          color: var(--text-secondary);
          backdrop-filter: blur(8px);
        }

        /* Header Bar */
        .player-header {
          position: relative;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 4px;
        }

        .exercise-progress-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: var(--radius-pill);
          font-size: 0.76rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .guide-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: var(--radius-pill);
          font-size: 0.78rem;
          font-weight: 600;
          color: #e4e4e7;
        }

        .guide-pill-btn:hover {
          background: rgba(255, 255, 255, 0.18);
        }

        .header-icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #e4e4e7;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .header-icon-btn:hover {
          background: rgba(255, 255, 255, 0.18);
        }

        .header-right-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Playlist Drawer */
        .playlist-drawer {
          position: absolute;
          top: 68px;
          left: 16px;
          right: 16px;
          background: #141418;
          border: 1px solid var(--border-active);
          border-radius: var(--radius-md);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.9);
          z-index: 50;
          padding: 12px;
          max-height: 280px;
          overflow-y: auto;
        }

        .drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border-subtle);
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .drawer-close-btn {
          color: var(--text-muted);
        }

        .drawer-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 8px;
        }

        .drawer-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          text-align: left;
          background: transparent;
        }

        .drawer-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .drawer-item.current {
          background: rgba(255, 255, 255, 0.16);
        }

        .drawer-item-num {
          font-size: 0.75rem;
          color: var(--text-muted);
          width: 18px;
        }

        .drawer-item-name {
          flex: 1;
          font-size: 0.9rem;
          font-weight: 600;
          color: #e4e4e7;
          text-transform: capitalize;
        }

        .drawer-item-sets {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }

        /* Center Content Overlay */
        .center-content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: auto;
          margin-bottom: 24px;
        }

        /* Weight Badge */
        .weight-badge-container {
          margin-bottom: 16px;
        }

        .weight-pill {
          display: flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-pill);
          padding: 4px 8px;
          backdrop-filter: blur(14px);
        }

        .weight-pill.bodyweight {
          padding: 6px 14px;
          font-size: 0.8rem;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .weight-pill.bodyweight:hover {
          color: #e4e4e7;
          border-color: rgba(255, 255, 255, 0.3);
        }

        .weight-adjust-btn {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          color: #e4e4e7;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
        }

        .weight-adjust-btn:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        .weight-display {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 10px;
          font-size: 0.86rem;
          font-weight: 600;
          color: #e4e4e7;
        }

        /* Counter Container */
        .counter-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 28px;
          margin-bottom: 28px;
        }

        .rep-adjust-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #e4e4e7;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(12px);
          transition: all 0.15s ease;
        }

        .rep-adjust-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: scale(1.06);
        }

        .reps-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 110px;
        }

        .reps-number {
          font-family: var(--font-display);
          font-size: 5rem;
          font-weight: 800;
          line-height: 0.9;
          letter-spacing: -0.04em;
          color: #e4e4e7;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.9);
        }

        .reps-label {
          font-size: 1.15rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.85);
          margin-top: 4px;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
        }

        /* Set Progress Pills Bar (Matching Reference) */
        .set-pills-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 8px;
          overflow-x: auto;
          max-width: 100%;
        }

        .set-pill {
          height: 44px;
          min-width: 96px;
          padding: 0 16px;
          border-radius: var(--radius-pill);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 0.92rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        /* Completed: White Pill with Checkmark (Matching Reference) */
        .set-pill.completed {
          background: #e4e4e7;
          color: #09090b;
          box-shadow: 0 4px 14px rgba(255, 255, 255, 0.2);
        }

        :global(.check-mark) {
          color: #09090b;
        }

        /* Active Set Pill: Dark Pill with subtle border (Matching Reference "Set 3") */
        .set-pill.active {
          background: rgba(255, 255, 255, 0.35);
          backdrop-filter: blur(16px);
          color: #e4e4e7;
          border: 1px solid rgba(255, 255, 255, 0.35);
          box-shadow: 0 0 16px rgba(255, 255, 255, 0.15);
        }

        /* Upcoming Set Pill: Subdued Translucent */
        .set-pill.upcoming {
          background: rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(12px);
          color: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .set-pill.upcoming:hover {
          background: rgba(255, 255, 255, 0.25);
          color: #e4e4e7;
        }

        /* Bottom Controls Bar */
        .player-footer {
          position: relative;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .footer-btn {
          flex-shrink: 0;
        }

        .next-set-btn {
          flex: 1;
        }
      `}</style>
    </div>
  );
};
