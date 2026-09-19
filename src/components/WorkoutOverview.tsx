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
  Sparkles,
  Dumbbell,
  CheckCircle2,
  ArrowLeft,
  Clock,
  Flame,
  Layers,
} from 'lucide-react';
import { WorkoutRoutine, RoutineExercise, Exercise } from '@/types/workout';
import { getExerciseById, getRoutineCoverImage } from '@/data/exercises';

interface WorkoutOverviewProps {
  routine: WorkoutRoutine;
  allRoutines: WorkoutRoutine[];
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
  onSelectRoutine,
  onStartWorkout,
  onSelectExerciseToStart,
  onOpenExerciseDetails,
  onOpenHistory,
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
  const [selectedSummaryRoutineId, setSelectedSummaryRoutineId] = useState<string | null>(null);
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

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
      {/* Top Action Bar */}
      {allRoutines.length > 0 && (
        <div className="top-action-bar">
          <button className="aux-btn-primary" onClick={onOpenCreateTemplate}>
            <Plus size={16} />
            <span>New Workout</span>
          </button>
        </div>
      )}

      {/* Templates List */}
      <div className="templates-list-container">
        {allRoutines.length === 0 ? (
          <div className="empty-templates-card">
            <Dumbbell size={40} className="empty-icon" />
            <h3>No Workout Templates</h3>
            <p>Create your first workout template to start training.</p>
            <button className="btn-primary-pill" onClick={onOpenCreateTemplate}>
              <Plus size={16} />
              <span>Create Workout Template</span>
            </button>
          </div>
        ) : (
          <div className="templates-cards-grid">
            {allRoutines.map((r) => {
              const coverImg = getRoutineCoverImage(r);
              const isExpanded = expandedRoutineId === r.id;
              const totalMovements = r.exercises?.length || 0;
              const estimatedCalories =
                r.estimatedCalories ?? Math.round((r.estimatedMinutes || 25) * 4);

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
            {/* Hero Cover Banner with Integrated Frosted Stat Bar */}
            <div className="summary-hero-banner">
              <Image
                src={getRoutineCoverImage(selectedRoutineForSummary)}
                alt={selectedRoutineForSummary.title}
                fill
                className="summary-hero-image"
                unoptimized
                priority
              />
              <div className="summary-hero-scrim" />
              <div className="summary-hero-content">
                <h2 className="summary-hero-title">{selectedRoutineForSummary.title}</h2>
              </div>

              {/* Integrated Frosted Glass Stat Bar */}
              <div className="hero-stat-bar">
                <div className="hero-stat-col">
                  <div className="hero-stat-top">
                    <Clock size={13} className="hero-stat-icon icon-cyan" />
                    <span className="hero-stat-value">~{selectedRoutineForSummary.estimatedMinutes || 25}</span>
                    <span className="hero-stat-unit">min</span>
                  </div>
                  <span className="hero-stat-label">Time</span>
                </div>

                <div className="hero-stat-divider" />

                <div className="hero-stat-col">
                  <div className="hero-stat-top">
                    <Flame size={13} className="hero-stat-icon icon-orange" />
                    <span className="hero-stat-value">
                      {selectedRoutineForSummary.estimatedCalories ??
                        Math.round((selectedRoutineForSummary.estimatedMinutes || 25) * 4)}
                    </span>
                    <span className="hero-stat-unit">cal</span>
                  </div>
                  <span className="hero-stat-label">Calories</span>
                </div>

                <div className="hero-stat-divider" />

                <div className="hero-stat-col">
                  <div className="hero-stat-top">
                    <Dumbbell size={13} className="hero-stat-icon icon-purple" />
                    <span className="hero-stat-value">
                      {selectedRoutineForSummary.exercises?.length || 0}
                    </span>
                  </div>
                  <span className="hero-stat-label">Movements</span>
                </div>

                <div className="hero-stat-divider" />

                <div className="hero-stat-col">
                  <div className="hero-stat-top">
                    <Layers size={13} className="hero-stat-icon icon-emerald" />
                    <span className="hero-stat-value">
                      {selectedRoutineForSummary.exercises?.reduce(
                        (acc, item) => acc + (item.targetSets || 0),
                        0
                      ) || 0}
                    </span>
                  </div>
                  <span className="hero-stat-label">Total Sets</span>
                </div>
              </div>
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

                {allRoutines.length > 1 && (
                  <button
                    type="button"
                    className="btn-card-action btn-delete-action"
                    onClick={() => setRoutineToDelete(selectedRoutineForSummary)}
                    title="Delete template"
                    aria-label="Delete template"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
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
                setSelectedSummaryRoutineId(null);
              }}
            >
              <span>Start Workout</span>
            </button>
          </div>
        </div>,
        portalTarget
      )}

      <style jsx>{`
        .templates-view {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 18px 20px 28px;
          color: #e4e4e7;
        }

        /* Templates List */
        .templates-list-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .empty-templates-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px dashed rgba(255, 255, 255, 0.14);
          border-radius: 24px;
          gap: 10px;
        }

        .empty-icon {
          color: #6b7280;
          margin-bottom: 4px;
        }

        .templates-cards-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Template Card */
        .template-card {
          background: #14141a;
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
          outline: none;
          transition: box-shadow 0.25s ease, transform 0.25s ease;
        }

        .template-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.65);
        }

        .template-card:focus,
        .template-card:focus-visible,
        .template-card:active {
          outline: none;
          border-color: rgba(255, 255, 255, 0.09);
        }

        /* Banner */
        .card-banner {
          position: relative;
          width: 100%;
          height: 165px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 14px 16px;
          overflow: hidden;
          background: #000000;
        }

        .banner-image {
          object-fit: cover;
          object-position: center;
          transition: transform 0.4s ease;
        }

        .template-card:hover .banner-image {
          transform: scale(1.03);
        }

        .banner-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0, 0, 0, 0.3) 0%,
            rgba(0, 0, 0, 0.05) 45%,
            rgba(18, 18, 24, 0.95) 100%
          );
          z-index: 1;
        }

        .banner-top-badges {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 6px;
        }

        .stat-pill-blur {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 10px;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          border: none;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          color: #f3f4f6;
        }

        .banner-titles {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .template-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #e4e4e7;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
        }

        /* Movements Bar */
        .movements-preview-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          min-height: 50px;
          background: rgba(0, 0, 0, 0.35);
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          border-bottom: none;
          cursor: pointer;
          user-select: none;
          transition: all 0.15s ease;
        }

        .btn-toggle-movements {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.07em;
          white-space: nowrap;
        }

        .toggle-chevron {
          color: #94a3b8;
          display: inline-flex;
        }

        .toggle-chevron.active {
          color: #94a3b8;
        }

        /* Smooth Expand & Collapse Accordion Drawer */
        .expandable-drawer {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.52s cubic-bezier(0.22, 1, 0.36, 1),
                      opacity 0.42s cubic-bezier(0.22, 1, 0.36, 1),
                      visibility 0.52s;
          opacity: 0;
          visibility: hidden;
          background: rgba(0, 0, 0, 0.35);
          overflow: hidden;
          will-change: grid-template-rows, opacity;
        }

        .expandable-drawer.is-expanded {
          grid-template-rows: 1fr;
          opacity: 1;
          visibility: visible;
          transition: grid-template-rows 0.54s cubic-bezier(0.22, 1, 0.36, 1),
                      opacity 0.48s cubic-bezier(0.22, 1, 0.36, 1) 0.04s;
        }

        .expandable-drawer-inner {
          min-height: 0;
          overflow: hidden;
          transition: transform 0.52s cubic-bezier(0.22, 1, 0.36, 1);
          transform: translateY(-8px);
          will-change: transform;
        }

        .expandable-drawer.is-expanded .expandable-drawer-inner {
          transform: translateY(0);
        }

        /* Expanded Exercises List */
        .expanded-exercises-list {
          padding: 4px 14px 14px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .empty-movements-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .expanded-exercise-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.065);
          border-radius: 14px;
          cursor: default;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .expanded-exercise-row:hover {
          background: rgba(255, 255, 255, 0.035);
          border-color: rgba(255, 255, 255, 0.065);
          transform: none;
        }

        .expanded-exercise-row:active {
          transform: none;
          background: rgba(255, 255, 255, 0.035);
        }

        .ex-seq-thumb {
          width: 54px;
          height: 44px;
          border-radius: 10px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.09);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .ex-seq-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }

        .ex-seq-name {
          font-size: 13px;
          font-weight: 700;
          color: #e4e4e7;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.01em;
        }

        .ex-seq-meta-row {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-wrap: wrap;
        }

        .ex-seq-meta {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
        }

        .ex-weight-badge {
          font-size: 9.5px;
          font-weight: 600;
          padding: 1.5px 6px;
          border-radius: 5px;
          letter-spacing: 0.02em;
        }

        .ex-weight-badge.bodyweight {
          background: rgba(255, 255, 255, 0.06);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .ex-weight-badge.weighted {
          background: rgba(59, 130, 246, 0.12);
          color: #93c5fa;
          border: 1px solid rgba(59, 130, 246, 0.25);
        }

        :global(.row-chevron) {
          color: rgba(255, 255, 255, 0.2);
          flex-shrink: 0;
          transition: all 0.18s ease;
        }

        .expanded-exercise-row:hover :global(.row-chevron) {
          color: rgba(255, 255, 255, 0.7);
          transform: translateX(2px);
        }

        .card-actions-inline {
          display: flex;
          align-items: center;
          gap: 8px;
          animation: fadeInActions 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes fadeInActions {
          from {
            opacity: 0;
            transform: scale(0.92);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .no-movements-text {
          font-size: 11.5px;
          font-weight: 600;
          color: #6b7280;
        }

        .btn-card-action {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          padding: 0;
          color: #94a3b8;
          cursor: pointer;
          transition: color 0.15s ease, transform 0.15s ease;
        }

        .btn-card-action:hover {
          background: transparent;
          color: #e4e4e7;
          transform: scale(1.12);
        }

        .btn-card-action:active {
          transform: scale(0.95);
        }

        .btn-delete-action {
          color: rgba(248, 113, 113, 0.72);
          background: transparent;
          border: none;
        }

        .btn-delete-action:hover {
          background: transparent;
          color: #f87171;
          transform: scale(1.12);
        }

        /* Top Action Bar */
        .top-action-bar {
          margin-bottom: 16px;
        }

        .aux-btn-primary {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 13px 20px;
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.35);
          border-radius: 9999px;
          color: #60a5fa;
          font-size: 13.5px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .aux-btn-primary:hover {
          background: rgba(59, 130, 246, 0.22);
          border-color: rgba(59, 130, 246, 0.5);
          color: #93c5fd;
          transform: translateY(-1px);
        }

        /* Delete Confirmation Modal */
        .delete-modal-backdrop {
          position: absolute;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.78);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: modalFadeIn 0.2s ease-out;
        }

        .delete-modal-card {
          width: 100%;
          max-width: 350px;
          background: #14141c;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 24px;
          padding: 28px 22px 24px 22px;
          box-shadow: 0 24px 50px rgba(0, 0, 0, 0.85),
                      0 0 0 1px rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          animation: modalScaleIn 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .delete-modal-icon-wrapper {
          color: #e05d5d;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }

        .delete-modal-title {
          font-size: 17.5px;
          font-weight: 800;
          color: #e4e4e7;
          margin: 0 0 12px 0;
          letter-spacing: -0.01em;
        }

        .delete-modal-desc {
          font-size: 13px;
          line-height: 1.5;
          color: #94a3b8;
          margin: 0 0 26px 0;
          max-width: 290px;
        }

        .delete-modal-target-title {
          color: #e4e4e7;
          font-weight: 700;
        }

        .delete-modal-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        .btn-delete-cancel {
          flex: 1;
          padding: 12px 16px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #e2e8f0;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-delete-cancel:hover {
          background: rgba(255, 255, 255, 0.14);
          color: #e4e4e7;
        }

        .btn-delete-confirm {
          flex: 1;
          padding: 12px 16px;
          border-radius: 12px;
          background: #9f2424;
          border: 1px solid rgba(248, 113, 113, 0.28);
          color: #e4e4e7;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: none;
          transition: all 0.15s ease;
        }

        .btn-delete-confirm:hover {
          background: #b91c1c;
          border-color: rgba(248, 113, 113, 0.45);
          transform: translateY(-1px);
          box-shadow: none;
        }

        .btn-delete-confirm:active {
          transform: translateY(0);
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalScaleIn {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        /* Workout Summary Screen Overlay */
        .workout-summary-screen-view {
          position: absolute;
          inset: 0;
          z-index: 150;
          width: 100%;
          height: 100%;
          background: #08080a;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: pageSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @media (max-width: 640px) {
          .workout-summary-screen-view {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            z-index: 9999 !important;
            overscroll-behavior: none !important;
          }
        }

        @keyframes pageSlideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .app-bar {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 70;
          height: 56px;
          background: rgba(8, 8, 10, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          flex-shrink: 0;
        }

        .left-slot {
          display: flex;
          align-items: center;
          min-width: 90px;
        }

        .left-slot.left-aligned-title {
          flex: 1;
          gap: 8px;
          min-width: 0;
        }

        .appbar-left-title {
          font-family: var(--font-display);
          font-size: 1.08rem;
          font-weight: 700;
          color: #e4e4e7;
          letter-spacing: -0.015em;
          margin: 0;
          line-height: 1.2;
        }

        .appbar-back-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          color: #e4e4e7;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .appbar-back-btn:hover {
          background: rgba(255, 255, 255, 0.18);
          transform: translateX(-2px);
        }

        .appbar-back-btn:active {
          transform: scale(0.94);
        }

        .appbar-back-btn.ghost-back {
          background: transparent;
          border: none;
          box-shadow: none;
        }

        .appbar-back-btn.ghost-back:hover {
          background: transparent;
          transform: translateX(-3px);
          opacity: 0.8;
        }

        .appbar-back-btn.ghost-back:active {
          transform: scale(0.92) translateX(-3px);
          opacity: 0.65;
        }

        .summary-content-body {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 24px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .summary-content-body::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }

        /* Summary Hero Banner with Integrated Stat Bar */
        .summary-hero-banner {
          position: relative;
          width: 100%;
          min-height: 250px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          background: #000000;
        }

        .summary-hero-image {
          object-fit: cover;
          object-position: center;
        }

        .summary-hero-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(8, 8, 10, 0.12) 0%,
            rgba(8, 8, 10, 0.42) 42%,
            rgba(8, 8, 10, 0.88) 80%,
            #08080a 100%
          );
          z-index: 1;
        }

        .summary-hero-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 24px 20px 14px 20px;
        }

        .summary-hero-title {
          font-family: var(--font-display);
          font-size: 1.65rem;
          font-weight: 800;
          color: #e4e4e7;
          letter-spacing: -0.02em;
          margin: 0;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.85);
          line-height: 1.15;
        }

        /* Hero-Integrated Frosted Glass Stat Bar */
        .hero-stat-bar {
          position: relative;
          z-index: 2;
          width: 100%;
          background: rgba(14, 14, 20, 0.72);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 13px 12px;
        }

        .hero-stat-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-width: 0;
        }

        .hero-stat-top {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .hero-stat-icon {
          flex-shrink: 0;
        }

        .hero-stat-icon.icon-cyan {
          color: #38bdf8;
        }

        .hero-stat-icon.icon-orange {
          color: #fb923c;
        }

        .hero-stat-icon.icon-purple {
          color: #c084fc;
        }

        .hero-stat-icon.icon-emerald {
          color: #34d399;
        }

        .hero-stat-value {
          font-family: var(--font-display);
          font-size: 14.5px;
          font-weight: 700;
          color: #e4e4e7;
          letter-spacing: -0.01em;
          line-height: 1;
        }

        .hero-stat-unit {
          font-size: 11px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1;
        }

        .hero-stat-label {
          font-size: 9.5px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.45);
          letter-spacing: 0.05em;
          text-transform: uppercase;
          line-height: 1;
        }

        .hero-stat-divider {
          width: 1px;
          height: 26px;
          background: rgba(255, 255, 255, 0.08);
          flex-shrink: 0;
        }

        /* Exercises Section */
        .summary-section-header {
          padding: 32px 20px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-title {
          font-size: 12.5px;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          margin: 0;
        }

        .summary-exercises-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 0 20px;
        }

        .summary-empty-exercises {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 36px 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          gap: 12px;
        }

        .summary-empty-exercises p {
          color: #94a3b8;
          font-size: 13px;
          margin: 0;
        }

        .btn-edit-empty {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 18px;
          background: rgba(59, 130, 246, 0.14);
          border: 1px solid rgba(59, 130, 246, 0.35);
          border-radius: 9999px;
          color: #60a5fa;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-edit-empty:hover {
          background: rgba(59, 130, 246, 0.24);
          color: #93c5fd;
        }

        .summary-exercise-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.065);
          border-radius: 16px;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          outline: none;
        }

        .summary-exercise-card[role='button'] {
          cursor: pointer;
        }

        .summary-exercise-card:hover,
        .summary-exercise-card:focus,
        .summary-exercise-card:focus-visible,
        .summary-exercise-card:active,
        .summary-exercise-card[role='button']:hover,
        .summary-exercise-card[role='button']:focus,
        .summary-exercise-card[role='button']:focus-visible,
        .summary-exercise-card[role='button']:active {
          background: rgba(255, 255, 255, 0.035);
          border-color: rgba(255, 255, 255, 0.065);
          outline: none;
          box-shadow: none;
          transform: none;
        }

        .summary-exercise-index {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.06);
          color: #94a3b8;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .summary-exercise-thumb {
          width: 56px;
          height: 48px;
          border-radius: 10px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .summary-exercise-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .summary-exercise-name {
          font-size: 13.5px;
          font-weight: 700;
          color: #e4e4e7;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.01em;
        }

        .summary-exercise-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .summary-meta-pill {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
        }

        .summary-weight-pill {
          font-size: 9.5px;
          font-weight: 600;
          padding: 1.5px 6px;
          border-radius: 5px;
          letter-spacing: 0.02em;
        }

        .summary-weight-pill.bodyweight {
          background: rgba(255, 255, 255, 0.06);
          color: #cbd5e1;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .summary-weight-pill.weighted {
          background: rgba(59, 130, 246, 0.12);
          color: #93c5fa;
          border: 1px solid rgba(59, 130, 246, 0.25);
        }

        .summary-muscle-pill {
          font-size: 9.5px;
          font-weight: 600;
          padding: 1.5px 6px;
          border-radius: 5px;
          background: rgba(255, 255, 255, 0.04);
          color: #94a3b8;
          text-transform: capitalize;
        }

        :global(.summary-chevron) {
          color: rgba(255, 255, 255, 0.25);
          flex-shrink: 0;
          transition: all 0.18s ease;
        }

        .summary-exercise-card:hover :global(.summary-chevron) {
          color: rgba(255, 255, 255, 0.7);
          transform: translateX(2px);
        }

        /* Sticky Bottom Footer */
        .summary-footer {
          position: relative;
          flex-shrink: 0;
          width: 100%;
          z-index: 80;
          padding: 14px 18px calc(14px + env(safe-area-inset-bottom, 0px));
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          border-right: none;
          border-bottom: none;
          border-left: none;
          outline: none;
          box-shadow: none;
          background: #0d0d12;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-start-workout-action {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 24px;
          background: #e4e4e7;
          border: none;
          border-radius: 9999px;
          color: #09090b;
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: none;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .btn-start-workout-action:hover {
          background: #d4d4d8;
          transform: translateY(-1px);
          box-shadow: none;
        }

        .btn-start-workout-action:active {
          transform: scale(0.98);
          background: #c8c8cc;
        }
      `}</style>
    </div>
  );
};
