'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  Plus,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Dumbbell,
  ArrowLeft,
  Clock,
  Flame,
  Layers,
  CalendarDays,
} from 'lucide-react';
import { WorkoutRoutine, Exercise } from '@/types/workout';
import { getExerciseById, getRoutineCoverImage } from '@/data/exercises';
import '@/styles/WorkoutOverview.css';

interface WorkoutOverviewProps {
  routine: WorkoutRoutine;
  allRoutines: WorkoutRoutine[];
  selectedSummaryRoutineId?: string | null;
  onSelectSummaryRoutine?: (routineId: string | null) => void;
  onSelectRoutine: (routineId: string) => void;
  onStartWorkout: (routineId?: string) => void;
  onSelectExerciseToStart: (exerciseIndex: number, routineId?: string) => void;
  onOpenExerciseDetails?: (exercise: Exercise) => void;
  onOpenHistory?: () => void;
  onOpenAddExercise?: () => void;
  onResetProgress?: () => void;
  completedExerciseIds: string[];
  isSessionActive: boolean;
  onOpenCreateTemplate: () => void;
  onOpenEditTemplate: (routine: WorkoutRoutine) => void;
  onDeleteRoutine: (routineId: string) => void;
  onUpdateExerciseTargets?: (
    exerciseIndex: number,
    targetSets: number,
    targetReps: number,
    targetWeightKg: number
  ) => void;
  onRemoveExerciseFromRoutine?: (exerciseIndex: number) => void;
}

export const WorkoutOverview: React.FC<WorkoutOverviewProps> = ({
  routine,
  allRoutines,
  selectedSummaryRoutineId: propSelectedSummaryRoutineId,
  onSelectSummaryRoutine,
  onSelectRoutine,
  onStartWorkout,
  onOpenExerciseDetails,
  isSessionActive,
  onOpenCreateTemplate,
  onOpenEditTemplate,
  onDeleteRoutine,
}) => {
  // Track expanded template cards to preview exercises
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);
  // Track routine pending deletion for custom confirmation modal
  const [routineToDelete, setRoutineToDelete] = useState<WorkoutRoutine | null>(null);
  // Track routine selected to preview in full-screen summary view
  const [internalSelectedSummaryRoutineId, setInternalSelectedSummaryRoutineId] = useState<string | null>(null);
  const [portalTarget, setPortalTarget] = useState<Element | null>(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth <= 640;
      return isMobile ? document.body : (document.querySelector('.app-container') || document.body);
    }
    return null;
  });

  const selectedSummaryRoutineId =
    propSelectedSummaryRoutineId !== undefined
      ? propSelectedSummaryRoutineId
      : internalSelectedSummaryRoutineId;

  const setSelectedSummaryRoutineId = (id: string | null) => {
    if (onSelectSummaryRoutine) {
      onSelectSummaryRoutine(id);
    } else {
      setInternalSelectedSummaryRoutineId(id);
    }
  };

  const selectedRoutineForSummary =
    allRoutines.find((r) => r.id === selectedSummaryRoutineId) || null;

  useEffect(() => {
    const updatePortalTarget = () => {
      const isMobile = window.innerWidth <= 640;
      const container = isMobile ? document.body : (document.querySelector('.app-container') || document.body);
      setPortalTarget(container);
    };

    updatePortalTarget();
    window.addEventListener('resize', updatePortalTarget);
    return () => window.removeEventListener('resize', updatePortalTarget);
  }, []);

  // Lock background window and body scrolling while full-screen summary view is open
  useEffect(() => {
    if (selectedRoutineForSummary) {
      window.scrollTo(0, 0);
      const originalOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [selectedRoutineForSummary]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (routineToDelete) {
          setRoutineToDelete(null);
        } else if (selectedSummaryRoutineId) {
          setSelectedSummaryRoutineId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [routineToDelete, selectedSummaryRoutineId]);

  const toggleExpand = (routineId: string) => {
    setExpandedRoutineId((prev) => (prev === routineId ? null : routineId));
  };

  return (
    <div className="templates-view animate-fade-in">
      {/* Templates List */}
      <div className={`templates-list-container ${allRoutines.length === 0 ? 'is-empty' : ''}`}>
        {allRoutines.length === 0 ? (
          <button className="btn-primary-pill" onClick={onOpenCreateTemplate}>
            <Plus size={16} />
            <span>Create Workout</span>
          </button>
        ) : (
          <div className="templates-cards-grid">
            {allRoutines.map((r) => {
              const coverImg = getRoutineCoverImage(r);
              const isExpanded = expandedRoutineId === r.id;
              const totalMovements = r.exercises?.length || 0;
              const estimatedCalories =
                r.estimatedCalories ??
                Math.round(
                  r.exercises?.reduce((acc, ex) => {
                    const sets = typeof ex.sets === 'number' ? ex.sets : ex.targetSets || 3;
                    const reps = ex.targetReps || 10;
                    const weight = ex.targetWeightKg || 0;
                    return acc + sets * reps * (weight > 0 ? 0.8 + weight * 0.015 : 1.0);
                  }, 0) || (r.exercises?.length || 5) * 45
                );

              return (
                <div
                  key={r.id}
                  className="template-card"
                  onClick={() => {
                    setSelectedSummaryRoutineId(r.id);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedSummaryRoutineId(r.id);
                    }
                  }}
                >
                  {/* Hero Cover Banner with Image */}
                  <div className="card-banner">
                    <Image
                      src={coverImg}
                      alt={r.title}
                      fill
                      className="banner-image"
                      unoptimized
                      priority={r.id === 'upper-body' || r.id === 'lower-body'}
                    />
                    <div className="banner-scrim" />

                    {/* Floating Top Badges */}
                    <div className="banner-top-badges">
                      <div className="stat-pill-blur">
                        <span>~{r.estimatedMinutes} min · {estimatedCalories} cal</span>
                      </div>
                    </div>

                    {/* Banner Titles */}
                    <div className="banner-titles">
                      <h2 className="template-title">{r.title}</h2>
                    </div>
                  </div>

                  {/* Movements Bar: clicking entire tile expands and collapses */}
                  <div
                    className="movements-preview-bar"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (totalMovements > 0) {
                        toggleExpand(r.id);
                      }
                    }}
                    role={totalMovements > 0 ? 'button' : undefined}
                    tabIndex={totalMovements > 0 ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (totalMovements > 0 && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleExpand(r.id);
                      }
                    }}
                  >
                    {totalMovements > 0 ? (
                      <div className="btn-toggle-movements">
                        <span>{totalMovements} EXERCISE{totalMovements === 1 ? '' : 'S'}</span>
                        {isExpanded ? (
                          <ChevronUp size={14} className="toggle-chevron active" />
                        ) : (
                          <ChevronDown size={14} className="toggle-chevron" />
                        )}
                      </div>
                    ) : (
                      <div className="empty-movements-row">
                        <span className="no-movements-text">0 EXERCISES</span>
                      </div>
                    )}
                  </div>

                  {/* Expandable Exercise Sequence List with Smooth Expand & Collapse */}
                  {totalMovements > 0 && (
                    <div
                      className={`expandable-drawer ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}
                      aria-hidden={!isExpanded}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="expandable-drawer-inner">
                        <div className="expanded-exercises-list">
                          {r.exercises.map((item, idx) => {
                            const ex = getExerciseById(item.exerciseId);
                            const exName = ex?.name || item.exerciseId;
                            return (
                              <div
                                key={`${item.exerciseId}-${idx}`}
                                className="expanded-exercise-row"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {ex?.thumbnailUrl && (
                                  <div className="ex-seq-thumb">
                                    <Image
                                      src={ex.thumbnailUrl}
                                      alt={exName}
                                      width={54}
                                      height={44}
                                      className="thumb-img"
                                      unoptimized
                                    />
                                  </div>
                                )}
                                <div className="ex-seq-info">
                                  <span className="ex-seq-name">{exName}</span>
                                  <div className="ex-seq-meta-row">
                                    <span className="ex-seq-meta">
                                      {item.targetSets} sets × {item.targetReps} reps
                                    </span>
                                    <span
                                      className={`ex-weight-badge ${
                                        item.targetWeightKg > 0 ? 'weighted' : 'bodyweight'
                                      }`}
                                    >
                                      {item.targetWeightKg > 0
                                        ? `${item.targetWeightKg} kg`
                                        : 'Bodyweight'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Button — Circular White + anchored at bottom right */}
      {allRoutines.length > 0 && !selectedRoutineForSummary && portalTarget && createPortal(
        <div
          className="fab-anchor"
          style={{ position: portalTarget === document.body ? 'fixed' : 'absolute' }}
        >
          <button
            id="fab-new-workout"
            className="fab-circular-white"
            onClick={onOpenCreateTemplate}
            aria-label="New Workout"
            title="New Workout"
          >
            <Plus size={24} strokeWidth={2.6} color="#000000" />
          </button>
        </div>,
        portalTarget
      )}

      {/* Delete Confirmation Modal Dialog Portaled to App Container for Dead-Center Alignment */}
      {routineToDelete && portalTarget && createPortal(
        <div
          className="delete-modal-backdrop"
          style={{ position: portalTarget === document.body ? 'fixed' : 'absolute' }}
          onClick={() => setRoutineToDelete(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div
            className="delete-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-modal-icon-wrapper">
              <Trash2 size={28} />
            </div>

            <h3 id="delete-dialog-title" className="delete-modal-title">
              Delete Workout
            </h3>

            <p className="delete-modal-desc">
              Are you sure you want to delete{' '}
              <span className="delete-modal-target-title">
                {routineToDelete.title}
              </span>
              ? 
            </p>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="btn-delete-cancel"
                onClick={() => setRoutineToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-delete-confirm"
                onClick={() => {
                  onDeleteRoutine(routineToDelete.id);
                  setRoutineToDelete(null);
                  setSelectedSummaryRoutineId(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        portalTarget
      )}

      {/* Workout Summary Full-Screen View */}
      {selectedRoutineForSummary && portalTarget && createPortal(
        <div
          className="workout-summary-screen-view"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedRoutineForSummary.title} summary`}
          style={{ position: portalTarget === document.body ? 'fixed' : 'absolute' }}
        >
          {/* Universal Top AppBar like Workout Page */}
          <header className="app-bar">
            <div className="left-slot left-aligned-title">
              <button
                type="button"
                className="appbar-back-btn ghost-back"
                onClick={() => setSelectedSummaryRoutineId(null)}
                aria-label="Go Back"
                title="Go Back"
              >
                <ArrowLeft size={18} />
              </button>
              <h1 className="appbar-left-title">Summary</h1>
            </div>
          </header>

          {/* Scrollable Body */}
          <div className="summary-content-body">
            {/* Routine Header: Reduced Title & Modern Stat Chips */}
            <div className="summary-header">
              <h2 className="summary-routine-title">{selectedRoutineForSummary.title}</h2>

              <div className="summary-stat-chips">
                <div className="summary-chip">
                  <Clock size={13} className="chip-icon icon-cyan" />
                  <span>~{selectedRoutineForSummary.estimatedMinutes || 25} min</span>
                </div>

                <div className="summary-chip">
                  <Flame size={13} className="chip-icon icon-orange" />
                  <span>
                    {selectedRoutineForSummary.estimatedCalories ??
                      Math.round(
                        selectedRoutineForSummary.exercises?.reduce((acc, ex) => {
                          const sets = typeof ex.sets === 'number' ? ex.sets : ex.targetSets || 3;
                          const reps = ex.targetReps || 10;
                          const weight = ex.targetWeightKg || 0;
                          return acc + sets * reps * (weight > 0 ? 0.8 + weight * 0.015 : 1.0);
                        }, 0) || (selectedRoutineForSummary.exercises?.length || 5) * 45
                      )}{' '}
                    cal
                  </span>
                </div>

                <div className="summary-chip">
                  <Dumbbell size={13} className="chip-icon icon-purple" />
                  <span>
                    {selectedRoutineForSummary.exercises?.length || 0} movements
                  </span>
                </div>

                <div className="summary-chip">
                  <Layers size={13} className="chip-icon icon-emerald" />
                  <span>
                    {selectedRoutineForSummary.exercises?.reduce(
                      (acc, item) => acc + (item.targetSets || 0),
                      0
                    ) || 0}{' '}
                    sets
                  </span>
                </div>
              </div>

              {/* Scheduled Days */}
              {selectedRoutineForSummary.scheduledDays && selectedRoutineForSummary.scheduledDays.length > 0 && (
                <div className="summary-days-row">
                  <div className="summary-chip summary-days-chip">
                    <CalendarDays size={13} className="chip-icon icon-blue" />
                    <span className="summary-days-label">
                      {(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const)
                        .filter((day) => selectedRoutineForSummary.scheduledDays!.includes(day))
                        .map((day) => {
                          const fullLabels = { sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat' };
                          return fullLabels[day];
                        })
                        .join(' · ')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Exercises Section Header */}
            <div className="summary-section-header">
              <h3 className="section-title">
                EXERCISES
              </h3>

              <div className="card-actions-inline">
                <button
                  type="button"
                  className="btn-card-action"
                  onClick={() => onOpenEditTemplate(selectedRoutineForSummary)}
                  title="Modify workout template"
                  aria-label="Edit template"
                >
                  <Edit3 size={15} />
                </button>

                <button
                  type="button"
                  className="btn-card-action btn-delete-action"
                  onClick={() => setRoutineToDelete(selectedRoutineForSummary)}
                  title="Delete template"
                  aria-label="Delete template"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Exercise Breakdown List */}
            <div className="summary-exercises-list">
              {(!selectedRoutineForSummary.exercises || selectedRoutineForSummary.exercises.length === 0) ? (
                <div className="summary-empty-exercises">
                  <Dumbbell size={32} className="empty-icon" />
                  <p>No exercises added to this template yet.</p>
                  <button
                    type="button"
                    className="btn-edit-empty"
                    onClick={() => onOpenEditTemplate(selectedRoutineForSummary)}
                  >
                    <Plus size={15} />
                    <span>Add Exercises</span>
                  </button>
                </div>
              ) : (
                selectedRoutineForSummary.exercises.map((item, idx) => {
                  const ex = getExerciseById(item.exerciseId);
                  const exName = ex?.name || item.exerciseId;
                  return (
                    <div
                      key={`${item.exerciseId}-${idx}`}
                      className="summary-exercise-card"
                      onClick={() => {
                        if (ex && onOpenExerciseDetails) {
                          onOpenExerciseDetails(ex);
                        }
                      }}
                      role={ex && onOpenExerciseDetails ? 'button' : undefined}
                    >
                      <div className="summary-exercise-index">{idx + 1}</div>
                      {ex?.thumbnailUrl && (
                        <div className="summary-exercise-thumb">
                          <Image
                            src={ex.thumbnailUrl}
                            alt={exName}
                            width={56}
                            height={50}
                            className="thumb-img"
                            unoptimized
                          />
                        </div>
                      )}
                      <div className="summary-exercise-info">
                        <span className="summary-exercise-name">{exName}</span>
                        <div className="summary-exercise-meta">
                          <span className="summary-meta-pill">
                            {item.targetSets} sets × {item.targetReps} reps
                          </span>
                          <span
                            className={`summary-weight-pill ${
                              item.targetWeightKg > 0 ? 'weighted' : 'bodyweight'
                            }`}
                          >
                            {item.targetWeightKg > 0 ? `${item.targetWeightKg} kg` : 'Bodyweight'}
                          </span>
                          {ex?.category && (
                            <span className="summary-muscle-pill">
                              {ex.category}
                            </span>
                          )}
                        </div>
                      </div>
                      {ex && onOpenExerciseDetails && (
                        <ChevronRight size={16} className="summary-chevron" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="summary-footer">
            <button
              type="button"
              className="btn-start-workout-action"
              onClick={() => {
                onSelectRoutine(selectedRoutineForSummary.id);
                onStartWorkout(selectedRoutineForSummary.id);
              }}
            >
              <span>
                {isSessionActive && routine.id === selectedRoutineForSummary.id
                  ? 'Resume Workout'
                  : 'Start Workout'}
              </span>
            </button>
          </div>
        </div>,
        portalTarget
      )}
    </div>
  );
};
