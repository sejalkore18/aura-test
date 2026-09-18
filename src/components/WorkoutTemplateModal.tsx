'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  X,
  Plus,
  Trash2,
  GripVertical,
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
  const [exercises, setExercises] = useState<(RoutineExercise & { _uid?: string })[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState('');
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [dragTranslateY, setDragTranslateY] = useState(0);
  const [dragItemHeight, setDragItemHeight] = useState(120);
  const [isDraggingActive, setIsDraggingActive] = useState(false);
  const [isDropping, setIsDropping] = useState(false);

  const dragItemRef = React.useRef<number | null>(null);
  const dragOverRef = React.useRef<number | null>(null);
  const isDraggingActiveRef = React.useRef(false);
  const isDroppingRef = React.useRef(false);
  const dropTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Swipe-to-delete state
  const [swipingIndex, setSwipingIndex] = useState<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [swipingCardWidth, setSwipingCardWidth] = useState(360);
  const [isSwipingActive, setIsSwipingActive] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const swipeStartRef = React.useRef<{
    x: number;
    y: number;
    locked: 'h' | 'v' | null;
    startIndex: number;
    cardWidth: number;
  } | null>(null);

  // Sync state when opened or initialRoutine changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialRoutine) {
        setTitle(initialRoutine.title);
        setExercises(
          initialRoutine.exercises.map((ex, i) => ({
            ...ex,
            _uid: `uid-${ex.exerciseId}-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            sets: [...ex.sets],
          }))
        );
      } else {
        setTitle('');
        setExercises([]);
      }
      setShowExercisePicker(false);
      setErrorMessage('');
      setSearchQuery('');
      setSelectedCategory('all');
      setDraggedIdx(null);
      setDragOverIdx(null);
      setDragTranslateY(0);
      setIsDraggingActive(false);
      setIsDropping(false);
      if (dropTimerRef.current) {
        clearTimeout(dropTimerRef.current);
        dropTimerRef.current = null;
      }
      dragItemRef.current = null;
      dragOverRef.current = null;
      isDraggingActiveRef.current = false;
      isDroppingRef.current = false;
      setSwipingIndex(null);
      setSwipeOffset(0);
      setIsSwipingActive(false);
      setDeletingIndex(null);
      swipeStartRef.current = null;
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

  // Reorder exercises via drag and drop
  const handleReorderExercises = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= exercises.length ||
      toIndex >= exercises.length
    )
      return;

    setExercises((prev) => {
      const copy = [...prev];
      const [movedItem] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, movedItem);
      return copy;
    });
  };

  const handlePointerDownHandle = (
    index: number,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (e.button !== 0 || isDroppingRef.current) return;
    e.preventDefault();
    e.stopPropagation();

    if (dropTimerRef.current) {
      clearTimeout(dropTimerRef.current);
      dropTimerRef.current = null;
    }

    // Cancel any active swipe immediately
    setSwipingIndex(null);
    setSwipeOffset(0);

    const container = listRef.current;
    if (!container) return;

    const cardWrappers = Array.from(
      container.querySelectorAll<HTMLElement>('.swipe-card-wrapper')
    );
    if (cardWrappers.length <= 1) return;

    // Snapshot undisturbed card centers and heights at the moment drag starts
    const slotCenters = cardWrappers.map((wrapper) => {
      const rect = wrapper.getBoundingClientRect();
      return rect.top + rect.height / 2;
    });

    const currentCardRect = cardWrappers[index]?.getBoundingClientRect();
    const measuredSlotHeight =
      cardWrappers.length >= 2 &&
      cardWrappers[1]?.offsetTop !== undefined &&
      cardWrappers[0]?.offsetTop !== undefined &&
      cardWrappers[1].offsetTop > cardWrappers[0].offsetTop
        ? cardWrappers[1].offsetTop - cardWrappers[0].offsetTop
        : (currentCardRect?.height || 110) + 14;
    setDragItemHeight(measuredSlotHeight);

    const startClientY = e.clientY;
    dragItemRef.current = index;
    dragOverRef.current = index;
    isDraggingActiveRef.current = true;
    isDroppingRef.current = false;
    setIsDropping(false);

    setDraggedIdx(index);
    setDragOverIdx(index);
    setDragTranslateY(0);
    setIsDraggingActive(true);

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!isDraggingActiveRef.current || isDroppingRef.current) return;
      moveEvent.preventDefault();

      const dy = moveEvent.clientY - startClientY;
      setDragTranslateY(dy);

      const currentMidY = slotCenters[index] + dy;

      // Find closest slot center
      let closestIdx = index;
      let minDistance = Infinity;
      for (let i = 0; i < slotCenters.length; i++) {
        const dist = Math.abs(currentMidY - slotCenters[i]);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = i;
        }
      }

      closestIdx = Math.max(0, Math.min(slotCenters.length - 1, closestIdx));

      if (dragOverRef.current !== closestIdx) {
        dragOverRef.current = closestIdx;
        setDragOverIdx(closestIdx);
      }
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      upEvent.preventDefault();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);

      const from = dragItemRef.current;
      const to = dragOverRef.current;

      if (from === null || to === null) {
        isDraggingActiveRef.current = false;
        dragItemRef.current = null;
        dragOverRef.current = null;
        setDraggedIdx(null);
        setDragOverIdx(null);
        setDragTranslateY(0);
        setIsDraggingActive(false);
        return;
      }

      // Calculate exact drop landing translation offset relative to initial position
      const landingY = (slotCenters[to] ?? slotCenters[from]) - slotCenters[from];

      // Initiate smooth landing drop animation
      isDroppingRef.current = true;
      setIsDropping(true);
      setDragTranslateY(landingY);

      dropTimerRef.current = setTimeout(() => {
        if (from !== to) {
          handleReorderExercises(from, to);
        }

        isDroppingRef.current = false;
        isDraggingActiveRef.current = false;
        dragItemRef.current = null;
        dragOverRef.current = null;

        setDraggedIdx(null);
        setDragOverIdx(null);
        setDragTranslateY(0);
        setIsDraggingActive(false);
        setIsDropping(false);
        dropTimerRef.current = null;
      }, 240);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp, { passive: false });
    window.addEventListener('pointercancel', onPointerUp, { passive: false });
  };

  // Remove exercise from sequence
  const handleRemoveExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));
  };

  // Swipe-to-delete trigger with smooth exit animation
  const handleTriggerDelete = (index: number) => {
    setDeletingIndex(index);
    setTimeout(() => {
      setExercises((prev) => prev.filter((_, i) => i !== index));
      setDeletingIndex(null);
      setSwipingIndex(null);
      setSwipeOffset(0);
    }, 240);
  };

  const handleSwipeStart = (
    index: number,
    clientX: number,
    clientY: number,
    target: HTMLElement
  ): boolean => {
    if (
      target.closest('.drag-handle, button, input, .step-btn') ||
      isDraggingActiveRef.current ||
      isDroppingRef.current
    ) {
      return false;
    }
    const cardWrapper = target.closest<HTMLElement>('.swipe-card-wrapper');
    const width = cardWrapper?.offsetWidth || 360;
    setSwipingCardWidth(width);

    swipeStartRef.current = {
      x: clientX,
      y: clientY,
      locked: null,
      startIndex: index,
      cardWidth: width,
    };
    if (swipingIndex !== null && swipingIndex !== index) {
      setSwipingIndex(null);
      setSwipeOffset(0);
    }
    return true;
  };

  const handleSwipeMove = (clientX: number, clientY: number) => {
    if (!swipeStartRef.current) return;
    const { x, y, startIndex, cardWidth } = swipeStartRef.current;
    const dx = clientX - x;
    const dy = clientY - y;

    if (swipeStartRef.current.locked === null) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        if (Math.abs(dx) > Math.abs(dy) + 2) {
          swipeStartRef.current.locked = 'h';
        } else {
          swipeStartRef.current.locked = 'v';
        }
      }
    }

    if (swipeStartRef.current.locked === 'h') {
      if (dx <= 0) {
        setSwipingIndex(startIndex);
        setIsSwipingActive(true);
        // Allow smooth swiping across full width, slight resistance only past full width
        const maxSlide = -cardWidth;
        const clamped = dx < maxSlide ? maxSlide + (dx - maxSlide) * 0.2 : dx;
        setSwipeOffset(clamped);
      } else if (swipingIndex === startIndex) {
        setSwipeOffset(0);
      }
    }
  };

  const handleSwipeEnd = () => {
    if (!swipeStartRef.current) return;
    const { startIndex, locked, cardWidth } = swipeStartRef.current;
    setIsSwipingActive(false);

    if (locked === 'h' && swipingIndex === startIndex) {
      // Only delete if shifted more than 60% of tile width to the left
      const deleteThreshold = cardWidth * 0.6;
      if (Math.abs(swipeOffset) >= deleteThreshold) {
        handleTriggerDelete(startIndex);
      } else {
        // Shifted less than 60% -> smoothly snap back to 0
        setSwipeOffset(0);
        setSwipingIndex(null);
      }
    }
    swipeStartRef.current = null;
  };

  const handleMouseDown = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    const shouldStart = handleSwipeStart(index, e.clientX, e.clientY, e.target as HTMLElement);
    if (!shouldStart) return;

    const onMouseMove = (moveEvent: MouseEvent) => {
      handleSwipeMove(moveEvent.clientX, moveEvent.clientY);
    };

    const onMouseUp = () => {
      handleSwipeEnd();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTouchStart = (index: number, e: React.TouchEvent<HTMLDivElement>) => {
    handleSwipeStart(index, e.touches[0].clientX, e.touches[0].clientY, e.target as HTMLElement);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      handleSwipeMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    handleSwipeEnd();
  };

  // Add exercise from picker
  const handleAddExerciseFromPicker = (ex: Exercise) => {
    const newRoutineEx: RoutineExercise & { _uid?: string } = {
      _uid: `uid-${ex.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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
      exercises: exercises.map(({ _uid, ...rest }) => rest),
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
          <ArrowLeft size={18} />
        </button>
        <h1 className="page-title">
          {mode === 'create' ? 'Create Custom Workout' : 'Modify Workout'}
        </h1>
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
              Workout Name
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

          {/* Exercises Sequence Section */}
          <div className="exercises-section">
            <div className="section-header-row">
              <button
                type="button"
                className="add-exercise-trigger-btn"
                onClick={() => setShowExercisePicker(true)}
              >
                <Plus size={15} />
                <span>Add Exercise</span>
              </button>
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
              <div
                ref={listRef}
                className={`exercise-cards-list ${isDraggingActive ? 'is-dragging-active' : ''}`}
              >
                {exercises.map((item, idx) => {
                  const ex = getExerciseById(item.exerciseId);
                  const exName = ex?.name || item.exerciseId;
                  const isThisDragging = isDraggingActive && draggedIdx === idx;
                  const isThisDropping = isThisDragging && isDropping;

                  // Calculate smooth slot displacement for neighboring cards
                  let shiftY = 0;
                  if (
                    isDraggingActive &&
                    draggedIdx !== null &&
                    dragOverIdx !== null &&
                    draggedIdx !== dragOverIdx
                  ) {
                    if (draggedIdx < dragOverIdx) {
                      if (idx > draggedIdx && idx <= dragOverIdx) {
                        shiftY = -dragItemHeight;
                      }
                    } else if (draggedIdx > dragOverIdx) {
                      if (idx >= dragOverIdx && idx < draggedIdx) {
                        shiftY = dragItemHeight;
                      }
                    }
                  }

                  const isSwipeActive =
                    (swipingIndex === idx && swipeOffset < 0) || deletingIndex === idx;
                  const deleteThreshold = swipingCardWidth > 0 ? swipingCardWidth * 0.6 : 200;
                  const isPast60Percent =
                    swipingIndex === idx && Math.abs(swipeOffset) >= deleteThreshold;

                  return (
                    <div
                      key={item._uid || `${item.exerciseId}-${idx}`}
                      className={`swipe-card-wrapper ${deletingIndex === idx ? 'is-deleting' : ''} ${
                        isThisDragging ? 'wrapper-dragging' : ''
                      } ${isThisDropping ? 'wrapper-dropping' : ''}`}
                      data-index={idx}
                      style={{
                        transform: isThisDragging
                          ? `translateY(${dragTranslateY}px)`
                          : shiftY !== 0
                          ? `translateY(${shiftY}px)`
                          : 'translateY(0)',
                        zIndex: isThisDragging ? 100 : 1,
                        transition: isThisDragging
                          ? isDropping
                            ? 'transform 0.24s cubic-bezier(0.18, 1, 0.22, 1)'
                            : 'none'
                          : isDraggingActive
                          ? 'transform 0.28s cubic-bezier(0.2, 0, 0, 1)'
                          : deletingIndex === idx
                          ? 'max-height 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, margin-bottom 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                          : 'none',
                      }}
                    >
                      {/* Swipe Delete Background Action (rendered only when actively swiping or deleting) */}
                      {isSwipeActive && (
                        <div
                          className={`swipe-delete-action ${
                            isPast60Percent ? 'ready-delete' : ''
                          }`}
                          onClick={() => handleTriggerDelete(idx)}
                        >
                          <div className="swipe-delete-content">
                            <Trash2
                              size={20}
                              color="#9ca3af"
                              className={`swipe-trash-icon ${isPast60Percent ? 'ready' : ''}`}
                            />
                            <span className="swipe-delete-label">
                              {isPast60Percent ? 'Release to Delete' : 'Slide to Delete'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Foreground Exercise Config Card */}
                      <div
                        className={`exercise-config-card ${isThisDragging ? 'is-dragging' : ''} ${
                          isThisDropping ? 'is-dropping' : ''
                        }`}
                        data-index={idx}
                        style={{
                          transform:
                            deletingIndex === idx
                              ? 'translateX(-100%)'
                              : swipingIndex === idx
                              ? `translateX(${swipeOffset}px)`
                              : 'translateX(0)',
                          transition:
                            isSwipingActive && swipingIndex === idx
                              ? 'none'
                              : 'transform 0.26s cubic-bezier(0.18, 1, 0.22, 1), opacity 0.24s ease',
                          pointerEvents: isThisDragging ? 'none' : 'auto',
                        }}
                        onMouseDown={(e) => handleMouseDown(idx, e)}
                        onTouchStart={(e) => handleTouchStart(idx, e)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onClick={() => {
                          if (swipingIndex === idx && swipeOffset < 0) {
                            setSwipeOffset(0);
                            setSwipingIndex(null);
                          }
                        }}
                      >
                        {/* Top Row: Thumbnail, Name, Drag Handle */}
                        <div className="card-top-row">
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

                          {/* Drag Handle */}
                          <div className="card-actions">
                            <div
                              className={`drag-handle ${
                                isThisDragging && !isThisDropping ? 'is-active' : ''
                              }`}
                              onPointerDown={(e) => handlePointerDownHandle(idx, e)}
                              title="Drag to reorder"
                              aria-label="Drag to reorder"
                            >
                              <GripVertical size={16} />
                            </div>
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <footer className="page-footer">
          <button
            type="button"
            className="btn-save-template"
            onClick={handleSave}
          >
            <span>{mode === 'create' ? 'Create Template' : 'Save'}</span>
          </button>
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
            height: 56px;
            padding: 0 16px;
            background: rgba(8, 8, 10, 0.95);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
            gap: 8px;
            flex-shrink: 0;
            position: sticky;
            top: 0;
            z-index: 70;
          }

          .back-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            color: #ffffff;
            background: transparent;
            border: none;
            box-shadow: none;
            cursor: pointer;
            transition: all 0.2s ease;
            flex-shrink: 0;
          }

          .back-btn:hover {
            background: transparent;
            transform: translateX(-3px);
            opacity: 0.8;
          }

          .back-btn:active {
            transform: scale(0.92) translateX(-3px);
            opacity: 0.65;
          }

          .page-title {
            font-family: var(--font-display);
            font-size: 1.08rem;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.015em;
            margin: 0;
            line-height: 1.2;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
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
            gap: 10px;
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
            padding: 4px 4px 0;
            margin-top: 12px;
            margin-bottom: 4px;
            background: transparent;
            border: none;
          }

          .stat-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 12.5px;
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
            gap: 12px;
          }

          .section-header-row {
            display: flex;
            justify-content: flex-start;
            align-items: center;
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
            gap: 14px;
          }

          .swipe-card-wrapper {
            position: relative;
            overflow: hidden;
            border-radius: 16px;
            max-height: 240px;
            opacity: 1;
            background: transparent;
            transition: max-height 0.25s cubic-bezier(0.16, 1, 0.3, 1),
                        opacity 0.2s ease,
                        margin-bottom 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .swipe-card-wrapper.is-deleting {
            max-height: 0;
            opacity: 0;
            margin-bottom: -14px;
            pointer-events: none;
          }

          .swipe-delete-action {
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 22px;
            background: transparent;
            border-radius: 16px;
            z-index: 1;
            cursor: pointer;
            user-select: none;
            -webkit-user-select: none;
          }

          .swipe-delete-action.ready-delete {
            background: transparent;
          }

          .swipe-delete-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            color: #9ca3af;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            transition: transform 0.18s cubic-bezier(0.18, 1, 0.22, 1);
          }

          .swipe-delete-label {
            color: #9ca3af;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.03em;
            text-transform: uppercase;
          }

          .swipe-delete-action.ready-delete .swipe-delete-label {
            color: #9ca3af;
          }

          :global(.swipe-trash-icon) {
            color: #9ca3af !important;
            stroke: #9ca3af !important;
            transition: transform 0.18s cubic-bezier(0.18, 1, 0.22, 1);
          }

          :global(.swipe-trash-icon.ready) {
            transform: scale(1.24);
            color: #9ca3af !important;
            stroke: #9ca3af !important;
          }

          .exercise-config-card {
            background: #141419;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 14px 14px;
            display: flex;
            flex-direction: column;
            gap: 11px;
            position: relative;
            z-index: 2;
            touch-action: pan-y;
            user-select: none;
            -webkit-user-select: none;
            transition: border-color 0.16s ease, box-shadow 0.16s ease;
          }

          .exercise-cards-list.is-dragging-active {
            user-select: none;
            -webkit-user-select: none;
            cursor: grabbing !important;
          }

          .exercise-cards-list.is-dragging-active * {
            cursor: grabbing !important;
          }

          .swipe-card-wrapper.wrapper-dragging {
            overflow: visible !important;
            z-index: 100 !important;
            pointer-events: none;
          }

          .exercise-config-card.is-dragging {
            background: #181822 !important;
            border-color: rgba(96, 165, 250, 0.9) !important;
            box-shadow: 0 18px 40px -6px rgba(0, 0, 0, 0.92),
                        0 0 0 1.5px rgba(96, 165, 250, 0.75),
                        0 0 28px rgba(59, 130, 246, 0.35) !important;
            transform: scale(1.025) !important;
            opacity: 0.97 !important;
            cursor: grabbing !important;
            animation: dragCardPulse 1.6s ease-in-out infinite alternate;
          }

          .exercise-config-card.is-dragging.is-dropping {
            background: #141419 !important;
            border-color: rgba(255, 255, 255, 0.12) !important;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4) !important;
            transform: scale(1) !important;
            opacity: 1 !important;
            animation: none !important;
            transition: transform 0.24s cubic-bezier(0.18, 1, 0.22, 1),
                        box-shadow 0.24s cubic-bezier(0.18, 1, 0.22, 1),
                        border-color 0.24s ease,
                        background 0.24s ease !important;
          }

          @keyframes dragCardPulse {
            0% {
              box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.85),
                          0 0 0 1.5px rgba(96, 165, 250, 0.6),
                          0 0 20px rgba(59, 130, 246, 0.25);
            }
            100% {
              box-shadow: 0 22px 46px -6px rgba(0, 0, 0, 0.95),
                          0 0 0 2px rgba(96, 165, 250, 0.9),
                          0 0 34px rgba(59, 130, 246, 0.45);
            }
          }

          .drag-handle.is-active {
            color: #60a5fa !important;
            transform: scale(1.2) !important;
          }

          .card-top-row {
            display: flex;
            align-items: center;
            gap: 10px;
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
            gap: 4px;
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
          }

          .drag-handle {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: transparent;
            border: none;
            color: #9ca3af;
            cursor: grab;
            touch-action: none;
            user-select: none;
            -webkit-user-select: none;
            transition: color 0.15s ease, transform 0.15s ease;
          }

          .drag-handle:hover {
            color: #ffffff;
            transform: scale(1.08);
          }

          .drag-handle:active {
            cursor: grabbing;
            color: #60a5fa;
            transform: scale(0.95);
          }

          .steppers-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1.3fr;
            gap: 8px;
            padding-top: 10px;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
          }

          .stepper-item {
            display: flex;
            flex-direction: column;
            gap: 7px;
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
            padding: 4px 6px;
          }

          .step-btn {
            width: 23px;
            height: 23px;
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

          .btn-save-template {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 16px 24px;
            background: #ffffff;
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

          .btn-save-template:hover {
            background: #f4f4f5;
            transform: translateY(-1px);
            box-shadow: none;
          }

          .btn-save-template:active {
            transform: scale(0.98);
            background: #e4e4e7;
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
