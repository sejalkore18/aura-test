'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  SkipBack,
  SkipForward,
  Check,
  Plus,
  Minus,
  Info,
  Dumbbell
} from 'lucide-react';
import { Exercise, WorkoutSet, WorkoutRoutine } from '@/types/workout';
import { getExerciseById } from '@/data/exercises';
import '@/styles/ActiveWorkoutPlayer.css';

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
  onAddSet?: () => void;
  onRemoveSet?: () => void;
  onCompleteSet: (setIndex: number, reps: number, weightKg: number) => void;
  onToggleSet?: (setIndex: number) => void;
  onPreviousSet: () => void;
  onSkipExercise: () => void;
  onOpenExerciseDetails: () => void;
  onSelectExercise: (index: number) => void;
}

export const ActiveWorkoutPlayer: React.FC<ActiveWorkoutPlayerProps> = ({
  exercise,
  exerciseIndex,
  totalExercises,
  routine,
  sets,
  currentSetIndex,
  onSetChange,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  onCompleteSet,
  onToggleSet,
  onPreviousSet,
  onSkipExercise,
  onOpenExerciseDetails,
  onSelectExercise,
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
  const [showPlaylistDrawer, setShowPlaylistDrawer] = useState<boolean>(false);
  const [isEditingWeight, setIsEditingWeight] = useState<boolean>(false);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);

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

  // Reset video and finishing state whenever exercise changes
  useEffect(() => {
    setIsFinishing(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [exercise.id]);

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
    if (isFinishing) return;
    if (isLastSet) {
      setIsFinishing(true);
    }
    onCompleteSet(currentSetIndex, reps, weightKg);
  };

  // Tap a set pill to mark it as done (or toggle unmark if already done)
  const handleSetClick = (idx: number) => {
    if (isFinishing) return;
    const targetSet = sets[idx];
    if (!targetSet) return;

    if (targetSet.completed) {
      if (onToggleSet) {
        onToggleSet(idx);
      } else {
        onSetChange(idx);
      }
    } else {
      const setReps =
        idx === currentSetIndex ? reps : (targetSet.actualReps || targetSet.targetReps);
      const setWeight =
        idx === currentSetIndex ? weightKg : (targetSet.weightKg ?? weightKg ?? 0);

      const allOthersCompleted = sets.every((s, i) => i === idx || s.completed);
      if (allOthersCompleted) {
        setIsFinishing(true);
      }

      onCompleteSet(idx, setReps, setWeight);
    }
  };

  // Toggle video play/pause
  const toggleVideoPlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    if (video.paused) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Video play interrupted:', err);
        });
      }
    } else {
      video.pause();
    }
  };

  const handleScreenClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Don't toggle video if user clicked any button, input, header action, control section, or footer
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('.weight-pill') ||
      target.closest('.playlist-drawer') ||
      target.closest('.playlist-dropdown-backdrop') ||
      target.closest('.player-header') ||
      target.closest('.center-content') ||
      target.closest('.sets-row-wrapper') ||
      target.closest('.player-footer')
    ) {
      return;
    }
    toggleVideoPlayback();
  };

  const isLastSet = currentSetIndex === sets.length - 1;
  const isLastExercise = exerciseIndex === totalExercises - 1;

  return (
    <div className="player-view animate-fade-in" onClick={handleScreenClick}>
      {/* Immersive Looping Exercise Video Background */}
      <div className="video-background-container">
        <video
          ref={videoRef}
          src={exercise.videoUrl}
          loop
          muted
          playsInline
          preload="auto"
          className="exercise-video-bg"
        />

        {/* Video Vignette & Readable Gradient Overlay */}
        <div className="video-overlay" />
      </div>

      {/* Quick Player Bar */}
      <header className="player-header">
        <div className="exercise-progress-wrapper">
          <button
            type="button"
            className="exercise-progress-badge"
            onClick={(e) => {
              e.stopPropagation();
              setShowPlaylistDrawer((prev) => !prev);
            }}
            title="View all exercises in routine"
          >
            <span>Exercise {exerciseIndex + 1} of {totalExercises}</span>
          </button>

          {/* Routine Playlist Dropdown Modal Box */}
          {showPlaylistDrawer && (
            <>
              <div
                className="playlist-dropdown-backdrop"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPlaylistDrawer(false);
                }}
              />
              <div
                className="playlist-drawer"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="drawer-list">
                  {routine.exercises.map((item, idx) => {
                    const isCurrent = idx === exerciseIndex;
                    const exData = getExerciseById(item.exerciseId);
                    const exName = exData?.name || item.exerciseId.replace(/-/g, ' ');
                    return (
                      <button
                        key={`${item.exerciseId}-${idx}`}
                        className={`drawer-item ${isCurrent ? 'current' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectExercise(idx);
                          setShowPlaylistDrawer(false);
                        }}
                      >
                        <span className="drawer-item-num">{idx + 1}</span>
                        <span className="drawer-item-name">{exName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="header-right-actions">
          <button
            type="button"
            className="guide-pill-btn"
            onClick={onOpenExerciseDetails}
            title="Exercise Form Instructions"
          >
            <Info size={14} />
            <span>Form Guide</span>
          </button>
        </div>
      </header>

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

        {/* Set Switcher Pills (First line up to 3 sets; extra sets shifted below) */}
        <div className="set-pills-container">
          <div className="set-pills-row">
            {sets.length > 1 && onRemoveSet && (
              <button
                type="button"
                className="set-pill action-btn remove-set-btn"
                onClick={onRemoveSet}
                title="Remove last set"
                aria-label="Remove Set"
              >
                <Minus size={16} />
              </button>
            )}

            {sets.slice(0, 3).map((set, idx) => {
              const isCompleted = set.completed;
              const isActive = idx === currentSetIndex;

              return (
                <button
                  key={set.setNumber}
                  type="button"
                  className={`set-pill ${
                    isCompleted ? 'completed' : isActive ? 'active' : 'upcoming'
                  }`}
                  onClick={() => handleSetClick(idx)}
                  title={
                    isCompleted
                      ? `Set ${set.setNumber} completed (tap to unmark)`
                      : `Tap to mark Set ${set.setNumber} done`
                  }
                  aria-label={`Set ${set.setNumber}${isCompleted ? ' completed' : ''}`}
                >
                  {isCompleted ? (
                    <Check size={18} strokeWidth={3} className="check-mark" />
                  ) : (
                    <span>Set {set.setNumber}</span>
                  )}
                </button>
              );
            })}

            {sets.length <= 3 && sets.length < 6 && onAddSet && (
              <button
                type="button"
                className="set-pill action-btn add-set-btn"
                onClick={onAddSet}
                title="Add another set (max 6)"
                aria-label="Add Set"
              >
                <Plus size={16} />
              </button>
            )}
          </div>

          {sets.length > 3 && (
            <div className="set-pills-row extra-sets-row">
              {sets.slice(3).map((set, i) => {
                const idx = 3 + i;
                const isCompleted = set.completed;
                const isActive = idx === currentSetIndex;

                return (
                  <button
                    key={set.setNumber}
                    type="button"
                    className={`set-pill ${
                      isCompleted ? 'completed' : isActive ? 'active' : 'upcoming'
                    }`}
                    onClick={() => handleSetClick(idx)}
                    title={
                      isCompleted
                        ? `Set ${set.setNumber} completed (tap to unmark)`
                        : `Tap to mark Set ${set.setNumber} done`
                    }
                    aria-label={`Set ${set.setNumber}${isCompleted ? ' completed' : ''}`}
                  >
                    {isCompleted ? (
                      <Check size={18} strokeWidth={3} className="check-mark" />
                    ) : (
                      <span>Set {set.setNumber}</span>
                    )}
                  </button>
                );
              })}

              {sets.length < 6 && onAddSet && (
                <button
                  type="button"
                  className="set-pill action-btn add-set-btn"
                  onClick={onAddSet}
                  title="Add another set (max 6)"
                  aria-label="Add Set"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls Bar (Matching Left Screen of Reference) */}
      <footer className="player-footer">
        {/* Skip to Previous Exercise (Left circle button) */}
        <button
          className="btn-circle footer-btn"
          onClick={onPreviousSet}
          title="Previous Exercise"
        >
          <SkipBack size={22} />
        </button>

        {/* Next Set / Finish Primary Action (Center white pill button) */}
        <button
          className="btn-primary-pill next-set-btn"
          onClick={handleNextSet}
          disabled={isFinishing}
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
    </div>
  );
};
