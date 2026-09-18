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
  const [portalTarget, setPortalTarget] = useState<Element | null>(null);

  useEffect(() => {
    const container = document.querySelector('.app-container') || document.body;
    setPortalTarget(container);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && routineToDelete) {
        setRoutineToDelete(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [routineToDelete]);

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
                    onSelectRoutine(r.id);
                    onStartWorkout(r.id);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectRoutine(r.id);
                      onStartWorkout(r.id);
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
                      <>
                        <div className="btn-toggle-movements">
                          <span>{totalMovements} EXERCISE{totalMovements === 1 ? '' : 'S'}</span>
                          {isExpanded ? (
                            <ChevronUp size={14} className="toggle-chevron active" />
                          ) : (
                            <ChevronDown size={14} className="toggle-chevron" />
                          )}
                        </div>

                        {isExpanded && (
                          <div
                            className="card-actions-inline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="btn-card-action"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenEditTemplate(r);
                              }}
                              title="Modify workout template"
                              aria-label="Edit template"
                            >
                              <Edit3 size={15} />
                            </button>

                            {allRoutines.length > 1 && (
                              <button
                                type="button"
                                className="btn-card-action btn-delete-action"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRoutineToDelete(r);
                                }}
                                title="Delete template"
                                aria-label="Delete template"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="empty-movements-row">
                        <span className="no-movements-text">0 EXERCISES</span>
                        <div className="card-actions-inline">
                          <button
                            className="btn-card-action"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenEditTemplate(r);
                            }}
                            title="Modify workout template"
                          >
                            <Edit3 size={15} />
                          </button>
                          {allRoutines.length > 1 && (
                            <button
                              className="btn-card-action btn-delete-action"
                              onClick={(e) => {
                                e.stopPropagation();
                                setRoutineToDelete(r);
                              }}
                              title="Delete template"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectRoutine(r.id);
                                  onSelectExerciseToStart(idx, r.id);
                                }}
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
                                <ChevronRight size={14} className="row-chevron" />
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
                }}
              >
                Delete
              </button>
            </div>
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
          color: #ffffff;
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
          color: #ffffff;
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
          cursor: pointer;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .expanded-exercise-row:hover {
          background: rgba(255, 255, 255, 0.075);
          border-color: rgba(255, 255, 255, 0.14);
          transform: translateY(-1px);
        }

        .expanded-exercise-row:active {
          transform: translateY(0);
          background: rgba(255, 255, 255, 0.05);
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
          color: #ffffff;
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
          color: #ffffff;
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
          color: #ffffff;
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
          color: #ffffff;
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
          color: #ffffff;
        }

        .btn-delete-confirm {
          flex: 1;
          padding: 12px 16px;
          border-radius: 12px;
          background: #9f2424;
          border: 1px solid rgba(248, 113, 113, 0.28);
          color: #ffffff;
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
      `}</style>
    </div>
  );
};
