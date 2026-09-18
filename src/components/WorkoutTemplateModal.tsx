'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  X,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Dumbbell,
  Clock,
  Layers,
  Search,
  Check,
  Sparkles,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { WorkoutRoutine, RoutineExercise, Exercise } from '@/types/workout';
import { EXERCISE_LIBRARY, getExerciseById } from '@/data/exercises';

interface WorkoutTemplateModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialRoutine?: WorkoutRoutine | null;
  onClose: () => void;
  onSave: (routine: WorkoutRoutine) => void;
  onDelete?: (routineId: string) => void;
}

const TEMPLATE_PRESETS = [
  { title: 'Upper Body' },
  { title: 'Lower Body' },
  { title: 'Push Day' },
  { title: 'Pull Day' },
  { title: 'Full Body Blast' },
];

export const WorkoutTemplateModal: React.FC<WorkoutTemplateModalProps> = ({
  isOpen,
  mode,
  initialRoutine,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState('');
  const [exercises, setExercises] = useState<RoutineExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync state when opened or initialRoutine changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialRoutine) {
        setTitle(initialRoutine.title);
        setExercises(
          initialRoutine.exercises.map((ex) => ({
            ...ex,
            sets: [...ex.sets],
          }))
        );
      } else {
        setTitle('');
        setExercises([]);
      }
      setShowExercisePicker(false);
      setShowDeleteConfirm(false);
      setErrorMessage('');
      setSearchQuery('');
      setSelectedCategory('all');
    }
  }, [isOpen, mode, initialRoutine]);

  if (!isOpen) return null;

  // Exercise modifications
  const handleUpdateExercise = (
    index: number,
    field: 'targetSets' | 'targetReps' | 'targetWeightKg',
    value: number
  ) => {
    setExercises((prev) => {
      const updated = [...prev];
      const item = { ...updated[index] };
      const safeVal = Math.max(0, value);

      if (field === 'targetSets') {
        item.targetSets = Math.max(1, Math.min(12, safeVal));
      } else if (field === 'targetReps') {
        item.targetReps = Math.max(1, Math.min(100, safeVal));
      } else if (field === 'targetWeightKg') {
        item.targetWeightKg = safeVal;
      }

      // Re-generate sets blueprint
      item.sets = Array.from({ length: item.targetSets }, (_, i) => ({
        setNumber: i + 1,
        targetReps: item.targetReps,
        actualReps: item.targetReps,
        weightKg: item.targetWeightKg,
        completed: false,
      }));

      updated[index] = item;
      return updated;
    });
  };

  // Reorder exercises
  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= exercises.length) return;

    setExercises((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  // Remove exercise from sequence
  const handleRemoveExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  // Add exercise from picker
  const handleAddExerciseFromPicker = (ex: Exercise) => {
    const newRoutineEx: RoutineExercise = {
      exerciseId: ex.id,
      targetSets: ex.defaultSets || 3,
      targetReps: ex.defaultReps || 10,
      targetWeightKg: ex.defaultWeightKg || 0,
      sets: Array.from({ length: ex.defaultSets || 3 }, (_, i) => ({
        setNumber: i + 1,
        targetReps: ex.defaultReps || 10,
        actualReps: ex.defaultReps || 10,
        weightKg: ex.defaultWeightKg || 0,
        completed: false,
      })),
    };

    setExercises((prev) => [...prev, newRoutineEx]);
    setShowExercisePicker(false);
    setErrorMessage('');
  };

  // Calculate estimated minutes based on total sets
  const totalSets = exercises.reduce((acc, curr) => acc + curr.targetSets, 0);
  const estimatedMinutes = Math.max(15, Math.round(totalSets * 2.5));

  // Save routine
  const handleSave = () => {
    if (!title.trim()) {
      setErrorMessage('Please enter a workout title (e.g. "Upper Body").');
      return;
    }
    if (exercises.length === 0) {
      setErrorMessage('Please add at least one exercise to this workout template.');
      return;
    }

    const routineId =
      mode === 'edit' && initialRoutine
        ? initialRoutine.id
        : `routine_${Date.now()}_${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    const firstExId = exercises[0]?.exerciseId;
    const firstEx = firstExId ? getExerciseById(firstExId) : null;
    const coverImage = firstEx?.thumbnailUrl || initialRoutine?.coverImage || '/workouts/upper-body.jpg';

    const savedRoutine: WorkoutRoutine = {
      id: routineId,
      title: title.trim(),
      estimatedMinutes,
      estimatedCalories: Math.round(estimatedMinutes * 4),
      exercises,
      isCustom: true,
      coverImage,
    };

    onSave(savedRoutine);
    onClose();
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'chest', label: 'Chest' },
    { id: 'back', label: 'Back' },
    { id: 'triceps', label: 'Triceps' },
    { id: 'biceps', label: 'Biceps' },
    { id: 'legs', label: 'Legs' },
    { id: 'shoulders', label: 'Shoulders' },
    { id: 'core', label: 'Core' },
  ];

  const filteredLibrary = EXERCISE_LIBRARY.filter((ex) => {
    const matchesQuery =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.primaryMuscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || ex.category === selectedCategory;
    return matchesQuery && matchesCat;
  });

  return (
    <div
      className="template-page-view"
      role="region"
      aria-label={mode === 'create' ? 'Create Custom Workout' : 'Modify Workout'}
    >
      {/* Page Header */}
      <header className="page-header">
        <button
          type="button"
          className="back-btn"
          onClick={onClose}
          aria-label="Go Back"
          title="Go Back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="header-titles">
          <span className="badge-mode">
            {mode === 'create' ? 'New Workout Template' : 'Edit Template'}
          </span>
          <h1 className="page-title">
            {mode === 'create' ? 'Create Custom Workout' : 'Modify Workout'}
          </h1>
        </div>
        <button
          type="button"
          className="header-cancel-btn"
          onClick={onClose}
        >
          Cancel
        </button>
      </header>

      {/* Content Body */}
      <div className="page-body">
          {errorMessage && (
            <div className="error-banner animate-fade-in">
              <AlertTriangle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Template Title Input */}
          <div className="input-group">
            <label className="input-label" htmlFor="workout-title-input">
              Workout Name *
            </label>
            <input
              id="workout-title-input"
              type="text"
              placeholder='e.g. "Upper Body", "Leg Day", "Push A"'
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrorMessage('');
              }}
              className="text-input"
              maxLength={40}
            />

            {/* Quick Presets if in create mode and empty */}
            {mode === 'create' && !title && (
              <div className="presets-row">
                <span className="presets-label">Quick Ideas:</span>
                <div className="presets-pills">
                  {TEMPLATE_PRESETS.map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      className="preset-pill"
                      onClick={() => {
                        setTitle(preset.title);
                      }}
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stats Preview */}
          <div className="stats-preview-bar">
            <div className="stat-item">
              <Layers size={14} className="text-accent" />
              <span>{exercises.length} Movements</span>
            </div>
            <div className="stat-item">
              <Flame size={14} className="text-orange" />
              <span>{totalSets} Sets</span>
            </div>
            <div className="stat-item">
              <Clock size={14} className="text-blue" />
              <span>~{estimatedMinutes} min</span>
            </div>
          </div>

          {/* Exercises Sequence Section */}
          <div className="exercises-section">
            <div className="section-header-row">
              <h3 className="section-title">
                Exercise Sequence ({exercises.length})
              </h3>
              <button
                type="button"
                className="add-exercise-trigger-btn"
                onClick={() => setShowExercisePicker(true)}
              >
                <Plus size={15} />
                <span>Add Exercise</span>
              </button>
            </div>

            {exercises.length === 0 ? (
              <div className="empty-exercises-card" onClick={() => setShowExercisePicker(true)}>
                <Dumbbell size={32} className="empty-icon" />
                <h4>No exercises added yet</h4>
                <p>Tap here to add exercises with custom sets, reps, and weights.</p>
                <button type="button" className="btn-add-initial">
                  <Plus size={16} />
                  <span>Choose First Exercise</span>
                </button>
              </div>
            ) : (
              <div className="exercise-cards-list">
                {exercises.map((item, idx) => {
                  const ex = getExerciseById(item.exerciseId);
                  const exName = ex?.name || item.exerciseId;
                  const isFirst = idx === 0;
                  const isLast = idx === exercises.length - 1;

                  return (
                    <div key={`${item.exerciseId}-${idx}`} className="exercise-config-card">
                      {/* Top Row: Index, Thumbnail, Name, Reorder, Delete */}
                      <div className="card-top-row">
                        <div className="sequence-badge">{idx + 1}</div>

                        {ex?.thumbnailUrl && (
                          <div className="thumb-container">
                            <Image
                              src={ex.thumbnailUrl}
                              alt={exName}
                              width={52}
                              height={40}
                              className="thumb-img"
                              unoptimized
                            />
                          </div>
                        )}

                        <div className="card-titles">
                          <span className="ex-name">{exName}</span>
                          <span className="ex-cat">
                            {ex?.category ? ex.category.toUpperCase() : 'EXERCISE'} ·{' '}
                            {ex?.equipment || 'Freeweights'}
                          </span>
                        </div>

                        {/* Reorder and Delete */}
                        <div className="card-actions">
                          <div className="reorder-btns">
                            <button
                              type="button"
                              className="btn-order"
                              disabled={isFirst}
                              onClick={() => handleMoveExercise(idx, 'up')}
                              title="Move up in sequence"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn-order"
                              disabled={isLast}
                              onClick={() => handleMoveExercise(idx, 'down')}
                              title="Move down in sequence"
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>

                          <button
                            type="button"
                            className="btn-trash"
                            onClick={() => handleRemoveExercise(idx)}
                            title="Remove from workout"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Row: Set, Rep, and Weight Steppers */}
                      <div className="steppers-grid">
                        {/* Sets Stepper */}
                        <div className="stepper-item">
                          <span className="stepper-label">Sets</span>
                          <div className="stepper-control">
                            <button
                              type="button"
                              className="step-btn"
                              onClick={() =>
                                handleUpdateExercise(idx, 'targetSets', item.targetSets - 1)
                              }
                            >
                              -
                            </button>
                            <span className="step-val">{item.targetSets}</span>
                            <button
                              type="button"
                              className="step-btn"
                              onClick={() =>
                                handleUpdateExercise(idx, 'targetSets', item.targetSets + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Reps Stepper */}
                        <div className="stepper-item">
                          <span className="stepper-label">Reps</span>
                          <div className="stepper-control">
                            <button
                              type="button"
                              className="step-btn"
                              onClick={() =>
                                handleUpdateExercise(idx, 'targetReps', item.targetReps - 1)
                              }
                            >
                              -
                            </button>
                            <span className="step-val">{item.targetReps}</span>
                            <button
                              type="button"
                              className="step-btn"
                              onClick={() =>
                                handleUpdateExercise(idx, 'targetReps', item.targetReps + 1)
                              }
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Weight Stepper */}
                        <div className="stepper-item weight-stepper">
                          <span className="stepper-label">Weight</span>
                          <div className="stepper-control">
                            <button
                              type="button"
                              className="step-btn"
                              onClick={() =>
                                handleUpdateExercise(
                                  idx,
                                  'targetWeightKg',
                                  Math.max(0, item.targetWeightKg - 2.5)
                                )
                              }
                            >
                              -
                            </button>
                            <span className="step-val weight-val">
                              {item.targetWeightKg > 0 ? `${item.targetWeightKg}kg` : 'BW'}
                            </span>
                            <button
                              type="button"
                              className="step-btn"
                              onClick={() =>
                                handleUpdateExercise(
                                  idx,
                                  'targetWeightKg',
                                  item.targetWeightKg + 2.5
                                )
                              }
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="page-footer">
          {mode === 'edit' && onDelete && (
            <div className="delete-area">
              {showDeleteConfirm ? (
                <div className="confirm-delete-row">
                  <span className="confirm-text">Are you sure?</span>
                  <button
                    type="button"
                    className="btn-confirm-delete"
                    onClick={() => {
                      if (initialRoutine) onDelete(initialRoutine.id);
                    }}
                  >
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    className="btn-cancel-delete"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn-delete-workout"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 size={16} />
                  <span>Delete Template</span>
                </button>
              )}
            </div>
          )}

          <div className="main-actions-row">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-save-template"
              onClick={handleSave}
            >
              <Check size={18} />
              <span>{mode === 'create' ? 'Create Template' : 'Save Changes'}</span>
            </button>
          </div>
        </footer>

        {/* Exercise Picker Overlay Sheet */}
        {showExercisePicker && (
          <div className="picker-overlay animate-slide-up">
            <div className="picker-header">
              <div className="picker-header-text">
                <h3>Select Movement</h3>
                <span>Add an exercise to your workout sequence</span>
              </div>
              <button
                type="button"
                className="close-picker-btn"
                onClick={() => setShowExercisePicker(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Input */}
            <div className="picker-search-box">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search by exercise or muscle group..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                autoFocus
              />
            </div>

            {/* Category Filter Chips */}
            <div className="picker-chips-scroll">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`category-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Exercise List */}
            <div className="picker-list">
              {filteredLibrary.map((ex) => {
                const isAlreadyIn = exercises.some((e) => e.exerciseId === ex.id);

                return (
                  <button
                    key={ex.id}
                    type="button"
                    className="picker-item"
                    onClick={() => handleAddExerciseFromPicker(ex)}
                  >
                    <Image
                      src={ex.thumbnailUrl}
                      alt={ex.name}
                      width={56}
                      height={42}
                      className="picker-thumb"
                      unoptimized
                    />
                    <div className="picker-info">
                      <span className="picker-name">{ex.name}</span>
                      <span className="picker-meta">
                        {ex.category.toUpperCase()} · {ex.defaultSets} sets × {ex.defaultReps} reps
                        {ex.defaultWeightKg ? ` · ${ex.defaultWeightKg}kg` : ''}
                      </span>
                    </div>
                    <div className="picker-add-action">
                      {isAlreadyIn ? (
                        <span className="badge-already">Added</span>
                      ) : (
                        <div className="icon-circle-add">
                          <Plus size={16} />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <style jsx>{`
          .template-page-view {
            position: absolute;
            inset: 0;
            z-index: 200;
            width: 100%;
            height: 100%;
            background: #08080a;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            animation: pageSlideIn 0.28s cubic-bezier(0.16, 1, 0.3, 1);
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

          .page-header {
            display: flex;
            align-items: center;
            padding: 16px 18px;
            background: #0d0d12;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            gap: 12px;
            flex-shrink: 0;
          }

          .back-btn {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.07);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.18s ease;
            flex-shrink: 0;
          }

          .back-btn:hover {
            background: rgba(255, 255, 255, 0.14);
            color: #ffffff;
            transform: translateX(-2px);
          }

          .header-titles {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 0;
          }

          .badge-mode {
            font-size: 10.5px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #60a5fa;
          }

          .page-title {
            font-size: 18px;
            font-weight: 800;
            color: #ffffff;
            letter-spacing: -0.01em;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .header-cancel-btn {
            background: none;
            border: none;
            color: #94a3b8;
            font-size: 13.5px;
            font-weight: 600;
            cursor: pointer;
            padding: 6px 10px;
            border-radius: 8px;
            transition: all 0.15s ease;
            flex-shrink: 0;
          }

          .header-cancel-btn:hover {
            color: #ffffff;
            background: rgba(255, 255, 255, 0.06);
          }

          .page-body {
            flex: 1;
            overflow-y: auto;
            padding: 20px 18px 24px;
            display: flex;
            flex-direction: column;
            gap: 18px;
            -webkit-overflow-scrolling: touch;
          }

          .error-banner {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 14px;
            background: rgba(239, 68, 68, 0.16);
            border: 1px solid rgba(239, 68, 68, 0.35);
            border-radius: 12px;
            color: #f87171;
            font-size: 13px;
            font-weight: 500;
          }

          .input-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .input-label {
            font-size: 12px;
            font-weight: 600;
            color: #9ca3af;
            letter-spacing: 0.2px;
          }

          .text-input {
            width: 100%;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 14px;
            color: #f3f4f6;
            font-size: 15px;
            font-weight: 600;
            outline: none;
            transition: all 0.2s ease;
          }

          .text-input:focus {
            background: rgba(255, 255, 255, 0.08);
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          }

          .presets-row {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-top: 4px;
          }

          .presets-label {
            font-size: 11px;
            color: #6b7280;
            font-weight: 500;
          }

          .presets-pills {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
          }

          .preset-pill {
            padding: 5px 10px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            color: #9ca3af;
            font-size: 11.5px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .preset-pill:hover {
            background: rgba(59, 130, 246, 0.15);
            border-color: rgba(59, 130, 246, 0.4);
            color: #93c5fd;
          }

          .stats-preview-bar {
            display: flex;
            align-items: center;
            justify-content: space-around;
            padding: 10px 14px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 14px;
          }

          .stat-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12px;
            font-weight: 600;
            color: #d1d5db;
          }

          .text-accent {
            color: #10b981;
          }
          .text-orange {
            color: #f97316;
          }
          .text-blue {
            color: #3b82f6;
          }

          .exercises-section {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .section-header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .section-title {
            font-size: 14px;
            font-weight: 700;
            color: #f3f4f6;
          }

          .add-exercise-trigger-btn {
            display: flex;
            align-items: center;
            gap: 5px;
            padding: 6px 12px;
            background: rgba(59, 130, 246, 0.15);
            border: 1px solid rgba(59, 130, 246, 0.35);
            border-radius: 20px;
            color: #60a5fa;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .add-exercise-trigger-btn:hover {
            background: rgba(59, 130, 246, 0.25);
            color: #93c5fd;
          }

          .empty-exercises-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 30px 20px;
            background: rgba(255, 255, 255, 0.02);
            border: 1px dashed rgba(255, 255, 255, 0.12);
            border-radius: 18px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .empty-exercises-card:hover {
            background: rgba(255, 255, 255, 0.04);
            border-color: rgba(59, 130, 246, 0.3);
          }

          .empty-icon {
            color: #4b5563;
            margin-bottom: 8px;
          }

          .empty-exercises-card h4 {
            font-size: 14px;
            font-weight: 700;
            color: #d1d5db;
            margin-bottom: 4px;
          }

          .empty-exercises-card p {
            font-size: 12px;
            color: #6b7280;
            max-width: 260px;
            margin-bottom: 12px;
          }

          .btn-add-initial {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: #2563eb;
            color: #ffffff;
            border: none;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
          }

          .exercise-cards-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .exercise-config-card {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 12px 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .card-top-row {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .sequence-badge {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.1);
            color: #9ca3af;
            font-size: 11px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }

          .thumb-container {
            width: 52px;
            height: 40px;
            border-radius: 9px;
            overflow: hidden;
            background: #000;
            flex-shrink: 0;
          }

          .thumb-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .card-titles {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-width: 0;
          }

          .ex-name {
            font-size: 13.5px;
            font-weight: 700;
            color: #f3f4f6;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .ex-cat {
            font-size: 10.5px;
            color: #6b7280;
            font-weight: 500;
            text-transform: uppercase;
          }

          .card-actions {
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .reorder-btns {
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .btn-order {
            width: 22px;
            height: 15px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 4px;
            color: #9ca3af;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            padding: 0;
          }

          .btn-order:disabled {
            opacity: 0.25;
            cursor: not-allowed;
          }

          .btn-trash {
            background: rgba(239, 68, 68, 0.12);
            border: 1px solid rgba(239, 68, 68, 0.25);
            color: #f87171;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .btn-trash:hover {
            background: rgba(239, 68, 68, 0.25);
          }

          .steppers-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1.3fr;
            gap: 8px;
            padding-top: 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
          }

          .stepper-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .stepper-label {
            font-size: 10.5px;
            font-weight: 600;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.3px;
          }

          .stepper-control {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(0, 0, 0, 0.35);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            padding: 3px 6px;
          }

          .step-btn {
            width: 22px;
            height: 22px;
            background: rgba(255, 255, 255, 0.08);
            border: none;
            border-radius: 6px;
            color: #d1d5db;
            font-size: 14px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: background 0.15s ease;
          }

          .step-btn:hover {
            background: rgba(255, 255, 255, 0.16);
            color: #ffffff;
          }

          .step-val {
            font-size: 13px;
            font-weight: 700;
            color: #f3f4f6;
          }

          .weight-val {
            color: #38bdf8;
            font-size: 12px;
          }

          .page-footer {
            padding: 14px 18px 18px 18px;
            border-top: 1px solid rgba(255, 255, 255, 0.08);
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: #0d0d12;
            flex-shrink: 0;
          }

          .delete-area {
            display: flex;
            justify-content: center;
          }

          .btn-delete-workout {
            display: flex;
            align-items: center;
            gap: 6px;
            background: transparent;
            border: none;
            color: #e05d5d;
            font-size: 12.5px;
            font-weight: 600;
            cursor: pointer;
            padding: 6px 12px;
            border-radius: 8px;
            transition: background 0.15s ease, color 0.15s ease;
          }

          .btn-delete-workout:hover {
            background: rgba(239, 68, 68, 0.08);
            color: #f87171;
          }

          .confirm-delete-row {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .confirm-text {
            font-size: 12px;
            color: #f87171;
            font-weight: 600;
          }

          .btn-confirm-delete {
            padding: 4px 10px;
            background: #dc2626;
            color: #ffffff;
            border: none;
            border-radius: 6px;
            font-size: 11.5px;
            font-weight: 700;
            cursor: pointer;
          }

          .btn-cancel-delete {
            padding: 4px 10px;
            background: rgba(255, 255, 255, 0.1);
            color: #d1d5db;
            border: none;
            border-radius: 6px;
            font-size: 11.5px;
            cursor: pointer;
          }

          .main-actions-row {
            display: flex;
            gap: 10px;
          }

          .btn-secondary {
            flex: 1;
            padding: 13px;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 14px;
            color: #d1d5db;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
          }

          .btn-save-template {
            flex: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 13px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border: none;
            border-radius: 14px;
            color: #ffffff;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
            transition: all 0.2s ease;
          }

          .btn-save-template:hover {
            opacity: 0.95;
            transform: translateY(-1px);
          }

          /* Exercise Picker Overlay */
          .picker-overlay {
            position: absolute;
            inset: 0;
            z-index: 10;
            background: #121217;
            display: flex;
            flex-direction: column;
          }

          .picker-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          }

          .picker-header-text h3 {
            font-size: 16px;
            font-weight: 700;
            color: #f3f4f6;
          }

          .picker-header-text span {
            font-size: 12px;
            color: #6b7280;
          }

          .close-picker-btn {
            background: rgba(255, 255, 255, 0.08);
            border: none;
            color: #9ca3af;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          .picker-search-box {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 12px 18px 8px 18px;
            padding: 10px 14px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
          }

          .search-icon {
            color: #6b7280;
          }

          .search-input {
            flex: 1;
            background: transparent;
            border: none;
            color: #f3f4f6;
            font-size: 13.5px;
            outline: none;
          }

          .picker-chips-scroll {
            display: flex;
            gap: 6px;
            padding: 6px 18px;
            overflow-x: auto;
            scrollbar-width: none;
          }

          .picker-chips-scroll::-webkit-scrollbar {
            display: none;
          }

          .category-chip {
            padding: 5px 12px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            color: #9ca3af;
            font-size: 12px;
            font-weight: 500;
            white-space: nowrap;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .category-chip.active {
            background: rgba(59, 130, 246, 0.2);
            border-color: #3b82f6;
            color: #60a5fa;
            font-weight: 600;
          }

          .picker-list {
            flex: 1;
            overflow-y: auto;
            padding: 10px 18px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .picker-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 14px;
            cursor: pointer;
            text-align: left;
            transition: all 0.15s ease;
          }

          .picker-item:hover {
            background: rgba(255, 255, 255, 0.07);
            border-color: rgba(59, 130, 246, 0.3);
          }

          .picker-thumb {
            width: 56px;
            height: 42px;
            border-radius: 8px;
            object-fit: cover;
            background: #000;
          }

          .picker-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }

          .picker-name {
            font-size: 13.5px;
            font-weight: 700;
            color: #f3f4f6;
          }

          .picker-meta {
            font-size: 11px;
            color: #9ca3af;
          }

          .badge-already {
            font-size: 10.5px;
            padding: 3px 8px;
            background: rgba(16, 185, 129, 0.15);
            color: #34d399;
            border-radius: 6px;
            font-weight: 600;
          }

          .icon-circle-add {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: rgba(59, 130, 246, 0.2);
            border: 1px solid rgba(59, 130, 246, 0.4);
            color: #60a5fa;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}</style>
    </div>
  );
};
